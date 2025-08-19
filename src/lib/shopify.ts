// src/lib/shopify.ts
import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";
import type { Env } from "../config/env.js";

/** Crea un cliente GraphQL usando la sesión de Custom App (token shpat_...) */
function getGraphqlClient(env: Env) {
  const shopify = shopifyApi({
    apiKey: env.SHOPIFY_API_KEY,
    apiSecretKey: env.SHOPIFY_API_SECRET,  
    apiVersion: LATEST_API_VERSION,
    isCustomStoreApp: true,
    isEmbeddedApp: false,
    adminApiAccessToken: env.SHOPIFY_ACCESS_TOKEN,
    hostName: new URL(env.APP_URL).host, 
  });

  const session = shopify.session.customAppSession(env.SHOPIFY_SHOP);
  return new shopify.clients.Graphql({ session });
}

/** Mantengo la misma firma que ya usan tus rutas */
export async function shopifyGraphQL<T = any>(env: Env, query: string, variables?: unknown): Promise<T> {
  const client = getGraphqlClient(env);
  const resp = await client.query({ data: { query, variables } });
  return resp.body as any; // { data, extensions }
}
