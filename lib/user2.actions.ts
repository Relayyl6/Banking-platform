'use server'

import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";
import { PlaidClient } from "./plaid";
import { encryptId, parseStringify } from "./utils";
import { addFundingSource } from "./dwolla.actions";
import { adminDb } from "@/config/firebaseAdmin";
import { FieldValue } from 'firebase-admin/firestore';

export const createLinkToken = async (user: User) => {
  try {
    const tokenParams = {
      user: {
        client_user_id: String(user.uid)
      },
      client_name: `${user.firstName} ${user.lastName}`,
      products: ['auth', 'transactions', 'identity'] as Products[],
      country_codes: ['US'] as CountryCode[],
      language: 'en'
    }

    const response = await PlaidClient.linkTokenCreate(tokenParams);
    return { link_token: response.data.link_token };
  } catch (error: any) {
    console.error('Error creating link token:', error);
    console.error("PLAID ERROR DETAILS:", error.response?.data);
    return { error: 'Unable to create Plaid link token. Please try again.' } as const;
  }
}


// In your exchangePublicToken function
export const exchangePublicToken = async (
  { user, publicToken }: exchangePublicTokenProps
) => {
  try {
    console.log("[DEBUG] starting token exchange")
    
    // ✅ FIX: Fetch the FULL user from Firestore to get dwollaCustomerId
    const userDoc = await adminDb.collection("user").doc(user.uid).get();
    
    if (!userDoc.exists) {
      throw new Error("User document not found in Firestore");
    }
    
    const userData = userDoc.data();
    console.log("[DEBUG] Full user from Firestore:", {
      uid: userData?.uid,
      dwollaCustomerId: userData?.dwollaCustomerId,
      dwollaCustomerUrl: userData?.dwollaCustomerUrl,
      email: userData?.email,
    });
    
    // Use the Firestore user data instead
    const fullUser = {
      ...user,
      dwollaCustomerId: userData?.dwollaCustomerId,
      dwollaCustomerUrl: userData?.dwollaCustomerUrl,
    };
    
    // Now check if Dwolla customer exists
    if (!fullUser.dwollaCustomerId) {
      throw new Error("Dwolla customer ID not found. Please complete profile setup.");
    }
    
    console.log("[DEBUG] Using Dwolla customer ID:", fullUser.dwollaCustomerId);
    
    // Step 1: Exchange public token
    const result = await PlaidClient.itemPublicTokenExchange({
      public_token: publicToken
    })
    
    const accessToken = result.data.access_token;
    const itemId = result.data.item_id;
    console.log("[DEBUG] Access token obtained");

    // Step 2: Get account information
    const accountResponse = await PlaidClient.accountsGet({
      access_token: accessToken
    })
    
    const accountData = accountResponse.data.accounts[0];
    console.log("[DEBUG] Account:", {
      id: accountData.account_id,
      name: accountData.name,
      type: accountData.type
    });

    // Step 3: Create processor token
    console.log("[DEBUG] creating a processor for dwolla")
    const request: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum
    }

    const processorTokenResponse = await PlaidClient.processorTokenCreate(request)
    const processorToken = processorTokenResponse.data.processor_token;
    console.log("[DEBUG] Processor token obtained");

    // Step 4: Add Dwolla funding source using the Firestore user data
    console.log("[DEBUG] adding a dwolla funding source with customer ID:", fullUser.dwollaCustomerId)
    
    try {
      const fundingSourceUrl = await addFundingSource({
        dwollaCustomerId: fullUser.dwollaCustomerId,  // ✅ Now this is defined!
        processorToken,
        bankName: accountData.name
      })
      
      console.log("[DEBUG] Funding source URL:", fundingSourceUrl);

      if (!fundingSourceUrl) {
        throw new Error("Funding source URL is empty");
      }

      // Step 5: Create bank account record
      console.log("[DEBUG] creating a bank account")
      await createBankAccount({
        userId: fullUser.uid,
        bankId: itemId,
        accountId: accountData.account_id,
        accessToken,
        fundingSourceUrl,
        sharableId: encryptId(accountData.account_id)
      })

      console.log("[DEBUG] returning success message")
      return parseStringify({
        publicTokenMessage: "complete"
      })
    } catch (dwollaError: any) {
      console.error("[DEBUG] Dwolla error details:", {
        message: dwollaError?.message,
        status: dwollaError?.status,
        body: dwollaError?.body,
        response: dwollaError?.response?.data
      });
      throw dwollaError;
    }

  } catch (error) {
    console.error('[DEBUG] Error:', error);
    throw new Error('Unable to exchange Plaid public token. Please try again.');
  }
}

// 1. Add the helper function outside so it's ready to use
const generateAccountNumber = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

