"use client"

import { Button } from "@/components/ui/button"
import { FileText, Users, Plus, CheckCircle, Settings, LogOut, X } from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onNavigate: (page: "dashboard" | "add-ip" | "approvals" | "login" | "verify-ip" | "settings") => void
  onClose: () => void
}

export default function Sidebar({ isOpen, onNavigate, onClose }: SidebarProps) {
  const menuItems = [
    { icon: FileText, label: "My IPs", page: "dashboard" as const },
    { icon: Plus, label: "Add New IP", page: "add-ip" as const },
    { icon: Users, label: "Collaborations", page: "approvals" as const },
    { icon: CheckCircle, label: "Verify IP", page: "verify-ip" as const },
    { icon: Settings, label: "Settings", page: "settings" as const },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 lg:hidden z-40" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 z-40 lg:z-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-bold text-lg">S</span>
              </div>
              <h1 className="text-lg font-bold text-sidebar-foreground">StoryIP</h1>
            </div>
            <button onClick={onClose} className="lg:hidden p-2 hover:bg-sidebar-accent rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  onNavigate(item.page)
                  onClose()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-left"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 bg-transparent"
              onClick={() => onNavigate("login")}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
