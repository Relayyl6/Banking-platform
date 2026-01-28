"use server";

import { adminAuth, adminDb } from "@/config/firebaseAdmin";
import { cookies } from "next/headers";
import { signOut } from "firebase/auth";
// import { adminAuth } from "@/lib/firebaseAdmin";

export async function createSession(idToken: string) {
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn
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

export const clearSession = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export const logout = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function getServerUser() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value;
  if (!session) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return decoded; // uid, email, claims
  } catch {
    return null;
  }
}

export const getUserProfile = async (uid: string) => {
//   const snap = await getDoc(doc(db, "user", uid))
  const snap = await adminDb.collection("user").doc(uid).get()

  if (!snap.exists) return null
  return snap.data()
}
