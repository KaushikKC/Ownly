"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Youtube,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useUser } from "@/lib/user-context";

interface YouTubeLinkPageProps {
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

export default function YouTubeLinkPage({ onNavigate }: YouTubeLinkPageProps) {
  const { user, linkYouTubeChannel, updateProfile } = useUser();
  const [channelId, setChannelId] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [linkStatus, setLinkStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleLinkChannel = async () => {
    if (!channelId.trim()) {
      setLinkStatus({
        success: false,
        message: "Please enter your YouTube channel ID",
      });
      return;
    }

    try {
      setIsLinking(true);
      setLinkStatus(null);

      // Automatic YouTube linking is not available
      setLinkStatus({
        success: false,
        message:
          "Automatic YouTube linking is not available. Please use the Manual Channel ID option below.",
      });
    } catch (error) {
      console.error("Failed to start YouTube OAuth:", error);
      setLinkStatus({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to start YouTube authorization. Please try again.",
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleDirectUpdate = async () => {
    if (!channelId.trim()) {
      setLinkStatus({
        success: false,
        message: "Please enter your YouTube channel ID",
      });
      return;
    }

    try {
      setIsLinking(true);
      setLinkStatus(null);

      // Directly update user profile with channel ID
      await updateProfile({ youtubeChannelId: channelId });

      setLinkStatus({
        success: true,
        message: "YouTube channel ID updated successfully!",
      });
    } catch (error) {
      console.error("Failed to update channel ID:", error);
      setLinkStatus({
        success: false,
        message: "Failed to update channel ID. Please try again.",
      });
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => onNavigate("dashboard")}
            className="p-2 hover:bg-muted rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            Link YouTube Channel
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <Card className="p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Youtube className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Connect Your YouTube Channel
                </h2>
                <p className="text-sm text-muted-foreground">
                  Link your YouTube channel to verify ownership of your videos
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  YouTube Channel ID
                </label>
                <Input
                  type="text"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  placeholder="UCyour-channel-id-here"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Find your channel ID by going to your YouTube channel and
                  looking at the URL:
                  <br />
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    https://www.youtube.com/channel/UCyour-channel-id-here
                  </code>
                </p>
              </div>

              {linkStatus && (
                <div
                  className={`p-4 rounded-lg border ${
                    linkStatus.success
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {linkStatus.success ? (
                      <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <p
                        className={`font-medium ${
                          linkStatus.success ? "text-green-800" : "text-red-800"
                        }`}
                      >
                        {linkStatus.success ? "Success!" : "Error"}
                      </p>
                      <p
                        className={`text-sm ${
                          linkStatus.success ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {linkStatus.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleLinkChannel}
                  disabled={isLinking}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLinking
                    ? "Redirecting..."
                    : "🔗 Link YouTube Channel (Automatic)"}
                </Button>
                <Button
                  onClick={handleDirectUpdate}
                  disabled={isLinking}
                  variant="outline"
                  className="flex-1"
                >
                  {isLinking ? "Linking..." : "Manual Channel ID"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onNavigate("dashboard")}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <h3 className="font-semibold text-foreground mb-3">
              How to Find Your Channel ID
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                  1
                </span>
                <p>Go to your YouTube channel</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                  2
                </span>
                <p>Look at the URL in your browser</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                  3
                </span>
                <p>
                  Copy the part after <code>/channel/</code> - that's your
                  Channel ID
                </p>
              </div>
            </div>
          </Card>

          {user?.youtubeChannelId && (
            <Card className="p-6 border border-green-200 bg-green-50">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">
                    YouTube Channel Linked
                  </p>
                  <p className="text-sm text-green-700">
                    Channel ID:{" "}
                    <code className="bg-green-100 px-2 py-1 rounded text-xs">
                      {user.youtubeChannelId}
                    </code>
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
