"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Copy } from "lucide-react";
import apiClient from "@/lib/api/client";

interface DebugLicenseTermsProps {
  asset: {
    _id: string;
    title: string;
    storyProtocolAssetId?: string;
    license?: {
      storyProtocolLicenseId?: string;
    };
  };
}

export default function DebugLicenseTerms({ asset }: DebugLicenseTermsProps) {
  const [licenseTermsId, setLicenseTermsId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    licenseTermsId: string;
    terms: string;
    commercialUse: boolean;
    attributionRequired: boolean;
    royaltyPercentage: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetLicenseTerms = async () => {
    if (!asset.storyProtocolAssetId) {
      setError("Asset must be registered with Story Protocol first");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Import Story Protocol service
      const StoryProtocolService = (await import("@/lib/storyProtocol"))
        .default;
      const storyProtocolService = new StoryProtocolService();

      // Get license terms from Story Protocol
      const response = await storyProtocolService.getLicenseTerms(
        asset.storyProtocolAssetId
      );

      setResult(response);
    } catch (error) {
      console.error("Failed to get license terms:", error);
      setError(`Failed to get license terms: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Debug License Terms
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="assetId">Asset ID</Label>
          <div className="flex items-center gap-2">
            <Input
              id="assetId"
              value={asset.storyProtocolAssetId || "Not registered"}
              readOnly
              className="font-mono text-xs"
            />
            {asset.storyProtocolAssetId && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(asset.storyProtocolAssetId!)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseTermsId">
            License Terms ID (from registration)
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="licenseTermsId"
              value={licenseTermsId}
              onChange={(e) => setLicenseTermsId(e.target.value)}
              placeholder="Enter license terms ID from your IP registration"
              className="font-mono text-xs"
            />
            <Button
              onClick={handleGetLicenseTerms}
              disabled={loading || !licenseTermsId}
              size="sm"
            >
              {loading ? "Loading..." : "Get Terms"}
            </Button>
          </div>
        </div>

        {asset.license?.storyProtocolLicenseId && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Stored License ID:</p>
            <p className="font-mono text-xs">
              {asset.license.storyProtocolLicenseId}
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {result && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800 mb-2">
              License Terms Found:
            </p>
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify(
                result,
                (key, value) =>
                  typeof value === "bigint" ? value.toString() : value,
                2
              )}
            </pre>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>How to find License Terms ID:</strong>
          </p>
          <p>
            1. When you registered your IP asset, the response included a{" "}
            <code>licenseTermsIds</code> array
          </p>
          <p>
            2. Use the first ID from that array:{" "}
            <code>response.licenseTermsIds[0]</code>
          </p>
          <p>
            3. This ID is also stored in your asset&apos;s{" "}
            <code>license.storyProtocolLicenseId</code> field
          </p>
          <p>
            4. You can also find it on the Story Protocol explorer for your IP
            asset
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
