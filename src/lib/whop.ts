import fetch from "node-fetch";
import crypto from "crypto";
import type { Env } from "../config/env";
import { logger } from "./logger";
import { raw } from "express";


export async function createWhopCheckoutSession(env: Env, input: {
    amount: number; currency: string; draftId: string; token: string;
}) {
    const res = await fetch("https://api.whope.com/v1/checkout_sessions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env.WHOP_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            amount: input.amount,
            currency: input.currency,
            metadata: {
                token: input.token,
                draftId: input.draftId,
                appId: env.WHOP_APP_ID,
                agentUserId: env.WHOP_AGENT_USER_ID,
                companyId: env.WHOP_COMPANY_ID
              },
            success_url: `${env.APP_URL}/whop/success?token=${input.token}`,
            cancel_url: `${env.APP_URL}/whop(cancel?token=${input.token})`
        }),
    });
    const data = await res.json();
    if(!res.ok){
        logger.error({ data }, "Whope session error");
        throw new Error("Whop session error");
    }

    return data as { id: string; url: string };
}

export function verifyWhopSignature(env: Env, rawBody: string, signatureHeader?: string | null){
    if(!signatureHeader) return false; 
    const h = crypto.createHmac("sha256", env.WHOP_WEBHOOK_SECRET);
    h.update(rawBody); 
    const expected = h.digest("hex");
    return expected === signatureHeader;
}