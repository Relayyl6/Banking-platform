import Header from '@/components/header'
import TotalBalanceBox from '@/components/TotalBalanceBox'
import React from 'react'
import RightSidebar from '@/components/Rightsidebar'
import { getLoggedInUser } from '@/lib/user.server'
import Transactions from '@/components/transactions'
import { getAccount, getAccounts } from '@/lib/dwolla/bank.actions'
// import { getServerUser, getUserProfile } from '@/lib/auth'
// import { loggedInUser } from '@/components/User'
// import { loggedInUser } from '@/components/User'

const Home = async ({ searchParams }: SearchParamProps ) => {
  const { id, page } = await searchParams; 

  const loggedInUser = await getLoggedInUser();
  
  const accounts = await getAccounts({
    userId: loggedInUser?.uid as string
  })

  if (!accounts) {
    return null;
  }

  const accountsData = accounts?.data

  const firebaseItemId = (id as string) || accountsData[0]?.firebaseItemId;

  if (!firebaseItemId) {
    return null;
  }

  const account = await getAccount({ firebaseItemId })

  const currentPage = Math.max(1, Math.floor(Number(page as string)) || 1) //* coerce string searchParam to a whole page >= 1 (handles "", "abc", "1.5")
  
  return (
    <main className="no-scrollbar flex w-full flex-row max-xl:max-h-screen max-xl:overflow-y-scroll">
      <div className="no-scrollbar flex w-full flex-1 flex-col gap-8 px-5! py-7! sm:px-8! lg:py-12! xl:max-h-screen xl:overflow-y-scroll">
        <Header
          type="greeting"
          title="Welcome"
          subText="Access and manage your account and transactions effeciently"
          user={loggedInUser?.firstName || "guest"}
        />

        <div className="flex gap-5">
          <TotalBalanceBox
            accounts={accountsData}
            totalBanks={accounts?.totalBanks}
            totalCurrentBalance={accounts?.totalCurrentBalance}
          />
        </div>

        <Transactions
          accounts={accountsData}
          transactions={account?.transactions}
          firebaseItemId={firebaseItemId}
          page={currentPage} //* pass a coerced number instead of the raw string searchParam
        />
      </div>

      {/* // right sidebar */}
      <RightSidebar
        user={loggedInUser as User}
        transactions={account?.transactions}
        banks={accountsData?.slice(0, 2)}
      />
    </main>
  )
}

export default Home