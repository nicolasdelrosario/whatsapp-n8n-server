import path from "node:path";
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { z } from "zod";

expand(
  config({
    path: path.resolve(
      process.cwd(),
      process.env.NODE_ENV === "test" ? ".env.test" : ".env",
    ),
  }),
);

const ZodEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  API_KEY: z.string().min(1),
  BROADCAST_DELAY_MS: z.coerce.number().int().nonnegative().default(1500),
});

const parsedEnv = ZodEnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid env:");
  console.error(JSON.stringify(parsedEnv.error.flatten().fieldErrors, null, 2));

  process.exit(1);
}

const env = parsedEnv.data;

export { env };
