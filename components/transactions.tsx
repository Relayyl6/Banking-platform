import Link from 'next/link'
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BankTabItem } from './BankTabItem'
import BankInfo from './BankInfo'
import TransactionsTable from './TransactionsTable'
import { Pagination } from './Pagination'

const Transactions = ({
  accounts = [], //* default so a failed account fetch doesn't crash .map below
  transactions = [], //* default so undefined transactions don't crash .length/.slice below
  firebaseItemId,
  page = 1
}: RecentTransactionsProps) => {
  const rowsPerPage = 8;
  const totalPage = Math.ceil(transactions.length / rowsPerPage)

  const indexOFLastTransaction = page * rowsPerPage
  const indexOFFirstTransaction = indexOFLastTransaction - rowsPerPage

  const currentTransactions = transactions.slice(
    indexOFFirstTransaction, indexOFLastTransaction
  )

  return (
    <section className='flex w-full flex-col gap-6'>
      <header className='flex items-center justify-between'>
        <h2 className='text-20 md:text-24 font-semibold text-gray-900'>
          Recent Transactions
        </h2>
        <Link
          className='text-14 rounded-lg border border-gray-300 px-4! py-2.5! font-semibold text-gray-700'
          href={`/transaction-history/?id=${firebaseItemId}`}>
            View All
        </Link>
      </header>

      <Tabs defaultValue={firebaseItemId} className="w-full!">
        <TabsList className="custom-scrollbar mb-8 flex w-full flex-nowrap">
          {/* <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger> */}
          { 
            accounts.map((a: Account) => (
              <TabsTrigger key={a.id} value={a.firebaseItemId}>
                <BankTabItem account={a} firebaseItemId={firebaseItemId} />
              </TabsTrigger>
            ))
          }
        </TabsList>
        {/* <TabsContent value="account">Make changes to your account here.</TabsContent>
        <TabsContent value="password">Change your password here.</TabsContent> */}
        {
          accounts.map((a: Account) => (
            <TabsContent className='space-y-4!' key={a.id} value={a.firebaseItemId}>
              <BankInfo
                account={a}
                firebaseItemId={firebaseItemId}
                type="full"
              />

              <TransactionsTable
                transactions={currentTransactions}
                variant="compact"
                rows={rowsPerPage}
              />

              {
                totalPage > 1 && (
                  <div className='my-4 w-full'>
                    <Pagination totalPages={totalPage} page={page}/>
                  </div>
                )
              }
            </TabsContent>
          ))
        }
      </Tabs>
    </section>
  )
}

export default Transactions
