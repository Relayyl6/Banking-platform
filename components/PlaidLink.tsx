import React, { useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'
import {
  usePlaidLink,
  PlaidLinkOptions,
  PlaidLinkOnSuccess,
} from 'react-plaid-link';
import { useRouter } from 'next/navigation';
import { createLinkToken } from '@/lib/user.action';

const PlaidLink = ({
  user,
  variant
}: PlaidLinkProps) => {

  const router = useRouter()
  
  const [ token, setToken ] = useState("")

  useEffect(() => {
    const getLinkToken = async () => {
      const data = await createLinkToken(user)

      setToken(data?.link_token)
    }

    getLinkToken()
  }, [user]) 


  const onSuccess = useCallback<PlaidLinkOnSuccess>(async (public_token: string) => {
    // await exchangePublicToken({  // a server action
    //   publicToken: public_token,
    //   user,
    // })

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
