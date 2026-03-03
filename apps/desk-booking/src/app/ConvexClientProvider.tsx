"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const AUTH_PROVIDER = process.env.NEXT_PUBLIC_AUTH_PROVIDER;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (AUTH_PROVIDER === "clerk") {
    // When using Clerk, AuthProvider wraps ConvexProviderWithClerk
    return (
      <AuthProvider convexClient={convex}>
        {children}
      </AuthProvider>
    );
  }

  // Guest-only mode: plain ConvexProvider
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
