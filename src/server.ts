import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { loadEnv } from "./config/env.js";
import { proxyRoutes } from "./routes/proxy.js";
import { payRoutes } from "./routes/pay.js";
import { whopRoutes } from "./routes/whop.js";

const env = loadEnv();
const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/proxy", proxyRoutes(env));    // App Proxy -> /proxy/checkout/start
app.use("/pay", payRoutes(env));        // Página intermedia
app.use("/api/whop", whopRoutes(env));  // session + webhook + redirects

app.use((_req, res) => res.status(404).json({ error: "Not Found" }));

app.listen(Number(env.PORT), () => {
  console.log(`Whop Gateway listening on :${env.PORT}`);
});
