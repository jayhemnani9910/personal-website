"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface InteractionProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

export function Interaction({ children, className = "", onClick }: InteractionProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={className}
            onClick={onClick}
            style={{ cursor: onClick ? "pointer" : "default" }}
        >
            {children}
        </motion.div>
    );
}
