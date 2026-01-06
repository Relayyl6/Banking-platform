"use client"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"
// import { auth } from "@/lib/firebase"
import { doc, setDoc, getDoc } from "firebase/firestore"
// import { db } from "@/lib/firebase"
import { auth, db } from "@/config/env";
import { createSession } from "@/components/SetCookie";
import { parseStringify } from "./utils";
import { cookies } from "next/headers";
import { adminAuth } from "@/config/firebaseAdmin";
// import { adminAuth } from "@/lib/firebaseAdmin";


export const SignIn = async (data: { email: string, password: string     }) => {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            data.email,
            data.password
        )

        return userCredential.user
    } catch (error) {
        console.error("Error signing in:", error);
    }
}

export const SignUp = async (userData: SignUpParams) => {

    const { email, password, ...profileData } = userData;

    try {
        console.log("[SignUp] Creating user with email & password...");

        const userCredentials = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredentials.user;

        await setDoc(doc(db, "user", user.uid), {
            email,
            ...profileData,
            createdAt: new Date(),
        });

        const idToken = await user.getIdToken();

        await createSession(idToken)

        return parseStringify(user);

    } catch (error: unknown) {
        console.error("[SignUp] ❌ Unknown Error occurred", error);

        let message;
        if (error instanceof Error) {
            message = error?.message
        }

        // Firebase-specific error info
        console.error("[SignUp] Error message:", message);
        console.error("[SignUp] Full error object:", error);

        throw error; // IMPORTANT: rethrow so caller knows it failed
    }
};


export const getUserProfile = async (uid: string) => {
  const snap = await getDoc(doc(db, "user", uid))

  if (!snap.exists()) return null
  return snap.data()
}

export const logout = async () => {
  await signOut(auth)
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
