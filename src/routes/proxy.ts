import { Router } from "express";
import { shopifyGraphQL } from "../lib/shopify";
import { DRAFT_ORDER_CREATE } from "../graphql/queries";
import { put } from "../storage/store";
import { v4 as uuidv4 } from "uuid";
import type { Env } from "../config/env";

export function proxyRoutes(env: Env){
    const router = Router();

    router.post("/checkout/start", async(req, res) => {
        try {
            const { email, currency="USD", total=0, lines } = req.body;
            if(!lines) return res.status(400).send("Missing lines");
            
            let parsedLines: Array<{variantId: string; quantity: number}>;
            try { parsedLines = typeof lines === "string" ? JSON.parse(lines) : lines; }
            catch { return res.status(400).send("Invalid lines JSON"); }

            const input = {
                email, 
                note: "Pago a través de Whop",
                tags: ["whop"],
                lineItems: parsedLines.map(l => ({ variantId: l.variantId, quantity: Number(l.quantity || 1) }))
            };

            const json = await shopifyGraphQL<any>(env, DRAFT_ORDER_CREATE, { input });
            const draft = json?.data?.draftOrderCreate?.draftOrder;
            const errs = json?.data?.draftOrderCreate?.userErrors;

            if(!draft) return res.status(400).json({ error: errs });

            const token = uuidv4();
            put(token, {draftId: draft.id, expectedTotal: Number(total), currency});

            return res.redirect(302, `/pay/${token}`);
        
        } catch {
            return res.status(500).send("Error creating draft order");
        }
    });
    return router; 
}