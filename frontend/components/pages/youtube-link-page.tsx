"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Youtube, CheckCircle } from "lucide-react";
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

interface YouTubeLinkPageProps {
  onNavigate: (page: PageType) => void;
}

export default function YouTubeLinkPage({ onNavigate }: YouTubeLinkPageProps) {
  const { user, walletAddress, isConnected, connectWallet, logout } = useUser();
  const [channelId, setChannelId] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  const [linkedChannel, setLinkedChannel] = useState("");
  const [linkStatus, setLinkStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleAutomaticLink = async () => {
    setIsLinking(true);

    // Simulate automatic linking
    setTimeout(() => {
      setIsLinking(false);
      setIsLinked(true);
      setLinkedChannel("UCyour-channel-id-here");
    }, 2000);
  };

  const handleManualLink = async () => {
    if (!channelId.trim()) {
      setLinkStatus({
        success: false,
        message: "Please enter your YouTube channel ID",
      });
      return;
    }

    try {
      setIsLinking(true);
      setLinkStatus(null);

      // Simulate API call for manual channel ID
      setTimeout(() => {
        setIsLinking(false);
        setIsLinked(true);
        setLinkedChannel(channelId);
      }, 2000);
    } catch (error) {
      console.error("Failed to link channel:", error);
      setLinkStatus({
        success: false,
        message: "Failed to link channel. Please try again.",
      });
    } finally {
      setIsLinking(false);
    }
  };

  if (isLinked) {
    return (
      <div className="min-h-screen">
        <TopHeader
          userEmail={user?.email || ""}
          currentPage="youtube-link"
          walletAddress={walletAddress || ""}
          connectedWallet={isConnected}
          connectedGoogle={!!user?.email}
          onWalletConnect={connectWallet}
          onDisconnect={logout}
          onNavigate={onNavigate}
        />

        <div className="max-w-2xl mx-auto px-6 py-12 pt-30">
          <Card className="glassy-card p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 flex items-center justify-center rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              ✅ YouTube Channel Linked!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your YouTube channel has been successfully linked to your account.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                <strong>Channel ID:</strong> {linkedChannel}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => onNavigate("dashboard")}
                className="story-button"
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsLinked(false);
                  setLinkedChannel("");
                }}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Link Another Channel
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopHeader
        userEmail={user?.email || ""}
        currentPage="youtube-link"
        walletAddress={walletAddress || ""}
        connectedWallet={isConnected}
        connectedGoogle={!!user?.email}
        onWalletConnect={connectWallet}
        onDisconnect={logout}
        onNavigate={onNavigate}
      />

      <div className="max-w-5xl mx-auto px-6 py-8 pt-30">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <Youtube className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Connect Your YouTube Channel
          </h1>
          <p className="text-white/70 text-lg">
            Link your YouTube channel to verify ownership of your videos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Linking Section */}
          <Card className="glassy-card p-8">
            <h2 className="text-xl font-semibold text-white mb-6">
              YouTube Channel ID
            </h2>

            <div className="space-y-6">
              {/* Channel ID Input */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Channel ID
                </label>
                <Input
                  type="text"
                  placeholder="UCyour-channel-id-here"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              {/* Status Messages */}
              {linkStatus && (
                <div
                  className={`p-4 rounded-lg border ${
                    linkStatus.success
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {linkStatus.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <div className="w-5 h-5 text-red-600 mt-0.5">⚠️</div>
                    )}
                    <div>
                      <p
                        className={`font-medium ${
                          linkStatus.success ? "text-green-800" : "text-red-800"
                        }`}
                      >
                        {linkStatus.success ? "Success!" : "Error"}
                      </p>
                      <p
                        className={`text-sm ${
                          linkStatus.success ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {linkStatus.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleAutomaticLink}
                  disabled={isLinking}
                  className="w-full flex items-center gap-2"
                >
                  {isLinking
                    ? "Linking..."
                    : "Link YouTube Channel (Automatic)"}
                </Button>

                <Button
                  onClick={handleManualLink}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  Manual Channel ID
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => onNavigate("dashboard")}
                  className="w-full text-white/70 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>

          {/* Instructions Section */}
          <Card className="glassy-card p-8">
            <h3 className="text-xl font-semibold text-white mb-6">
              How to Find Your Channel ID
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#41B5FF] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">
                    Go to your YouTube channel
                  </h4>
                  <p className="text-white/70 text-sm">
                    Navigate to your YouTube channel page in your browser
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#41B5FF] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">
                    Look at the URL in your browser
                  </h4>
                  <p className="text-white/70 text-sm">
                    Check the address bar for your channel URL
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#41B5FF] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">
                    Copy the part after /channel/
                  </h4>
                  <p className="text-white/70 text-sm">
                    That&apos;s your Channel ID - the string that starts with
                    &quot;UC&quot;
                  </p>
                </div>
              </div>
            </div>

            {/* Example */}
            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <h4 className="font-medium text-white mb-2">Example:</h4>
              <div className="text-sm text-white/70">
                <p>
                  URL:{" "}
                  <code className="bg-white/10 px-2 py-1 rounded">
                    https://www.youtube.com/channel/UCyour-channel-id-here
                  </code>
                </p>
                <p className="mt-2">
                  Channel ID:{" "}
                  <code className="bg-white/10 px-2 py-1 rounded">
                    your-channel-id-here
                  </code>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
