import type { MiddlewareHandler } from "hono";
import * as HttpStatusCodes from "@/lib/Shared/common/HttpStatusCodes";
import * as HttpStatusPhrases from "@/lib/Shared/common/HttpStatusPhrases";
import { env } from "@/lib/Shared/infrastructure/config/env";

const PUBLIC_PATHS = [
  "/api/v1",
  "/api/v1/",
  "/api/v1/health",
  "/api/v1/openapi.json",
  "/api/v1/docs",
];

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const requestPath = c.req.path.replace(/\/$/, "");

  if (
    PUBLIC_PATHS.includes(requestPath) ||
    requestPath.startsWith("/api/v1/docs/")
  ) {
    await next();
    return;
  }

  const apiKey = c.req.header("x-api-key");

  if (!apiKey || apiKey !== env.API_KEY) {
    return c.json(
      { message: HttpStatusPhrases.UNAUTHORIZED },
      HttpStatusCodes.UNAUTHORIZED,
    );
  }

  await next();
};
