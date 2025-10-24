"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Wallet, Mail, Instagram, X } from "lucide-react"

interface SettingsPageProps {
  userEmail: string
  wallet: string
  google: string
  instagram: string
  onNavigate: (page: "dashboard" | "add-ip" | "approvals" | "login" | "verify-ip" | "settings") => void
}

export default function SettingsPage({ userEmail, wallet, google, instagram, onNavigate }: SettingsPageProps) {
  const [displayName, setDisplayName] = useState("Alex Wave")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      alert("Settings saved!")
    }, 500)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => onNavigate("dashboard")} className="p-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Profile Section */}
          <Card className="p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Display Name</label>
                <Input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <Input type="email" value={userEmail} disabled className="w-full opacity-50" />
              </div>
            </div>
          </Card>

          {/* Wallet & Integrations */}
          <Card className="p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Connected Accounts</h2>
            <div className="space-y-4">
              {/* Wallet */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Wallet</p>
                    <p className="text-sm text-muted-foreground">{wallet || "Not connected"}</p>
                  </div>
                </div>
                {wallet && (
                  <Button size="sm" variant="outline" className="flex items-center gap-1 bg-transparent">
                    <X className="w-4 h-4" />
                    Disconnect
                  </Button>
                )}
              </div>

              {/* Google */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Google</p>
                    <p className="text-sm text-muted-foreground">{google || "Not connected"}</p>
                  </div>
                </div>
                {google && (
                  <Button size="sm" variant="outline" className="flex items-center gap-1 bg-transparent">
                    <X className="w-4 h-4" />
                    Disconnect
                  </Button>
                )}
              </div>

              {/* Instagram */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Instagram className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Instagram</p>
                    <p className="text-sm text-muted-foreground">{instagram || "Not connected"}</p>
                  </div>
                </div>
                {instagram && (
                  <Button size="sm" variant="outline" className="flex items-center gap-1 bg-transparent">
                    <X className="w-4 h-4" />
                    Disconnect
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onNavigate("dashboard")} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
