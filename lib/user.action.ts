"use client"

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"
import { doc, setDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/config/env";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "./utils";
import { clearSession } from "./auth";
import { FirebaseError } from "firebase/app";
import { PlaidClient } from "./plaid";
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

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

    const newUserAccount = userCredentials.user;

    // Step 1: Create user in Firestore first
    await setDoc(doc(db, "user", newUserAccount.uid), {
      email,
      ...profileData,
      createdAt: new Date(),
    });

    console.log("[SignUp] User document created in Firestore");

    // Step 2: Create Dwolla customer
    let dwollaCustomerUrl;
    let dwollaCustomerId;
    
    try {
      console.log("[SignUp] Creating Dwolla customer...");
      
      dwollaCustomerUrl = await createDwollaCustomer({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        address1: userData.address,
        city: userData.city,
        state: userData.state.toUpperCase(),
        postalCode: userData.postalCode,
        dateOfBirth: userData.dateofbirth,
        ssn: userData.SSN,
        // DO NOT include type: "personal"
      });

      if (!dwollaCustomerUrl) {
        throw new Error("No Dwolla customer URL returned");
      }

      console.log("[SignUp] Dwolla customer URL:", dwollaCustomerUrl);
      
      dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);
      console.log("[SignUp] Extracted Dwolla customer ID:", dwollaCustomerId);

    } catch (dwollaError: any) {
      console.error("[SignUp] Failed to create Dwolla customer:", dwollaError.message);
      
      // Return error to user
      return { error: `Failed to create payment account: ${dwollaError.message}` };
    }

    // Step 3: Update Firestore with Dwolla info
    await updateDoc(doc(db, "user", newUserAccount.uid), {
      dwollaCustomerId,
      dwollaCustomerUrl,
      updatedAt: new Date(),
    });

    console.log("[SignUp] Firestore updated with Dwolla customer info");

    // Step 4: Get ID token
    const idToken = await newUserAccount.getIdToken(true);

    console.log("[SignUp] Success: User fully created with banking");

    return {
      user: parseStringify(newUserAccount),
      idToken
    };
    
  } catch (error: unknown) {
    console.error("[SignUp] Error:", error);

    if (error instanceof FirebaseError) {
      console.log("[SignUp] Firebase error code:", error.code);
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

    if (error instanceof Error) {
      return { error: error.message };
    }

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

export const SignInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    const idToken = await userCredential.user.getIdToken(true);

    const user = userCredential.user;

    console.log("Available user data:", {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      phoneNumber: user.phoneNumber,
      providerData: user.providerData
    });

    if (userCredential.operationType === "signIn") {
      const userRef = doc(db, "user", user.uid);
      await setDoc(userRef, {
        email: user.email,
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ")[1] || "",
        createdAt: new Date(),
        // Note: Google OAuth doesn't provide address, SSN, etc. for Dwolla
        // We need to prompt the user to complete their profile separately
      }, { merge: true });
    }

    return {
      user: parseStringify(userCredential.user),
      idToken,
    }
  } catch (error) {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case "auth/popup-closed-by-user":
          return { error: "Sign-in popup was closed before completing the sign-in process." };
        case "auth/cancelled-popup-request":
          return { error: "Only one sign-in popup can be opened at a time." };
        case "auth/popup-blocked":
          return { error: "Sign-in popup was blocked by the browser. Please allow popups and try again." };
        case "auth/network-request-failed":
          return { error: "Network error occurred during sign-in. Please check your connection and try again." };
        default:
          return { error: "An unexpected error occurred during Google sign-in. Please try again." };
      }
    }
    return { error: "An unknown error occurred during Google sign-in. Please try again." };
  }
}