import BankCard from '@/components/BankCard';
import Header from '@/components/header'
import { getAccounts } from '@/lib/dwolla/bank.actions';
import { getLoggedInUser } from '@/lib/user.server';
import React from 'react'

const MyBanks = async () => {
  const loggedInUser = await getLoggedInUser();
    
  const accounts = await getAccounts({
    userId: loggedInUser?.uid as string
  })

  const accountName: string = loggedInUser?.firstName + " " + loggedInUser?.lastName


  return (
    <section className='flex'>
      <div className='flex h-screen max-h-screen w-full flex-col gap-8 bg-gray-25 p-8! xl:py-12!'>
        <Header
          title="My Banks"
          subText="Effortlessly manage your banking activities"
        />

        <div className="space-y-4">
          <h2 className='text-18 font-semibold text-gray-900'>
            Your Cards
          </h2>
        </div>

        <div className='flex flex-wrap gap-6'>
          {accounts && accounts.data.map((account: Account) => (
            <BankCard
              key={account.id}
              account={account}
              userName={accountName}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default MyBanks