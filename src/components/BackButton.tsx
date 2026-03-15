"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({ label = "Back to Projects" }: { label?: string }) {
    const router = useRouter();

    return (
        <button
            onClick={() => window.history.length > 1 ? router.back() : router.push("/projects")}
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-4"
        >
            <ArrowLeft className="w-4 h-4" />
            {label}
        </button>
    );
}
