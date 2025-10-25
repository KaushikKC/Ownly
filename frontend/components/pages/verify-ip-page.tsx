"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
} from "lucide-react";
import apiClient from "@/lib/api/client";

interface VerifyIPPageProps {
  onNavigate: (
    page:
      | "dashboard"
      | "add-ip"
      | "approvals"
      | "login"
      | "verify-ip"
      | "settings"
  ) => void;
}

export default function VerifyIPPage({ onNavigate }: VerifyIPPageProps) {
  const [url, setUrl] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{
    status: "registered" | "not-registered" | null;
    owner?: { name: string; email: string };
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => onNavigate("dashboard")}
            className="p-2 hover:bg-muted rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Verify IP</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Card className="p-8 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Check IP Registration Status
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Enter a media URL to check if it's already registered as an IP on
            Story Protocol.
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Media URL
              </label>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://instagram.com/reel/..."
                className="w-full"
              />
            </div>

            <Button
              onClick={handleCheck}
              disabled={isChecking || !url}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              {isChecking ? "Checking..." : "Check Ownership"}
            </Button>
          </div>

          {/* Results */}
          {result.status === "registered" && result.asset && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">
                      ✅ IP Already Registered
                    </p>
                    <p className="text-sm text-green-800">
                      Owned by <strong>{result.owner?.name}</strong> (
                      {result.owner?.email})
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
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
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
                  className="mt-2 bg-transparent"
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
