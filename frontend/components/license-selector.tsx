"use client";

import { Card } from "@/components/ui/card";

interface LicenseSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const licenses = [
  {
    id: "commercial",
    name: "Commercial",
    description: "Allow commercial use and remixes",
  },
  {
    id: "non-commercial",
    name: "Non-Commercial",
    description: "Non-commercial use only",
  },
  {
    id: "derivative",
    name: "Derivative",
    description: "Allow derivative works",
  },
  {
    id: "exclusive",
    name: "Exclusive",
    description: "Exclusive licensing rights",
  },
];

export default function LicenseSelector({
  value,
  onChange,
}: LicenseSelectorProps) {
  return (
    <Card className="p-6 border border-border">
      <label className="block text-sm font-semibold text-foreground mb-4">
        License Type
      </label>
      <div className="space-y-3">
        {licenses.map((license) => (
          <label
            key={license.id}
            className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              value === license.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/30"
            }`}
          >
            <input
              type="radio"
              name="license"
              value={license.id}
              checked={value === license.id}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 mt-1 flex-shrink-0"
            />
            <div>
              <p className="font-medium text-foreground">{license.name}</p>
              <p className="text-sm text-muted-foreground">
                {license.description}
              </p>
            </div>
          </label>
        ))}
      </div>
    </Card>
  );
}
