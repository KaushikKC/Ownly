"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import apiClient from "./api/client";

interface UserContextType {
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    walletAddress?: string | null;
    instagramHandle?: string | null;
    youtubeChannelId?: string | null;
  } | null;
  walletAddress: string | null;
  isConnected: boolean;
  isLoading: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  connectGoogle: () => void;
  disconnectGoogle: () => void;
  logout: () => void;
  registerUser: (userData: {
    email: string;
    name: string;
    profilePicture?: string;
    googleId?: string;
    walletAddress?: string;
  }) => Promise<void>;
  updateProfile: (profileData: {
    walletAddress?: string;
    instagramHandle?: string;
    youtubeChannelId?: string;
    preferences?: Record<string, unknown>;
  }) => Promise<void>;
  linkYouTubeChannel: (accessToken: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const [isLoading, setIsLoading] = useState(false);
  const [backendUser, setBackendUser] = useState<{
    id: string;
    email: string;
    name: string;
    profilePicture?: string;
    walletAddress?: string;
    instagramHandle?: string;
    youtubeChannelId?: string;
    preferences?: Record<string, unknown>;
  } | null>(null);

  // Sync with backend when session or wallet changes
  useEffect(() => {
    const syncWithBackend = async () => {
      if (session?.user && address) {
        try {
          // Register/update user in backend
          const response = await registerUser({
            email: session.user.email || "",
            name: session.user.name || "",
            profilePicture: session.user.image || undefined,
            googleId: session.user.id || undefined,
            walletAddress: address,
          });

          console.log("User synced with backend:", response);
        } catch (error) {
          console.error("Failed to sync with backend:", error);
        }
      }
    };

    if (session?.user && address) {
      syncWithBackend();
    }
  }, [session, address]);

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

  const disconnectWallet = async () => {
    try {
      setIsLoading(true);
      await disconnect();
      // Clear backend user data when wallet disconnects
      setBackendUser(null);
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Complete logout - disconnect both wallet and Google
  const logout = async () => {
    try {
      setIsLoading(true);
      // Disconnect wallet
      await disconnect();
      // Sign out from Google
      await signOut({ callbackUrl: "/" });
      // Clear backend user data
      setBackendUser(null);
    } catch (error) {
      console.error("Failed to logout:", error);
    } finally {
      setIsLoading(false);
    }
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
      // Clear backend user data when Google disconnects
      setBackendUser(null);
    } catch (error) {
      console.error("Failed to disconnect Google:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (userData: {
    email: string;
    name: string;
    profilePicture?: string;
    googleId?: string;
    walletAddress?: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await apiClient.registerUser(userData);
      if (response.success) {
        setBackendUser(response.user);
      }
      return response;
    } catch (error) {
      console.error("Failed to register user:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: {
    walletAddress?: string;
    instagramHandle?: string;
    youtubeChannelId?: string;
    preferences?: Record<string, unknown>;
  }) => {
    try {
      setIsLoading(true);
      const response = await apiClient.updateUserProfile(profileData);
      if (response.success) {
        setBackendUser(response.user);
      }
      return response;
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const linkYouTubeChannel = async (accessToken: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.linkYouTubeChannel(accessToken);
      if (response.success) {
        // Update user context with YouTube channel info
        setBackendUser((prev: typeof backendUser) =>
          prev
            ? {
                ...prev,
                youtubeChannelId: response.channelInfo.channelId,
              }
            : null
        );
      }
      return response;
    } catch (error) {
      console.error("Failed to link YouTube channel:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user: backendUser || session?.user || null,
    walletAddress: address || null,
    isConnected: isConnected && !!session?.user,
    isLoading: status === "loading" || isLoading,
    connectWallet,
    disconnectWallet,
    connectGoogle,
    disconnectGoogle,
    logout,
    registerUser,
    updateProfile,
    linkYouTubeChannel,
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
