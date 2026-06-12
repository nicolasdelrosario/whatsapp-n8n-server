import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode, StatusCode } from "hono/utils/http-status";
import * as HttpStatusCodes from "@/lib/Shared/common/HttpStatusCodes";
import { env } from "@/lib/Shared/infrastructure/config/env";

const isProd = env?.NODE_ENV === "production";

export const onError: ErrorHandler = (err, c) => {
  const currentStatus =
    "status" in err ? (err.status as StatusCode) : c.res.status;

  const statusCode =
    currentStatus !== HttpStatusCodes.OK
      ? currentStatus
      : HttpStatusCodes.INTERNAL_SERVER_ERROR;

  return c.json(
    {
      message: err.message,
      stack: isProd ? undefined : err.stack,
    },
    statusCode as ContentfulStatusCode,
  );
};
