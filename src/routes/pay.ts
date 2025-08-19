import { Router } from "express";
import { get } from "../storage/store.js";
import type { Env } from "../config/env.js";

export function payRoutes(_env: Env) {
  const router = Router();

  router.get("/:token", (req, res) => {
    const t = get(req.params.token);
    if (!t) return res.status(404).send("Session not found");

    res.status(200).send(`
      <html><head><meta charset="utf-8"><title>Pagar</title></head>
      <body style="font-family:system-ui;margin:40px">
        <h2>Método de pago</h2>
        <div style="border:1px solid #e5e7eb;border-radius:12px;padding:18px;max-width:560px">
          <p>Después de hacer clic en <b>“Pagar ahora”</b>, serás redirigido para completar tu compra de forma segura.</p>
          <form method="POST" action="/api/whop/session">
            <input type="hidden" name="token" value="${req.params.token}" />
            <button type="submit" style="padding:12px 18px;border-radius:8px;border:0;background:black;color:white">
              Pagar ahora
            </button>
          </form>
        </div>
      </body></html>
    `);
  });

  return router;
}
