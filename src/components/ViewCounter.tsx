"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";

export function ViewCounter({ slug }: { slug: string }) {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        // Increment view on mount
        fetch("/api/views", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug }),
        })
            .then((res) => res.json())
            .then((data) => setCount(data.count))
            .catch(() => {});
    }, [slug]);

    if (count === null) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-1.5 text-sm"
            style={{ color: 'var(--text-muted)' }}
        >
            <Eye className="w-4 h-4" />
            <span>{count} {count === 1 ? "view" : "views"}</span>
        </motion.div>
    );
}
