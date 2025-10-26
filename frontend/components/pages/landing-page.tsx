"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Github, Twitter, Lock, Zap, Shield } from "lucide-react";
import { useUser } from "@/lib/user-context";
import HeroImageLayout from "@/components/hero-image-layout";
import TopHeader from "@/components/header";
import WalletConnectModal from "@/components/wallet-connect-modal";

export default function LandingPage({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const {
    user,
    walletAddress,
    isConnected,
    connectWallet,
    connectGoogle,
    connectInstagram,
  } = useUser();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleWalletConnect = async (method: string) => {
    console.log(`Connecting with ${method}`);
    try {
      if (method === "wallet") {
        await connectWallet();
      } else if (method === "google") {
        await connectGoogle();
      } else if (method === "instagram") {
        await connectInstagram();
      }
    } catch (error) {
      console.error(`Failed to connect ${method}:`, error);
    }
  };

  return (
    <div className="min-h-screen text-white overflow-hidden font-sans">
      {/* Enhanced Header with Dark Theme */}
      <TopHeader
        onWalletConnect={() => setIsWalletModalOpen(true)}
        connectedWallet={!!walletAddress}
        connectedGoogle={!!user}
        walletAddress={walletAddress || ""}
        emailAddress={user?.email || ""}
        onDisconnect={() => {}}
      />
      {/* Enhanced Hero Section with Stunning Gradients */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-10">
        {/* Dynamic Animated Gradient Orbs */}
        <motion.div
          className="absolute w-[600px] h-[600px] bg-linear-to-r from-[#41B5FF] via-[#99F3FB] to-[#1380F5] rounded-full blur-3xl opacity-30"
          animate={{
            x: mousePosition.x - 300,
            y: mousePosition.y - 300,
            scale: [1, 1.2, 1],
          }}
          transition={{
            x: { type: "spring", damping: 30, stiffness: 100 },
            y: { type: "spring", damping: 30, stiffness: 100 },
            scale: { duration: 4, repeat: Number.POSITIVE_INFINITY },
          }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] bg-linear-to-r from-[#1380F5] via-[#3480B1] to-[#41B5FF] rounded-full blur-2xl opacity-40"
          animate={{
            x: -mousePosition.x + 200,
            y: -mousePosition.y + 200,
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            x: { type: "spring", damping: 25, stiffness: 80 },
            y: { type: "spring", damping: 25, stiffness: 80 },
            scale: { duration: 3, repeat: Number.POSITIVE_INFINITY, delay: 1 },
          }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] bg-linear-to-r from-[#99F3FB] to-[#E9F6FF] rounded-full blur-xl opacity-25"
          animate={{
            x: mousePosition.x * 0.5 - 150,
            y: -mousePosition.y * 0.3 + 150,
            rotate: [0, 360],
          }}
          transition={{
            x: { type: "spring", damping: 20, stiffness: 60 },
            y: { type: "spring", damping: 20, stiffness: 60 },
            rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY },
          }}
        />

        {/* Hero Content with Grid Layout */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 ">
          <div className="grid md:grid-cols-2 gap-12 items-center justify-center">
            {/* Enhanced Left Content */}
            <motion.div style={{ opacity, scale }}>
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-6xl md:text-7xl font-bold mb-6 leading-tight tracking-tight text-white"
              >
                Own your creativity.
                <br />
                <span className="text-gradient">
                  Register your IP on-chain.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl leading-relaxed font-normal"
              >
                Ownly lets creators prove, protect, and monetize their content
                using Story Protocol.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-6"
              >
                <motion.button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="story-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </motion.div>
            </motion.div>

            <div className="hidden md:block">
              <HeroImageLayout />
            </div>
          </div>
        </div>
      </section>

      <section
        className="relative px-12 md:px-16 overflow-hidden w-full"
        style={{
          background: `
                linear-gradient(45deg, rgba(65, 181, 255, 0.1) 25%, transparent 25%), 
                linear-gradient(-45deg, rgba(65, 181, 255, 0.1) 25%, transparent 25%), 
                linear-gradient(45deg, transparent 75%, rgba(153, 243, 251, 0.1) 75%), 
                linear-gradient(-45deg, transparent 75%, rgba(153, 243, 251, 0.1) 75%)
              `,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        }}
      >
        <div className="relative py-20 md:py-32 px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            {/* Checked pattern background */}

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-[#99F3FB] mb-6">
                The future of Creative Ownership
              </h2>
              <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-3xl mx-auto">
                In a world where content is infinitely reproducible, ownership
                becomes the scarcest resource. Ownly transforms how creators
                prove, protect, and monetize their work by anchoring it to the
                blockchain.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Capabilities Section */}
      <section className="relative py-20 md:py-32 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#99F3FB]">
              What you can do
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: "Claim & Register",
                description:
                  "Register your videos, music, and creative work directly from YouTube, Instagram, or upload custom media. Establish immutable proof of creation on-chain.",
              },
              {
                icon: Zap,
                title: "Collaborate Transparently",
                description:
                  "Add co-creators, assign ownership shares, and automate revenue splits. Every collaboration is recorded and verifiable on the blockchain.",
              },
              {
                icon: Shield,
                title: "Monetize Instantly",
                description:
                  "Generate on-chain licenses, set royalty rates, and enable programmable rights. Your IP becomes a revenue-generating asset.",
              },
            ].map((capability, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative p-6 rounded-3xl bg-linear-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 hover:border-[#41B5FF]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#41B5FF]/20 overflow-hidden"
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-linear-to-br from-[#41B5FF]/10 via-transparent to-[#99F3FB]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Header section with icon and title */}
                <div className="relative z-10 flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#41B5FF]/30 to-[#99F3FB]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                    <capability.icon className="w-6 h-6 text-[#99F3FB] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-[#99F3FB] transition-colors duration-300 leading-tight">
                      {capability.title}
                    </h3>
                    <div className="w-8 h-0.5 bg-linear-to-r from-[#41B5FF] to-[#99F3FB] mt-2 group-hover:w-full transition-all duration-300"></div>
                  </div>
                </div>

                {/* Description with enhanced styling */}
                <div className="relative z-10">
                  <p className="text-white/80 font-normal leading-relaxed group-hover:text-white/90 transition-colors duration-300 text-sm">
                    {capability.description}
                  </p>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-[#41B5FF]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Subtle border glow effect */}
                <div className="absolute inset-0 rounded-3xl bg-linear-to-r from-[#41B5FF]/20 via-transparent to-[#99F3FB]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Checked Background Patterns Section */}
      <section
        className="relative px-12 md:px-16 overflow-hidden w-full"
        style={{
          background: `
                linear-gradient(45deg, rgba(65, 181, 255, 0.1) 25%, transparent 25%), 
                linear-gradient(-45deg, rgba(65, 181, 255, 0.1) 25%, transparent 25%), 
                linear-gradient(45deg, transparent 75%, rgba(153, 243, 251, 0.1) 75%), 
                linear-gradient(-45deg, transparent 75%, rgba(153, 243, 251, 0.1) 75%)
              `,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        }}
      >
        <div className="relative py-20 md:py-32 px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            {/* Checked pattern background */}

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-[#99F3FB] mb-6">
                Built for Creators
              </h2>
              <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-3xl mx-auto">
                Ownly provides the tools and infrastructure creators need to
                protect, monetize, and grow their intellectual property in the
                Web3 economy.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Why StoryIP Section */}
      <section className="relative py-20 md:py-32 px-6 overflow-hidden">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight text-[#99F3FB] relative inline-block">
            Built on Story Protocol
          </h2>
          <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-normal mb-8">
            StoryIP leverages Story Protocol&apos;s infrastructure to make
            intellectual property programmable, composable, and monetizable.
            Your creative work becomes a first-class asset in the Web3 economy.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Immutable proof of creation",
              "Transparent ownership records",
              "Automated royalty distribution",
              "Programmable licensing",
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-4"
              >
                <div className="w-2 h-2 rounded-full skywash-accent shrink-0" />
                <span className="text-lg font-semibold text-white">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Enhanced CTA Section */}
      {/* <section className="relative py-20 md:py-32 px-6 overflow-hidden">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to own your IP?</h2>
          <p className="text-white/80 text-lg mb-8 font-normal">
            Start protecting and monetizing your creative work today.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.button
              onClick={() => onNavigate("login")}
              className="story-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Launch App
            </motion.button>
            <motion.button
              className="px-8 py-4 rounded-xl border-2 border-[#41B5FF] text-[#41B5FF] font-semibold hover:bg-[#41B5FF] hover:text-white transition-all"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>
      </section> */}

      {/* Enhanced Footer */}
      <footer className="relative py-12 px-6 border-t border-[#41B5FF]/30 glassy-header">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-white/80 text-sm font-medium">
              © 2025 Ownly • Built on Story Protocol
            </p>
            <div className="flex items-center gap-6">
              {[
                { icon: Github, label: "GitHub" },
                { icon: Twitter, label: "X" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className="text-white/60 hover:text-[#99F3FB] transition-colors"
                  whileHover={{ scale: 1.2 }}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleWalletConnect}
        onNavigate={onNavigate}
        onDisconnect={() => {}}
      />
    </div>
  );
}
