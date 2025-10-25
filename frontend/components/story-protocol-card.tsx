"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, CheckCircle, AlertCircle } from "lucide-react";
import apiClient from "@/lib/api/client";

interface StoryProtocolCardProps {
  asset: {
    _id: string;
    title: string;
    sourceUrl: string;
    thumbnailUrl?: string;
    nftTokenId?: string;
    nftContractAddress?: string;
    storyProtocolAssetId?: string;
    status: string;
    registeredAt?: string;
  };
}

export default function StoryProtocolCard({ asset }: StoryProtocolCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [storyData, setStoryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const loadStoryProtocolData = async () => {
    if (!asset.storyProtocolAssetId) return;

    try {
      setLoading(true);
      const response = await apiClient.getStoryProtocolData(asset._id);
      if (response.success) {
        setStoryData(response.storyProtocol);
      }
    } catch (error) {
      console.error("Failed to load Story Protocol data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "registered":
        return (
          <Badge className="bg-green-100 text-green-800">Registered</Badge>
        );
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{asset.title}</CardTitle>
          {getStatusBadge(asset.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {asset.thumbnailUrl && (
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={asset.thumbnailUrl}
              alt={asset.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {asset.storyProtocolAssetId ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Registered on Story Protocol
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Asset ID:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">
                    {asset.storyProtocolAssetId}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      copyToClipboard(asset.storyProtocolAssetId!, "assetId")
                    }
                    className="h-6 w-6 p-0"
                  >
                    {copiedField === "assetId" ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>

              {asset.nftTokenId && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">NFT Token ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">
                      {asset.nftTokenId}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(asset.nftTokenId!, "tokenId")
                      }
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === "tokenId" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {asset.nftContractAddress && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Contract:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">
                      {asset.nftContractAddress.slice(0, 6)}...
                      {asset.nftContractAddress.slice(-4)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(asset.nftContractAddress!, "contract")
                      }
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === "contract" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {asset.registeredAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Registered:</span>
                  <span className="text-xs">
                    {new Date(asset.registeredAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadStoryProtocolData}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Loading..." : "View Details"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(asset.sourceUrl, "_blank")}
                className="flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Source
              </Button>
            </div>

            {storyData && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-2">
                  Story Protocol Details
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">License ID:</span>
                    <span className="font-mono">{storyData.licenseId}</span>
                  </div>
                  {storyData.assetData && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span>{storyData.assetData.status}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Not registered with Story Protocol</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
