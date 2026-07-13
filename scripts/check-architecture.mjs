import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const concreteModuleNames = [
  "salon",
  "restaurant",
  "clinic",
  "gym",
  "pharmacy",
  "store",
];

const failures = [];

function readText(filePath) {
  return fs.readFileSync(path.join(root, filePath), "utf8");
}

function listFiles(dir, extensions = [".ts", ".tsx", ".js", ".mjs", ".prisma", ".sql", ".md"]) {
  const absDir = path.join(root, dir);
  if (!fs.existsSync(absDir)) {
    return [];
  }

  const result = [];
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    const fullPath = path.join(absDir, entry.name);
    const relativePath = path.relative(root, fullPath);
    if (entry.isDirectory()) {
      result.push(...listFiles(relativePath, extensions));
    } else if (extensions.includes(path.extname(entry.name))) {
      result.push(relativePath);
    }
  }
  return result;
}

function assertNoMatch(label, files, pattern) {
  for (const file of files) {
    const lines = readText(file).split("\n");
    lines.forEach((line, index) => {
      if (pattern.test(line)) {
        failures.push(`${label}: ${file}:${index + 1}: ${line.trim()}`);
      }
    });
  }
}

function extractPrismaModel(schema, modelName) {
  const start = schema.indexOf(`model ${modelName} {`);
  if (start === -1) {
    failures.push(`Prisma model not found: ${modelName}`);
    return "";
  }

  let depth = 0;
  for (let i = start; i < schema.length; i += 1) {
    if (schema[i] === "{") depth += 1;
    if (schema[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        return schema.slice(start, i + 1);
      }
    }
  }

  failures.push(`Prisma model is not closed: ${modelName}`);
  return "";
}

function extractImportSpecifiers(file) {
  const text = readText(file);
  const specifiers = [];
  const patterns = [
    /import\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g,
    /export\s+(?:type\s+)?[\s\S]*?\s+from\s+["']([^"']+)["']/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      specifiers.push(match[1]);
    }
  }

  return specifiers;
}

function resolveInternalImport(fromFile, specifier) {
  if (!specifier.startsWith("@/") && !specifier.startsWith(".")) {
    return null;
  }

  const basePath = specifier.startsWith("@/")
    ? path.join(root, "src", specifier.slice(2))
    : path.resolve(path.dirname(path.join(root, fromFile)), specifier);

  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.mjs`,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.tsx"),
  ];

  const resolved = candidates.find((candidate) => fs.existsSync(candidate));
  return resolved ? path.relative(root, resolved) : null;
}

function fileArea(file) {
  if (file.startsWith("src/core/")) return "core";
  if (file.startsWith("src/modules/")) return "modules";
  return "other";
}

function buildImportGraph(files) {
  const graph = new Map();
  const fileSet = new Set(files);

  for (const file of files) {
    const edges = [];
    for (const specifier of extractImportSpecifiers(file)) {
      const resolved = resolveInternalImport(file, specifier);
      if (resolved && fileSet.has(resolved)) {
        edges.push(resolved);
      }
    }
    graph.set(file, edges);
  }

  return graph;
}

function detectCrossBoundaryCycles(graph) {
  const visited = new Set();
  const stack = new Set();
  const pathStack = [];

  function visit(file) {
    if (stack.has(file)) {
      const cycleStart = pathStack.indexOf(file);
      const cycle = pathStack.slice(cycleStart).concat(file);
      const areas = new Set(cycle.map(fileArea));
      if (areas.has("core") && areas.has("modules")) {
        failures.push(`Core/Modules circular dependency: ${cycle.join(" -> ")}`);
      }
      return;
    }

    if (visited.has(file)) {
      return;
    }

    visited.add(file);
    stack.add(file);
    pathStack.push(file);

    for (const edge of graph.get(file) ?? []) {
      visit(edge);
    }

    pathStack.pop();
    stack.delete(file);
  }

  for (const file of graph.keys()) {
    visit(file);
  }
}

function gitOutput(command) {
  try {
    return execSync(command, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function checkCoreFreeze() {
  if (process.env.ARCH_ALLOW_CORE_CHANGES === "true") {
    return;
  }

  const workingTreeCoreDiff = gitOutput("git diff --name-only HEAD -- src/core");
  if (workingTreeCoreDiff) {
    failures.push(
      `Core freeze violation: src/core changed in working tree:\n${workingTreeCoreDiff}`,
    );
  }

  const baseRef = process.env.ARCH_CHECK_BASE_REF ?? "origin/main";
  const hasBaseRef = gitOutput(`git rev-parse --verify ${baseRef}`);
  if (!hasBaseRef) {
    return;
  }

  const committedCoreDiff = gitOutput(`git diff --name-only ${baseRef}...HEAD -- src/core`);
  if (committedCoreDiff) {
    failures.push(
      `Core freeze violation: src/core changed relative to ${baseRef}. ` +
        `Set ARCH_ALLOW_CORE_CHANGES=true only after Architecture Review:\n${committedCoreDiff}`,
    );
  }
}

const coreFiles = listFiles("src/core", [".ts", ".tsx"]);
const coreRbacFiles = listFiles("src/core/rbac", [".ts", ".tsx"]);
const moduleFiles = listFiles("src/modules", [".ts", ".tsx"]);
const rlsFiles = [
  ...listFiles("supabase", [".sql"]),
  "docs/implementation/RLS.md",
  "docs/security/RLS_STRATEGY.md",
].filter((file) => fs.existsSync(path.join(root, file)));

assertNoMatch(
  "Core must not import modules",
  coreFiles,
  /from\s+["']@\/modules\//,
);

for (const file of coreFiles) {
  for (const specifier of extractImportSpecifiers(file)) {
    const resolved = resolveInternalImport(file, specifier);
    if (resolved?.startsWith("src/modules/")) {
      failures.push(
        `Dependency direction violation: ${file} imports ${resolved} via "${specifier}"`,
      );
    }
  }
}

assertNoMatch(
  "Core must not mention concrete module names",
  coreFiles,
  new RegExp(`\\b(${concreteModuleNames.join("|")})\\b`, "i"),
);

assertNoMatch(
  "Core RBAC must not contain module-specific permissions",
  coreRbacFiles,
  /\b[a-z][a-z0-9-]*:[a-z][a-z0-9-]*:[a-z][a-z0-9-]*\b/,
);

assertNoMatch(
  "RLS must not encode business roles",
  rlsFiles,
  /role\s+(IN|=)\s*\(?['"]?(OWNER|ADMIN|MANAGER|STAFF|CUSTOMER)/,
);

const prismaSchema = readText("prisma/schema.prisma");
for (const coreModel of ["Tenant", "Membership", "TenantModule"]) {
  const modelBody = extractPrismaModel(prismaSchema, coreModel);
  const concreteModulePattern = new RegExp(`\\b(${concreteModuleNames.join("|")})\\b`, "i");
  if (concreteModulePattern.test(modelBody)) {
    failures.push(`Core Prisma model ${coreModel} references a concrete module`);
  }
}

detectCrossBoundaryCycles(buildImportGraph([...coreFiles, ...moduleFiles]));
checkCoreFreeze();

if (failures.length > 0) {
  console.error("Architecture regression check failed:\n");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Architecture regression check passed.");
