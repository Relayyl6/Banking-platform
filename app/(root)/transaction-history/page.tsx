// import { BankDropdown } from '@/components/BankDropdown'
import { BankDropUp } from '@/components/BankDropUp'
import Header from '@/components/header'
import TransactionHistoryClient from '@/components/TransactionHistoryClient'
import { getAccount, getAccounts } from '@/lib/dwolla/bank.actions'
import { getLoggedInUser } from '@/lib/user.server'
import React from 'react'

const TransactionHistory = async ({ searchParams }: SearchParamProps) => {
  const { id, page } = await searchParams
  
  const loggedInUser = await getLoggedInUser()
  
  const accounts = await getAccounts({
    userId: loggedInUser?.uid as string
  })

  if (!accounts) {
    return null
  }

  const accountsData = accounts?.data
  //* fall back to the first account so visiting /transaction-history without ?id isn't a blank page
  const firebaseItemId = (id as string) || accountsData?.[0]?.firebaseItemId

  if (!firebaseItemId) {
    return null
  }

  const account = await getAccount({ firebaseItemId })

  return (
    <section className="flex max-h-screen w-full flex-col gap-8 overflow-y-scroll bg-gray-25 p-8! xl:py-12!">
      <header className="flex w-full flex-col md: flex-row items-start justify-between gap-8 md:flex-row">
        <Header
          title="Transaction History"
          subText="See your bank details and transactions"
        />

        <BankDropUp
          accounts={accounts}
        />
      </header>

      <TransactionHistoryClient 
        account={account}
        transactions={account?.transactions || []}
      />
    </section>
  )
}

export default TransactionHistory