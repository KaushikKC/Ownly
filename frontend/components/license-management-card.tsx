"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Coins,
  Copy,
  CheckCircle,
  ExternalLink,
  Plus,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import apiClient from "@/lib/api/client";
import { parseEther } from "viem";
import DebugLicenseTerms from "./debug-license-terms";

interface LicenseManagementCardProps {
  asset: {
    _id: string;
    title: string;
    storyProtocolAssetId?: string;
    license?: {
      type: string;
      royaltyPercentage: number;
      storyProtocolLicenseId?: string;
    };
    licenseTokens?: Array<{
      licenseTermsId: string;
      tokenIds: string[];
      transactionHash: string;
      mintedAt: string;
    }>;
    royaltyPayments?: Array<{
      receiverIpId: string;
      payerIpId: string;
      amount: string;
      token: string;
      transactionHash: string;
      paidAt: string;
    }>;
  };
}

export default function LicenseManagementCard({
  asset,
}: LicenseManagementCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [mintLoading, setMintLoading] = useState(false);
  const [licenseTerms, setLicenseTerms] = useState<any>(null);
  const [revenueShare, setRevenueShare] = useState<any>(null);
  const [mintForm, setMintForm] = useState({
    licenseTermsId: "",
    receiver: "",
    amount: 1,
    maxMintingFee: "0",
    maxRevenueShare: 100,
  });
  const [payForm, setPayForm] = useState({
    receiverIpId: asset.storyProtocolAssetId || "",
    payerIpId: "",
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

  const handleMintLicenseTokens = async () => {
    if (!asset.storyProtocolAssetId) {
      alert("Asset must be registered with Story Protocol first");
      return;
    }

    try {
      setMintLoading(true);

      // Import Story Protocol service
      const StoryProtocolService = (await import("@/lib/storyProtocol"))
        .default;
      const storyProtocolService = new StoryProtocolService();

      // Call Story Protocol directly from frontend
      const result = await storyProtocolService.mintLicenseTokens(
        asset.storyProtocolAssetId,
        mintForm.licenseTermsId,
        mintForm.receiver || undefined,
        mintForm.amount,
        parseEther(mintForm.maxMintingFee), // Convert decimal string to BigInt using parseEther
        mintForm.maxRevenueShare
      );

      // Convert BigInt values to strings for API serialization
      const serializedLicenseTokenIds =
        result.licenseTokenIds?.map((id: any) =>
          typeof id === "bigint" ? id.toString() : id
        ) || [];

      // Send result to backend to store in database
      const response = await apiClient.mintLicenseTokens({
        assetId: asset._id,
        licenseTermsId: mintForm.licenseTermsId,
        receiver: mintForm.receiver || undefined,
        amount: mintForm.amount,
        maxMintingFee: mintForm.maxMintingFee,
        maxRevenueShare: mintForm.maxRevenueShare,
        licenseTokenIds: serializedLicenseTokenIds,
        transactionHash: result.transactionHash,
      });

      if (response.success) {
        alert("License tokens minted successfully!");
        // Refresh the page or update the asset data
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to mint license tokens:", error);
      alert("Failed to mint license tokens");
    } finally {
      setMintLoading(false);
    }
  };

  const handlePayRoyalty = async () => {
    try {
      const response = await apiClient.payRoyalty({
        assetId: asset._id,
        receiverIpId: payForm.receiverIpId,
        payerIpId: payForm.payerIpId || undefined,
        amount: payForm.amount,
        token: payForm.token,
      });

      if (response.success) {
        alert("Royalty paid successfully!");
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to pay royalty:", error);
      alert("Failed to pay royalty");
    }
  };

  const loadLicenseTerms = async () => {
    try {
      const response = await apiClient.getLicenseTerms(asset._id);
      if (response.success) {
        setLicenseTerms(response.licenseTerms);
      }
    } catch (error) {
      console.error("Failed to load license terms:", error);
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

  if (!asset.storyProtocolAssetId) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            License Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">
              Asset must be registered with Story Protocol first
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5" />
          License Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mint" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mint">Mint License</TabsTrigger>
            <TabsTrigger value="pay">Pay Royalty</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="mint" className="space-y-4">
            <DebugLicenseTerms asset={asset} />
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="licenseTermsId">License Terms ID</Label>
                  <Input
                    id="licenseTermsId"
                    value={mintForm.licenseTermsId}
                    onChange={(e) =>
                      setMintForm({
                        ...mintForm,
                        licenseTermsId: e.target.value,
                      })
                    }
                    placeholder="Enter license terms ID"
                  />
                </div>
                <div>
                  <Label htmlFor="receiver">Receiver Address (Optional)</Label>
                  <Input
                    id="receiver"
                    value={mintForm.receiver}
                    onChange={(e) =>
                      setMintForm({ ...mintForm, receiver: e.target.value })
                    }
                    placeholder="0x..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={mintForm.amount}
                    onChange={(e) =>
                      setMintForm({
                        ...mintForm,
                        amount: parseInt(e.target.value),
                      })
                    }
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="maxMintingFee">Max Minting Fee (WIP)</Label>
                  <Input
                    id="maxMintingFee"
                    value={mintForm.maxMintingFee}
                    onChange={(e) =>
                      setMintForm({
                        ...mintForm,
                        maxMintingFee: e.target.value,
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <Button
                onClick={handleMintLicenseTokens}
                disabled={mintLoading || !mintForm.licenseTermsId}
                className="w-full"
              >
                {mintLoading ? "Minting..." : "Mint License Tokens"}
              </Button>
            </div>

            {/* Existing License Tokens */}
            {asset.licenseTokens && asset.licenseTokens.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Minted License Tokens</h4>
                <div className="space-y-2">
                  {asset.licenseTokens.map((token, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            License Terms: {token.licenseTermsId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Tokens: {token.tokenIds?.join(", ") || "No tokens"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Amount: {token.amount} tokens
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Minted:{" "}
                            {new Date(token.mintedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              copyToClipboard(
                                token.transactionHash,
                                `tx-${index}`
                              )
                            }
                          >
                            {copiedField === `tx-${index}` ? (
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
                                `https://aeneid.explorer.story.foundation/tx/${token.transactionHash}`,
                                "_blank"
                              )
                            }
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pay" className="space-y-4">
            <div className="space-y-4">
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
                <Label htmlFor="payerIpId">
                  Payer IP ID (Optional - leave empty for external tip)
                </Label>
                <Input
                  id="payerIpId"
                  value={payForm.payerIpId}
                  onChange={(e) =>
                    setPayForm({ ...payForm, payerIpId: e.target.value })
                  }
                  placeholder="0x... (or leave empty)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    value={payForm.amount}
                    onChange={(e) =>
                      setPayForm({ ...payForm, amount: e.target.value })
                    }
                    placeholder="1.0"
                  />
                </div>
                <div>
                  <Label htmlFor="token">Token</Label>
                  <Select
                    value={payForm.token}
                    onValueChange={(value) =>
                      setPayForm({ ...payForm, token: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WIP">WIP</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handlePayRoyalty}
                disabled={!payForm.receiverIpId || !payForm.amount}
                className="w-full"
              >
                Pay Royalty
              </Button>
            </div>

            {/* Recent Royalty Payments */}
            {asset.royaltyPayments && asset.royaltyPayments.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Recent Royalty Payments</h4>
                <div className="space-y-2">
                  {asset.royaltyPayments.slice(0, 5).map((payment, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {payment.amount} {payment.token}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.payerIpId === "External"
                              ? "External tip"
                              : `From: ${payment.payerIpId.slice(0, 6)}...`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              copyToClipboard(
                                payment.transactionHash,
                                `payment-${index}`
                              )
                            }
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
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={loadLicenseTerms} variant="outline" size="sm">
                Load License Terms
              </Button>
              <Button onClick={loadRevenueShare} variant="outline" size="sm">
                Load Revenue Share
              </Button>
            </div>

            {licenseTerms && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">License Terms</h4>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(licenseTerms, null, 2)}
                </pre>
              </div>
            )}

            {revenueShare && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Revenue Share</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Earned:</span>
                    <span className="font-medium">
                      {revenueShare.totalEarned} WIP
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Claimable:</span>
                    <span className="font-medium">
                      {revenueShare.claimableAmount} WIP
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-lg font-bold">$1,240</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-lg font-bold">$320</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-muted-foreground">Active Licenses</p>
                <p className="text-lg font-bold">12</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
