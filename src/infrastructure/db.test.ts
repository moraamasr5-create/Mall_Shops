import { describe, expect, it } from "vitest";
import { getDb, withIdentityRls } from "@/infrastructure/db";
import { AppError } from "@/shared/errors";

describe("identity RLS DB context", () => {
  it("forbids getDb outside withIdentityRls", () => {
    expect(() => getDb()).toThrow(AppError);
  });

  it("exposes getDb inside withIdentityRls when RUN_RLS_INTEGRATION=true", async () => {
    if (process.env.RUN_RLS_INTEGRATION !== "true") {
      return;
    }

    const identityId = "00000000-0000-4000-8000-000000000099";
    await expect(
      withIdentityRls(identityId, async () => {
        const db = getDb();
        expect(db).toBeTruthy();
        return true;
      })
    ).resolves.toBe(true);
  });
});
