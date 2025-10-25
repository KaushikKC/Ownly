"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import LoginPage from "@/components/pages/login-page";
import DashboardPage from "@/components/pages/dashboard-page";
import AddIPPage from "@/components/pages/add-ip-page";
import ApprovalsPage from "@/components/pages/approvals-page";
import VerifyIPPage from "@/components/pages/verify-ip-page";
import SettingsPage from "@/components/pages/settings-page";
import YouTubeImportPage from "@/components/pages/youtube-import-page";
import LicenseVideoPage from "@/components/pages/license-video-page";
import YouTubeLinkPage from "@/components/pages/youtube-link-page";
import { AuthGuard } from "@/components/auth-guard";
import { AuthDebug } from "@/components/auth-debug";

type PageType =
  | "login"
  | "dashboard"
  | "add-ip"
  | "approvals"
  | "verify-ip"
  | "settings"
  | "youtube-import"
  | "license-video"
  | "youtube-link";

export default function Home() {
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState<PageType>("login");
  const [userEmail, setUserEmail] = useState("");
  const [connectedWallet, setConnectedWallet] = useState("");
  const [connectedGoogle, setConnectedGoogle] = useState("");
  const [connectedInstagram, setConnectedInstagram] = useState("");

  const handleLogin = (
    email: string,
    wallet: string,
    google: string,
    instagram: string
  ) => {
    setUserEmail(email);
    setConnectedWallet(wallet);
    setConnectedGoogle(google);
    setConnectedInstagram(instagram);
    setCurrentPage("dashboard");
  };

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page);
  };

  // Show login page if not authenticated
  if (status === "unauthenticated" || currentPage === "login") {
    return (
      <main className="min-h-screen bg-background">
        <LoginPage onLogin={handleLogin} />
        <AuthDebug />
      </main>
    );
  }

  // Show loading state
  if (status === "loading") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  // Show authenticated content
  return (
    <AuthGuard>
      <main className="min-h-screen bg-background">
        {currentPage === "dashboard" && (
          <DashboardPage userEmail={userEmail} onNavigate={handleNavigate} />
        )}
        {currentPage === "add-ip" && <AddIPPage onNavigate={handleNavigate} />}
        {currentPage === "approvals" && (
          <ApprovalsPage onNavigate={handleNavigate} />
        )}
        {currentPage === "verify-ip" && (
          <VerifyIPPage onNavigate={handleNavigate} />
        )}
        {currentPage === "settings" && (
          <SettingsPage
            userEmail={userEmail}
            wallet={connectedWallet}
            google={connectedGoogle}
            instagram={connectedInstagram}
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === "youtube-import" && (
          <YouTubeImportPage onNavigate={handleNavigate} />
        )}
        {currentPage === "license-video" && (
          <LicenseVideoPage onNavigate={handleNavigate} />
        )}
        {currentPage === "youtube-link" && (
          <YouTubeLinkPage onNavigate={handleNavigate} />
        )}
      </main>
    </AuthGuard>
  );
}
