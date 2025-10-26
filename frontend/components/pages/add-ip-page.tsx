"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Check, Loader2, AlertCircle } from "lucide-react";
import LicenseSelector from "@/components/license-selector";
import AlreadyRegisteredModal from "@/components/already-registered-modal";
import TopHeader from "@/components/header";
import { useUser } from "@/lib/user-context";
import apiClient from "@/lib/api/client";
import StoryProtocolService from "@/lib/storyProtocol";
import Image from "next/image";

type PageType =
  | "login"
  | "dashboard"
  | "add-ip"
  | "approvals"
  | "verify-ip"
  | "settings"
  | "youtube-import"
  | "license-video"
  | "youtube-link";

interface AddIPPageProps {
  onNavigate: (page: PageType) => void;
}

// Mock collaborators removed as they were unused

export default function AddIPPage({ onNavigate }: AddIPPageProps) {
  const {
    user,
    walletAddress,
    isConnected,
    connectWallet,
    disconnectWallet,
    logout,
  } = useUser();
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
  const [violations, setViolations] = useState<{
    urlMatch?: {
      owner: { name: string };
      registeredAt: string;
      assetId: string;
      storyProtocolAssetId: string;
    };
    titleMatches?: Array<{
      title: string;
      owner: { name: string };
      assetId: string;
      storyProtocolAssetId: string;
    }>;
    thumbnailMatches?: Array<{
      title: string;
      owner: { name: string };
      assetId: string;
      storyProtocolAssetId: string;
    }>;
  } | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showAlreadyRegisteredModal, setShowAlreadyRegisteredModal] =
    useState(false);
  const [existingAsset, setExistingAsset] = useState<{
    assetId: string;
    title: string;
    registeredAt: string;
    storyProtocolAssetId: string;
    owner: string;
  } | null>(null);
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
          await verifyOwnership(newUrl, {
            title: video.title,
            thumbnailUrl: video.thumbnailUrl,
          });
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
  const verifyOwnership = async (
    videoUrl: string,
    videoData?: { title: string; thumbnailUrl: string }
  ) => {
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

      // Check if user has YouTube channel ID (either from database or manually set)
      if (!user?.youtubeChannelId) {
        setOwnershipStatus({
          isOwner: false,
          channelInfo: null,
          message:
            "YouTube channel ID not found. Please go to Settings and enter your YouTube channel ID to verify ownership.",
        });
        return;
      }

      // Show that we're using the user's YouTube channel ID
      console.log("Using YouTube channel ID:", user.youtubeChannelId);

      const response = await fetch(
        "https://ownly-dxax.vercel.app/api/youtube/verify-ownership",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            videoUrl,
            userEmail,
          }),
        }
      );
      const data = await response.json();

      if (data.success) {
        setOwnershipStatus({
          isOwner: data.isOwner,
          channelInfo: data.channelInfo,
          message: data.message,
        });

        // If ownership is verified, set the current user as the only collaborator with 100% ownership
        if (data.isOwner && user) {
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
            const violationData = {
              sourceUrl: videoUrl,
              title: videoData?.title || title,
              thumbnailUrl: videoData?.thumbnailUrl || thumbnailUrl,
              currentWalletAddress: user?.walletAddress, // Pass current user's wallet address for intelligent filtering
            };

            console.log("Checking violations with data:", violationData);

            const violationResponse = await apiClient.checkViolations(
              violationData
            );

            // Check if user has already registered this IP
            if (violationResponse.isAlreadyRegistered) {
              // Show a proper modal with existing asset details
              const existingAssetData = violationResponse.violations.urlMatch;
              if (existingAssetData) {
                setExistingAsset({
                  assetId: existingAssetData.assetId,
                  title: existingAssetData.title,
                  registeredAt: existingAssetData.registeredAt,
                  storyProtocolAssetId: existingAssetData.storyProtocolAssetId,
                  owner: existingAssetData.owner,
                });
                setShowAlreadyRegisteredModal(true);
                return; // Stop the flow until user decides
              }
            }

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

  const addCollaborator = () => {
    const newId = (selectedCollaborators.length + 1).toString();
    setSelectedCollaborators((prev) => [
      ...prev,
      {
        id: newId,
        name: `@collaborator${newId}`,
        wallet: "0x0000...0000",
        ownership: 0,
        approval: false,
      },
    ]);
  };

  const removeCollaborator = (id: string) => {
    setSelectedCollaborators((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCollaborator = (id: string, field: string, value: string) => {
    setSelectedCollaborators((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
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
        ownerAddress: user?.walletAddress || undefined, // Pass the current user's wallet address
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
            assetId: storyResponse.storyProtocolAssetId || "",
            nftTokenId: storyResponse.nftTokenId || "",
            nftContractAddress: storyResponse.nftContractAddress || "",
            licenseId: storyResponse.licenseId
              ? String(storyResponse.licenseId)
              : "",
            transactionHashes: {
              registration: storyResponse.transactionHash || "",
            },
            ipfsHash: storyResponse.ipfsHash || "",
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
      <div className="min-h-screen">
        <TopHeader
          currentPage="add-ip"
          userEmail={user?.email || ""}
          walletAddress={walletAddress || ""}
          connectedWallet={isConnected}
          connectedGoogle={!!user?.email}
          onWalletConnect={connectWallet}
          onDisconnect={logout}
          onNavigate={onNavigate}
        />
        <div className="max-w-2xl mx-auto px-6 py-12 pt-30">
          <Card className="glassy-card p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 flex items-center justify-center rounded-full">
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              ✅ Success! IP Registered
            </h2>
            <p className="text-muted-foreground mb-8">
              Your IP has been successfully registered on Story Protocol.
            </p>

            {storyProtocolData && (
              <div className="space-y-4 mb-8 text-left bg-white/40 p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Story IP ID</p>
                  <p className="font-mono font-semibold text-foreground">
                    #{storyProtocolData.assetId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Transaction Hash
                  </p>
                  <p className="font-mono font-semibold text-foreground">
                    {storyProtocolData.transactionHashes.registration}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IPFS CID</p>
                  <p className="font-mono font-semibold text-foreground">
                    {storyProtocolData.ipfsHash}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NFT Contract</p>
                  <p className="font-mono font-semibold text-foreground">
                    {storyProtocolData.nftContractAddress}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                onClick={() => onNavigate("dashboard")}
                className="story-button"
              >
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopHeader
        currentPage="add-ip"
        userEmail={user?.email || ""}
        walletAddress={walletAddress || ""}
        connectedWallet={isConnected}
        connectedGoogle={!!user?.email}
        onWalletConnect={connectWallet}
        onDisconnect={disconnectWallet}
        onNavigate={onNavigate}
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 pt-30">
        {/* Step Indicator */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1">
              <div
                className={`h-2 ${s <= step ? "bg-[#41B5FF]" : "bg-white/40"}`}
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
                <Card className="glassy-card p-6">
                  <label className="block text-sm font-semibold mb-3 placeholder:text-white">
                    Source URL
                  </label>
                  <Input
                    type="text"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full border-[#41B5FF]/30 bg-white/20"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Paste a YouTube or Instagram URL to auto-detect
                    collaborators
                  </p>
                </Card>

                {isLoadingVideo && (
                  <Card className="glassy-card p-6">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-[#41B5FF]" />
                      <p className="text-sm text-muted-foreground">
                        Loading video data...
                      </p>
                    </div>
                  </Card>
                )}

                {videoError && (
                  <Card className="glassy-card p-6 border-red-500/20 bg-red-500/10">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <p className="text-sm text-red-400">{videoError}</p>
                    </div>
                  </Card>
                )}

                {title && !videoError && (
                  <Card className="glassy-card p-6">
                    <label className="block text-sm font-semibold text-foreground mb-3">
                      Metadata Preview
                    </label>
                    <div className="aspect-video bg-white/40 overflow-hidden mb-4">
                      {thumbnailUrl && (
                        <Image
                          src={thumbnailUrl}
                          alt="Video preview"
                          width={400}
                          height={225}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Platform: YouTube
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Publish Date: {publishDate}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Channel: {channelTitle}
                      </p>
                    </div>
                  </Card>
                )}

                {isVerifyingOwnership && (
                  <Card className="glassy-card p-6">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-[#41B5FF]" />
                      <p className="text-sm text-muted-foreground">
                        Verifying ownership...
                      </p>
                    </div>
                  </Card>
                )}

                {ownershipStatus && (
                  <Card
                    className={`glassy-card p-6 ${
                      ownershipStatus.isOwner
                        ? "border-green-500/20 bg-green-500/10"
                        : "border-red-500/20 bg-red-500/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {ownershipStatus.isOwner ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <p
                        className={`text-sm ${
                          ownershipStatus.isOwner
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {ownershipStatus.message}
                      </p>
                    </div>
                  </Card>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => onNavigate("dashboard")}
                    className="flex-1 bg-white/60 border-[#41B5FF]/30"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setStep(2)}
                    className="flex-1"
                    disabled={!ownershipStatus?.isOwner}
                  >
                    Next: Ownership Setup
                  </Button>
                </div>
              </>
            )}

            {/* Step 2 - Ownership Setup */}
            {step === 2 && (
              <>
                <Card className="glassy-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-semibold text-foreground">
                      Collaborators
                    </label>
                    <button
                      onClick={addCollaborator}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#41B5FF]/20 text-[#41B5FF] rounded-full hover:bg-[#41B5FF]/30 transition-colors"
                    >
                      <span>+</span>
                      <span>Add Collaborator</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {selectedCollaborators.map((collab) => (
                      <div
                        key={collab.id}
                        className="flex items-center gap-4 p-4 border border-white/20 rounded-lg"
                      >
                        <div
                          className="w-10 h-10 flex items-center justify-center shrink-0"
                          style={{
                            background:
                              "linear-gradient(135deg, #41B5FF 0%, #1380F5 100%)",
                          }}
                        >
                          <span className="text-sm font-semibold text-white">
                            {collab.name.charAt(1).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={collab.name}
                            onChange={(e) =>
                              updateCollaborator(
                                collab.id,
                                "name",
                                e.target.value
                              )
                            }
                            className="w-full bg-transparent border-b border-white/20 text-sm font-medium text-foreground focus:border-[#41B5FF] focus:outline-none"
                            placeholder="Collaborator name"
                          />
                          <input
                            type="text"
                            value={collab.wallet}
                            onChange={(e) =>
                              updateCollaborator(
                                collab.id,
                                "wallet",
                                e.target.value
                              )
                            }
                            className="w-full bg-transparent border-b border-white/20 text-xs text-muted-foreground focus:border-[#41B5FF] focus:outline-none mt-1"
                            placeholder="Wallet address"
                          />
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={collab.ownership}
                            onChange={(e) =>
                              handleOwnershipChange(
                                collab.id,
                                Number.parseInt(e.target.value)
                              )
                            }
                            className="w-24"
                          />
                          <span className="text-sm font-semibold text-foreground w-12 text-right">
                            {collab.ownership}%
                          </span>
                        </div>
                        <button
                          onClick={() => removeCollaborator(collab.id)}
                          className="shrink-0 rounded-full transition-colors"
                          title="Remove collaborator"
                        >
                          <span className="text-red-400 text-xl">×</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Total: {totalOwnership}%
                  </p>
                </Card>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-white/60 border-[#41B5FF]/30"
                  >
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1">
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

                <Card className="glassy-card p-6">
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Royalty Share (%)
                  </label>
                  <Input
                    type="number"
                    value={royaltyShare}
                    onChange={(e) => setRoyaltyShare(e.target.value)}
                    placeholder="10"
                    className="w-full bg-white/20 border-[#41B5FF]/30"
                  />
                </Card>

                <Card className="glassy-card p-6">
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Minting Fee (ETH)
                  </label>
                  <Input
                    type="number"
                    value={mintingFee}
                    onChange={(e) => setMintingFee(e.target.value)}
                    placeholder="0.1"
                    className="w-full bg-white/20 border-[#41B5FF]/30"
                  />
                </Card>

                <Card className="glassy-card p-6">
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    License Description
                  </label>
                  <textarea
                    value={licenseDescription}
                    onChange={(e) => setLicenseDescription(e.target.value)}
                    placeholder="Describe the license terms..."
                    className="w-full p-3 border border-[#41B5FF]/30 bg-white/20 text-sm text-foreground"
                    rows={4}
                  />
                </Card>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-white/60 border-[#41B5FF]/30"
                  >
                    Back
                  </Button>
                  <Button onClick={() => setStep(4)} className="flex-1">
                    Next: Review & Register
                  </Button>
                </div>
              </>
            )}

            {/* Step 4 - Register */}
            {step === 4 && (
              <>
                <Card className="glassy-card p-6">
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
                    className="flex-1 bg-white/60 border-[#41B5FF]/30"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleRegister}
                    disabled={isRegistering}
                    className="flex-1 disabled:opacity-50"
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
            <Card className="glassy-card p-6 sticky top-24">
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

      {/* Already Registered Modal */}
      {existingAsset && (
        <AlreadyRegisteredModal
          isOpen={showAlreadyRegisteredModal}
          onClose={() => setShowAlreadyRegisteredModal(false)}
          onProceed={() => {
            setShowAlreadyRegisteredModal(false);
            // Continue with registration - the user has confirmed they want to proceed
          }}
          existingAsset={existingAsset}
        />
      )}
    </div>
  );
}
