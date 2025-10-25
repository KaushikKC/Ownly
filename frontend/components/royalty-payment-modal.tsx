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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  ExternalLink,
  Copy,
  CheckCircle,
  Wallet,
} from "lucide-react";
import StoryProtocolService from "@/lib/storyProtocol";
import apiClient from "@/lib/api/client";

interface RoyaltyPaymentModalProps {
  ipAsset: {
    _id: string;
    title: string;
    storyProtocolAssetId?: string;
    thumbnailUrl?: string;
    owner: string;
  };
  onSuccess?: () => void;
}

export default function RoyaltyPaymentModal({
  ipAsset,
  onSuccess,
}: RoyaltyPaymentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: "",
    token: "WIP",
  });

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);
      console.log("Starting royalty payment...");
      console.log("IP Asset ID:", ipAsset.storyProtocolAssetId);
      console.log("Amount:", formData.amount);

      // Use Story Protocol SDK directly
      const storyProtocolService = new StoryProtocolService();
      const paymentResult = await storyProtocolService.payRoyalty(
        ipAsset.storyProtocolAssetId!,
        formData.amount,
        "WIP_TOKEN_ADDRESS" // Using WIP token
      );

      console.log("Story Protocol payment result:", paymentResult);

      if (paymentResult.success) {
        console.log("Story Protocol payment successful, saving to backend...");

        // Save the payment to backend
        const backendResponse = await apiClient.payRoyalty({
          assetId: ipAsset._id,
          receiverIpId: paymentResult.receiverIpId,
          payerIpId: paymentResult.payerIpId,
          amount: formData.amount,
          token: formData.token,
          transactionHash: paymentResult.transactionHash,
        });

        console.log("Backend response:", backendResponse);

        if (backendResponse.success) {
          alert(
            `Royalty paid successfully!\nTransaction: ${paymentResult.transactionHash}\nAmount: ${formData.amount} WIP`
          );
          setIsOpen(false);
          onSuccess?.();
          // Reset form
          setFormData({
            amount: "",
            token: "WIP",
          });
        } else {
          alert(`Backend error: ${backendResponse.message || "Unknown error"}`);
        }
      } else {
        alert(`Story Protocol error: Unknown error`);
      }
    } catch (error) {
      console.error("Failed to pay royalty:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      alert(`Failed to pay royalty: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!ipAsset.storyProtocolAssetId) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled>
            <DollarSign className="w-4 h-4 mr-2" />
            Pay Royalty
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pay Royalty</DialogTitle>
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
          <DollarSign className="w-4 h-4 mr-2" />
          Pay Royalty
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pay Royalty to IP Asset</DialogTitle>
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

          {/* Payment Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (WIP) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="Enter amount to pay"
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4" />
                <span className="text-sm font-medium">Payment Info</span>
              </div>
              <p className="text-xs text-muted-foreground">
                This will pay the IP Asset owner directly. Revenue will be
                automatically distributed according to license terms.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                loading || !formData.amount || parseFloat(formData.amount) <= 0
              }
            >
              {loading ? "Paying..." : "Pay Royalty"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
