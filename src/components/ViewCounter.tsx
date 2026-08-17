"use client";

import { useState, useEffect } from "react";
import { m } from "framer-motion";
import { Eye } from "lucide-react";

export function ViewCounter({ slug }: { slug: string }) {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        // Client-side half of the dedup. The server is the authority (it keys on
        // IP for a day), but this stops the obvious case cheaply: navigating back
        // to the same project inside one session used to fire another POST every
        // time the component mounted.
        let seen = false;
        try {
            seen = sessionStorage.getItem(`viewed:${slug}`) === "1";
        } catch {
            // Private mode or storage disabled: fall through and let the server decide.
        }

        // A repeat view still reads the total so the number renders; only a first
        // view asks for it to be counted.
        fetch(seen ? `/api/views?slug=${encodeURIComponent(slug)}` : "/api/views", {
            method: seen ? "GET" : "POST",
            ...(seen
                ? {}
                : {
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ slug }),
                  }),
        })
            .then((res) => res.json())
            .then((data) => {
                setCount(data.count);
                try {
                    sessionStorage.setItem(`viewed:${slug}`, "1");
                } catch {
                    // Nothing to do: the server-side dedup still holds.
                }
            })
            .catch(() => {});
    }, [slug]);

    if (count === null) return null;

    return (
        <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-1.5 text-[length:var(--tr-t-mono-sm)] text-tr-text-mute"
        >
            <Eye className="w-4 h-4" />
            <span>{count} {count === 1 ? "view" : "views"}</span>
        </m.div>
    );
}
