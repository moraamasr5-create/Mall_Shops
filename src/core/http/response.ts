import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isAppError } from "@/shared/errors";
import { getRequestId } from "@/core/http/request-id";
import { logStructured } from "@/core/http/logger";

export function jsonOk<T>(data: T, status = 200) {
  const requestId = getRequestId();
  return NextResponse.json(
    {
      data,
      meta: {
        requestId,
      },
    },
    { status }
  );
}

export function jsonError(error: unknown) {
  const requestId = getRequestId();
  const errorId = crypto.randomUUID();

  if (isAppError(error)) {
    logStructured("error", {
      msg: "request.error",
      errorId,
      code: error.code,
      status: error.status,
      message: error.message,
    });
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details ?? {},
          errorId,
        },
        meta: {
          requestId,
        },
      },
      { status: error.status }
    );
  }

  if (error instanceof ZodError) {
    logStructured("error", {
      msg: "request.error",
      errorId,
      code: "VALIDATION_ERROR",
      status: 422,
      message: "Request validation failed",
    });
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: error.flatten(),
          errorId,
        },
        meta: {
          requestId,
        },
      },
      { status: 422 }
    );
  }

  logStructured("error", {
    msg: "request.error",
    errorId,
    code: "INTERNAL_ERROR",
    status: 500,
    message: error instanceof Error ? error.message : "Unexpected server error",
  });
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Unexpected server error",
        details: {},
        errorId,
      },
      meta: {
        requestId,
      },
    },
    { status: 500 }
  );
}
