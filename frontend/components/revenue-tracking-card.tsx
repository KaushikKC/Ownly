"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Coins,
  ExternalLink,
  Copy,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import apiClient from "@/lib/api/client";
import { WIP_TOKEN_ADDRESS } from "@story-protocol/core-sdk";

interface RevenueTrackingCardProps {
  asset: {
    _id: string;
    title: string;
    storyProtocolAssetId?: string;
    royaltyPayments?: Array<{
      receiverIpId: string;
      payerIpId: string;
      amount: string;
      token: string;
      transactionHash: string;
      paidAt: string;
    }>;
    revenueClaims?: Array<{
      amount: string;
      transactionHash: string;
      claimedAt: string;
    }>;
  };
}

export default function RevenueTrackingCard({
  asset,
}: RevenueTrackingCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [revenueShare, setRevenueShare] = useState<{
    totalRevenue: number;
    claimedRevenue: number;
    pendingRevenue: number;
    revenueShare: number;
    totalEarned: number;
    claimableAmount: number;
    parentShares: Array<{ ipId: string; revenueShare: number; amount: number }>;
  } | null>(null);
  const [claimForm, setClaimForm] = useState({
    amount: "",
  });
  const [payForm, setPayForm] = useState({
    receiverIpId: asset.storyProtocolAssetId || "",
    payerIpId: "",
    amount: "",
    token: String(WIP_TOKEN_ADDRESS),
  });
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

  const loadRevenueShare = async () => {
    try {
      const response = await apiClient.getRevenueShare(asset._id);
      if (response.success) {
        setRevenueShare(response.revenueShare);
      }
    } catch (error) {
      console.error("Failed to load revenue share:", error);
    }
  };

  const handleClaimRevenue = async () => {
    if (!claimForm.amount) {
      alert("Please enter an amount to claim");
      return;
    }

    try {
      setLoading(true);

      // Import Story Protocol service
      const StoryProtocolService = (await import("@/lib/storyProtocol"))
        .default;
      const storyProtocolService = new StoryProtocolService();

      // Call Story Protocol directly from frontend
      const result = await storyProtocolService.claimAllRevenue(
        asset.storyProtocolAssetId || "",
        asset.storyProtocolAssetId || "", // claimer is the same as the IP owner
        [], // childIpIds - empty for direct claims
        [] // royaltyPolicies - empty for direct claims
      );

      // Serialize BigInt values before sending to backend
      const serializedClaimedTokens = result.claimedTokens
        ? Object.fromEntries(
            Object.entries(result.claimedTokens).map(([key, value]) => [
              key,
              typeof value === "bigint"
                ? (value as bigint).toString()
                : typeof value === "object"
                ? JSON.stringify(value)
                : String(value),
            ])
          )
        : {};

      // Send result to backend to store in database
      const response = await apiClient.claimRevenue({
        assetId: asset._id,
        ipId: asset.storyProtocolAssetId || "",
        claimer: asset.storyProtocolAssetId || "",
        claimedTokens: serializedClaimedTokens,
        transactionHash: result.transactionHash,
      });

      if (response.success) {
        alert("Revenue claimed successfully!");
        setClaimForm({ amount: "" });
        loadRevenueShare();
      }
    } catch (error) {
      console.error("Failed to claim revenue:", error);
      alert("Failed to claim revenue");
    } finally {
      setLoading(false);
    }
  };

  const handlePayRoyalty = async () => {
    if (!payForm.receiverIpId || !payForm.amount) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      // Import Story Protocol service
      const StoryProtocolService = (await import("@/lib/storyProtocol"))
        .default;
      const storyProtocolService = new StoryProtocolService();

      // Call Story Protocol directly from frontend
      const result = await storyProtocolService.payRoyalty(
        payForm.receiverIpId,
        payForm.amount,
        payForm.token
      );

      // Send result to backend to store in database
      const response = await apiClient.payRoyalty({
        assetId: asset._id,
        receiverIpId: payForm.receiverIpId,
        payerIpId: payForm.payerIpId || undefined,
        amount: payForm.amount,
        token: payForm.token,
        transactionHash: result.transactionHash,
      });

      if (response.success) {
        alert("Royalty paid successfully!");
        setPayForm({
          receiverIpId: asset.storyProtocolAssetId || "",
          payerIpId: "",
          amount: "",
          token: String(WIP_TOKEN_ADDRESS),
        });
        loadRevenueShare();
      }
    } catch (error) {
      console.error("Failed to pay royalty:", error);
      alert("Failed to pay royalty");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (asset.storyProtocolAssetId) {
      loadRevenueShare();
    }
  }, [asset.storyProtocolAssetId]);

  if (!asset.storyProtocolAssetId) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Revenue Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Asset must be registered with Story Protocol to track revenue</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate mock revenue data
  const totalEarned =
    asset.royaltyPayments?.reduce(
      (sum, payment) => sum + parseFloat(payment.amount),
      0
    ) || 0;
  const totalClaimed =
    asset.revenueClaims?.reduce(
      (sum, claim) => sum + parseFloat(claim.amount),
      0
    ) || 0;
  const claimableAmount = totalEarned - totalClaimed;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Revenue Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Revenue Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalEarned.toFixed(2)} WIP
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Coins className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-muted-foreground">Claimable</p>
                <p className="text-2xl font-bold text-blue-600">
                  {claimableAmount.toFixed(2)} WIP
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-xl font-bold text-purple-600">+$320</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Users className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <p className="text-sm text-muted-foreground">Active Licenses</p>
                <p className="text-xl font-bold text-orange-600">12</p>
              </div>
            </div>

            {/* Revenue Share Info */}
            {revenueShare && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Revenue Share Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Earned:</span>
                    <span className="font-medium">
                      {revenueShare.totalEarned} WIP
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Claimable Amount:</span>
                    <span className="font-medium">
                      {revenueShare.claimableAmount} WIP
                    </span>
                  </div>
                  {revenueShare.parentShares &&
                    revenueShare.parentShares.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">
                          Parent Shares:
                        </span>
                        <div className="ml-4 space-y-1">
                          {revenueShare.parentShares.map(
                            (
                              share: { ipId: string; revenueShare: number },
                              index: number
                            ) => (
                              <div
                                key={index}
                                className="flex justify-between text-xs"
                              >
                                <span>Parent {index + 1}:</span>
                                <span>{share.revenueShare} WIP</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            {/* Recent Payments */}
            {asset.royaltyPayments && asset.royaltyPayments.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium">Recent Royalty Payments</h4>
                {asset.royaltyPayments.slice(0, 10).map((payment, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            +{payment.amount} {payment.token}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.payerIpId === "External"
                              ? "External tip"
                              : `From: ${payment.payerIpId.slice(0, 6)}...`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(payment.paidAt).toLocaleDateString()}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            copyToClipboard(
                              payment.transactionHash,
                              `payment-${index}`
                            )
                          }
                          className="h-6 w-6 p-0"
                        >
                          {copiedField === `payment-${index}` ? (
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
                              `https://aeneid.explorer.story.foundation/tx/${payment.transactionHash}`,
                              "_blank"
                            )
                          }
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No royalty payments yet</p>
              </div>
            )}

            {/* Recent Claims */}
            {asset.revenueClaims && asset.revenueClaims.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Recent Claims</h4>
                {asset.revenueClaims.slice(0, 5).map((claim, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <ArrowDownRight className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            -{claim.amount} WIP
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Claimed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(claim.claimedAt).toLocaleDateString()}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            copyToClipboard(
                              claim.transactionHash,
                              `claim-${index}`
                            )
                          }
                          className="h-6 w-6 p-0"
                        >
                          {copiedField === `claim-${index}` ? (
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
                              `https://aeneid.explorer.story.foundation/tx/${claim.transactionHash}`,
                              "_blank"
                            )
                          }
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            {/* Claim Revenue */}
            <div className="space-y-4">
              <h4 className="font-medium">Claim Revenue</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="claimAmount">Amount to Claim (WIP)</Label>
                  <Input
                    id="claimAmount"
                    value={claimForm.amount}
                    onChange={(e) => setClaimForm({ amount: e.target.value })}
                    placeholder="Enter amount to claim"
                    type="number"
                  />
                </div>
                <Button
                  onClick={handleClaimRevenue}
                  disabled={loading || !claimForm.amount}
                  className="w-full"
                >
                  {loading ? "Claiming..." : "Claim Revenue"}
                </Button>
              </div>
            </div>

            {/* Pay Royalty */}
            <div className="space-y-4">
              <h4 className="font-medium">Pay Royalty</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="receiverIpId">Receiver IP ID</Label>
                  <Input
                    id="receiverIpId"
                    value={payForm.receiverIpId}
                    onChange={(e) =>
                      setPayForm({ ...payForm, receiverIpId: e.target.value })
                    }
                    placeholder="0x..."
                  />
                </div>
                <div>
                  <Label htmlFor="payerIpId">Payer IP ID (Optional)</Label>
                  <Input
                    id="payerIpId"
                    value={payForm.payerIpId}
                    onChange={(e) =>
                      setPayForm({ ...payForm, payerIpId: e.target.value })
                    }
                    placeholder="0x... (leave empty for external tip)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="payAmount">Amount</Label>
                    <Input
                      id="payAmount"
                      value={payForm.amount}
                      onChange={(e) =>
                        setPayForm({ ...payForm, amount: e.target.value })
                      }
                      placeholder="1.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payToken">Token</Label>
                    <select
                      id="payToken"
                      value={payForm.token}
                      onChange={(e) =>
                        setPayForm({ ...payForm, token: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    >
                      <option value={String(WIP_TOKEN_ADDRESS)}>WIP</option>
                      <option value="0x1514000000000000000000000000000000000000">
                        WIP (Testnet)
                      </option>
                    </select>
                  </div>
                </div>
                <Button
                  onClick={handlePayRoyalty}
                  disabled={loading || !payForm.receiverIpId || !payForm.amount}
                  className="w-full"
                >
                  {loading ? "Paying..." : "Pay Royalty"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
