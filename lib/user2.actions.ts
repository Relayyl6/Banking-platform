'use server'

import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";
import { PlaidClient } from "./plaid";
import { encryptId, parseStringify } from "./utils";
import { addFundingSource } from "./dwolla.actions";
import { adminDb } from "@/config/firebaseAdmin";

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

    await adminDb.collection("user").doc(data.userId).collection("banks").add(data);
    
    console.log("Bank account created with ID:", bankId);

    const bankAccount = {
      id: bankId,
      ...data
    };

    return parseStringify(bankAccount);
  } catch (error) {
    console.error("An error occured", error)
    throw new Error("Unable to save bank account. Please try again.");
  }
}