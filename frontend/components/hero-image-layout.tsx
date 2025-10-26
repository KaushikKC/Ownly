"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { TrendingUp, CheckCircle2 } from "lucide-react";

export default function HeroImageLayout() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center"
    >
      {/* "Increase in Engagement" Badge - Top Left */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute top-4 left-4 md:top-8 md:left-8 lg:top-26 lg:left-0 z-30"
      >
        <div className="flex items-center gap-2 bg-[#FFD15C] text-black px-4 py-2.5 md:px-6 md:py-3 rounded-full font-medium shadow-lg text-sm md:text-base">
          <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
          <span>Future of Ownership</span>
        </div>
      </motion.div>

      {/* Main Image Container - Center with blue background */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="absolute top-[15%] md:top-[10%] left-[15%] md:left-[20%] w-[280px] h-[380px] md:w-[320px] md:h-[440px] lg:w-[360px] lg:h-[530px] bg-[#6BA4D8] rounded-[40px] shadow-2xl overflow-hidden z-20"
      >
        <Image
          src="/insta-reel1.jpg"
          alt="Two women embracing"
          width={360}
          height={480}
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Chat Bubble 1  */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-[35%] md:bottom-[40%] left-4 md:left-8 lg:left-12 z-40"
      >
        <div className="flex items-center gap-2.5 bg-white px-4 py-2.5 md:px-5 md:py-3 rounded-full shadow-lg">
          <div className="w-5 h-5 bg-[#4ADE80] rounded-full flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </div>
          <span className="text-gray-800 font-medium text-sm md:text-base">
            Verify your creativity
          </span>
        </div>
      </motion.div>

      {/* Chat Bubble 2  */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-[25%] md:bottom-[23%] left-8 md:left-16 lg:left-20 z-40"
      >
        <div className="flex items-center gap-2.5 bg-white px-4 py-2.5 md:px-5 md:py-3 rounded-full shadow-lg">
          <div className="w-5 h-5 bg-[#4ADE80] rounded-full flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </div>
          <span className="text-gray-800 font-medium text-sm md:text-base">
            Prove Your Ownership
          </span>
        </div>
      </motion.div>

      {/* Chat Bubble 3  */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-[15%] md:bottom-[35%] left-20 md:left-26 lg:left-105 z-40"
      >
        <div className="flex items-center gap-2.5 bg-white px-4 py-2.5 md:px-5 md:py-3 rounded-full shadow-lg">
          <div className="w-5 h-5 bg-[#4ADE80] rounded-full flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </div>
          <span className="text-gray-800 font-medium text-sm md:text-base">
            Secure IP
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
