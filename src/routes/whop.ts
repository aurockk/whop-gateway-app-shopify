import { Router } from "express";
import { get, setCompleted } from "../storage/store.js";
import { createWhopCheckoutSession, verifyWhopSignature } from "../lib/whop.js";
import { shopifyGraphQL } from "../lib/shopify.js";
import { DRAFT_ORDER_COMPLETE } from "../graphql/queries.js";
import type { Env } from "../config/env.js";

// raw body middleware para verificar HMAC del webhook
function rawBody(req: any, _res: any, next: any) {
  let data = ""; req.setEncoding("utf8");
  req.on("data", (c: string) => { data += c; });
  req.on("end", () => { req.rawBody = data; try { req.body = JSON.parse(data || "{}"); } catch { req.body = {}; } next(); });
}

export function whopRoutes(env: Env) {
  const router = Router();

  // Crea sesión en Whop y redirige
  router.post("/session", async (req, res) => {
    const token = req.body.token as string;
    const t = get(token);
    if (!t) return res.status(404).send("Session not found");

    const session = await createWhopCheckoutSession(env, {
      amount: t.expectedTotal,  // ideal: centavos
      currency: t.currency,
      draftId: t.draftId,
      token
    });
    return res.redirect(302, session.url);
  });

  // Webhook Whop
  router.post("/webhook", rawBody, async (req: any, res) => {
    const raw = req.rawBody as string;
    if (!verifyWhopSignature(env, raw, req.header("x-whop-signature"))) {
      return res.sendStatus(401);
    }
    const event = JSON.parse(raw);
    if (event?.type === "payment_succeeded") {
      const token = event?.metadata?.token;
      const draftId = event?.metadata?.draftId;
      if (token && draftId) {
        const r = await shopifyGraphQL<any>(env, DRAFT_ORDER_COMPLETE, { id: draftId, paymentPending: false });
        const order = r?.data?.draftOrderComplete?.order;
        if (order) setCompleted(token, order.id, order.statusUrl);
      }
    }
    return res.sendStatus(200);
  });

  // Redirects
  router.get("/success", (req, res) => {
    const t = get(String(req.query.token || ""));
    if (!t?.statusUrl) return res.redirect(302, "/cart");
    return res.redirect(302, t.statusUrl);
  });

  router.get("/cancel", (_req, res) => res.redirect(302, "/cart"));

  return router;
}

