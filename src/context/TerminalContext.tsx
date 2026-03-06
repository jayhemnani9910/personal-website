"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

interface TerminalContextType {
    isOpen: boolean;
    toggleTerminal: () => void;
    closeTerminal: () => void;
}

const TerminalContext = createContext<TerminalContextType | undefined>(undefined);

export const TerminalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleTerminal = useCallback(() => setIsOpen((prev) => !prev), []);
    const closeTerminal = useCallback(() => setIsOpen(false), []);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                toggleTerminal();
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [toggleTerminal]);

    const value = useMemo(() => ({ isOpen, toggleTerminal, closeTerminal }), [isOpen, toggleTerminal, closeTerminal]);

    return (
        <TerminalContext.Provider value={value}>
            {children}
        </TerminalContext.Provider>
    );
};

export const useTerminal = () => {
    const context = useContext(TerminalContext);
    if (context === undefined) {
        throw new Error("useTerminal must be used within a TerminalProvider");
    }
    return context;
};
