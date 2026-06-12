import type { Hono } from "hono";
import {
  openApiDocument,
  renderScalarHtml,
} from "@/lib/Shared/infrastructure/openapi/openapi";

export const register = (app: Hono): void => {
  app.get("/", (c) => c.redirect("/api/v1/docs"));

  app.get("/health", (c) => {
    return c.json(
      {
        status: "ok",
        service: "whatsapp-n8n-server",
        timestamp: new Date().toISOString(),
      },
      200,
    );
  });

  app.get("/openapi.json", (c) => c.json(openApiDocument));

  app.get("/docs", (c) => {
    return c.html(renderScalarHtml());
  });
};
