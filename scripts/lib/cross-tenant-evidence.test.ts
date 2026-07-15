import { describe, expect, it } from "vitest";
import {
  CROSS_TENANT_CASE_SPECS,
  evaluateCase,
  isNotExecutedError,
  renderNotExecutedReport,
  summarizeResults,
} from "../../scripts/lib/cross-tenant-evidence.mjs";

describe("cross-tenant operational evidence matrix", () => {
  it("defines the live isolation cases required for PASS", () => {
    const ids = CROSS_TENANT_CASE_SPECS.map((c) => c.id);
    expect(ids).toContain("B_with_A_tenant_header");
    expect(ids).toContain("A_with_B_tenant_header");
    expect(ids).toContain("B_lists_own_services_empty_of_A");
    expect(ids).toContain("B_get_A_service_by_id_denied");
    expect(ids).toContain("B_write_A_tenant_denied");
  });

  it("marks cross-tenant header misuse as PASS only on 403", () => {
    const pass = evaluateCase({
      id: "B_with_A_tenant_header",
      title: "denied",
      actualStatus: 403,
      expectedStatuses: [403],
      dataRows: 0,
      maxDataRows: 0,
    });
    expect(pass.result).toBe("PASS");

    const fail = evaluateCase({
      id: "B_with_A_tenant_header",
      title: "denied",
      actualStatus: 200,
      expectedStatuses: [403],
      dataRows: 1,
      maxDataRows: 0,
    });
    expect(fail.result).toBe("FAIL");
  });

  it("fails when foreign tenant data rows leak on an otherwise-allowed list", () => {
    const leak = evaluateCase({
      id: "B_lists_own_services_empty_of_A",
      title: "no leak",
      actualStatus: 200,
      expectedStatuses: [200],
      dataRows: 1,
      maxDataRows: 0,
    });
    expect(leak.result).toBe("FAIL");
  });

  it("summarizes overall FAIL if any case fails", () => {
    const summary = summarizeResults([
      {
        id: "ok",
        title: "ok",
        result: "PASS",
        detail: "ok",
      },
      {
        id: "bad",
        title: "bad",
        result: "FAIL",
        detail: "leak",
      },
    ]);
    expect(summary.overall).toBe("FAIL");
    expect(summary.failed).toBe(1);
    expect(summary.passed).toBe(1);
  });

  it("summarizes overall PASS only when all cases pass", () => {
    const summary = summarizeResults([
      { id: "a", title: "a", result: "PASS", detail: "ok" },
      { id: "b", title: "b", result: "PASS", detail: "ok" },
    ]);
    expect(summary.overall).toBe("PASS");
    expect(summary.failed).toBe(0);
  });

  it("classifies unreachable app / fetch failed as NOT_EXECUTED, not FAIL", () => {
    expect(isNotExecutedError(new Error("fetch failed"))).toBe(true);
    expect(
      isNotExecutedError(
        new Error("Application was not reachable at http://127.0.0.1:3000 (fetch failed)")
      )
    ).toBe(true);

    const refused = new Error("connect");
    /** @type {Error & { code?: string }} */ (refused).code = "ECONNREFUSED";
    expect(isNotExecutedError(refused)).toBe(true);

    expect(isNotExecutedError(new Error("expected 403, got 200"))).toBe(false);
  });

  it("renders NOT_EXECUTED report without claiming isolation failure", () => {
    const report = renderNotExecutedReport({
      baseUrl: "http://127.0.0.1:3000",
      ranAt: "2026-07-15T00:00:00.000Z",
      reason: "Application was not reachable (fetch failed)",
    });
    expect(report).toContain("**Overall:** NOT_EXECUTED");
    expect(report).not.toContain("**Overall:** FAIL");
    expect(report).toContain("no conclusion");
  });
});
