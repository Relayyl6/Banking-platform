// lib/dwolla/client.ts
import { Client } from 'dwolla-v2';

// Create and export a singleton Dwolla client
let dwollaClient: Client | null = null;

export const getDwollaClient = (): Client => {
  if (dwollaClient) {
    return dwollaClient;
  }

  if (!process.env.DWOLLA_KEY || !process.env.DWOLLA_SECRET) {
    throw new Error('Missing Dwolla environment variables: DWOLLA_CLIENT_ID or DWOLLA_CLIENT_SECRET');
  }

  const environment = process.env.DWOLLA_ENVIRONMENT || 'sandbox';
  
  dwollaClient = new Client({
    key: process.env.DWOLLA_KEY,
    secret: process.env.DWOLLA_SECRET,
    environment: environment as 'sandbox' | 'production',
  });

  return dwollaClient;
};

// Helper to get application token
export const getDwollaAuthToken = async (): Promise<string> => {
  const client = getDwollaClient();
  const appToken = await client.auth.client();
  return appToken.access_token;
};

// Helper to get master account
export const getDwollaMasterAccount = async (): Promise<any> => {
  const client = getDwollaClient();
  const masterAccount = await client.get('/');
  return masterAccount.body;
};