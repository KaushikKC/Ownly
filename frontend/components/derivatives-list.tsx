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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5" />
          Derivatives ({asset.derivatives.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {asset.derivatives.map((derivative, index) => (
            <div key={derivative._id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{derivative.title}</h4>
                    <Badge variant="outline">
                      {derivative.license?.type || "Derivative"}
                    </Badge>
                    <Badge variant="secondary">
                      {derivative.license?.royaltyPercentage || 0}% Royalty
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    {derivative.description}
                  </p>

                  <div className="space-y-1 text-xs">
                    {derivative.storyProtocolAssetId && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">IP ID:</span>
                        <span className="font-mono">
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
                          className="h-4 w-4 p-0"
                        >
                          {copiedField === `derivative-ip-${index}` ? (
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
                              `https://aeneid.explorer.story.foundation/ipa/${derivative.storyProtocolAssetId}`,
                              "_blank"
                            )
                          }
                          className="h-4 w-4 p-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    {derivative.nftTokenId && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Token ID:</span>
                        <span className="font-mono">
                          {derivative.nftTokenId}
                        </span>
                      </div>
                    )}

                    {derivative.registeredAt && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          Registered:
                        </span>
                        <span>
                          {new Date(
                            derivative.registeredAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        variant={
                          derivative.status === "registered"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {derivative.status}
                      </Badge>
                    </div>
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
