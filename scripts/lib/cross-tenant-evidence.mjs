/**
 * Pure evaluation helpers for Operational Evidence — Cross-Tenant isolation.
 * No architecture / infrastructure changes — evidence scoring only.
 *
 * Overall statuses:
 * - PASS — runtime ran; isolation proven
 * - FAIL — runtime ran; tenant isolation broken
 * - NOT_EXECUTED — environment unavailable; no conclusion
 */

/**
 * @typedef {{
 *   id: string,
 *   title: string,
 *   actualStatus: number,
 *   expectedStatuses: number[],
 *   dataRows?: number | null,
 *   maxDataRows?: number | null,
 *   detail?: string,
 * }} EvidenceCase
 */

/**
 * @param {EvidenceCase} evidenceCase
 * @returns {{ id: string, title: string, result: 'PASS' | 'FAIL', detail: string }}
 */
export function evaluateCase(evidenceCase) {
  const {
    id,
    title,
    actualStatus,
    expectedStatuses,
    dataRows = null,
    maxDataRows = null,
    detail = "",
  } = evidenceCase;

  if (!expectedStatuses.includes(actualStatus)) {
    return {
      id,
      title,
      result: "FAIL",
      detail:
        detail ||
        `expected status in [${expectedStatuses.join(", ")}], got ${actualStatus}`,
    };
  }

  if (maxDataRows !== null && maxDataRows !== undefined) {
    const rows = dataRows ?? 0;
    if (rows > maxDataRows) {
      return {
        id,
        title,
        result: "FAIL",
        detail:
          detail ||
          `expected at most ${maxDataRows} data row(s), got ${rows}`,
      };
    }
  }

  return {
    id,
    title,
    result: "PASS",
    detail: detail || `status ${actualStatus}`,
  };
}

/**
 * @param {Array<ReturnType<typeof evaluateCase>>} results
 * @returns {{ overall: 'PASS' | 'FAIL', passed: number, failed: number, results: typeof results }}
 */
export function summarizeResults(results) {
  const failed = results.filter((r) => r.result === "FAIL").length;
  const passed = results.length - failed;
  return {
    overall: failed === 0 && results.length > 0 ? "PASS" : "FAIL",
    passed,
    failed,
    results,
  };
}

/**
 * Environment / reachability errors mean evidence was NOT EXECUTED.
 * Isolation regressions after a successful connection are FAIL.
 *
 * @param {unknown} error
 * @returns {boolean}
 */
export function isNotExecutedError(error) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const err = /** @type {{ name?: string, message?: string, cause?: unknown, code?: string }} */ (
    error
  );
  const message = `${err.message ?? ""} ${String(err.cause ?? "")}`.toLowerCase();
  const code = `${err.code ?? ""}`.toUpperCase();

  if (
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "UND_ERR_CONNECT_TIMEOUT"
  ) {
    return true;
  }

  if (message.includes("fetch failed")) return true;
  if (message.includes("econnrefused")) return true;
  if (message.includes("network") && message.includes("failed")) return true;
  if (message.includes("application was not reachable")) return true;
  if (message.includes("not running")) return true;

  return false;
}

/**
 * @param {{ baseUrl: string, ranAt: string, reason: string }} meta
 * @returns {string}
 */
export function renderNotExecutedReport(meta) {
  return [
    "# Cross-Tenant Operational Evidence — Latest Run",
    "",
    "**Overall:** NOT_EXECUTED",
    "",
    "No runtime conclusion can be drawn. The application/environment was unavailable,",
    "so tenant isolation was neither proven nor disproven.",
    "",
    `**Reason:** ${meta.reason}`,
    `**Base URL:** ${meta.baseUrl}`,
    `**Ran at:** ${meta.ranAt}`,
    "",
    "## Status legend",
    "",
    "- **PASS** — runtime ran; isolation proven",
    "- **FAIL** — runtime ran; tenant isolation broken",
    "- **NOT_EXECUTED** — environment unavailable; no conclusion",
    "",
  ].join("\n");
}

/**
 * Expected live matrix (documentation + unit tests).
 * Live script fills actualStatus / dataRows at runtime.
 */
export const CROSS_TENANT_CASE_SPECS = [
  {
    id: "A_lists_own_services",
    title: "Identity A + Tenant A can list own salon services",
    expectedStatuses: [200],
    maxDataRows: null,
    requireMinRows: 1,
  },
  {
    id: "B_with_A_tenant_header",
    title: "Identity B + X-Tenant-Id=A is denied (no membership)",
    expectedStatuses: [403],
    maxDataRows: 0,
  },
  {
    id: "A_with_B_tenant_header",
    title: "Identity A + X-Tenant-Id=B is denied (no membership)",
    expectedStatuses: [403],
    maxDataRows: 0,
  },
  {
    id: "B_lists_own_services_empty_of_A",
    title: "Identity B + Tenant B list does not include Tenant A services",
    expectedStatuses: [200],
    maxDataRows: 0,
  },
  {
    id: "B_get_A_service_by_id_denied",
    title: "Identity B cannot GET Tenant A service id (wrong tenant header → 403)",
    expectedStatuses: [403],
    maxDataRows: 0,
  },
  {
    id: "B_write_A_tenant_denied",
    title: "Identity B cannot POST salon service into Tenant A (cross-tenant write denied)",
    expectedStatuses: [403],
    maxDataRows: 0,
  },
];
