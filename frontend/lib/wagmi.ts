import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, arbitrum, base, sepolia } from "wagmi/chains";

// Story Testnet (Aeneid) configuration
const storyTestnet = {
  id: 1315,
  name: "Story Testnet",
  network: "story-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://aeneid.storyrpc.io"],
    },
    public: {
      http: ["https://aeneid.storyrpc.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Story Explorer",
      url: "https://explorer.aeneid.story.foundation",
    },
  },
  testnet: true,
} as const;

export const config = getDefaultConfig({
  appName: "Ownly",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "your-project-id-here",
  chains: [storyTestnet, mainnet, polygon, arbitrum, base, sepolia],
  ssr: true,
});
