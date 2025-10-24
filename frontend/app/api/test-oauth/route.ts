import { NextResponse } from "next/server";

export async function GET() {
  const config = {
    googleClientId: process.env.GOOGLE_CLIENT_ID ? "Set" : "Missing",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "Set" : "Missing",
    nextAuthUrl: process.env.NEXTAUTH_URL || "Missing",
    nextAuthSecret: process.env.NEXTAUTH_SECRET ? "Set" : "Missing",
    walletConnectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
      ? "Set"
      : "Missing",
  };

  return NextResponse.json({
    message: "OAuth Configuration Status",
    config,
    recommendations: [
      config.googleClientId === "Missing" &&
        "Set GOOGLE_CLIENT_ID in .env.local",
      config.googleClientSecret === "Missing" &&
        "Set GOOGLE_CLIENT_SECRET in .env.local",
      config.nextAuthUrl === "Missing" && "Set NEXTAUTH_URL in .env.local",
      config.nextAuthSecret === "Missing" &&
        "Set NEXTAUTH_SECRET in .env.local",
      config.walletConnectId === "Missing" &&
        "Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local",
    ].filter(Boolean),
  });
}
