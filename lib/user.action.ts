"use client"

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/config/env";
import { parseStringify } from "./utils";

export const SignIn = async (data: { email: string, password: string     }) => {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            data.email,
            data.password
        )

        const idToken = await userCredential.user.getIdToken();

        return {
            user: parseStringify(userCredential.user),
            idToken,
        };
    } catch (error) {
        console.error("Error signing in:", error);
        throw error
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

        return {
            user: parseStringify(user),
            idToken
        };
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

export const logOutClient = async () => {
  await signOut(auth)
}
