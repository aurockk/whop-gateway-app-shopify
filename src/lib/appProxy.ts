import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import type { Env } from "../config/env";

export function verifyAppProxy(env: Env){
    return (req: Request, res: Response, next: NextFunction) => {
        if(!env.SHOPIFY_APP_SECRET) return next();

        const url = new URL(req.protocol + "://" + req.get("host") + req.originalUrl);
        const signature = url.searchParams.get("signature") || url.searchParams.get("hmac");
        if(!signature) return res.status(401).send("Missing signature");

        const params = new URLSearchParams(url.search);
        params.delete("signature"); params.delete("hmac");
        const computed = crypto.createHmac("sha256", env.SHOPIFY_APP_SECRET).update(params.toString()).digest("hex");
        if (computed !== signature) return res.status(401).send("Bad signature");

        next();
    };
}