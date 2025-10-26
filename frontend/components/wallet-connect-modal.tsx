"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, Mail, Instagram, Check } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (method: string) => void;
  onNavigate: (page: string) => void;
  onDisconnect: () => void;
}

export default function WalletConnectModal({
  isOpen,
  onClose,
  onConnect,
  onNavigate,
  onDisconnect,
}: WalletConnectModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Connect Your Accounts
              </h2>
              <p className="text-white/60 text-sm">
                Connect your wallet and social accounts to get started
              </p>
            </div>

            {/* Connection Options */}
            <div className="space-y-4">
              {/* Wallet Connection */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#41B5FF] to-[#99F3FB] flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Wallet</h3>
                    <p className="text-white/60 text-sm">
                      Connect your crypto wallet
                    </p>
                  </div>
                </div>
                <div className="w-full">
                  <ConnectButton />
                </div>
              </div>

              {/* Google Connection */}
              <motion.button
                onClick={() => onConnect("google")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-[#41B5FF]/50 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#1380F5] to-[#41B5FF] flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-semibold">Google Account</h3>
                    <p className="text-white/60 text-sm">
                      Connect your Google account
                    </p>
                  </div>
                  <Check className="w-5 h-5 text-[#99F3FB]" />
                </div>
              </motion.button>

              {/* Instagram Connection */}
              <motion.button
                onClick={() => onConnect("instagram")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-[#41B5FF]/50 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#99F3FB] to-[#E9F6FF] flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-semibold">Instagram</h3>
                    <p className="text-white/60 text-sm">
                      Connect your Instagram account
                    </p>
                  </div>
                  <Check className="w-5 h-5 text-[#99F3FB]" />
                </div>
              </motion.button>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-xs text-white/40 text-center">
                By connecting, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
