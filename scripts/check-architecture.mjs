import fs from "node:fs";
import path from "node:path";

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

const coreFiles = listFiles("src/core", [".ts", ".tsx"]);
const coreRbacFiles = listFiles("src/core/rbac", [".ts", ".tsx"]);
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

if (failures.length > 0) {
  console.error("Architecture regression check failed:\n");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Architecture regression check passed.");
