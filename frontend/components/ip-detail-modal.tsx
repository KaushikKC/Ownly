"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Share2, Download } from "lucide-react";
import RoyaltyPaymentModal from "./royalty-payment-modal";
import RevenueClaimModal from "./revenue-claim-modal";

interface IPDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ip: {
    id: string;
    title: string;
    thumbnail: string;
    collaborators: string[];
    licenseType: string;
    status: string;
    storyProtocolAssetId?: string;
    owner?: string;
    derivatives?: string[];
  } | null;
}

export default function IPDetailModal({
  isOpen,
  onClose,
  ip,
}: IPDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!ip) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getLicenseColor = (type: string) => {
    switch (type) {
      case "Commercial Remix":
        return "bg-blue-100 text-blue-800";
      case "Non-Commercial":
        return "bg-purple-100 text-purple-800";
      case "Private Draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (s: string) => {
    return s === "Active"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {ip.title}
          </DialogTitle>
        </DialogHeader>

        {/* Thumbnail */}
        <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
          <img
            src={ip.thumbnail || "/placeholder.svg"}
            alt={ip.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Status and License Badges */}
        <div className="flex gap-2 flex-wrap mb-6">
          <Badge className={`text-sm ${getLicenseColor(ip.licenseType)}`}>
            {ip.licenseType}
          </Badge>
          <Badge className={`text-sm ${getStatusColor(ip.status)}`}>
            {ip.status}
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
            <TabsTrigger value="rights">Rights</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card className="p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4">
                IP Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">IP ID</p>
                  <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                    <code className="text-sm font-mono text-foreground">
                      0x{ip.id}...{ip.id.slice(-4)}
                    </code>
                    <button
                      onClick={() =>
                        handleCopy(`0x${ip.id}...${ip.id.slice(-4)}`, "ipId")
                      }
                      className="p-1 hover:bg-background rounded"
                    >
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    License Type
                  </p>
                  <p className="text-foreground font-medium">
                    {ip.licenseType}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <p className="text-foreground font-medium">{ip.status}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created</p>
                  <p className="text-foreground font-medium">
                    January 15, 2024
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4">
                Description
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This is a collaborative IP project featuring remix rights and
                commercial licensing. The project includes contributions from
                multiple creators and is actively managed on Story Protocol.
              </p>
            </Card>
          </TabsContent>

          {/* Collaborators Tab */}
          <TabsContent value="collaborators" className="space-y-4 mt-4">
            <Card className="p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4">
                Collaborators ({ip.collaborators.length})
              </h3>
              <div className="space-y-3">
                {ip.collaborators.map((collab, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {collab.charAt(1).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{collab}</p>
                        <p className="text-xs text-muted-foreground">
                          Ownership: {Math.round(100 / ip.collaborators.length)}
                          %
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Profile
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Rights Tab */}
          <TabsContent value="rights" className="space-y-4 mt-4">
            <Card className="p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4">
                License Rights
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Commercial Use
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Allowed for commercial projects
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Remix Rights</p>
                    <p className="text-sm text-muted-foreground">
                      Can be remixed and modified
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Distribution</p>
                    <p className="text-sm text-muted-foreground">
                      Can be distributed publicly
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✕</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Sublicensing</p>
                    <p className="text-sm text-muted-foreground">
                      Cannot be sublicensed
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4 mt-4">
            <Card className="p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4 pb-4 border-b border-border last:border-b-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-foreground">IP Registered</p>
                    <p className="text-sm text-muted-foreground">
                      January 15, 2024 at 10:30 AM
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pb-4 border-b border-border last:border-b-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-foreground">
                      Collaborators Added
                    </p>
                    <p className="text-sm text-muted-foreground">
                      January 15, 2024 at 10:45 AM
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pb-4 border-b border-border last:border-b-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-foreground">
                      License Activated
                    </p>
                    <p className="text-sm text-muted-foreground">
                      January 15, 2024 at 11:00 AM
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-foreground">
                      Royalty Payment Received
                    </p>
                    <p className="text-sm text-muted-foreground">
                      January 20, 2024 at 2:15 PM
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-border">
          <Button
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2 bg-transparent"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2 bg-transparent"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
            Edit IP
          </Button>
        </div>

        {/* Royalty Actions */}
        {ip.storyProtocolAssetId && (
          <div className="flex gap-3 mt-4">
            <RoyaltyPaymentModal
              ipAsset={{
                _id: ip.id,
                title: ip.title,
                storyProtocolAssetId: ip.storyProtocolAssetId,
                thumbnailUrl: ip.thumbnail,
                owner: ip.owner || "Unknown",
              }}
              onSuccess={() => {
                // Refresh data or show success message
                console.log("Royalty payment successful");
              }}
            />
            <RevenueClaimModal
              ipAsset={{
                _id: ip.id,
                title: ip.title,
                storyProtocolAssetId: ip.storyProtocolAssetId,
                thumbnailUrl: ip.thumbnail,
                owner: ip.owner || "Unknown",
                derivatives: ip.derivatives || [],
              }}
              onSuccess={() => {
                // Refresh data or show success message
                console.log("Revenue claim successful");
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
