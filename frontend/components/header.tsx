"use client";

import { Bell, Menu, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import logo from "@/public/logo-light.svg";

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

interface TopHeaderProps {
  userEmail?: string;
  emailAddress?: string;
  currentPage?: string;
  onWalletConnect?: () => void;
  connectedWallet?: boolean;
  connectedGoogle?: boolean;
  walletAddress?: string;
  onDisconnect?: () => void;
  onNavigate?: (page: PageType) => void;
}

export default function TopHeader({
  userEmail,
  currentPage,
  onWalletConnect,
  connectedWallet,
  connectedGoogle,
  walletAddress,
  onDisconnect,
  onNavigate,
}: TopHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: "My IPs", page: "dashboard", href: "/dashboard" },
    { label: "Add New IP", page: "add-ip", href: "/add-ip" },
    { label: "Link YouTube", page: "youtube-link", href: "/youtube-link" },
    { label: "Verify IP", page: "verify-ip", href: "/verify-ip" },
  ];

  return (
    <>
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
        <div className="bg-black/80 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Image
                src={logo}
                alt="Ownly"
                width={100}
                height={100}
                className="w-10 h-10 text-white"
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2 rounded-full">
              {menuItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => onNavigate?.(item.page as PageType)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                    currentPage === item.page
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#41B5FF] rounded-full"></span>
              </button>

              {userEmail && (
                <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-white/10">
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#41B5FF] to-[#1380F5] flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {userEmail.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-sm font-medium text-white">
                      {userEmail}
                    </p>
                  </div>
                </div>
              )}

              {connectedWallet || connectedGoogle ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-sm">
                    {connectedWallet && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-green-300 text-xs">
                          {walletAddress?.slice(0, 4)}...
                          {walletAddress?.slice(-3)}
                        </span>
                      </div>
                    )}
                    {connectedGoogle && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-full">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-blue-300 text-xs">G</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={onDisconnect}
                    className="p-2 hover:bg-red-500/20 rounded-full transition-colors"
                    title="Disconnect"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onWalletConnect}
                  className="p-3 hover:bg-white/10 rounded-full transition-colors w-full text-white"
                >
                  <span>Get Started</span>
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 bg-black/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-4">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => {
                    onNavigate?.(item.page as PageType);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm font-medium rounded-2xl transition-all block ${
                    currentPage === item.page
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
