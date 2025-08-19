import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.string().default("3000"),
  APP_URL: z.string().url(),

  SHOPIFY_SHOP: z.string().min(1),
  SHOPIFY_ACCESS_TOKEN: z.string().min(1),

  // ⬇️ nuevas para @shopify/shopify-api
  SHOPIFY_API_KEY: z.string().min(1),
  SHOPIFY_API_SECRET: z.string().min(1),

  SHOPIFY_APP_SECRET: z.string().optional(),  // (solo si verificás App Proxy)

  WHOP_API_KEY: z.string().min(1),
  WHOP_WEBHOOK_SECRET: z.string().min(1),

  WHOP_APP_ID: z.string().optional(),
  WHOP_AGENT_USER_ID: z.string().optional(),
  WHOP_COMPANY_ID: z.string().optional(),

  SHOPIFY_CART_URL: z.string().url()
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("ENV inválido:", parsed.error.flatten().fieldErrors);
    throw new Error("ENV validation failed");
  }
  return parsed.data;
}
