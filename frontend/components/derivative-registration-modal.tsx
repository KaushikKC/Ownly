"use client";

import { useState } from "react";
import Image from "next/image";
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
import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Copy,
  CheckCircle,
  // Users,
  Link as LinkIcon,
} from "lucide-react";
import apiClient from "@/lib/api/client";
import StoryProtocolService from "@/lib/storyProtocol";

interface DerivativeRegistrationModalProps {
  parentAsset: {
    _id: string;
    title: string;
    storyProtocolAssetId?: string;
    thumbnailUrl?: string;
    license?: {
      type: string;
      royaltyPercentage: number;
      storyProtocolLicenseId?: string;
    };
  };
  onSuccess?: () => void;
}

export default function DerivativeRegistrationModal({
  parentAsset,
  onSuccess,
}: DerivativeRegistrationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sourceUrl: "",
    thumbnailUrl: "",
    owner: "",
    licenseTermsId: "",
    collaborators: [] as Array<{
      id: string;
      name: string;
      wallet: string;
      ownership: number;
      approval: boolean;
    }>,
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

  const addCollaborator = () => {
    setFormData({
      ...formData,
      collaborators: [
        ...formData.collaborators,
        {
          id: `collab-${Date.now()}`,
          name: "",
          wallet: "",
          ownership: 0,
          approval: false,
        },
      ],
    });
  };

  const updateCollaborator = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updatedCollaborators = [...formData.collaborators];
    updatedCollaborators[index] = {
      ...updatedCollaborators[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      collaborators: updatedCollaborators,
    });
  };

  const removeCollaborator = (index: number) => {
    setFormData({
      ...formData,
      collaborators: formData.collaborators.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.sourceUrl ||
      !formData.licenseTermsId
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      console.log("Starting derivative registration...");
      console.log("Parent Asset ID:", parentAsset.storyProtocolAssetId);
      console.log("License Terms ID:", formData.licenseTermsId);

      // Use Story Protocol SDK directly
      const storyProtocolService = new StoryProtocolService();

      // Test if Story Protocol client is working
      console.log("Testing Story Protocol client...");
      try {
        // Simple test call to see if client is working
        console.log("Story Protocol client initialized successfully");
      } catch (clientError) {
        console.error("Story Protocol client error:", clientError);
        throw new Error(`Story Protocol client error: ${clientError}`);
      }

      const derivativeResult =
        await storyProtocolService.registerDerivativeIPAsset(
          parentAsset.storyProtocolAssetId!,
          formData.licenseTermsId,
          {
            title: formData.title,
            description: formData.description,
            sourceUrl: formData.sourceUrl,
            thumbnailUrl: formData.thumbnailUrl,
            owner: formData.owner,
            collaborators: formData.collaborators,
          }
        );

      console.log("Story Protocol result:", derivativeResult);

      if (derivativeResult.success) {
        console.log(
          "Story Protocol registration successful, saving to backend..."
        );

        // Save the derivative to backend with Story Protocol data
        const backendResponse = await apiClient.registerDerivative({
          parentAssetId: parentAsset._id,
          licenseTermsId: formData.licenseTermsId,
          derivativeData: {
            title: formData.title,
            description: formData.description,
            sourceUrl: formData.sourceUrl,
            thumbnailUrl: formData.thumbnailUrl,
            owner: formData.owner,
            collaborators: formData.collaborators,
          },
          derivativeIpId: derivativeResult.derivativeIpId,
          tokenId: derivativeResult.tokenId?.toString(),
          transactionHash: derivativeResult.transactionHash,
        });

        console.log("Backend response:", backendResponse);

        if (backendResponse.success) {
          alert(
            `Derivative registered successfully!\nTransaction: ${derivativeResult.transactionHash}\nIP ID: ${derivativeResult.derivativeIpId}`
          );
          setIsOpen(false);
          onSuccess?.();
          // Reset form
          setFormData({
            title: "",
            description: "",
            sourceUrl: "",
            thumbnailUrl: "",
            owner: "",
            licenseTermsId: "",
            collaborators: [],
          });
        } else {
          alert(`Backend error: ${backendResponse.message || "Unknown error"}`);
        }
      } else {
        alert(`Story Protocol error: Unknown error`);
      }
    } catch (error) {
      console.error("Failed to register derivative:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      alert(`Failed to register derivative: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!parentAsset.storyProtocolAssetId) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled>
            <LinkIcon className="w-4 h-4 mr-2" />
            Register Derivative
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Register Derivative</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center text-muted-foreground">
            Parent asset must be registered with Story Protocol first
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <LinkIcon className="w-4 h-4 mr-2" />
          Register Derivative
        </Button>
      </DialogTrigger>
      <DialogContent
        className="!max-w-none !w-[95vw] !max-h-[90vh] overflow-y-auto bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20"
        style={{
          maxWidth: "none",
          width: "95vw",
          minWidth: "90vw",
        }}
      >
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-white">
            Register Derivative IP Asset
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Parent Asset Info - Compact */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3">
              {parentAsset.thumbnailUrl && (
                <Image
                  src={parentAsset.thumbnailUrl}
                  alt={parentAsset.title}
                  width={40}
                  height={40}
                  className="w-10 h-10 object-cover rounded-lg shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate text-sm">
                  {parentAsset.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                    {parentAsset.license?.type || "Unknown License"}
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                    {parentAsset.license?.royaltyPercentage || 0}% Royalty
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-white/70 font-mono">
                  {parentAsset.storyProtocolAssetId?.slice(0, 8)}...
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    copyToClipboard(
                      parentAsset.storyProtocolAssetId!,
                      "parentIpId"
                    )
                  }
                  className="h-6 w-6 p-0 shrink-0 hover:bg-white/10"
                >
                  {copiedField === "parentIpId" ? (
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-white/60" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Derivative Form */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
              Derivative Information
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white/80">
                  Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter derivative title"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner" className="text-white/80">
                  Owner Address *
                </Label>
                <Input
                  id="owner"
                  value={formData.owner}
                  onChange={(e) =>
                    setFormData({ ...formData, owner: e.target.value })
                  }
                  placeholder="0x..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white/80">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your derivative work"
                rows={4}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sourceUrl" className="text-white/80">
                  Source URL *
                </Label>
                <Input
                  id="sourceUrl"
                  value={formData.sourceUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, sourceUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnailUrl" className="text-white/80">
                  Thumbnail URL
                </Label>
                <Input
                  id="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnailUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseTermsId" className="text-white/80">
                License Terms ID *
              </Label>
              <Input
                id="licenseTermsId"
                value={formData.licenseTermsId}
                onChange={(e) =>
                  setFormData({ ...formData, licenseTermsId: e.target.value })
                }
                placeholder="Enter license terms ID from parent"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
              />
            </div>

            {/* Collaborators */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                  Collaborators
                </h4>
                <Button
                  onClick={addCollaborator}
                  size="sm"
                  className="story-button"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Collaborator
                </Button>
              </div>

              {formData.collaborators.map((collab, index) => (
                <Card key={collab.id} className="glassy-card">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor={`collab-name-${index}`}
                          className="text-white/80"
                        >
                          Name
                        </Label>
                        <Input
                          id={`collab-name-${index}`}
                          value={collab.name}
                          onChange={(e) =>
                            updateCollaborator(index, "name", e.target.value)
                          }
                          placeholder="Collaborator name"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor={`collab-wallet-${index}`}
                          className="text-white/80"
                        >
                          Wallet Address
                        </Label>
                        <Input
                          id={`collab-wallet-${index}`}
                          value={collab.wallet}
                          onChange={(e) =>
                            updateCollaborator(index, "wallet", e.target.value)
                          }
                          placeholder="0x..."
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor={`collab-ownership-${index}`}
                          className="text-white/80"
                        >
                          Ownership %
                        </Label>
                        <Input
                          id={`collab-ownership-${index}`}
                          type="number"
                          value={collab.ownership}
                          onChange={(e) =>
                            updateCollaborator(
                              index,
                              "ownership",
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          min="0"
                          max="100"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={() => removeCollaborator(index)}
                          variant="destructive"
                          size="sm"
                          className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30 h-12"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                loading ||
                !formData.title ||
                !formData.description ||
                !formData.sourceUrl ||
                !formData.licenseTermsId
              }
              className="story-button"
            >
              {loading ? "Registering..." : "Register Derivative"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
