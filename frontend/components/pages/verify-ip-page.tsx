"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"

interface VerifyIPPageProps {
  onNavigate: (page: "dashboard" | "add-ip" | "approvals" | "login" | "verify-ip" | "settings") => void
}

export default function VerifyIPPage({ onNavigate }: VerifyIPPageProps) {
  const [url, setUrl] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<{ status: "registered" | "not-registered" | null; owner?: string }>({
    status: null,
  })

  const handleCheck = () => {
    if (!url) return
    setIsChecking(true)
    setTimeout(() => {
      // Mock result - 50% chance of being registered
      const isRegistered = Math.random() > 0.5
      setResult({
        status: isRegistered ? "registered" : "not-registered",
        owner: isRegistered ? "@alexwave" : undefined,
      })
      setIsChecking(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => onNavigate("dashboard")} className="p-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Verify IP</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Card className="p-8 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-2">Check IP Registration Status</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Enter a media URL to check if it's already registered as an IP on Story Protocol.
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Media URL</label>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://instagram.com/reel/..."
                className="w-full"
              />
            </div>

            <Button
              onClick={handleCheck}
              disabled={isChecking || !url}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              {isChecking ? "Checking..." : "Check Ownership"}
            </Button>
          </div>

          {/* Results */}
          {result.status === "registered" && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">✅ Registered</p>
                <p className="text-sm text-green-800">Owned by {result.owner}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-transparent"
                  onClick={() => onNavigate("dashboard")}
                >
                  View IP Details
                </Button>
              </div>
            </div>
          )}

          {result.status === "not-registered" && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">❌ Not Registered</p>
                <p className="text-sm text-yellow-800">This media is not yet registered as an IP.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-transparent"
                  onClick={() => onNavigate("add-ip")}
                >
                  Register as New IP
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
