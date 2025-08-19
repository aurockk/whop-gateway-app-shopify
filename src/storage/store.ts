export type SessionState = {
    draftId: string;
    expectedTotal: number; 
    currency: string;
    whopSessionId?: string;
    state: "pending" | "completed";
    orderId?: string;
    statusUrl?: string;
};

const mem = new Map<string, SessionState>();

export function put(token: string, state: Omit<SessionState, "state">) {
    mem.set(token, {...state, state: "pending"});
}

export function get(token: string){ return mem.get(token); }
export function setCompleted(token: string, orderId: string, statusUrl: string){
    const st = mem.get(token); if(!st) return; 
    mem.set(token, {...st, orderId, statusUrl, state: "completed"});
}