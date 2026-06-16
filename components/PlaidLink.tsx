"use client"

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'
import {
  usePlaidLink,
  PlaidLinkOptions,
  PlaidLinkOnSuccess,
} from 'react-plaid-link';
import { useRouter } from 'next/navigation';
import { createLinkToken } from '@/lib/user2.actions';
import Image from 'next/image';

const PlaidLink = ({
  user,
  variant,
  onExchangeToken
}: PlaidLinkProps) => {

  const router = useRouter()
  const [token, setToken] = useState("")

  useEffect(() => {
    const getLinkToken = async () => {
      try {
        const { link_token } = await createLinkToken(user)
        console.log("DEBUG: Received Link Token:", link_token);
        setToken(link_token as string)
      } catch (error) {
        console.error("Error getting link token:", error);
      }
    }

    getLinkToken()
  }, [user]) 

  // Fixed: Added all dependencies that are used inside the callback
  const onSuccess = useCallback<PlaidLinkOnSuccess>(async (public_token: string) => {
    try {
      console.log("DEBUG: Plaid Link success, exchanging public token:", public_token);
      
      const result = await onExchangeToken({  // a server action
        publicToken: public_token,
        user,
      })
      
      console.log("DEBUG: Token exchange result:", result);
      router.push("/")
    } catch (error) {
      console.error("Error exchanging token:", error);
    }
  }, [user, onExchangeToken, router]) // Added all dependencies

  const config: PlaidLinkOptions = {
    token,
    onSuccess
  }

  const { ready, open } = usePlaidLink(config);
  
  return (
    <>
      {
        variant === "primary" ? (
          <Button
            onClick={() => open()}
            disabled={!ready}
            className="text-16 rounded-lg border border-bank-gradient bg-bank-gradient font-semibold text-white shadow-form"
          >
            Connect Bank
          </Button>
        ) : variant === "ghost" ? (
          <Button
            variant="ghost"
            onClick={() => open()}
            disabled={!ready}
            className="flex items-center cursor-pointer gap-3 rounded-lg px-3! py-7! hover:bg-white lg:justify-start"
          >
            <Image
              src="/icons/connect-bank.svg"
              alt="connect-bank "
              width={24}
              height={24}
            />
            <p className='hidden text-[16px] font-semibold text-black-2 xl:block'>Connect Bank</p>
          </Button>
        ) : (
          <Button
            onClick={() => open()}
            disabled={!ready}
            className="flex justify-start! cursor-pointer gap-3 rounded-lg bg-transparent! flex-row"
          >
            <Image
              src="/icons/connect-bank.svg"
              alt="connect-bank "
              width={24}
              height={24}
            />
            <p className='text-[16px] font-semibold text-black-2'>Connect Bank</p>
          </Button>
        )
      }
    </>
  )
}

export default PlaidLink