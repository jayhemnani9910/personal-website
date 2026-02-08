"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
    // Close on escape key
    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, handleEscape]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0"
                        style={{ background: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(8px)" }}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl"
                        style={{
                            background: "var(--bg-primary)",
                            border: "1px solid var(--border)",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div
                            className="sticky top-0 flex items-center justify-between p-6 pb-4"
                            style={{
                                background: "var(--bg-primary)",
                                borderBottom: "1px solid var(--border)"
                            }}
                        >
                            {title && (
                                <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                                    {title}
                                </h2>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full transition-colors hover:bg-[var(--bg-secondary)]"
                                style={{ color: "var(--text-secondary)" }}
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 pt-4">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
