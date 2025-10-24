import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  return NextResponse.json({
    message: "NextAuth Redirect URI Debug",
    baseUrl,
    redirectUri,
    instructions: [
      "Copy this exact redirect URI:",
      redirectUri,
      "",
      "Go to Google Cloud Console:",
      "1. APIs & Services → Credentials",
      "2. Click your OAuth 2.0 Client ID",
      "3. Add this URI to 'Authorized redirect URIs'",
      "4. Save and wait 1-2 minutes",
      "5. Try Google login again",
    ],
  });
}
