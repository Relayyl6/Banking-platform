"use server";

import {
  CountryCode,
} from "plaid"; //* removed Transfer* imports — only used by the deleted hardcoded createTransfer

// import { PlaidClient } from "../plaid.config";
import { parseStringify } from "../utils";

// import { getTransactionsByBankId } from "../transaction.actions";
// import { getBanks, getBank } from "./user2.actions";
import { PlaidClient } from "../plaid";
import { getBanks, getBank } from "../user2.actions";
import { getTransactionsByBankId } from "../transaction.actions";

// Get multiple bank accounts
export const getAccounts = async ({ userId }: getAccountsProps) => {
  try {
    // get banks from db
    const banks = await getBanks({ userId });

    const accountsRaw = await Promise.all(
      banks?.map(async (bank: Bank) => {
        try { //* one bad bank/institution no longer wipes out every account
          // get each account info from plaid
          const accountsResponse = await PlaidClient.accountsGet({
            access_token: bank.accessToken,
          });
          const accountData = accountsResponse.data.accounts[0];

          // get institution info from plaid
          const institution = await getInstitution({
            institutionId: accountsResponse.data.item.institution_id!,
          });

          const account: Account = {
            id: accountData.account_id,
            availableBalance: (typeof bank.availableBalance === 'number' && !Number.isNaN(bank.availableBalance))
              ? bank.availableBalance
              : accountData.balances.available!,
            currentBalance: accountData.balances.current!,
            institutionId: institution?.institution_id, //* institution may be undefined on failure
            name: accountData.name,
            officialName: accountData.official_name as string,
            mask: accountData.mask!,
            type: accountData.type as string,
            subtype: accountData.subtype! as string,
            firebaseItemId: bank.uid,
            sharableId: bank.sharableId,
          };

          return account;
        } catch (bankError) { //* skip this bank instead of rejecting the whole Promise.all
          console.error(`Failed to load bank ${bank?.uid}:`, bankError);
          return null;
        }
      })
    );

    //* drop any banks that failed to load so the dashboard still renders the rest
    const accounts = accountsRaw.filter((account): account is Account => account !== null);

    const totalBanks = accounts.length;
    const totalCurrentBalance = accounts.reduce((total: number, account: Account) => {
      return total + account.availableBalance;
    }, 0);

    return parseStringify({ data: accounts, totalBanks, totalCurrentBalance });
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};

// Get one bank account
export const getAccount = async ({ firebaseItemId }: getAccountProps) => {
  try {
    if (!firebaseItemId) throw new Error("firebaseItemId is required");

    // get bank from db
    const bank = await getBank({ documentId: firebaseItemId });

    if (!bank) {
      throw new Error(`Bank not found for accountId: ${firebaseItemId}`);
    }

    // get account info from plaid
    const accountsResponse = await PlaidClient.accountsGet({
      access_token: bank.accessToken,
    });
    const accountData = accountsResponse.data.accounts[0];

    // get transfer transactions from firebase
    const transferTransactionsData = await getTransactionsByBankId({
      bankId: bank.uid,
    });

    const transferTransactions = transferTransactionsData.documents.map(
      (transferData: Transaction) => {
        
        // THE FIX: Bulletproof Date Parsing for Serialized Firebase Timestamps
        let formattedDate = new Date().toISOString(); // Safe fallback

        if (transferData.createdAt) {
          if (transferData.createdAt._seconds) {
            // Converts Firebase's serialized seconds back into a real JS Date string
            formattedDate = new Date(transferData.createdAt._seconds * 1000).toISOString();
          } else if (typeof transferData.createdAt === 'string') {
            formattedDate = transferData.createdAt;
          }
        }

        return {
          id: transferData.id,
          name: transferData.name || "Transfer",
          amount: transferData.amount || 0,
          date: formattedDate, // Now guaranteed to be a valid Date string!
          paymentChannel: transferData.paymentChannel || transferData.channel || "online",
          category: transferData.category || "Transfer",
          type: transferData.senderBankId === bank.uid ? "debit" : "credit",
        };
      }
    );

    // get institution info from plaid
    const institution = await getInstitution({
      institutionId: accountsResponse.data.item.institution_id!,
    });

    const transactions = await getTransactions({
      accessToken: bank?.accessToken,
    });

    const account = {
      id: accountData.account_id,
      availableBalance: accountData.balances.available!,
      currentBalance: accountData.balances.current!,
      institutionId: institution.institution_id,
      name: accountData.name,
      officialName: accountData.official_name,
      mask: accountData.mask!,
      type: accountData.type as string,
      subtype: accountData.subtype! as string,
      firebaseItemId: bank.uid,
    };

    // sort transactions by date such that the most recent transaction is first
    const allTransactions = [...transactions, ...transferTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return parseStringify({
      data: account,
      transactions: allTransactions,
    });
  } catch (error) {
    console.error("An error occurred while getting the account:", error);
  }
};

// Get bank info
export const getInstitution = async ({
  institutionId,
}: getInstitutionProps) => {
  try {
    const institutionResponse = await PlaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: ["US"] as CountryCode[],
    });

    const intitution = institutionResponse.data.institution;

    return parseStringify(intitution);
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};

// Get transactions
export const getTransactions = async ({
  accessToken,
}: getTransactionsProps) => {
  let hasMore = true;
  let cursor: string | undefined = undefined; //* track the sync cursor so each loop fetches the NEXT page
  let transactions: any = [];

  try {
    // Iterate through each page of new transaction updates for item
    while (hasMore) {
      const response = await PlaidClient.transactionsSync({
        access_token: accessToken,
        cursor, //* without this the API returns the same first page forever -> infinite loop
      });

      const data = response.data;

      const pageTransactions = data.added.map((transaction) => ({
        id: transaction.transaction_id,
        name: transaction.name,
        paymentChannel: transaction.payment_channel,
        type: transaction.payment_channel,
        accountId: transaction.account_id,
        amount: transaction.amount,
        pending: transaction.pending,
        category: transaction.category ? transaction.category[0] : "",
        date: transaction.date,
        image: transaction.logo_url,
      }));

      transactions = [...transactions, ...pageTransactions]; //* accumulate pages instead of overwriting
      cursor = data.next_cursor; //* advance to the next page
      hasMore = data.has_more;
    }

    return parseStringify(transactions);
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};

//* Removed the hardcoded sandbox createTransfer that ignored its arguments and always
//* moved $10 from a fixed account. The real, parameterized transfer lives in
//* lib/dwolla.actions.ts (createTransfer({ sourceFundingSourceUrl, destinationFundingSourceUrl, amount }))
//* which is what PaymentTransferForm already imports.

