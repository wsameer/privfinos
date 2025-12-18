import { ApiEnvSchema } from "@repo/types/env";
import type { ApiEnv } from "@repo/types/env";

function validateEnv(): ApiEnv {
  const parsed = ApiEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("Invalid environment variables:");
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
  }

  return parsed.data;
}

export const env = validateEnv();
