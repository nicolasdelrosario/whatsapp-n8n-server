import { serve } from "@hono/node-server";
import { env } from "@/lib/Shared/infrastructure/config/env";
import { createApp } from "@/lib/Shared/infrastructure/hono/createApp";
import { registerRoutes } from "@/lib/Shared/infrastructure/routes/registerRoutes";
import { initializeClient } from "@/lib/Whatsapp/infrastructure/WhatsappClient";

const app = createApp();

registerRoutes(app);

console.log("WhatsApp client initialization started");
initializeClient();

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    if (env.NODE_ENV === "development") {
      console.log(`Server is running on http://localhost:${info.port}`);
    }
  },
);

export { app };
