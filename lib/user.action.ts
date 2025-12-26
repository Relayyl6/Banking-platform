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

        return user;

    } catch (error: any) {
        console.error("[SignUp] ❌ Error occurred");

        // Firebase-specific error info
        console.error("[SignUp] Error message:", error?.message);
        console.error("[SignUp] Error code:", error?.code);
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
}