"use client"

import { Card } from "@/components/ui/card"

interface CollaboratorSelectorProps {
  value: string[]
  onChange: (value: string[]) => void
}

export default function CollaboratorSelector({ value, onChange }: CollaboratorSelectorProps) {
  const allCollaborators = [
    { id: "1", name: "@alexwave" },
    { id: "2", name: "@mira.codes" },
    { id: "3", name: "@johnfilmmaker" },
  ]

  const toggleCollaborator = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }

  return (
    <Card className="p-6 border border-border">
      <label className="block text-sm font-semibold text-foreground mb-4">Select Collaborators</label>
      <div className="space-y-2">
        {allCollaborators.map((collab) => (
          <label key={collab.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
            <input
              type="checkbox"
              checked={value.includes(collab.id)}
              onChange={() => toggleCollaborator(collab.id)}
              className="w-4 h-4 rounded border-border"
            />
            <span className="text-sm font-medium text-foreground">{collab.name}</span>
          </label>
        ))}
      </div>
    </Card>
  )
}
