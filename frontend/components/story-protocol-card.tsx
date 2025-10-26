"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Copy, CheckCircle, AlertCircle } from "lucide-react";
import apiClient from "@/lib/api/client";
import LicenseManagementCard from "./license-management-card";
import DerivativeRegistrationModal from "./derivative-registration-modal";
import RevenueTrackingCard from "./revenue-tracking-card";
import DerivativesList from "./derivatives-list";

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
  const [storyData, setStoryData] = useState<{
    assetId: string;
    nftTokenId: string;
    nftContractAddress: string;
    licenseId: string;
    transactionHashes: { registration: string };
    ipfsHash: string;
    storyProtocolAssetId: string;
    status: string;
    license: { type: string; royaltyPercentage?: number };
  } | null>(null);
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
        setStoryData(response.storyProtocolData);
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
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Registered
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            Pending
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-white/10 text-white/80 border-white/20">
            Draft
          </Badge>
        );
      default:
        return (
          <Badge className="bg-white/10 text-white/80 border-white/20">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card className="w-full glassy-card overflow-hidden hover:border-[#41B5FF]/50 hover:shadow-2xl hover:shadow-[#41B5FF]/20 transition-all cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg text-white line-clamp-2 flex-1 min-w-0">
            {asset.title}
          </CardTitle>
          <div className="shrink-0">{getStatusBadge(asset.status)}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {asset.thumbnailUrl && (
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset.thumbnailUrl}
              alt={asset.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {asset.storyProtocolAssetId ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
              <TabsTrigger
                value="overview"
                className="text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="license"
                className="text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white"
              >
                License
              </TabsTrigger>
              <TabsTrigger
                value="derivative"
                className="text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white"
              >
                Derivative
              </TabsTrigger>
              <TabsTrigger
                value="revenue"
                className="text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white"
              >
                Revenue
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-300">
                  Registered on Story Protocol
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-white/70 shrink-0">Asset ID:</span>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-mono text-xs text-white/90 truncate">
                      {asset.storyProtocolAssetId}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(asset.storyProtocolAssetId!, "assetId")
                      }
                      className="h-6 w-6 p-0 shrink-0 hover:bg-white/10"
                    >
                      {copiedField === "assetId" ? (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-white/60" />
                      )}
                    </Button>
                  </div>
                </div>

                {asset.nftTokenId && (
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-white/70 shrink-0">
                      NFT Token ID:
                    </span>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-mono text-xs text-white/90 truncate">
                        {asset.nftTokenId}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard(asset.nftTokenId!, "tokenId")
                        }
                        className="h-6 w-6 p-0 shrink-0 hover:bg-white/10"
                      >
                        {copiedField === "tokenId" ? (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-white/60" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {asset.nftContractAddress && (
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-white/70 shrink-0">Contract:</span>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-mono text-xs text-white/90 truncate">
                        {asset.nftContractAddress.slice(0, 6)}...
                        {asset.nftContractAddress.slice(-4)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard(asset.nftContractAddress!, "contract")
                        }
                        className="h-6 w-6 p-0 shrink-0 hover:bg-white/10"
                      >
                        {copiedField === "contract" ? (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-white/60" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {asset.registeredAt && (
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-white/70 shrink-0">Registered:</span>
                    <span className="text-xs text-white/90">
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
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground shrink-0">
                        Asset ID:
                      </span>
                      <span className="font-mono text-xs truncate">
                        {storyData.storyProtocolAssetId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span>{storyData.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        License Type:
                      </span>
                      <span>{storyData.license?.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Royalty:</span>
                      <span>{storyData.license?.royaltyPercentage}%</span>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="license">
              <LicenseManagementCard asset={asset} />
            </TabsContent>

            <TabsContent value="derivative">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Derivative Registration
                  </h3>
                </div>
                <DerivativeRegistrationModal
                  parentAsset={asset}
                  onSuccess={() => window.location.reload()}
                />
                <div className="text-sm text-muted-foreground">
                  Register a derivative work based on this IP asset. This will
                  create a new IP asset that references this one as its parent.
                </div>

                {/* Show existing derivatives */}
                <DerivativesList asset={asset} />
              </div>
            </TabsContent>

            <TabsContent value="revenue">
              <RevenueTrackingCard asset={asset} />
            </TabsContent>
          </Tabs>
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
