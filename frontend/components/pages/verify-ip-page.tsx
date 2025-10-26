"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Copy, ExternalLink } from "lucide-react";
import TopHeader from "@/components/header";
import { useUser } from "@/lib/user-context";
import apiClient from "@/lib/api/client";

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

interface VerifyIPPageProps {
  onNavigate: (page: PageType) => void;
}

export default function VerifyIPPage({ onNavigate }: VerifyIPPageProps) {
  const { user, walletAddress, isConnected, connectWallet, logout } = useUser();
  const [url, setUrl] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{
    status: "registered" | "not-registered" | null;
    owner?: string;
    asset?: {
      id: string;
      title: string;
      status: string;
      registeredAt: string;
      storyProtocolAssetId?: string;
      thumbnailUrl?: string;
      sourceUrl: string;
    };
  }>({
    status: null,
  });

  const handleCheck = async () => {
    if (!url) return;
    setIsChecking(true);

    try {
      const response = await apiClient.checkURL(url);
      if (response.success && response.isRegistered) {
        setResult({
          status: "registered",
          owner: response.owner,
          asset: response.asset,
        });
      } else {
        setResult({
          status: "not-registered",
        });
      }
    } catch (error) {
      console.error("Failed to check URL:", error);
      setResult({
        status: "not-registered",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen">
      <TopHeader
        userEmail={user?.email || ""}
        currentPage="verify-ip"
        walletAddress={walletAddress || ""}
        connectedWallet={isConnected}
        connectedGoogle={!!user?.email}
        onWalletConnect={connectWallet}
        onDisconnect={logout}
        onNavigate={onNavigate}
      />

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12 pt-30">
        <Card className="glassy-card p-8">
          <h2 className="text-lg font-semibold text-white mb-2">
            Check IP Registration Status
          </h2>
          <p className="text-sm text-white/70 mb-6">
            Enter a media URL to check if it&apos;s already registered as an IP
            on Story Protocol.
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Media URL
              </label>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/video"
                className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <Button
              onClick={handleCheck}
              disabled={isChecking || !url}
              className="w-full disabled:opacity-50"
            >
              {isChecking ? "Checking..." : "Check Ownership"}
            </Button>
          </div>

          {/* Results */}
          {result.status === "registered" && result.asset && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">
                      ✅ IP Already Registered
                    </p>
                    <p className="text-sm text-green-800">
                      Owned by <strong>{result.owner}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Asset Details */}
              <Card className="p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-3">
                  IP Asset Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-medium">{result.asset.title}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.asset.status === "registered"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {result.asset.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Registered Date
                    </p>
                    <p className="text-sm">
                      {result.asset.registeredAt
                        ? new Date(
                            result.asset.registeredAt
                          ).toLocaleDateString()
                        : "Date not available"}
                    </p>
                  </div>

                  {result.asset.storyProtocolAssetId && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Story Protocol Asset ID
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {result.asset.storyProtocolAssetId}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            result.asset &&
                            handleCopy(result.asset.storyProtocolAssetId!)
                          }
                          className="p-1"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        result.asset &&
                        window.open(result.asset.sourceUrl, "_blank")
                      }
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Source
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigate("dashboard")}
                    >
                      View in Dashboard
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {result.status === "not-registered" && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">
                  ❌ Not Registered
                </p>
                <p className="text-sm text-yellow-800">
                  This media is not yet registered as an IP.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-yellow-800 bg-transparent"
                  onClick={() => onNavigate("add-ip")}
                >
                  Register as New IP
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
