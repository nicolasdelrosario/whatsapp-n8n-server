import type { Hono } from "hono";
import * as SystemRoutes from "@/lib/Shared/infrastructure/routes/systemRoutes";
import * as WhatsappRoutes from "@/lib/Whatsapp/infrastructure/routes/honoWhatsappRoutes";

const routes = [SystemRoutes, WhatsappRoutes];

export function registerRoutes(app: Hono): void {
  for (const route of routes) {
    route.register(app);
  }
}
