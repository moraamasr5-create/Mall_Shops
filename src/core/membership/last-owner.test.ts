import { describe, expect, it } from "vitest";
import { AppError } from "@/shared/errors";
import {
  assertLastOwnerInvariant,
  isActiveOwnerRole,
} from "@/core/membership/last-owner";

describe("Last OWNER invariant", () => {
  it("treats only active OWNER as an active owner", () => {
    expect(isActiveOwnerRole("OWNER", "active")).toBe(true);
    expect(isActiveOwnerRole("OWNER", "revoked")).toBe(false);
    expect(isActiveOwnerRole("ADMIN", "active")).toBe(false);
  });

  it("allows demoting an OWNER when another active OWNER remains", () => {
    expect(() =>
      assertLastOwnerInvariant({
        activeOwnerCount: 2,
        targetIsActiveOwner: true,
        nextRole: "ADMIN",
      })
    ).not.toThrow();
  });

  it("forbids demoting the last active OWNER", () => {
    try {
      assertLastOwnerInvariant({
        activeOwnerCount: 1,
        targetIsActiveOwner: true,
        nextRole: "ADMIN",
      });
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("CONFLICT");
      expect((error as AppError).status).toBe(409);
    }
  });

  it("forbids revoking the last active OWNER", () => {
    expect(() =>
      assertLastOwnerInvariant({
        activeOwnerCount: 1,
        targetIsActiveOwner: true,
        nextStatus: "revoked",
      })
    ).toThrow(AppError);
  });

  it("forbids suspending the last active OWNER", () => {
    expect(() =>
      assertLastOwnerInvariant({
        activeOwnerCount: 1,
        targetIsActiveOwner: true,
        nextStatus: "suspended",
      })
    ).toThrow(AppError);
  });

  it("allows revoking/suspending OWNER when another OWNER remains", () => {
    expect(() =>
      assertLastOwnerInvariant({
        activeOwnerCount: 2,
        targetIsActiveOwner: true,
        nextStatus: "revoked",
      })
    ).not.toThrow();

    expect(() =>
      assertLastOwnerInvariant({
        activeOwnerCount: 2,
        targetIsActiveOwner: true,
        nextStatus: "suspended",
      })
    ).not.toThrow();
  });

  it("ignores non-OWNER targets", () => {
    expect(() =>
      assertLastOwnerInvariant({
        activeOwnerCount: 1,
        targetIsActiveOwner: false,
        nextRole: "STAFF",
        nextStatus: "revoked",
      })
    ).not.toThrow();
  });

  it("allows keeping OWNER role or active status unchanged", () => {
    expect(() =>
      assertLastOwnerInvariant({
        activeOwnerCount: 1,
        targetIsActiveOwner: true,
        nextRole: "OWNER",
      })
    ).not.toThrow();

    expect(() =>
      assertLastOwnerInvariant({
        activeOwnerCount: 1,
        targetIsActiveOwner: true,
        nextStatus: "active",
      })
    ).not.toThrow();
  });
});
