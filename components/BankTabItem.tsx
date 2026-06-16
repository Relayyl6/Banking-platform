"use client";

import { useSearchParams, useRouter } from "next/navigation";

import { cn, formUrlQuery } from "@/lib/utils";

export const BankTabItem = ({ account, firebaseItemId }: BankTabItemProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isActive = firebaseItemId === account?.firebaseItemId;

  const handleBankChange = () => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "id",
      value: account?.firebaseItemId,
    });
    router.push(newUrl, { scroll: false });
  };

  return (
    <div
      onClick={handleBankChange}
      className={cn(`gap-4.5 border-b-2 flex px-2! sm:px-4! py-2! transition-all`, {
        "border-blue-600": isActive,
      })}
    >
      <p
        className={cn(`text-16 line-clamp-1 flex-1 font-medium text-gray-500`, {
          " text-blue-600": isActive,
        })}
      >
        {account.name}
      </p>
    </div>
  );
};