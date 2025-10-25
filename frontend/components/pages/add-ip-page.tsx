"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Check, Youtube, Loader2, AlertCircle } from "lucide-react";
import LicenseSelector from "@/components/license-selector";
import { useUser } from "@/lib/user-context";
import apiClient from "@/lib/api/client";
import StoryProtocolService from "@/lib/storyProtocol";

interface AddIPPageProps {
  onNavigate: (
    page:
      | "dashboard"
      | "add-ip"
      | "approvals"
      | "login"
      | "verify-ip"
      | "settings"
  ) => void;
}

// Mock collaborators removed as they were unused

export default function AddIPPage({ onNavigate }: AddIPPageProps) {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [duration, setDuration] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [channelTitle, setChannelTitle] = useState("");
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [ownershipStatus, setOwnershipStatus] = useState<{
    isOwner: boolean;
    channelInfo: {
      channelId: string;
      channelTitle: string;
      channelUrl: string;
    } | null;
    message: string;
  } | null>(null);
  const [isVerifyingOwnership, setIsVerifyingOwnership] = useState(false);
  const [selectedCollaborators, setSelectedCollaborators] = useState<
    Array<{
      id: string;
      name: string;
      wallet: string;
      ownership: number;
      approval: boolean;
    }>
  >([]);
  const [licenseType, setLicenseType] = useState("commercial");
  const [royaltyShare, setRoyaltyShare] = useState("10");
  const [mintingFee, setMintingFee] = useState("0.1");
  const [licenseDescription, setLicenseDescription] = useState(
    "Allows commercial remixes with 10% rev share to original owner."
  );
  const [isRegistering, setIsRegistering] = useState(false);
  const [violations, setViolations] = useState<any>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [storyProtocolData, setStoryProtocolData] = useState<{
    assetId: string;
    nftTokenId: string;
    nftContractAddress: string;
    licenseId: string;
    transactionHashes: Record<string, string>;
    ipfsHash: string;
  } | null>(null);
  const [currentAssetId, setCurrentAssetId] = useState<string | null>(null);

  // Auto-fetch YouTube data when URL is entered
  const handleUrlChange = async (newUrl: string) => {
    setUrl(newUrl);
    setVideoError(null);
    setOwnershipStatus(null);

    if (newUrl.includes("youtube.com") || newUrl.includes("youtu.be")) {
      try {
        setIsLoadingVideo(true);
        const response = await apiClient.checkYouTubeVideo(newUrl);

        if (response.success && response.videoData) {
          const video = response.videoData;
          setTitle(video.title);
          setDescription(video.description);
          setThumbnailUrl(video.thumbnailUrl);
          setPublishDate(
            new Date(
              video.metadata?.publishedAt || Date.now()
            ).toLocaleDateString()
          );
          setDuration(video.duration || 0);
          setViewCount(video.metadata?.viewCount || 0);
          setChannelTitle(video.channelTitle || "Unknown Channel");

          // Verify ownership
          await verifyOwnership(newUrl);
        } else {
          setVideoError("Video not found or not accessible");
        }
      } catch (error) {
        console.error("Failed to fetch video data:", error);
        setVideoError("Failed to fetch video data");
      } finally {
        setIsLoadingVideo(false);
      }
    }
  };

  // Verify ownership of the YouTube channel
  const verifyOwnership = async (videoUrl: string) => {
    try {
      setIsVerifyingOwnership(true);
      const userEmail = user?.email;

      if (!userEmail) {
        setOwnershipStatus({
          isOwner: false,
          channelInfo: null,
          message: "Please login with Google to verify ownership",
        });
        return;
      }

      // Check if user has linked their YouTube channel
      if (!user?.youtubeChannelId) {
        setOwnershipStatus({
          isOwner: false,
          channelInfo: null,
          message:
            "Please link your YouTube channel first. Go to Settings to link your YouTube channel.",
        });
        return;
      }

      const response = await apiClient.verifyYouTubeOwnership(
        videoUrl,
        userEmail
      );

      if (response.success) {
        setOwnershipStatus({
          isOwner: response.isOwner,
          channelInfo: response.channelInfo,
          message: response.message,
        });

        // If ownership is verified, set the current user as the only collaborator with 100% ownership
        if (response.isOwner && user) {
          // Only add collaborator if user has a valid ID
          if (user.id && user.id !== "current-user") {
            setSelectedCollaborators([
              {
                id: user.id,
                name: user.name || user.email || "Current User",
                wallet:
                  user.walletAddress ||
                  "0x0000000000000000000000000000000000000000",
                ownership: 100,
                approval: true,
              },
            ]);
          } else {
            // If no valid user ID, don't add collaborators - the owner will be set from the user context
            setSelectedCollaborators([]);
          }

          // Check for IP violations
          try {
            const violationResponse = await apiClient.checkViolations({
              sourceUrl: url,
              title: title,
              thumbnailUrl: thumbnailUrl,
            });

            if (violationResponse.hasViolations) {
              setViolations(violationResponse.violations);
              setShowDisputeModal(true);
              return; // Stop the flow if violations are found
            }
          } catch (error) {
            console.error("Failed to check violations:", error);
            // Continue with registration even if violation check fails
          }
        }
      }
    } catch (error) {
      console.error("Failed to verify ownership:", error);
      setOwnershipStatus({
        isOwner: false,
        channelInfo: null,
        message: "Failed to verify ownership",
      });
    } finally {
      setIsVerifyingOwnership(false);
    }
  };

  const handleOwnershipChange = (id: string, value: number) => {
    setSelectedCollaborators((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ownership: value } : c))
    );
  };

  const handleRegister = async () => {
    try {
      setIsRegistering(true);

      // First, create the IP asset in our database
      const assetData = {
        title,
        description,
        sourceUrl: url,
        sourcePlatform: "youtube",
        thumbnailUrl,
        duration,
        collaborators:
          selectedCollaborators.length > 0
            ? selectedCollaborators.map((c) => ({
                userId: c.id,
                walletAddress: c.wallet,
                ownershipPercentage: c.ownership,
                role: "collaborator",
                approved: c.approval,
              }))
            : [],
        license: {
          type: licenseType,
          price: 0,
          royaltyPercentage: parseInt(royaltyShare),
          terms: licenseDescription,
          commercialUse: true,
          attributionRequired: true,
          exclusivity: "non-exclusive",
          status: "active",
        },
      };

      const assetResponse = await apiClient.createIPAsset(assetData);

      if (assetResponse.success) {
        setCurrentAssetId(assetResponse.asset._id);

        // Register with Story Protocol using the real SDK
        const storyProtocolService = new StoryProtocolService();

        const videoData = {
          title,
          description,
          sourceUrl: url,
          thumbnailUrl,
          duration,
          owner:
            user?.walletAddress || "0x0000000000000000000000000000000000000000",
          collaborators:
            selectedCollaborators.length > 0 ? selectedCollaborators : [],
          license: {
            type: licenseType,
            royaltyPercentage: parseInt(royaltyShare),
            mintingFee: mintingFee,
            duration: "1 year",
            commercialUse: true,
            attributionRequired: true,
            exclusivity: "non-exclusive",
          },
        };

        const storyResponse = await storyProtocolService.registerIPAsset(
          videoData
        );

        if (storyResponse.success) {
          // Save Story Protocol data to backend
          await storyProtocolService.saveToBackend(
            assetResponse.asset._id,
            storyResponse
          );

          setStoryProtocolData({
            assetId: storyResponse.storyProtocolAssetId,
            nftTokenId: storyResponse.nftTokenId,
            nftContractAddress: storyResponse.nftContractAddress,
            licenseId: storyResponse.licenseId,
            transactionHashes: {
              registration: storyResponse.transactionHash,
            },
            ipfsHash: storyResponse.ipfsHash,
          });
          setRegistrationComplete(true);
        }
      }
    } catch (error) {
      console.error("Registration failed:", error);
      // Handle error - show error message to user
    } finally {
      setIsRegistering(false);
    }
  };

  const totalOwnership = selectedCollaborators.reduce(
    (sum, c) => sum + c.ownership,
    0
  );

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
            <button
              onClick={() => onNavigate("dashboard")}
              className="p-2 hover:bg-muted rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">
              Register New IP
            </h1>
          </div>
        </div>

        {/* Success Content */}
        <div className="max-w-2xl mx-auto px-6 py-12">
          <Card className="p-12 border border-border text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              ✅ Success! IP Registered
            </h2>
            <p className="text-muted-foreground mb-8">
              Your IP has been successfully registered on Story Protocol.
            </p>

            <div className="space-y-4 mb-8 text-left bg-muted p-6 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">
                  Story Protocol Asset ID
                </p>
                <p className="font-mono font-semibold text-foreground">
                  {storyProtocolData?.assetId || "Loading..."}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">NFT Token ID</p>
                <p className="font-mono font-semibold text-foreground">
                  {storyProtocolData?.nftTokenId || "Loading..."}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  NFT Contract Address
                </p>
                <p className="font-mono font-semibold text-foreground">
                  {storyProtocolData?.nftContractAddress || "Loading..."}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">License ID</p>
                <p className="font-mono font-semibold text-foreground">
                  {storyProtocolData?.licenseId || "Loading..."}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">IPFS Hash</p>
                <p className="font-mono font-semibold text-foreground">
                  {storyProtocolData?.ipfsHash || "Loading..."}
                </p>
              </div>
              {storyProtocolData?.transactionHashes && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Transaction Hashes
                  </p>
                  <div className="space-y-2">
                    {Object.entries(storyProtocolData.transactionHashes).map(
                      ([key, hash]) => (
                        <div key={key}>
                          <p className="text-xs text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}:
                          </p>
                          <p className="font-mono text-xs text-foreground">
                            {hash}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={() => onNavigate("dashboard")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => onNavigate("dashboard")}
            className="p-2 hover:bg-muted rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            Register New IP
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Step Indicator */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1">
              <div
                className={`h-2 rounded-full ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              ></div>
              <p className="text-xs text-muted-foreground mt-2">Step {s}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1 - Source Input */}
            {step === 1 && (
              <>
                <Card className="p-6 border border-border">
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Source URL
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      value={url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="https://youtube.com/watch?v=abc123"
                      className="flex-1"
                    />
                    {isLoadingVideo && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Paste a YouTube URL to auto-fetch video details
                  </p>
                  {videoError && (
                    <div className="flex items-center gap-2 text-red-600 mt-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{videoError}</span>
                    </div>
                  )}
                </Card>

                <Card className="p-6 border border-border">
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Metadata Preview
                  </label>
                  {thumbnailUrl ? (
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                      <img
                        src={thumbnailUrl}
                        alt="Video preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                      <Youtube className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {title || "Enter a YouTube URL to see video details"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Platform: YouTube
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Publish Date: {publishDate || "N/A"}
                    </p>
                    {duration > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Duration: {Math.floor(duration / 60)}:
                        {(duration % 60).toString().padStart(2, "0")}
                      </p>
                    )}
                    {viewCount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Views: {viewCount.toLocaleString()}
                      </p>
                    )}
                    {/* <p className="text-xs text-muted-foreground mt-2">
                      Detected Collaborators: @alexwave, @mira.codes, @johnfilm
                    </p> */}
                  </div>
                </Card>

                {/* Ownership Verification */}
                {ownershipStatus && (
                  <Card
                    className={`p-6 border ${
                      ownershipStatus.isOwner
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {ownershipStatus.isOwner ? (
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3
                          className={`font-semibold ${
                            ownershipStatus.isOwner
                              ? "text-green-800"
                              : "text-red-800"
                          }`}
                        >
                          {ownershipStatus.isOwner
                            ? "✅ Ownership Verified"
                            : "❌ Ownership Not Verified"}
                        </h3>
                        <p
                          className={`text-sm mt-1 ${
                            ownershipStatus.isOwner
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {ownershipStatus.message}
                        </p>
                        {ownershipStatus.channelInfo && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <p>
                              Channel:{" "}
                              {ownershipStatus.channelInfo.channelTitle}
                            </p>
                            <p>
                              Channel ID:{" "}
                              {ownershipStatus.channelInfo.channelId}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Loading state for ownership verification */}
                {isVerifyingOwnership && (
                  <Card className="p-6 border border-border">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Verifying channel ownership...
                      </span>
                    </div>
                  </Card>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => onNavigate("dashboard")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (
                        violations &&
                        (violations.urlMatch ||
                          violations.titleMatches.length > 0 ||
                          violations.thumbnailMatches.length > 0)
                      ) {
                        setShowDisputeModal(true);
                      } else {
                        setStep(2);
                      }
                    }}
                    disabled={
                      !ownershipStatus?.isOwner ||
                      (violations &&
                        (violations.urlMatch ||
                          violations.titleMatches.length > 0 ||
                          violations.thumbnailMatches.length > 0))
                    }
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ownershipStatus?.isOwner
                      ? violations &&
                        (violations.urlMatch ||
                          violations.titleMatches.length > 0 ||
                          violations.thumbnailMatches.length > 0)
                        ? "⚠️ Duplicate Detected - Cannot Proceed"
                        : "Next: Ownership Setup"
                      : "Verify Ownership First"}
                  </Button>
                </div>
              </>
            )}

            {/* Step 2 - Ownership Setup */}
            {step === 2 && (
              <>
                <Card className="p-6 border border-border">
                  <label className="block text-sm font-semibold text-foreground mb-4">
                    Content Owner
                  </label>
                  <div className="space-y-4">
                    {selectedCollaborators.length > 0 ? (
                      selectedCollaborators.map((collab) => (
                        <div
                          key={collab.id}
                          className="flex items-center gap-4 p-4 bg-muted rounded-lg"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-primary">
                              {collab.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {collab.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {collab.wallet}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-sm font-semibold text-foreground">
                              {collab.ownership}%
                            </span>
                            <span className="text-xs font-medium text-green-600">
                              ✅ Owner
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No collaborators added yet</p>
                        <p className="text-xs">
                          You can add collaborators if needed
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Total: {totalOwnership}%
                  </p>

                  {/* Add Collaborator Button */}
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement add collaborator functionality
                        console.log("Add collaborator clicked");
                      }}
                      className="w-full"
                    >
                      + Add Collaborator
                    </Button>
                  </div>
                </Card>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Next: License & Terms
                  </Button>
                </div>
              </>
            )}

            {/* Step 3 - License & Terms */}
            {step === 3 && (
              <>
                <LicenseSelector
                  value={licenseType}
                  onChange={setLicenseType}
                />

                <Card className="p-6 border border-border">
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Royalty Share (%)
                  </label>
                  <Input
                    type="number"
                    value={royaltyShare}
                    onChange={(e) => setRoyaltyShare(e.target.value)}
                    placeholder="10"
                    className="w-full"
                  />
                </Card>

                <Card className="p-6 border border-border">
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Minting Fee ($IP)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={mintingFee}
                    onChange={(e) => setMintingFee(e.target.value)}
                    placeholder="0.1"
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Fee required to mint a license for this IP
                  </p>
                </Card>

                <Card className="p-6 border border-border">
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    License Description
                  </label>
                  <textarea
                    value={licenseDescription}
                    onChange={(e) => setLicenseDescription(e.target.value)}
                    placeholder="Describe the license terms..."
                    className="w-full p-3 border border-border rounded-lg text-sm"
                    rows={4}
                  />
                </Card>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Next: Review & Register
                  </Button>
                </div>
              </>
            )}

            {/* Step 4 - Register */}
            {step === 4 && (
              <>
                <Card className="p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-4">
                    Review Your IP Registration
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Title</p>
                      <p className="font-medium text-foreground">{title}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">License Type</p>
                      <p className="font-medium text-foreground capitalize">
                        {licenseType.replace("-", " ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Royalty Share</p>
                      <p className="font-medium text-foreground">
                        {royaltyShare}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Collaborators</p>
                      <p className="font-medium text-foreground">
                        {selectedCollaborators.length}
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleRegister}
                    disabled={isRegistering}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                  >
                    {isRegistering
                      ? "Registering..."
                      : "Register on Story Protocol"}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-1">
            <Card className="p-6 border border-border sticky top-24">
              <h3 className="font-semibold text-foreground mb-4">
                Registration Summary
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Current Step</p>
                  <p className="font-medium text-foreground">
                    Step {step} of 4
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">License Type</p>
                  <p className="font-medium text-foreground capitalize">
                    {licenseType.replace("-", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Collaborators</p>
                  <p className="font-medium text-foreground">
                    {selectedCollaborators.length}
                  </p>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-muted-foreground mb-2">Ownership Split</p>
                  <div className="space-y-1">
                    {selectedCollaborators.map((c) => (
                      <div key={c.id} className="flex justify-between text-xs">
                        <span className="text-foreground">{c.name}</span>
                        <span className="font-semibold text-foreground">
                          {c.ownership}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Dispute Modal */}
      {showDisputeModal && violations && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-semibold">
                ⚠️ Possible IP Violation Detected
              </h3>
            </div>

            <div className="space-y-4 mb-6">
              {violations.urlMatch && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-medium text-red-800">
                    Exact URL Match Found:
                  </p>
                  <p className="text-sm text-red-700">
                    This URL is already registered by{" "}
                    <strong>{violations.urlMatch.owner.name}</strong>
                  </p>
                  <p className="text-xs text-red-600">
                    Registered:{" "}
                    {new Date(
                      violations.urlMatch.registeredAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}

              {violations.titleMatches.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="font-medium text-yellow-800">
                    Similar Titles Found:
                  </p>
                  {violations.titleMatches.map((match: any, index: number) => (
                    <div key={index} className="text-sm text-yellow-700">
                      • "{match.title}" by {match.owner.name}
                    </div>
                  ))}
                </div>
              )}

              {violations.thumbnailMatches.length > 0 && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="font-medium text-orange-800">
                    Similar Thumbnails Found:
                  </p>
                  {violations.thumbnailMatches.map(
                    (match: any, index: number) => (
                      <div key={index} className="text-sm text-orange-700">
                        • &quot;{match.title}&quot; by {match.owner.name}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDisputeModal(false);
                  // Don't clear violations - keep them active to block navigation
                  // setViolations(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDisputeModal(false);
                  setViolations(null); // Clear violations to allow proceeding
                  setStep(2); // Proceed to step 2
                }}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Proceed Anyway
              </Button>
              <Button
                onClick={async () => {
                  try {
                    // Record dispute using Story Protocol SDK
                    const storyProtocolService = new StoryProtocolService();

                    // Get the IP ID from the violation
                    const ipId =
                      violations.urlMatch?.storyProtocolAssetId ||
                      violations.titleMatches[0]?.storyProtocolAssetId;

                    if (!ipId) {
                      alert(
                        "Cannot record dispute: The existing IP asset is not registered with Story Protocol. Only assets registered on Story Protocol can be disputed."
                      );
                      return;
                    }

                    // Create dispute evidence
                    const disputeEvidence = {
                      reason: "Duplicate IP claim",
                      claimantAddress:
                        user?.walletAddress ||
                        "0x0000000000000000000000000000000000000000",
                      originalUrl: url,
                      originalTitle: title,
                      timestamp: new Date().toISOString(),
                      evidence:
                        "User attempting to register already claimed IP asset",
                    };

                    // Generate unique IPFS CID for this dispute
                    // Each dispute needs a unique CID that hasn't been used before
                    const evidenceCid =
                      await storyProtocolService.generateDisputeCID(
                        disputeEvidence
                      );
                    console.log("Generated unique dispute CID:", evidenceCid);

                    const disputeResponse =
                      await storyProtocolService.recordDispute(
                        ipId,
                        "Duplicate IP claim",
                        evidenceCid
                      );

                    if (disputeResponse.success) {
                      // Also save to backend for tracking
                      await apiClient.recordDispute({
                        assetId:
                          violations.urlMatch?.assetId ||
                          violations.titleMatches[0]?.assetId,
                        disputeReason: "Duplicate IP claim",
                        claimantAddress:
                          user?.walletAddress ||
                          "0x0000000000000000000000000000000000000000",
                        storyProtocolDisputeId: disputeResponse.disputeId,
                        transactionHash: disputeResponse.transactionHash,
                      });

                      setShowDisputeModal(false);
                      setViolations(null);
                      alert(
                        `Dispute recorded successfully! Transaction: ${disputeResponse.transactionHash}`
                      );
                    }
                  } catch (error) {
                    console.error("Failed to record dispute:", error);
                    alert("Failed to record dispute. Please try again.");
                  }
                }}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Raise Dispute
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
