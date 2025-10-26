"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Copy,
  CheckCircle,
  Link as LinkIcon,
} from "lucide-react";

interface DerivativesListProps {
  asset: {
    _id: string;
    title: string;
    storyProtocolAssetId?: string;
    derivatives?: Array<{
      _id: string;
      title: string;
      description: string;
      storyProtocolAssetId?: string;
      nftTokenId?: string;
      status: string;
      registeredAt?: string;
      license?: {
        type: string;
        royaltyPercentage: number;
        parentAssetId: string;
      };
    }>;
  };
}

export default function DerivativesList({ asset }: DerivativesListProps) {
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

  if (!asset.derivatives || asset.derivatives.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Derivatives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <LinkIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No derivatives created yet</p>
            <p className="text-sm">Create derivatives to show them here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full glassy-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-white">
          <LinkIcon className="w-5 h-5 text-[#41B5FF]" />
          Derivatives ({asset.derivatives.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {asset.derivatives.map((derivative, index) => (
            <div
              key={derivative._id}
              className="p-4 bg-white/5 border border-white/10 rounded-lg"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="font-medium text-white truncate">
                        {derivative.title}
                      </h4>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                        {derivative.license?.type || "Derivative"}
                      </Badge>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                        {derivative.license?.royaltyPercentage || 0}% Royalty
                      </Badge>
                    </div>

                    <p className="text-sm text-white/70 mb-3 line-clamp-2">
                      {derivative.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {derivative.storyProtocolAssetId && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-white/70 shrink-0">IP ID:</span>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="font-mono text-white/90 truncate">
                          {derivative.storyProtocolAssetId}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            copyToClipboard(
                              derivative.storyProtocolAssetId!,
                              `derivative-ip-${index}`
                            )
                          }
                          className="h-6 w-6 p-0 shrink-0 hover:bg-white/10"
                        >
                          {copiedField === `derivative-ip-${index}` ? (
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-white/60" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            window.open(
                              `https://aeneid.explorer.story.foundation/ipa/${derivative.storyProtocolAssetId}`,
                              "_blank"
                            )
                          }
                          className="h-6 w-6 p-0 shrink-0 hover:bg-white/10"
                        >
                          <ExternalLink className="w-3 h-3 text-white/60" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {derivative.nftTokenId && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-white/70 shrink-0">Token ID:</span>
                      <span className="font-mono text-white/90 truncate">
                        {derivative.nftTokenId}
                      </span>
                    </div>
                  )}

                  {derivative.registeredAt && (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-white/70 shrink-0">
                        Registered:
                      </span>
                      <span className="text-white/90">
                        {new Date(derivative.registeredAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-white/70 shrink-0">Status:</span>
                    <Badge
                      className={
                        derivative.status === "registered"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      }
                    >
                      {derivative.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