export const createBankAccount = async ({
  userId,
  bankId,
  accountId,
  accessToken,
  fundingSourceUrl,
  sharableId // This is the ugly string
}: createBankAccountProps) => {
  try {
    // 2. Generate the clean 10-digit account number for the user
    const newAccountNumber = generateAccountNumber();

    // 3. Add it to your data object
    const data = {
      userId,
      bankId,
      accountId,
      accessToken,
      fundingSourceUrl,
      sharableId,
      accountNumber: newAccountNumber, // Saves the 10 digits to Firebase
    };

    const docRef = await adminDb
      .collection("user")
      .doc(data.userId)
      .collection("banks")
      .add(data);

    // IMPORTANT: Update the document with its own ID for easier querying
    await docRef.update({
      uid: docRef.id,
      createdAt: FieldValue.serverTimestamp()
    });

    const bankAccount = {
      id: bankId,
      docId: docRef.id,  // Store the Firestore document ID
      ...data
    };

    return parseStringify(bankAccount);
  } catch (error) {
    console.error("[createBankAccount] Error:", error);
    throw new Error("Unable to save bank account. Please try again.");
  }
};

export const getBanks = async ({userId}: getBanksProps) => {
  try {
    if (!userId) throw new Error("userId is required");
    
    const banksSnapshot = await adminDb
      .collection("user")
      .doc(userId)
      .collection("banks")
      .get();

    const banks = banksSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));

    return parseStringify(banks);
   } catch (error) {
    console.error(error)
  }
}

export const getBank = async ({ documentId }: getBankProps) => {
  try {
    //* Query directly on the `uid` field (each bank doc stores uid === its own doc id)
    //* instead of loading EVERY bank in the database into memory and .find()-ing it.
    const bankSnapshot = await adminDb
      .collectionGroup("banks")
      .where("uid", "==", documentId)
      .limit(1)
      .get();

    if (bankSnapshot.empty) {
      console.log("[getBank] No bank found with document ID:", documentId);
      return null;
    }

    const matchingDoc = bankSnapshot.docs[0];

    const bank = {
      uid: matchingDoc.id,
      ...matchingDoc.data()
    };

    return parseStringify(bank);
  } catch (error) {
    console.error(error);
  }
};

export const getBankByAccountId = async ({ accountId }: getBankByAccountIdProps) => {
  try {
    // This tells Firestore: ONLY bring back the document that matches this exact ID
    const bankSnapshot = await adminDb
      .collectionGroup("banks")
      .where('accountId', '==', accountId)
      .limit(1) //* accountId is unique — stop after the first match
      .get();

    // If the snapshot is empty, the bank doesn't exist
    if (bankSnapshot.empty) {
      return null;
    }

    // Since IDs are unique, we know the first document is our target
    const matchingDoc = bankSnapshot.docs[0];

    const bank = {
      uid: matchingDoc.id,
      ...matchingDoc.data()
    };

    return parseStringify(bank);
    
  } catch (error) {
    console.error("[getBank] Error fetching bank:", error);
    return null;
  }
};

export const convertSharableId = async (input: string): Promise<string | null> => {
  try {
    if (!input) {
      return null;
    }

    // Clean up any accidental spaces the user typed
    const cleanInput = input.trim();

    // Check if it is exactly a 10-digit number
    const isTenDigits = /^\d{10}$/.test(cleanInput);

    if (isTenDigits) {
      // SCENARIO 1: User typed the clean 10-digit account number.
      // We look up the document to find their real, ugly accountId.
      const snapshot = await adminDb
        .collectionGroup("banks")
        .where("accountNumber", "==", cleanInput)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      // Return the real Plaid/Dwolla accountId stored in the database
      return snapshot.docs[0].data().accountId;

    } else {
      // SCENARIO 2: Fallback! The user pasted an old Base64 ugly string.
      try {
        return atob(cleanInput);
      } catch (e) {
        // If atob fails, it means it's already decoded. Just return it.
        return cleanInput;
      }
    }
  } catch (error) {
    console.error("[convertSharableId] CRITICAL ERROR resolving ID:", error);
    return null;
  }
};

export const updateBankBalance = async ({
  userId,
  documentId,
  newBalance,
}: UpdateBankBalanceProps) => {
  try {
    // Direct path to the exact document. No searching needed! Fast and efficient.
    const bankDocRef = adminDb
      .collection("user")
      .doc(userId)
      .collection("banks")
      .doc(documentId);

    // Update the available balance
    await bankDocRef.update({
      availableBalance: newBalance
    });

    console.log("[updateBankBalance] SUCCESS: Balance updated successfully.");
    
    return parseStringify({ success: true, newBalance });
  } catch (error) {
    console.error("[updateBankBalance] CRITICAL ERROR updating balance:", error);
    return null;
  }
};