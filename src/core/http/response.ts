import { NextResponse } from "next/server";
import { isAppError } from "@/shared/errors";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      data,
      meta: {
        requestId: crypto.randomUUID(),
      },
    },
    { status }
  );
}

export function jsonError(error: unknown) {
  if (isAppError(error)) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details ?? {},
        },
        meta: {
          requestId: crypto.randomUUID(),
        },
      },
      { status: error.status }
    );
  }

  console.error(error);
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Unexpected server error",
        details: {},
      },
      meta: {
        requestId: crypto.randomUUID(),
      },
    },
    { status: 500 }
  );
}
