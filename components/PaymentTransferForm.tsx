"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { createTransfer } from "@/lib/dwolla.actions";
import { getBank, getBankByAccountId, convertSharableId, updateBankBalance } from "@/lib/user2.actions"; 
import { createTransaction } from "@/lib/transaction.actions";

import { BankDropdown } from "./BankDropdown";
import { Button } from "./ui/button";
import { Form } from "./ui/form";
import PaymentForm from "./PaymentForm";

const formSchema = z.object({
  email: z.email("Invalid email address"),
  name: z.string().min(4, "Transfer note is too short"),
  //* must be a positive number, not just any non-empty string, or Number(amount) becomes NaN downstream
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => Number(v) > 0, "Enter a valid amount greater than 0"),
  senderBank: z.string().min(4, "Please select a valid bank account"),
  sharableId: z.string().min(8, "Please enter a valid Account Number"), 
});

const PaymentTransferForm = ({ accounts }: PaymentTransferFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      amount: "",
      senderBank: "",
      sharableId: "",
    },
  });

  const submit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      // FIX 3: Convert the 10-digit input into the real database accountId
      const receiverAccountId = await convertSharableId(data.sharableId);

      // FIX 4: If the 10-digit number doesn't exist, show a UI error and stop!
      if (!receiverAccountId) {
        form.setError("sharableId", { 
          type: "manual", 
          message: "Account not found. Please double-check the 10-digit account number." 
        });
        setIsLoading(false);
        return;
      }

      const receiverBank = await getBankByAccountId({
        accountId: receiverAccountId,
      });
      
      const senderBank = await getBank({ documentId: data.senderBank });

      // Extra safeguard: Ensure both banks were successfully fetched
      if (!receiverBank || !senderBank) {
         form.setError("sharableId", { 
           type: "manual", 
           message: "Unable to retrieve bank details for this transfer." 
         });
         setIsLoading(false);
         return;
      }

      const transferParams = {
        sourceFundingSourceUrl: senderBank.fundingSourceUrl,
        destinationFundingSourceUrl: receiverBank.fundingSourceUrl,
        amount: data.amount,
      };
      
      // create transfer
      const transfer = await createTransfer(transferParams);

      // create transfer transaction
      if (transfer) {
        const transaction = {
          name: data.name,
          amount: data.amount,
          senderId: senderBank.userId, //* userId is already the user id string, not an object — .uid was always undefined
          senderBankId: senderBank.uid,
          receiverId: receiverBank.userId, //* same fix for the receiver side
          receiverBankId: receiverBank.uid,
          email: data.email,
        };

        const newTransaction = await createTransaction(transaction);

        if (newTransaction) {
          const activeAccount = accounts.find(
            (acc) => acc.firebaseItemId === data.senderBank
          );

          const startingBalance = activeAccount?.availableBalance || 0;
          const transferAmount = Number(data.amount); //* parse once, reuse for both balances

          //* Debit the sender
          const updatedSenderBalance = startingBalance - transferAmount;

          await updateBankBalance({
            userId: senderBank.userId,
            documentId: senderBank.uid,
            newBalance: updatedSenderBalance
          });

          //* Credit the receiver — but ONLY if their doc already has a local
          //* availableBalance override. getAccounts() prefers the doc's
          //* availableBalance over Plaid's real balance whenever it is a number, so
          //* writing here when no override exists would clobber the receiver's real
          //* Plaid balance (e.g. overwrite a real $5000 with just the $10 transfer).
          //* When there is no override, Plaid stays the source of truth and already
          //* reflects the real funds movement.
          if (typeof receiverBank.availableBalance === 'number') {
            await updateBankBalance({
              userId: receiverBank.userId,
              documentId: receiverBank.uid,
              newBalance: receiverBank.availableBalance + transferAmount
            });
          }

          form.reset();
          router.refresh();
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Submitting create transfer request failed: ", error);
    }

    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="flex flex-col">
        <PaymentForm
            control={form.control}
            title="Select Source Bank"
            description="Select the bank account you want to transfer funds from"
            name="senderBank"
        >
            <BankDropdown
                accounts={accounts}
                setValue={form.setValue}
                otherStyles="w-full!"
            />
        </PaymentForm>

        <PaymentForm
            control={form.control}
            title="Transfer Note (Optional)"
            placeholder="Write a short note here"
            description="Please provide any additional information or instructions related to the transfer"
            name="name"
        />

        <div className="flex flex-col gap-1 border-t border-gray-200 pb-5! pt-6!">
          <h2 className="text-18 font-semibold text-gray-900">
            Bank account details
          </h2>
          <p className="text-16 font-normal text-gray-600">
            Enter the bank account details of the recipient
          </p>
        </div>

        <PaymentForm
            control={form.control}
            title="Recipient&apos;s Email Address"
            placeholder="ex: johndoe@gmail.com"
            name="email"
        />

        <PaymentForm
            control={form.control}
            title="Receiver's Account Number"
            placeholder="Enter the 10-digit account number"
            name="sharableId"
        />

        <PaymentForm
            control={form.control}
            title="Amount"
            placeholder="ex: 5.00"
            name="amount"
        />

        <div className="mt-5 flex w-full max-w-[850px] gap-3 border-gray-200 py-5!">
          <Button type="submit" className="text-14 w-full bg-bank-gradient font-semibold text-white shadow-form !important">
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> &nbsp; Sending...
              </>
            ) : (
              "Transfer Funds"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PaymentTransferForm;