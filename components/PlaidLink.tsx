import React, { useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'
import {
  usePlaidLink,
  PlaidLinkOptions,
  PlaidLinkOnSuccess,
} from 'react-plaid-link';
import { useRouter } from 'next/navigation';
import { exchangePublicToken } from '@/lib/user.action';
import { createLinkToken } from '@/lib/user2.actions';


const PlaidLink = ({
  user,
  variant
}: PlaidLinkProps) => {

  const router = useRouter()
  
  const [ token, setToken ] = useState("")

  useEffect(() => {
    const getLinkToken = async () => {
      const { link_token } = await createLinkToken(user)
      console.log("DEBUG: Received Token:", link_token);
      setToken(link_token as string)
    }

    getLinkToken()
  }, [user]) 


  const onSuccess = useCallback<PlaidLinkOnSuccess>(async (public_token: string) => {
    await exchangePublicToken({  // a server action
      publicToken: public_token,
      user,
    })

    router.push("/")
  }, [user])

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
          <Button>
            Connect Bank
          </Button>
        ) : (
          <Button>
            Connect Bank
          </Button>
        )
      }
    </>
  )
}

export default PlaidLink
