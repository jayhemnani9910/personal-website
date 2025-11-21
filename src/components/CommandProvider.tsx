"use client";

import * as React from "react";
import { CommandPalette } from "./CommandPalette";

interface CommandContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CommandContext = React.createContext<CommandContextType | undefined>(undefined);

export function CommandProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <CommandContext.Provider value={{ open, setOpen }}>
      {children}
      <CommandPalette open={open} setOpen={setOpen} />
    </CommandContext.Provider>
  );
}

export function useCommand() {
  const context = React.useContext(CommandContext);
  if (context === undefined) {
    throw new Error("useCommand must be used within a CommandProvider");
  }
  return context;
}
