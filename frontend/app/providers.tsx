"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { SessionProvider } from "next-auth/react";
import { config } from "@/lib/wagmi";
import { UserProvider } from "@/lib/user-context";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <UserProvider>{children}</UserProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}
