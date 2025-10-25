"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Youtube,
  Clock,
  Eye,
  ThumbsUp,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  DollarSign,
  Users,
  FileText,
} from "lucide-react";
import { useUser } from "@/lib/user-context";
import apiClient from "@/lib/api/client";

interface VideoDetails {
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string;
  channelTitle: string;
  sourceUrl: string;
}

interface LicenseForm {
  type: string;
  price: number;
  royaltyPercentage: number;
  terms: string;
  commercialUse: boolean;
  attributionRequired: boolean;
  exclusivity: string;
}

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

interface LicenseVideoPageProps {
  onNavigate: (page: PageType) => void;
}

export default function LicenseVideoPage({
  onNavigate,
}: LicenseVideoPageProps) {
  const { isConnected } = useUser();
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLicensing, setIsLicensing] = useState(false);
  const [licenseResult, setLicenseResult] = useState<{
    success: boolean;
    asset: {
      id: string;
      title: string;
      description: string;
      sourceUrl: string;
      thumbnailUrl: string;
      status: string;
    };
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [licenseForm, setLicenseForm] = useState<LicenseForm>({
    type: "commercial",
    price: 0,
    royaltyPercentage: 10,
    terms: "Standard commercial license with attribution required",
    commercialUse: true,
    attributionRequired: true,
    exclusivity: "non-exclusive",
  });

  const handleCheckVideo = async () => {
    if (!videoUrl.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.checkYouTubeVideo(videoUrl);

      if (response.success && response.videoData) {
        setVideoDetails(response.videoData);
      } else {
        setError("Video not found or not accessible");
        setVideoDetails(null);
      }
    } catch (error) {
      console.error("Failed to check video:", error);
      setError("Failed to fetch video details. Please check the URL.");
      setVideoDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLicense = async () => {
    if (!videoDetails || !isConnected) {
      setError("Please connect your wallet and check a video first");
      return;
    }

    try {
      setIsLicensing(true);
      setError(null);

      // Create IP asset with license
      const assetData = {
        title: videoDetails.title,
        description: videoDetails.description,
        sourceUrl: videoDetails.sourceUrl,
        sourcePlatform: "youtube",
        thumbnailUrl: videoDetails.thumbnailUrl,
        duration: videoDetails.duration,
        collaborators: [],
        license: {
          type: licenseForm.type,
          price: licenseForm.price,
          royaltyPercentage: licenseForm.royaltyPercentage,
          terms: licenseForm.terms,
          commercialUse: licenseForm.commercialUse,
          attributionRequired: licenseForm.attributionRequired,
          exclusivity: licenseForm.exclusivity,
          status: "active",
        },
      };

      const response = await apiClient.createIPAsset(assetData);

      if (response.success) {
        setLicenseResult({
          success: true,
          asset: response.asset,
          message: "Video successfully licensed as IP asset!",
        });
      } else {
        setError("Failed to create license");
      }
    } catch (error) {
      console.error("Failed to create license:", error);
      setError("Failed to create license. Please try again.");
    } finally {
      setIsLicensing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="outline"
              onClick={() => onNavigate("dashboard")}
              className="flex items-center gap-2"
            >
              ← Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            License YouTube Video
          </h1>
          <p className="text-muted-foreground mt-2">
            Create IP assets and licensing terms for YouTube videos
          </p>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-orange-700">
                <AlertCircle className="w-5 h-5" />
                <span>Please connect your wallet to create licenses</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Video URL Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Step 1: Enter YouTube URL</CardTitle>
            <CardDescription>
              Paste the YouTube video URL you want to license
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleCheckVideo}
                disabled={!videoUrl.trim() || isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Youtube className="w-4 h-4" />
                )}
                Check Video
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Video Details */}
        {videoDetails && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                Video Details Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Image
                  src={videoDetails.thumbnailUrl}
                  alt={videoDetails.title}
                  width={192}
                  height={144}
                  className="w-48 h-36 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    {videoDetails.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {videoDetails.description}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(videoDetails.duration)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {formatNumber(videoDetails.viewCount)} views
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {formatNumber(videoDetails.likeCount)} likes
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {formatNumber(videoDetails.commentCount)} comments
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="secondary">
                      {videoDetails.channelTitle}
                    </Badge>
                    <Badge variant="outline">
                      {formatDate(videoDetails.publishedAt)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* License Configuration */}
        {videoDetails && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Step 2: Configure License Terms</CardTitle>
              <CardDescription>
                Set the licensing terms for this video
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* License Type */}
                <div className="space-y-2">
                  <Label htmlFor="license-type">License Type</Label>
                  <Select
                    value={licenseForm.type}
                    onValueChange={(value: string) =>
                      setLicenseForm({ ...licenseForm, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commercial">Commercial Use</SelectItem>
                      <SelectItem value="non-commercial">
                        Non-Commercial
                      </SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="personal">
                        Personal Use Only
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Exclusivity */}
                <div className="space-y-2">
                  <Label htmlFor="exclusivity">Exclusivity</Label>
                  <Select
                    value={licenseForm.exclusivity}
                    onValueChange={(value: string) =>
                      setLicenseForm({ ...licenseForm, exclusivity: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exclusive">Exclusive</SelectItem>
                      <SelectItem value="non-exclusive">
                        Non-Exclusive
                      </SelectItem>
                      <SelectItem value="semi-exclusive">
                        Semi-Exclusive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">License Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={licenseForm.price}
                    onChange={(e) =>
                      setLicenseForm({
                        ...licenseForm,
                        price: Number(e.target.value),
                      })
                    }
                    placeholder="0"
                  />
                </div>

                {/* Royalty Percentage */}
                <div className="space-y-2">
                  <Label htmlFor="royalty">Royalty Percentage (%)</Label>
                  <Input
                    id="royalty"
                    type="number"
                    value={licenseForm.royaltyPercentage}
                    onChange={(e) =>
                      setLicenseForm({
                        ...licenseForm,
                        royaltyPercentage: Number(e.target.value),
                      })
                    }
                    placeholder="10"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="space-y-2">
                <Label htmlFor="terms">License Terms</Label>
                <Textarea
                  id="terms"
                  value={licenseForm.terms}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setLicenseForm({ ...licenseForm, terms: e.target.value })
                  }
                  placeholder="Describe the license terms..."
                  rows={3}
                />
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="commercial-use"
                    checked={licenseForm.commercialUse}
                    onChange={(e) =>
                      setLicenseForm({
                        ...licenseForm,
                        commercialUse: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="commercial-use">Allow commercial use</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="attribution"
                    checked={licenseForm.attributionRequired}
                    onChange={(e) =>
                      setLicenseForm({
                        ...licenseForm,
                        attributionRequired: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="attribution">Require attribution</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create License Button */}
        {videoDetails && isConnected && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Ready to Create License</h3>
                  <p className="text-sm text-muted-foreground">
                    This will create an IP asset with the specified license
                    terms
                  </p>
                </div>
                <Button
                  onClick={handleCreateLicense}
                  disabled={isLicensing}
                  className="flex items-center gap-2"
                >
                  {isLicensing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  Create License
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* License Result */}
        {licenseResult && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                License Created Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-green-700">{licenseResult.message}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Price: ${licenseForm.price}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-sm">
                      Royalty: {licenseForm.royaltyPercentage}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{licenseForm.type}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => onNavigate("dashboard")}
                    variant="outline"
                  >
                    View Dashboard
                  </Button>
                  <Button
                    onClick={() => {
                      setVideoUrl("");
                      setVideoDetails(null);
                      setLicenseResult(null);
                      setError(null);
                    }}
                    variant="outline"
                  >
                    License Another Video
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
