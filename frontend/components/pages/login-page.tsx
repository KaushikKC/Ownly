"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, Mail, Instagram, Check, Loader2 } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface LoginPageProps {
  onLogin: (
    email: string,
    wallet: string,
    google: string,
    instagram: string
  ) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const {
    user,
    walletAddress,
    isConnected,
    isLoading,
    connectWallet,
    connectGoogle,
  } = useUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      alert("Please connect your wallet first");
      return;
    }
    if (!user) {
      alert("Please connect your Google account first");
      return;
    }

    onLogin(
      email || user.email || "user@example.com",
      walletAddress,
      user.email || "",
      "" // Instagram will be added later
    );
  };

  const canProceed = walletAddress && user;

  // Auto-proceed when both wallet and Google are connected
  useEffect(() => {
    if (canProceed) {
      onLogin(
        email || user?.email || "user@example.com",
        walletAddress,
        user?.email || "",
        "" // Instagram will be added later
      );
    }
  }, [canProceed, user, walletAddress, email, onLogin]);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Abstract geometric illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary/10 via-background to-primary/5 items-center justify-center p-12">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute w-96 h-96 rounded-full border-2 border-primary/20"></div>
          <div className="absolute w-72 h-72 rounded-full border-2 border-primary/30"></div>
          <div className="absolute w-48 h-48 rounded-full border-2 border-primary/40"></div>
          <div className="absolute w-24 h-24 rounded-full bg-primary/10"></div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          {/* Logo and tagline */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  S
                </span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">StoryIP</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Own and license your creativity on-chain.
            </p>
          </div>

          {/* Connection Status */}
          <div className="mb-6 space-y-2">
            {walletAddress && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">
                  Wallet Connected: {walletAddress.slice(0, 6)}...
                  {walletAddress.slice(-4)}
                </span>
              </div>
            )}
            {user && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">
                  Google Linked: {user.email}
                </span>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email (Optional)
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !canProceed}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Continue to Dashboard"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-background text-muted-foreground">
                Connect your accounts
              </span>
            </div>
          </div>

          {/* Social buttons */}
          <div className="space-y-3">
            <div className="w-full">
              <ConnectButton />
            </div>
            <Button
              type="button"
              onClick={connectGoogle}
              disabled={!!user || isLoading}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 bg-transparent disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              {user ? "Google Connected" : "Connect Google"}
            </Button>
            <Button
              type="button"
              disabled={true}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 bg-transparent opacity-50"
            >
              <Instagram className="w-4 h-4" />
              Connect Instagram (Coming Soon)
            </Button>
          </div>

          {/* Footer text */}
          <p className="text-xs text-muted-foreground text-center mt-8">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
