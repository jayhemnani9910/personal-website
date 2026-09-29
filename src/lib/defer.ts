import { after } from "next/server";

/**
 * Run bookkeeping (metrics, cache writes) after the response is sent, so it
 * never adds a round trip to what the visitor waits for. Outside a request
 * (unit tests call route handlers directly) `after` throws, so the work runs
 * inline instead.
 */
export async function defer(work: () => Promise<unknown>): Promise<void> {
    try {
        after(work);
    } catch {
        await work();
    }
}
