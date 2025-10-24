"use client"

import { useState } from "react"
import LoginPage from "@/components/pages/login-page"
import DashboardPage from "@/components/pages/dashboard-page"
import AddIPPage from "@/components/pages/add-ip-page"
import ApprovalsPage from "@/components/pages/approvals-page"
import VerifyIPPage from "@/components/pages/verify-ip-page"
import SettingsPage from "@/components/pages/settings-page"

type PageType = "login" | "dashboard" | "add-ip" | "approvals" | "verify-ip" | "settings"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>("login")
  const [userEmail, setUserEmail] = useState("")
  const [connectedWallet, setConnectedWallet] = useState("")
  const [connectedGoogle, setConnectedGoogle] = useState("")
  const [connectedInstagram, setConnectedInstagram] = useState("")

  const handleLogin = (email: string, wallet: string, google: string, instagram: string) => {
    setUserEmail(email)
    setConnectedWallet(wallet)
    setConnectedGoogle(google)
    setConnectedInstagram(instagram)
    setCurrentPage("dashboard")
  }

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page)
  }

  return (
    <main className="min-h-screen bg-background">
      {currentPage === "login" && <LoginPage onLogin={handleLogin} />}
      {currentPage === "dashboard" && <DashboardPage userEmail={userEmail} onNavigate={handleNavigate} />}
      {currentPage === "add-ip" && <AddIPPage onNavigate={handleNavigate} />}
      {currentPage === "approvals" && <ApprovalsPage onNavigate={handleNavigate} />}
      {currentPage === "verify-ip" && <VerifyIPPage onNavigate={handleNavigate} />}
      {currentPage === "settings" && (
        <SettingsPage
          userEmail={userEmail}
          wallet={connectedWallet}
          google={connectedGoogle}
          instagram={connectedInstagram}
          onNavigate={handleNavigate}
        />
      )}
    </main>
  )
}
