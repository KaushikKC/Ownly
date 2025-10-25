"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, Plus, Menu, Youtube, LogOut, RefreshCw } from "lucide-react";
import IPCard from "@/components/ip-card";
import IPDetailModal from "@/components/ip-detail-modal";
import StoryProtocolCard from "@/components/story-protocol-card";
import Sidebar from "@/components/sidebar";
import { useUser } from "@/lib/user-context";
import apiClient from "@/lib/api/client";

interface DashboardPageProps {
  userEmail: string;
  onNavigate: (
    page:
      | "dashboard"
      | "add-ip"
      | "approvals"
      | "login"
      | "verify-ip"
      | "settings"
      | "youtube-import"
      | "license-video"
      | "youtube-link"
  ) => void;
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

const mockIPs = [
  {
    id: "1",
    title: "Sunset Beats – Remix License",
    thumbnail: "/sunset-beats-music-video.jpg",
    platform: "YouTube",
    collaborators: ["@alexwave", "@mira.codes"],
    licenseType: "Commercial Remix",
    status: "Registered",
    ownership: "50%",
  },
  {
    id: "2",
    title: "Ocean Reels Collaboration",
    thumbnail: "/ocean-waves-video.png",
    platform: "YouTube",
    collaborators: ["@johnfilm"],
    licenseType: "Non-Commercial",
    status: "Registered",
    ownership: "50%",
  },
  {
    id: "3",
    title: "TechTalk Ep. 4",
    thumbnail: "/tech-talk-podcast.jpg",
    platform: "YouTube",
    collaborators: ["@alexwave", "@mira.codes", "@johnfilm"],
    licenseType: "Private Draft",
    status: "Draft",
    ownership: "50%",
  },
  {
    id: "4",
    title: "Summer Vibes Mix",
    thumbnail: "/summer-music-mix.jpg",
    platform: "Instagram",
    collaborators: ["@mira.codes"],
    licenseType: "Commercial Remix",
    status: "Registered",
    ownership: "75%",
  },
  {
    id: "5",
    title: "Creative Collab Series",
    thumbnail: "/creative-collaboration.jpg",
    platform: "YouTube",
    collaborators: ["@alexwave", "@johnfilm"],
    licenseType: "Commercial Remix",
    status: "Registered",
    ownership: "40%",
  },
  {
    id: "6",
    title: "Podcast Episode 12",
    thumbnail: "/podcast-recording.jpg",
    platform: "YouTube",
    collaborators: [],
    licenseType: "Non-Commercial",
    status: "Registered",
    ownership: "100%",
  },
  {
    id: "7",
    title: "Behind the Scenes",
    thumbnail: "/behind-the-scenes-footage.jpg",
    platform: "Instagram",
    collaborators: ["@mira.codes"],
    licenseType: "Private Draft",
    status: "Draft",
    ownership: "100%",
  },
  {
    id: "8",
    title: "Music Production Tutorial",
    thumbnail: "/music-production-tutorial.jpg",
    platform: "YouTube",
    collaborators: ["@johnfilm"],
    licenseType: "Non-Commercial",
    status: "Registered",
    ownership: "60%",
  },
];

export default function DashboardPage({
  userEmail,
  onNavigate,
}: DashboardPageProps) {
  const { user, logout } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedIP, setSelectedIP] = useState<(typeof mockIPs)[0] | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleIPSelect = (ip: (typeof mockIPs)[0]) => {
    setSelectedIP(ip);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onNavigate={onNavigate}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="border-b border-border bg-card">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-muted rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-foreground">My IPs</h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={loadUserAssets}
                className="p-2 hover:bg-muted rounded-lg relative"
                title="Refresh assets"
              >
                <RefreshCw className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="p-2 hover:bg-muted rounded-lg relative">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-border">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">
                    {userEmail.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">
                    {userEmail || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">0xA23F...4F9B</p>
                </div>
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Card className="p-6 bg-card border border-border">
                <p className="text-sm text-muted-foreground mb-1">
                  Total Registered IPs
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {loading ? "..." : userAssets.length + mockIPs.length}
                </p>
              </Card>
              <Card className="p-6 bg-card border border-border">
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
              <Card className="p-6 bg-card border border-border">
                <p className="text-sm text-muted-foreground mb-1">
                  Royalties Earned
                </p>
                <p className="text-3xl font-bold text-foreground">$1,240</p>
              </Card>
            </div>

            {/* IP Cards */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  My IPs
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => onNavigate("youtube-link")}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Youtube className="w-4 h-4" />
                    Link YouTube
                  </Button>
                  <Button
                    onClick={() => onNavigate("add-ip")}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add New IP
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Show user's real assets with Story Protocol integration */}
                {userAssets.map((asset: UserAsset) => (
                  <StoryProtocolCard key={asset._id} asset={asset} />
                ))}

                {/* Show mock IPs for demonstration */}
                {mockIPs.map((ip) => (
                  <IPCard key={ip.id} {...ip} onSelect={handleIPSelect} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <IPDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ip={selectedIP}
      />
    </div>
  );
}
