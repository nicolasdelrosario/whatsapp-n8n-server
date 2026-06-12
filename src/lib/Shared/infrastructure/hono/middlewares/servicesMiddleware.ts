import type { MiddlewareHandler } from "hono";
import { createServicesContainer } from "@/lib/Shared/infrastructure/services/createServicesContainer";

export const servicesMiddleware: MiddlewareHandler = async (c, next) => {
  const services = createServicesContainer();

  c.set("services", services);

  await next();
};
