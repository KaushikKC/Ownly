"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Wallet, Mail, Instagram, Check } from "lucide-react"

interface LoginPageProps {
  onLogin: (email: string, wallet: string, google: string, instagram: string) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState("")
  const [connectedGoogle, setConnectedGoogle] = useState("")
  const [connectedInstagram, setConnectedInstagram] = useState("")

  const handleConnectWallet = () => {
    setConnectedWallet("0xA23F...4F9B")
  }

  const handleConnectGoogle = () => {
    setConnectedGoogle("alexwave@gmail.com")
  }

  const handleConnectInstagram = () => {
    setConnectedInstagram("@alex.creates")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!connectedWallet) {
      alert("Please connect your wallet first")
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      onLogin(email || "user@example.com", connectedWallet, connectedGoogle, connectedInstagram)
      setIsLoading(false)
    }, 500)
  }

  const isConnected = connectedWallet && (connectedGoogle || connectedInstagram)

  return (
    <div className="min-h-screen flex">
      {/* Left side - Abstract geometric illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-background to-primary/5 items-center justify-center p-12">
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
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">StoryIP</h1>
            </div>
            <p className="text-muted-foreground text-sm">Own and license your creativity on-chain.</p>
          </div>

          {/* Connection Status */}
          <div className="mb-6 space-y-2">
            {connectedWallet && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">Wallet Connected: {connectedWallet}</span>
              </div>
            )}
            {connectedGoogle && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">Google Linked: {connectedGoogle}</span>
              </div>
            )}
            {connectedInstagram && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">Instagram Linked: {connectedInstagram}</span>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email (Optional)</label>
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
              disabled={isLoading || !isConnected}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Continue to Dashboard"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-background text-muted-foreground">Connect your accounts</span>
            </div>
          </div>

          {/* Social buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              onClick={handleConnectWallet}
              disabled={!!connectedWallet}
              variant={connectedWallet ? "outline" : "outline"}
              className="w-full flex items-center justify-center gap-2 bg-transparent disabled:opacity-50"
            >
              <Wallet className="w-4 h-4" />
              {connectedWallet ? "Wallet Connected" : "Connect Wallet"}
            </Button>
            <Button
              type="button"
              onClick={handleConnectGoogle}
              disabled={!!connectedGoogle}
              variant={connectedGoogle ? "outline" : "outline"}
              className="w-full flex items-center justify-center gap-2 bg-transparent disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              {connectedGoogle ? "Google Connected" : "Connect Google"}
            </Button>
            <Button
              type="button"
              onClick={handleConnectInstagram}
              disabled={!!connectedInstagram}
              variant={connectedInstagram ? "outline" : "outline"}
              className="w-full flex items-center justify-center gap-2 bg-transparent disabled:opacity-50"
            >
              <Instagram className="w-4 h-4" />
              {connectedInstagram ? "Instagram Connected" : "Connect Instagram"}
            </Button>
          </div>

          {/* Footer text */}
          <p className="text-xs text-muted-foreground text-center mt-8">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
