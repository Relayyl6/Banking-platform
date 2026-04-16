'use server'

import { CountryCode, Products } from "plaid";
import { PlaidClient } from "./plaid";
import { parseStringify } from "./utils";

export const createLinkToken = async (user: User) => {
  try {
    const tokenParams = {
      user: {
        client_user_id: String(user.$id)
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