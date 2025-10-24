"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Check, X } from "lucide-react"

interface ApprovalsPageProps {
  onNavigate: (page: "dashboard" | "add-ip" | "approvals" | "login" | "verify-ip" | "settings") => void
}

const mockRequests = [
  {
    id: "1",
    thumbnail: "/sunset-beats-remix.jpg",
    title: "Sunset Beats – Remix License",
    initiator: "@alexwave",
    ownership: "25%",
    status: "pending",
  },
  {
    id: "2",
    thumbnail: "/ocean-reels-collaboration.jpg",
    title: "Ocean Reels Collaboration",
    initiator: "@johnfilm",
    ownership: "30%",
    status: "pending",
  },
  {
    id: "3",
    thumbnail: "/tech-talk-podcast.jpg",
    title: "TechTalk Ep. 4",
    initiator: "@mira.codes",
    ownership: "20%",
    status: "approved",
  },
]

export default function ApprovalsPage({ onNavigate }: ApprovalsPageProps) {
  const [requests, setRequests] = useState(mockRequests)
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending")

  const handleApprove = (id: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)))
  }

  const handleReject = (id: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)))
  }

  const filteredRequests = requests.filter((r) => r.status === activeTab)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => onNavigate("dashboard")} className="p-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Collaboration Approvals</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border">
          {(["pending", "approved", "rejected"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({requests.filter((r) => r.status === tab).length})
            </button>
          ))}
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <Card key={request.id} className="p-4 border border-border hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    <img
                      src={request.thumbnail || "/placeholder.svg"}
                      alt={request.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{request.title}</p>
                    <p className="text-sm text-muted-foreground">Requested by {request.initiator}</p>
                    <p className="text-sm text-muted-foreground">Proposed Ownership: {request.ownership}</p>
                  </div>

                  {/* Status indicator */}
                  <div className="flex-shrink-0">
                    {request.status === "pending" && (
                      <span className="inline-block w-3 h-3 rounded-full bg-yellow-500"></span>
                    )}
                    {request.status === "approved" && (
                      <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                    )}
                    {request.status === "rejected" && (
                      <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                    )}
                  </div>

                  {/* Actions */}
                  {request.status === "pending" && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(request.id)}
                        className="flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                  {request.status === "approved" && (
                    <span className="text-sm font-medium text-green-600">Approved</span>
                  )}
                  {request.status === "rejected" && <span className="text-sm font-medium text-red-600">Rejected</span>}
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 border border-border text-center">
              <p className="text-muted-foreground">No {activeTab} collaboration requests</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
