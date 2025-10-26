"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Calendar,
  Hash,
  ExternalLink,
  Copy,
  CheckCircle,
  X,
} from "lucide-react";

interface AlreadyRegisteredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  existingAsset: {
    assetId: string;
    title: string;
    registeredAt: string;
    storyProtocolAssetId: string;
    owner: string;
  };
}

export default function AlreadyRegisteredModal({
  isOpen,
  onClose,
  onProceed,
  existingAsset,
}: AlreadyRegisteredModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>

            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
                IP Already Registered
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Warning Message */}
              <div className="bg-amber-500/10 border border-amber-400/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-300 mb-1">
                      This IP asset has already been registered
                    </h3>
                    <p className="text-amber-200/80 text-sm">
                      You have previously registered this content. You can
                      register it again for derivatives, remixes, or different
                      purposes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Existing Asset Details */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Hash className="w-5 h-5 text-blue-400" />
                    Existing Registration Details
                  </h3>
                </div>
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="text-sm font-medium text-white/70 mb-1 block">
                      Title
                    </label>
                    <p className="text-white font-medium">
                      {existingAsset.title}
                    </p>
                  </div>

                  {/* Registration Date */}
                  <div>
                    <label className="text-sm font-medium text-white/70 mb-1 block">
                      Registration Date
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-white/60" />
                      <span className="text-white">
                        {formatDate(existingAsset.registeredAt)}
                      </span>
                    </div>
                  </div>

                  {/* Story Protocol Asset ID */}
                  <div>
                    <label className="text-sm font-medium text-white/70 mb-1 block">
                      Story Protocol Asset ID
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white/10 px-3 py-2 rounded-md text-sm font-mono text-white/90 truncate border border-white/20">
                        {existingAsset.storyProtocolAssetId}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleCopy(
                            existingAsset.storyProtocolAssetId,
                            "assetId"
                          )
                        }
                        className="shrink-0 border-white/20 text-white hover:bg-white/10"
                      >
                        {copiedField === "assetId" ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Asset ID */}
                  <div>
                    <label className="text-sm font-medium text-white/70 mb-1 block">
                      Database Asset ID
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white/10 px-3 py-2 rounded-md text-sm font-mono text-white/90 truncate border border-white/20">
                        {existingAsset.assetId}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleCopy(existingAsset.assetId, "dbId")
                        }
                        className="shrink-0 border-white/20 text-white hover:bg-white/10"
                      >
                        {copiedField === "dbId" ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onProceed}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Register Again
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-sm text-white/70 bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="font-medium mb-1 text-white">
                  Why register the same IP again?
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-white/60">
                  <li>Create a derivative work or remix</li>
                  <li>Register for a different license type</li>
                  <li>Update ownership or collaboration terms</li>
                  <li>Create a new version with different metadata</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
