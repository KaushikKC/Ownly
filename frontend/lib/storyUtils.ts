import { http } from "viem";
import { Account, privateKeyToAccount, Address } from "viem/accounts";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";

// Check environment variables
if (!process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY) {
  throw new Error("NEXT_PUBLIC_WALLET_PRIVATE_KEY is required");
}

if (!process.env.NEXT_PUBLIC_STORY_PROTOCOL_RPC_URL) {
  throw new Error("NEXT_PUBLIC_STORY_PROTOCOL_RPC_URL is required");
}

const privateKey: Address = `0x${process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY}`;
const account: Account = privateKeyToAccount(privateKey);

const config: StoryConfig = {
  account: account, // the account object from above
  transport: http(process.env.NEXT_PUBLIC_STORY_PROTOCOL_RPC_URL),
  chainId: "aeneid",
};

export const client = StoryClient.newClient(config);
