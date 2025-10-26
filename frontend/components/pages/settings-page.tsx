"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Wallet, Mail, Instagram, X, Youtube } from "lucide-react";
import TopHeader from "@/components/header";
import { useUser } from "@/lib/user-context";

type PageType =
  | "login"
  | "dashboard"
  | "add-ip"
  | "approvals"
  | "verify-ip"
  | "settings"
  | "youtube-import"
  | "license-video"
  | "youtube-link";

interface SettingsPageProps {
  userEmail: string;
  wallet: string;
  google: string;
  instagram: string;
  youtubeChannelId?: string;
  onNavigate: (page: PageType) => void;
}

export default function SettingsPage({
  userEmail,
  wallet,
  google,
  instagram,
  youtubeChannelId,
  onNavigate,
}: SettingsPageProps) {
  const {
    user,
    walletAddress,
    isConnected,
    connectWallet,
    disconnectWallet,
    logout,
  } = useUser();
  const [displayName, setDisplayName] = useState("Alex Wave");
  const [youtubeChannelIdInput, setYoutubeChannelIdInput] = useState(
    youtubeChannelId || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update YouTube channel ID if it has changed
      if (youtubeChannelIdInput !== youtubeChannelId) {
        // This would need to be connected to the user context
        console.log("Saving YouTube Channel ID:", youtubeChannelIdInput);
        // await updateYouTubeChannelId(youtubeChannelIdInput);
      }

      setTimeout(() => {
        setIsSaving(false);
        alert("Settings saved!");
      }, 500);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setIsSaving(false);
      alert("Failed to save settings. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopHeader
        userEmail={userEmail}
        currentPage="settings"
        walletAddress={walletAddress || ""}
        connectedWallet={isConnected}
        connectedGoogle={!!user?.email}
        onWalletConnect={connectWallet}
        onDisconnect={logout}
        onNavigate={onNavigate}
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Profile Section */}
          <Card className="p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Display Name
                </label>
                <Input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={userEmail}
                  disabled
                  className="w-full opacity-50"
                />
              </div>
            </div>
          </Card>

          {/* Wallet & Integrations */}
          <Card className="p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Connected Accounts
            </h2>
            <div className="space-y-4">
              {/* Wallet */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Wallet</p>
                    <p className="text-sm text-muted-foreground">
                      {wallet || "Not connected"}
                    </p>
                  </div>
                </div>
                {wallet && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1 bg-transparent"
                  >
                    <X className="w-4 h-4" />
                    Disconnect
                  </Button>
                )}
              </div>

              {/* Google */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Google</p>
                    <p className="text-sm text-muted-foreground">
                      {google || "Not connected"}
                    </p>
                  </div>
                </div>
                {google && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1 bg-transparent"
                  >
                    <X className="w-4 h-4" />
                    Disconnect
                  </Button>
                )}
              </div>

              {/* Instagram */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Instagram className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Instagram</p>
                    <p className="text-sm text-muted-foreground">
                      {instagram || "Not connected"}
                    </p>
                  </div>
                </div>
                {instagram && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1 bg-transparent"
                  >
                    <X className="w-4 h-4" />
                    Disconnect
                  </Button>
                )}
              </div>

              {/* YouTube Channel ID Input */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Youtube className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      YouTube Channel ID
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {youtubeChannelId
                        ? "Your YouTube channel ID is set and ready for IP verification"
                        : "Enter your YouTube channel ID for IP verification"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="UCxxxxxxxxxxxxxxxxxxxxxx"
                    value={youtubeChannelIdInput}
                    onChange={(e) => setYoutubeChannelIdInput(e.target.value)}
                    className="w-full"
                  />
                  {youtubeChannelId ? (
                    <p className="text-xs text-green-600">
                      ✅ YouTube channel ID is set and ready for use
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Find your channel ID in your YouTube channel URL or
                      channel settings
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onNavigate("dashboard")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
