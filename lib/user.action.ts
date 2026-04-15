"use client"

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
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
import { revalidatePath } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";
import { adminDb } from "@/config/firebaseAdmin";

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

        await setDoc(doc(db, "user", newUserAccount.uid), {
            email,
            ...profileData,
            createdAt: new Date(),
        });

        const dwollaCustomerUrl = await createDwollaCustomer({
          firstName: profileData.firstName as string,
          lastName: profileData.lastName as string,
          email,
          type: "personal",
          address1: profileData.address as string,
          city: profileData.city as string, 
          state: profileData.state as string,
          postalCode: profileData.postalCode as string,
          dateOfBirth: profileData.dateofbirth as string,
          ssn: profileData.SSN as string,
        })

        if (!dwollaCustomerUrl) throw new Error("Error creating Dwolla customer")

        const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl)

        const newUserBankRef = await adminDb.collection("dwollaUser").add({
          ...profileData,
          email,
          userId: newUserAccount.uid,
          dwollaCustomerId,
          dwollaCustomerUrl,
          createdAt: new Date(),
        });


        const idToken = await newUserAccount.getIdToken(true);

        console.log("[SignUp] Success: User created and idToken obtained");

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

export const createLinkToken = async (user: User) => {
  try {
    const tokenParams = {
      user: {
        client_user_id: user.$id
      },
      client_name: user.email,
      products: ['auth', 'transactions', 'identity'] as Products[],
      country_codes: ['US'] as CountryCode[],
      language: 'en'
    }

    const response = await PlaidClient.linkTokenCreate(tokenParams);
    return parseStringify({ linkToken: response.data.link_token });
  } catch (error) {
    console.error('Error creating link token:', error);
    return { error: 'Unable to create Plaid link token. Please try again.' } as const;
  }
}

export const SignInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    const idToken = await userCredential.user.getIdToken(true);

    const user = userCredential.user;

    if (userCredential.operationType === "signIn") {
      const userRef = doc(db, "user", user.uid);
      await setDoc(userRef, {
        email: user.email,
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ")[1] || "",
        createdAt: new Date(),
        // Note: Google OAuth doesn't provide address, SSN, etc. for Dwolla
        // You may need to prompt the user to complete their profile separately
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

export const createBankAccount = async ({
  userId,
  bankId,
  accountId,
  accessToken,
  fundingSourceUrl,
  sharableId
}: createBankAccountProps) => {
  try {
    const data = {
      userId,
      bankId,
      accountId,
      accessToken,
      fundingSourceUrl,
      sharableId
    };

    const docRef = await adminDb.collection("bankAccounts").add(data);

    console.log("Bank account created with ID:", docRef.id);

    const bankAccount = {
      id: docRef.id,
      ...data
    };

    return bankAccount;
  } catch (error) {
    console.error("An error occured", error)
    throw new Error("Unable to save bank account. Please try again.");
  }
}

const exchangePublicToken = async (
  { user, publicToken }: exchangePublicTokenProps
) => {
  try {
    const result = await PlaidClient.itemPublicTokenExchange({
      public_token: publicToken
    })
    
    const accessToken = result.data.access_token;
    const itemId = result.data.item_id;

    // get account information from plaid using the access token
    const accountResponse = await PlaidClient.accountsGet({
      access_token: accessToken
    })
    
    const accountData = accountResponse.data.accounts[0];

    // create a processor for Dwolla using the same access token and account ID
    const request: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum
    }

    const processorTokenResponse = await PlaidClient.processorTokenCreate(request)

    const processorToken = processorTokenResponse.data.processor_token;


    // create a funding source for the account using th eDWolla customer ID, Processor Token, and bank name
    const fundingSourceUrl = await addFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name
    })

    // if the funding source url is not created, throw a safe error
    if (!fundingSourceUrl) throw new Error("Funding source creation failed. Please try again.");

    // Create a bank account using the userId, itemID, account ID, accessToken, fundingSourceUrl, and shareableId
    await createBankAccount({
      userId: user.$id,
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceUrl,
      sharableId: encryptId(accountData.account_id)
    })

    // revalidate path to reflect changes 
    revalidatePath("/")

    return parseStringify({
      publicTokenMessage: "complete"
    })

  } catch (error) {
    console.error('Error exchanging public token:', error);
    throw new Error('Unable to exchange Plaid public token. Please try again.');
  }
}