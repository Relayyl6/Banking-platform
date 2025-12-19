import Header from '@/components/header'
import TotalBalanceBox from '@/components/TotalBalanceBox'
import React from 'react'

const Home = () => {
  const user = {
    firstName: "Leonard"
  }
  return (
    <main className="no-scrollbar flex w-full flex-row max-xl:max-h-screen max-xl:overflow-y-scroll">
      <div className="no-scrollbar flex w-full flex-1 flex-col gap-8 px-5 py-7 sm:px-8! lg:py-12! xl:max-h-screen xl:overflow-y-scroll">
        <Header
          type="greeting"
          title="Welcome"
          subText="Access and manage your account and transactions effeciently"
          user={user?.firstName || "guest"}
        />

        <TotalBalanceBox
          accounts={[]}
          totalBanks={1}
          totalCurrentBalance={1268.38}
        />
      </div>
    </main>
  )
}

export default Home