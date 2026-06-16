"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectLabel
} from "@/components/ui/select";
import { formUrlQuery, formatAmount } from "@/lib/utils";

export const BankDropUp= ({
  accounts = [],
  setValue,
  otherStyles,
  defaultValue,
}: BankDropdownProps & { defaultValue?: string }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Calculate the selected account during rendering (no useEffect needed!)
  const getSelectedAccount = () => {
    if (!accounts.length) return null;
    
    // Priority 1: URL parameter
    const urlId = searchParams.get("id");
    if (urlId) {
      const accountFromUrl = accounts.find((a) => a.firebaseItemId === urlId);
      if (accountFromUrl) return accountFromUrl;
    }
    
    // Priority 2: defaultValue prop
    if (defaultValue) {
      const accountFromDefault = accounts.find((a) => a.firebaseItemId === defaultValue);
      if (accountFromDefault) return accountFromDefault;
    }
    
    // Priority 3: First account as fallback
    return accounts[0];
  };
  
  const selected = getSelectedAccount();

  const handleBankChange = (id: string) => {
    const account = accounts.find((account) => account.firebaseItemId === id);
    if (!account) return;

    // Update URL with new bank ID
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "id",
      value: id,
    });
    router.push(newUrl, { scroll: false });

    // Update form value if setValue is provided
    if (setValue) {
      setValue("senderBank", id, { shouldValidate: true });
    }
  };

  if (!accounts.length || !selected) return null;

  // Get initials from bank name (e.g., "Bank of America" -> "BA")
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Select
      value={selected.firebaseItemId}
      onValueChange={handleBankChange}
    >
      <SelectTrigger
        className={`flex w-full min-w-[260px] items-center justify-between gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-16 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${otherStyles}`}
      >
        <div className="flex w-full items-center gap-3">
          {/* Bank Icon - using first two letters as avatar */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
            <span className="text-14 font-semibold text-blue-600">
              {getInitials(selected.name)}
            </span>
          </div>
          
          <div className="flex flex-1 flex-col items-start">
            <p className="line-clamp-1 text-left text-14 font-medium text-gray-900">
              {selected.name}
            </p>
            <p className="text-12 font-medium text-blue-600">
              {formatAmount(selected.availableBalance)}
            </p>
          </div>
          
          <Image
            src="/icons/chevron-down.svg"
            width={16}
            height={16}
            alt="chevron down"
            className="ml-auto"
          />
        </div>
      </SelectTrigger>
      
      <SelectContent
        className="w-[260px] bg-white"
        align="end"
        sideOffset={8}
      >
        <SelectGroup>
          <SelectLabel className="px-3 py-2 text-12 font-medium text-gray-500">
            Select a bank to display
          </SelectLabel>
          
          {accounts.map((account: Account) => (
            <SelectItem
              key={account.id}
              value={account.firebaseItemId}
              className="cursor-pointer border-t border-gray-100 px-3 py-2 hover:bg-gray-50 focus:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                  <span className="text-14 font-semibold text-blue-600">
                    {getInitials(account.name)}
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <p className="text-14 font-medium text-gray-900">
                    {account.name}
                  </p>
                  <p className="text-12 font-medium text-blue-600">
                    {formatAmount(account.availableBalance)}
                  </p>
                </div>
              </div>
            </SelectItem>
          ))}
          
          {/* Add new bank option */}
          <div className="border-t border-gray-100 px-3 py-2">
            <button 
              onClick={() => router.push("/connect-bank")}
              className="flex w-full items-center gap-3 rounded-md p-2 text-14 font-medium text-blue-600 hover:bg-blue-50"
            >
              <Image
                src="/icons/plus.svg"
                width={16}
                height={16}
                alt="add"
              />
              Add new bank
            </button>
          </div>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};