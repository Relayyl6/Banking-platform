"use server";

import { parseStringify } from "./utils";

// import { ID, Query } from "node-appwrite";
// import { createAdminClient } from "../appwrite";
// import { parseStringify } from "../utils";
import { adminDb } from "@/config/firebaseAdmin";

const TRANSACTION_COLLECTION_ID = process.env.FIREBASE_TRANSACTION_COLLECTION_ID || 'transactions';

export const createTransaction = async (transaction: CreateTransactionProps) => {
  try {
    const newTransactionRef = adminDb.collection(TRANSACTION_COLLECTION_ID!).doc(); 

    // 2. Set the data to that specific document
    await newTransactionRef.set({
      channel: 'online',
      category: 'Transfer',
      ...transaction
    });

    // You can access the newly generated ID via newTransactionRef.id
    const newTransaction = {
    id: newTransactionRef.id,
    channel: 'online',
    category: 'Transfer',
    ...transaction
  };

    return parseStringify(newTransaction);
  } catch (error) {
    console.log(error);
  }
}

export const getTransactionsByBankId = async ({bankId}: getTransactionsByBankIdProps) => {
  try {
    const senderSnapshot = await adminDb.collection(TRANSACTION_COLLECTION_ID!)
      .where('senderBankId', '==', bankId)
      .get();

    // Map through the snapshot to extract the ID and the document data
    const senderTransactions = senderSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // 2. Fetch receiver transactions
    const receiverSnapshot = await adminDb.collection(TRANSACTION_COLLECTION_ID!)
      .where('receiverBankId', '==', bankId)
      .get();

    // Map through the snapshot to extract the ID and the document data
    const receiverTransactions = receiverSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const transactions = {
      total: senderTransactions.length + receiverTransactions.length,
      documents: [
        ...senderTransactions, 
        ...receiverTransactions,
      ]
    };

    return parseStringify(transactions);
  } catch (error) {
    console.log(error);
  }
}