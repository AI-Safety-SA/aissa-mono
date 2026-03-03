"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";

const AUTH_PROVIDER = process.env.NEXT_PUBLIC_AUTH_PROVIDER;

interface AuthProviderProps {
  children: ReactNode;
  convexClient: ConvexReactClient;
}

export function AuthProvider({ children, convexClient }: AuthProviderProps) {
  if (AUTH_PROVIDER === "clerk") {
    // Clerk integration requires:
    // 1. pnpm add @clerk/nextjs
    // 2. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY env vars
    // 3. Set NEXT_PUBLIC_AUTH_PROVIDER=clerk
    //
    // When Clerk is not installed, this falls back to plain ConvexProvider.
    return <ConvexProvider client={convexClient}>{children}</ConvexProvider>;
  }

  // Guest-only mode: plain ConvexProvider
  return <ConvexProvider client={convexClient}>{children}</ConvexProvider>;
}

export function useAuthMode() {
  return {
    provider: AUTH_PROVIDER ?? "guest",
    isGuestOnly: !AUTH_PROVIDER,
    isClerk: AUTH_PROVIDER === "clerk",
  };
}
