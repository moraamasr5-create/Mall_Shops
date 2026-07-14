import { NextResponse } from "next/server";
import { ZodError } from "zod";
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

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: error.flatten(),
        },
        meta: {
          requestId: crypto.randomUUID(),
        },
      },
      { status: 422 }
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
