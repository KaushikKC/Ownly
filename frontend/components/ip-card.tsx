"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface IPCardProps {
  id: string;
  title: string;
  thumbnail: string;
  platform: string;
  collaborators: string[];
  licenseType: string;
  status: string;
  ownership: string;
  onSelect?: (ip: IPCardProps) => void;
}

export default function IPCard({
  id,
  title,
  thumbnail,
  platform,
  collaborators,
  licenseType,
  status,
  ownership,
  onSelect,
}: IPCardProps) {
  const getLicenseColor = (type: string) => {
    switch (type) {
      case "Commercial Remix":
        return "bg-[#41B5FF]/20 text-[#41B5FF] border-[#41B5FF]/30";
      case "Non-Commercial":
        return "bg-[#99F3FB]/20 text-[#99F3FB] border-[#99F3FB]/30";
      case "Private Draft":
        return "bg-white/10 text-white/80 border-white/20";
      default:
        return "bg-white/10 text-white/80 border-white/20";
    }
  };

  const getStatusColor = (s: string) => {
    return s === "Active"
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  };

  const handleClick = () => {
    if (onSelect) {
      onSelect({
        id,
        title,
        thumbnail,
        platform,
        collaborators,
        licenseType,
        status,
        ownership,
      });
    }
  };

  return (
    <Card
      onClick={handleClick}
      className="glassy-card overflow-hidden hover:border-[#41B5FF]/50 hover:shadow-2xl hover:shadow-[#41B5FF]/20 transition-all cursor-pointer group"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-muted overflow-hidden">
        <img
          src={thumbnail || "/placeholder.svg"}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Collaborators */}
        <div className="flex items-center gap-2 mb-3">
          {collaborators.slice(0, 3).map((collab, idx) => (
            <div
              key={idx}
              className="w-6 h-6 rounded-full bg-linear-to-br from-[#41B5FF]/30 to-[#99F3FB]/30 flex items-center justify-center text-xs font-semibold text-white border border-white/20"
              title={collab}
            >
              {collab.charAt(1).toUpperCase()}
            </div>
          ))}
          {collaborators.length > 3 && (
            <span className="text-xs text-white/60">
              +{collaborators.length - 3}
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
          <Badge className={`text-xs ${getLicenseColor(licenseType)}`}>
            {licenseType}
          </Badge>
          <Badge className={`text-xs ${getStatusColor(status)}`}>
            {status}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
