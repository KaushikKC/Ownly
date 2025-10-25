"use client";

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Youtube,
  Play,
  Clock,
  CheckCircle,
  Loader2,
  ExternalLink,
  Download,
} from "lucide-react";
import { useUser } from "@/lib/user-context";
import apiClient from "@/lib/api/client";

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  url: string;
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

interface ImportPageProps {
  onNavigate: (page: PageType) => void;
}

export default function YouTubeImportPage({ onNavigate }: ImportPageProps) {
  const {} = useUser();
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: boolean;
    importedCount: number;
    errorCount: number;
    importedAssets: unknown[];
    errors: unknown[];
    registeredCount?: number;
    registeredAssets?: unknown[];
  } | null>(null);
  const [accessToken, setAccessToken] = useState<string>("");
  const [manualUrl, setManualUrl] = useState<string>("");
  const [manualVideo, setManualVideo] = useState<{
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    duration: number;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    publishedAt: string;
    channelTitle: string;
    url: string;
    sourcePlatform?: string;
    sourceUrl?: string;
  } | null>(null);
  const [isCheckingUrl, setIsCheckingUrl] = useState(false);

  // Get YouTube access token from Google OAuth
  useEffect(() => {
    const getAccessToken = async () => {
      try {
        // This would be obtained from Google OAuth with YouTube scope
        // For now, we'll use a placeholder
        const token = localStorage.getItem("youtube_access_token");
        if (token) {
          setAccessToken(token);
          await fetchUserVideos(token);
        }
      } catch (error) {
        console.error("Failed to get YouTube access token:", error);
      }
    };

    getAccessToken();
  }, []);

  const fetchUserVideos = async (token: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.getYouTubeVideos(token, 50);
      if (response.success) {
        setVideos(response.videos);
      }
    } catch (error) {
      console.error("Failed to fetch YouTube videos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoSelect = (videoId: string) => {
    const newSelected = new Set(selectedVideos);
    if (newSelected.has(videoId)) {
      newSelected.delete(videoId);
    } else {
      newSelected.add(videoId);
    }
    setSelectedVideos(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedVideos.size === videos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(videos.map((v) => v.id)));
    }
  };

  const handleBulkImport = async () => {
    if (!accessToken || selectedVideos.size === 0) return;

    try {
      setIsImporting(true);
      const response = await apiClient.bulkRegisterYouTubeVideos({
        accessToken,
        maxResults: selectedVideos.size,
        collaborators: [],
        license: {
          type: "commercial",
          price: 0,
          royaltyPercentage: 0,
          terms: "Standard commercial license",
          commercialUse: true,
          attributionRequired: true,
          exclusivity: "non-exclusive",
          status: "active",
        },
      });

      setImportResults(response);
    } catch (error) {
      console.error("Failed to import videos:", error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleManualUrlCheck = async () => {
    if (!manualUrl) return;

    try {
      setIsCheckingUrl(true);
      const response = await apiClient.checkYouTubeVideo(manualUrl);

      if (response.success && response.videoData) {
        setManualVideo(response.videoData);
      } else {
        setManualVideo(null);
      }
    } catch (error) {
      console.error("Failed to check video URL:", error);
      setManualVideo(null);
    } finally {
      setIsCheckingUrl(false);
    }
  };

  const handleManualImport = async () => {
    if (!manualVideo || !accessToken) return;

    try {
      setIsImporting(true);
      const response = await apiClient.registerYouTubeVideo({
        videoUrl: manualUrl,
        accessToken,
        collaborators: [],
        license: {
          type: "commercial",
          price: 0,
          royaltyPercentage: 0,
          terms: "Standard commercial license",
          commercialUse: true,
          attributionRequired: true,
          exclusivity: "non-exclusive",
          status: "active",
        },
      });

      if (response.success) {
        setImportResults({
          success: true,
          importedCount: 1,
          errorCount: 0,
          importedAssets: [response.asset],
          errors: [],
          registeredCount: 1,
          registeredAssets: [response.asset],
        });
        setManualVideo(null);
        setManualUrl("");
      }
    } catch (error) {
      console.error("Failed to import video:", error);
    } finally {
      setIsImporting(false);
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
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
            <Youtube className="w-8 h-8 text-red-500" />
            YouTube Content Import
          </h1>
          <p className="text-muted-foreground mt-2">
            Import your YouTube videos as IP assets and protect your content
          </p>
        </div>

        <Tabs defaultValue="bulk" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
            <TabsTrigger value="manual">Manual Import</TabsTrigger>
          </TabsList>

          {/* Bulk Import Tab */}
          <TabsContent value="bulk" className="space-y-6">
            {!accessToken ? (
              <Card>
                <CardHeader>
                  <CardTitle>Connect YouTube Account</CardTitle>
                  <CardDescription>
                    You need to connect your YouTube account to import videos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => {
                      // This would trigger YouTube OAuth
                      alert("YouTube OAuth integration needed");
                    }}
                    className="flex items-center gap-2"
                  >
                    <Youtube className="w-4 h-4" />
                    Connect YouTube Account
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Import Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle>Import Controls</CardTitle>
                    <CardDescription>
                      Select videos to import as IP assets
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          onClick={handleSelectAll}
                          disabled={isLoading}
                        >
                          {selectedVideos.size === videos.length
                            ? "Deselect All"
                            : "Select All"}
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {selectedVideos.size} of {videos.length} videos
                          selected
                        </span>
                      </div>
                      <Button
                        onClick={handleBulkImport}
                        disabled={selectedVideos.size === 0 || isImporting}
                        className="flex items-center gap-2"
                      >
                        {isImporting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        Import Selected ({selectedVideos.size})
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Videos Grid */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="ml-2">Loading your YouTube videos...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                      <Card
                        key={video.id}
                        className={`cursor-pointer transition-all ${
                          selectedVideos.has(video.id)
                            ? "ring-2 ring-primary bg-primary/5"
                            : "hover:shadow-md"
                        }`}
                        onClick={() => handleVideoSelect(video.id)}
                      >
                        <div className="relative">
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          {selectedVideos.has(video.id) && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle className="w-6 h-6 text-primary bg-background rounded-full" />
                            </div>
                          )}
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                            <Play className="w-3 h-3 inline mr-1" />
                            Watch
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold line-clamp-2 mb-2">
                            {video.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{formatDate(video.publishedAt)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Manual Import Tab */}
          <TabsContent value="manual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Import Single Video</CardTitle>
                <CardDescription>
                  Import a specific YouTube video by URL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleManualUrlCheck}
                    disabled={!manualUrl || isCheckingUrl}
                  >
                    {isCheckingUrl ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Check"
                    )}
                  </Button>
                </div>

                {manualVideo && (
                  <Card className="border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={manualVideo.thumbnailUrl}
                          alt={manualVideo.title}
                          className="w-32 h-24 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">
                            {manualVideo.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {manualVideo.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(manualVideo.duration || 0)}
                            </span>
                            <Badge variant="secondary">
                              {manualVideo.sourcePlatform}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          onClick={handleManualImport}
                          disabled={isImporting}
                          className="flex items-center gap-2"
                        >
                          {isImporting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          Import as IP Asset
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            window.open(manualVideo.sourceUrl, "_blank")
                          }
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View on YouTube
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Import Results */}
        {importResults && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                Import Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-green-700">
                  Successfully imported {importResults.registeredCount} videos
                  as IP assets
                </p>
                {importResults.errors && importResults.errors.length > 0 && (
                  <p className="text-orange-700">
                    {importResults.errorCount} videos failed to import
                  </p>
                )}
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => onNavigate("dashboard")}
                    variant="outline"
                  >
                    View Dashboard
                  </Button>
                  <Button
                    onClick={() => setImportResults(null)}
                    variant="outline"
                  >
                    Import More
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
