"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  ExternalLink,
  Copy,
  CheckCircle,
  Wallet,
  Coins,
} from "lucide-react";
import StoryProtocolService from "@/lib/storyProtocol";
import apiClient from "@/lib/api/client";

interface RevenueClaimModalProps {
  ipAsset: {
    _id: string;
    title: string;
    storyProtocolAssetId?: string;
    thumbnailUrl?: string;
    owner: string;
    derivatives?: string[];
  };
  onSuccess?: () => void;
}

export default function RevenueClaimModal({
  ipAsset,
  onSuccess,
}: RevenueClaimModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleClaimRevenue = async () => {
    try {
      setLoading(true);
      console.log("Starting revenue claim...");
      console.log("IP Asset ID:", ipAsset.storyProtocolAssetId);
      console.log("Owner:", ipAsset.owner);

      // Use Story Protocol SDK directly
      const storyProtocolService = new StoryProtocolService();
      const claimResult = await storyProtocolService.claimAllRevenue(
        ipAsset.storyProtocolAssetId!,
        ipAsset.owner,
        ipAsset.derivatives || [], // Child IP IDs (derivatives)
        [] // Royalty policies (can be added later)
      );

      console.log("Story Protocol claim result:", claimResult);

      if (claimResult.success) {
        console.log("Story Protocol claim successful, saving to backend...");

        // Save the claim to backend
        const backendResponse = await apiClient.claimRevenue({
          assetId: ipAsset._id,
          ipId: claimResult.ipId,
          claimer: claimResult.claimer,
          claimedTokens: claimResult.claimedTokens as unknown as Record<
            string,
            string
          >,
          transactionHash: claimResult.transactionHash,
        });

        console.log("Backend response:", backendResponse);

        if (backendResponse.success) {
          alert(
            `Revenue claimed successfully!\nTransaction: ${claimResult.transactionHash}\nClaimed: ${claimResult.claimedTokens}`
          );
          setIsOpen(false);
          onSuccess?.();
        } else {
          alert(`Backend error: ${backendResponse.message || "Unknown error"}`);
        }
      } else {
        alert(`Story Protocol error: Unknown error`);
      }
    } catch (error) {
      console.error("Failed to claim revenue:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      alert(`Failed to claim revenue: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!ipAsset.storyProtocolAssetId) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled>
            <TrendingUp className="w-4 h-4 mr-2" />
            Claim Revenue
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Claim Revenue</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center text-muted-foreground">
            IP Asset must be registered with Story Protocol first
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <TrendingUp className="w-4 h-4 mr-2" />
          Claim Revenue
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Claim Revenue from IP Asset</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* IP Asset Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">IP Asset</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {ipAsset.thumbnailUrl && (
                  <img
                    src={ipAsset.thumbnailUrl}
                    alt={ipAsset.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{ipAsset.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">IP Asset</Badge>
                    <Badge variant="secondary">Owner: {ipAsset.owner}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      IP ID: {ipAsset.storyProtocolAssetId}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(ipAsset.storyProtocolAssetId!, "ipId")
                      }
                      className="h-4 w-4 p-0"
                    >
                      {copiedField === "ipId" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        window.open(
                          `https://aeneid.explorer.story.foundation/ipa/${ipAsset.storyProtocolAssetId}`,
                          "_blank"
                        )
                      }
                      className="h-4 w-4 p-0"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Info */}
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4" />
                <span className="text-sm font-medium">Revenue Information</span>
              </div>
              <p className="text-xs text-muted-foreground">
                This will claim all available revenue for this IP Asset from the
                royalty vault. Revenue includes payments from external sources
                and derivative IPs.
              </p>
            </div>

            {ipAsset.derivatives && ipAsset.derivatives.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Derivative Revenue
                  </span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  This IP Asset has {ipAsset.derivatives.length} derivative(s).
                  Revenue from derivatives will also be claimed.
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleClaimRevenue} disabled={loading}>
              {loading ? "Claiming..." : "Claim Revenue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
