"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Youtube } from "lucide-react";
import StoryProtocolCard from "@/components/story-protocol-card";
import TopHeader from "@/components/header";
import { useUser } from "@/lib/user-context";
import apiClient from "@/lib/api/client";

type PageType =
  | "dashboard"
  | "add-ip"
  | "approvals"
  | "login"
  | "verify-ip"
  | "settings"
  | "youtube-import"
  | "license-video"
  | "youtube-link";

interface DashboardPageProps {
  userEmail: string;
  onNavigate: (page: PageType) => void;
}

interface UserAsset {
  _id: string;
  title: string;
  description: string;
  sourceUrl: string;
  sourcePlatform: string;
  thumbnailUrl: string;
  status: string;
  storyProtocolAssetId?: string;
  owner: string;
  collaborators: Array<{
    userId: string;
    walletAddress: string;
    ownershipPercentage: number;
    role: string;
    approved: boolean;
  }>;
  license: {
    type: string;
    price: number;
    royaltyPercentage: number;
    terms: string;
    commercialUse: boolean;
    attributionRequired: boolean;
    exclusivity: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage({
  userEmail,
  onNavigate,
}: DashboardPageProps) {
  const { user, logout, walletAddress, isConnected, connectWallet } = useUser();
  const [userAssets, setUserAssets] = useState<UserAsset[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user assets function
  const loadUserAssets = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Dashboard - User object:", user);
      console.log("Dashboard - Wallet address:", user?.walletAddress);
      console.log(
        "Dashboard - Wallet address type:",
        typeof user?.walletAddress
      );

      // Check if wallet address is valid
      const isValidWalletAddress =
        user?.walletAddress && /^0x[a-fA-F0-9]{40}$/.test(user.walletAddress);
      console.log("Dashboard - Is valid wallet address:", isValidWalletAddress);

      if (!isValidWalletAddress) {
        console.log("Dashboard - Invalid wallet address, skipping API call");
        console.log(
          "Dashboard - Please connect your wallet to view your IP assets"
        );
        setLoading(false);
        return;
      }

      const response = await apiClient.getMyAssets(
        user?.walletAddress || undefined
      );
      if (response.success) {
        setUserAssets(response.assets);
        console.log("Dashboard - Loaded assets:", response.assets.length);
      }
    } catch (error) {
      console.error("Failed to load user assets:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load user assets on component mount and when wallet address changes
  useEffect(() => {
    loadUserAssets();
  }, [loadUserAssets]);

  // Reload assets when component becomes visible (user navigates back to dashboard)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.walletAddress) {
        console.log("Dashboard - Page became visible, reloading assets");
        loadUserAssets();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user?.walletAddress, loadUserAssets]);

  return (
    <div className="min-h-screen">
      <TopHeader
        userEmail={userEmail}
        currentPage="dashboard"
        walletAddress={walletAddress || ""}
        connectedWallet={isConnected}
        connectedGoogle={!!user?.email}
        onWalletConnect={connectWallet}
        onDisconnect={logout}
        onNavigate={onNavigate}
      />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-30">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="glassy-card p-6">
            <p className="text-sm text-muted-foreground mb-1">
              Total Registered IPs
            </p>
            <p className="text-3xl font-bold text-foreground">
              {loading ? "..." : userAssets.length}
            </p>
          </Card>
          <Card className="glassy-card p-6">
            <p className="text-sm text-muted-foreground mb-1">
              Story Protocol Assets
            </p>
            <p className="text-3xl font-bold text-foreground">
              {loading
                ? "..."
                : userAssets.filter(
                    (asset: UserAsset) => asset.storyProtocolAssetId
                  ).length}
            </p>
          </Card>
          <Card className="glassy-card p-6">
            <p className="text-sm text-muted-foreground mb-1">
              Royalties Earned
            </p>
            <p className="text-3xl font-bold text-foreground">$1,240</p>
          </Card>
        </div>

        {/* IP Cards */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">My IPs</h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onNavigate("youtube-link")}
                className="story-button flex items-center gap-2"
              >
                <Youtube className="w-4 h-4" />
                Link YouTube
              </Button>
              <Button
                onClick={() => onNavigate("add-ip")}
                className="story-button flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New IP
              </Button>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground">
                  Loading your IP assets...
                </p>
              </div>
            </div>
          ) : userAssets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Show user's real assets with Story Protocol integration */}
              {userAssets.map((asset: UserAsset) => (
                <StoryProtocolCard key={asset._id} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <Plus className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No IP Assets Yet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                You haven&apos;t registered any IP assets yet. Start by adding
                your first creative work or linking your YouTube channel to
                import content.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => onNavigate("add-ip")}
                  className="story-button flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New IP
                </Button>
                <Button
                  onClick={() => onNavigate("youtube-link")}
                  className="story-button flex items-center gap-2"
                >
                  <Youtube className="w-4 h-4" />
                  Link YouTube
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
