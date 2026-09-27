"use client";

import { createContext, useContext, type ReactNode } from "react";

const CapabilityContext = createContext<Set<string>>(new Set());

/** Capabilities of the current context (from GET /navigation?context=…); drives buttons, never security. */
export function CapabilityProvider({ capabilities, children }: { capabilities: string[]; children: ReactNode }) {
  return <CapabilityContext.Provider value={new Set(capabilities)}>{children}</CapabilityContext.Provider>;
}

export function useCan(code: string): boolean {
  return useContext(CapabilityContext).has(code);
}

export function Can({ code, children }: { code: string; children: ReactNode }) {
  return useCan(code) ? <>{children}</> : null;
}
