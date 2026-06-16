import Header from '@/components/header'
import PaymentTransferForm from '@/components/PaymentTransferForm'
import { getAccounts } from '@/lib/dwolla/bank.actions';
import { getLoggedInUser } from '@/lib/user.server';
import React from 'react'

const PaymentTransfer = async () => {
  const loggedInUser = await getLoggedInUser();
    
  const accounts = await getAccounts({
    userId: loggedInUser?.uid as string
   })
  
   if (!accounts) {
    return null;
  }
  
  const accountsData = accounts?.data
  return (
    <section className='no-scrollbar flex flex-col overflow-y-scroll bg-gray-25 p-8! md:max-h-screen xl:py-12!'>
      <Header
        title="Payment Transfer"
        subText='Please provide any specific details or notes related to the payment transfer'
      />

      <section className='size-full pt-5!'>
        <PaymentTransferForm accounts={accountsData} />
      </section>
    </section>
  )
}

export default PaymentTransfer