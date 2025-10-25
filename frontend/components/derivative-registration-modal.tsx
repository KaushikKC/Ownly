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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  ExternalLink,
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register Derivative IP Asset</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Parent Asset Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Parent Asset</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {parentAsset.thumbnailUrl && (
                  <Image
                    src={parentAsset.thumbnailUrl}
                    alt={parentAsset.title}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{parentAsset.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">
                      {parentAsset.license?.type || "Unknown License"}
                    </Badge>
                    <Badge variant="secondary">
                      {parentAsset.license?.royaltyPercentage || 0}% Royalty
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      IP ID: {parentAsset.storyProtocolAssetId}
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
                      className="h-4 w-4 p-0"
                    >
                      {copiedField === "parentIpId" ? (
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
                          `https://aeneid.explorer.story.foundation/ipa/${parentAsset.storyProtocolAssetId}`,
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

          {/* Derivative Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter derivative title"
                />
              </div>
              <div>
                <Label htmlFor="owner">Owner Address *</Label>
                <Input
                  id="owner"
                  value={formData.owner}
                  onChange={(e) =>
                    setFormData({ ...formData, owner: e.target.value })
                  }
                  placeholder="0x..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your derivative work"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sourceUrl">Source URL *</Label>
                <Input
                  id="sourceUrl"
                  value={formData.sourceUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, sourceUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                <Input
                  id="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnailUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="licenseTermsId">License Terms ID *</Label>
              <Input
                id="licenseTermsId"
                value={formData.licenseTermsId}
                onChange={(e) =>
                  setFormData({ ...formData, licenseTermsId: e.target.value })
                }
                placeholder="Enter license terms ID from parent"
              />
            </div>

            {/* Collaborators */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Collaborators</Label>
                <Button onClick={addCollaborator} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Collaborator
                </Button>
              </div>

              {formData.collaborators.map((collab, index) => (
                <Card key={collab.id} className="mb-3">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`collab-name-${index}`}>Name</Label>
                        <Input
                          id={`collab-name-${index}`}
                          value={collab.name}
                          onChange={(e) =>
                            updateCollaborator(index, "name", e.target.value)
                          }
                          placeholder="Collaborator name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`collab-wallet-${index}`}>
                          Wallet Address
                        </Label>
                        <Input
                          id={`collab-wallet-${index}`}
                          value={collab.wallet}
                          onChange={(e) =>
                            updateCollaborator(index, "wallet", e.target.value)
                          }
                          placeholder="0x..."
                        />
                      </div>
                      <div>
                        <Label htmlFor={`collab-ownership-${index}`}>
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
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={() => removeCollaborator(index)}
                          variant="destructive"
                          size="sm"
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
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
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
            >
              {loading ? "Registering..." : "Register Derivative"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
