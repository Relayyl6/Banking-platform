"use server";
import "server-only";

import { adminAuth } from "@/config/firebaseAdmin";
import { cookies } from "next/headers";

export async function createSessionFromToken(idToken: string) {
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn,
  });

  const cookieStore = await cookies()

  cookieStore.set("session", sessionCookie, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: expiresIn / 1000,
  });
}
