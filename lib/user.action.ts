"use client"

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/config/env";
import { parseStringify } from "./utils";
import { clearSession } from "./auth";
import { FirebaseError } from "firebase/app";

export const SignIn = async (data: { email: string, password: string }) => {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            data.email,
            data.password
        )

        const idToken = await userCredential.user.getIdToken(true);

        return {
            user: parseStringify(userCredential.user),
            idToken,
        };
    } catch (error) {
        if (error instanceof FirebaseError) {
          switch (error.code) {
            case "auth/user-not-found":
              return { error: "No account found with this email." };
            case "auth/wrong-password":
              return { error: "Incorrect password." };
            case "auth/invalid-email":
              return { error: "The email address is invalid." };
            default:
              return { error: "An unexpected error occurred. Please try again." };
          }
        }

        return { error: "An unknown error occurred." };
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

        const idToken = await user.getIdToken(true);

        return {
            user: parseStringify(user),
            idToken
        };
    } catch (error: unknown) {
        if (error instanceof FirebaseError) {
          switch (error.code) {
            case "auth/email-already-in-use":
              return { error: "This email is already registered. Please sign in." };
            case "auth/invalid-email":
              return { error: "The email address is invalid." };
            case "auth/weak-password":
              return { error: "Password should be at least 6 characters." };
            default:
              return { error: "An unexpected error occurred. Please try again." };
          }
        }

        // fallback for non-Firebase errors
        return { error: "An unknown error occurred." };
    }
};

export const logOutClient = async () => {
  try {
    await signOut(auth)
    await clearSession()
    return true
  } catch (error) {
    console.error("Error signing out:", error);
    return false   
  }
}
