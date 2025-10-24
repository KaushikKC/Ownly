"use client";

import { useSession } from "next-auth/react";
import { useUser } from "@/lib/user-context";

export function AuthDebug() {
  const { data: session, status } = useSession();
  const { user, walletAddress, isConnected } = useUser();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Session Status: {status}</div>
        <div>User: {user ? user.email : "None"}</div>
        <div>
          Wallet: {walletAddress ? `${walletAddress.slice(0, 6)}...` : "None"}
        </div>
        <div>Connected: {isConnected ? "Yes" : "No"}</div>
        <div>
          Google Client ID: {process.env.GOOGLE_CLIENT_ID ? "Set" : "Missing"}
        </div>
        <div>
          WalletConnect ID:{" "}
          {process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? "Set" : "Missing"}
        </div>
        <div>
          Redirect URI:{" "}
          {`${
            process.env.NEXTAUTH_URL || "http://localhost:3001"
          }/api/auth/callback/google`}
        </div>
      </div>
    </div>
  );
}
