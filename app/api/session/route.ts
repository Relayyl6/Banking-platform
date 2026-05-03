import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/config/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      console.log("✅ Token verified for uid:", decoded.uid);
    } catch (verifyErr) {
      console.error("❌ verifyIdToken failed:", verifyErr);
      return NextResponse.json({ error: "Token verify failed" }, { status: 401 });
    }

    console.log("🔍 Received idToken:", idToken ? "Present" : "Missing");

    if (!idToken) return NextResponse.json({ error: "Missing ID token" }, { status: 400 });

    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    console.log("🔄 Creating session cookie...");
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    console.log("✅ Session cookie created successfully");

    const response = NextResponse.json({ success: true });
    response.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: expiresIn / 1000,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("❌ Error creating session cookie:", err);
    return NextResponse.json({ error: "Invalid ID token" }, { status: 401 });
  }
}

// For a URL like /api/session?type=admin, you access them like this:
// const { searchParams } = new URL(req.url);
// const type = searchParams.get('type');