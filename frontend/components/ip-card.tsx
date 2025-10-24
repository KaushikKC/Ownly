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
        return "bg-blue-100 text-blue-800";
      case "Non-Commercial":
        return "bg-purple-100 text-purple-800";
      case "Private Draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (s: string) => {
    return s === "Active"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
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
      className="overflow-hidden border border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
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
              className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary"
              title={collab}
            >
              {collab.charAt(1).toUpperCase()}
            </div>
          ))}
          {collaborators.length > 3 && (
            <span className="text-xs text-muted-foreground">
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
