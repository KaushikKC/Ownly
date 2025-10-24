"use client";

import { createContext, useContext, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

interface UserContextType {
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  } | null;
  walletAddress: string | null;
  isConnected: boolean;
  isLoading: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  connectGoogle: () => void;
  disconnectGoogle: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      if (connectors[0]) {
        await connect({ connector: connectors[0] });
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    disconnect();
  };

  const connectGoogle = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Failed to connect Google:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectGoogle = async () => {
    try {
      setIsLoading(true);
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Failed to disconnect Google:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user: session?.user || null,
    walletAddress: address || null,
    isConnected: isConnected && !!session?.user,
    isLoading: status === "loading" || isLoading,
    connectWallet,
    disconnectWallet,
    connectGoogle,
    disconnectGoogle,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
