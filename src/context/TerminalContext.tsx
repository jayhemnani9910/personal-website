"use client";

import React, { createContext, useContext, useState } from "react";

interface TerminalContextType {
    isOpen: boolean;
    toggleTerminal: () => void;
    closeTerminal: () => void;
}

const TerminalContext = createContext<TerminalContextType | undefined>(undefined);

export const TerminalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleTerminal = () => setIsOpen((prev) => !prev);
    const closeTerminal = () => setIsOpen(false);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                toggleTerminal();
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    return (
        <TerminalContext.Provider value={{ isOpen, toggleTerminal, closeTerminal }}>
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
