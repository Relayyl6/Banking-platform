"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue, // 1. ADDED: Required import for Shadcn Select
} from "@/components/ui/select";
import { formUrlQuery, formatAmount } from "@/lib/utils";

export const BankDropdown = ({
  accounts = [],
  setValue,
  otherStyles,
}: BankDropdownProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selected, setSelected] = useState(accounts[0]); // Fixed typo: setSeclected -> setSelected

  const handleBankChange = (id: string) => {
    const account = accounts.find((account) => account.firebaseItemId === id);
    if (!account) return;

    setSelected(account);
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "id",
      value: id,
    });
    router.push(newUrl, { scroll: false });

    if (setValue) {
      setValue("senderBank", id, { shouldValidate: true });
    }
  };

  if (!selected) return null;

  return (
    <Select
      value={selected.firebaseItemId} 
      onValueChange={handleBankChange}
    >
      <SelectTrigger
        className={`flex w-full items-center justify-between p-3! gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-16 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${otherStyles}`}
      >
        <div className="flex w-full items-center gap-3 ">
          <Image
            src="icons/credit-card.svg"
            width={20}
            height={20}
            alt="account"
          />
          <SelectValue placeholder="Select a bank">
            <p className="line-clamp-1 w-full text-left">{selected.name}</p>
          </SelectValue>
        </div>
      </SelectTrigger>
      
      <SelectContent
        className="w-full bg-white"
        align="end"
      >
        <SelectGroup>
          <SelectLabel className="p-2! font-normal text-gray-500">
            Select a bank to display
          </SelectLabel>
          {accounts.map((account: Account) => (
            <SelectItem
              key={account.id}
              value={account.firebaseItemId}
              className="cursor-pointer border-t p-2!"
            >
              <div className="flex flex-col">
                <p className="text-16 font-medium">{account.name}</p>
                <p className="text-14 font-medium text-blue-600">
                  {formatAmount(account.availableBalance)}
                </p>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};