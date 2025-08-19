// src/app.ts
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

// parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/whop/webhook", express.raw({ type: "*/*" }));

// health
app.get("/health", (_req, res) => res.json({ ok: true }));

// rutas
app.use("/proxy", proxyRoutes(env));
app.use("/pay", payRoutes(env));
app.use("/api/whop", whopRoutes(env));

// 404
app.use((_req, res) => res.status(404).json({ error: "Not Found" }));

export default app;
