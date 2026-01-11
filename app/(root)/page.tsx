import Header from '@/components/header'
import TotalBalanceBox from '@/components/TotalBalanceBox'
import React from 'react'
import RightSidebar from '@/components/Rightsidebar'
import { getLoggedInUser } from '@/lib/user.server'
// import { getServerUser, getUserProfile } from '@/lib/auth'
// import { loggedInUser } from '@/components/User'
// import { loggedInUser } from '@/components/User'

const Home = async () => {
  const loggedInUser = await getLoggedInUser();
  // const user = {
  //   firstName: "Leonard",
  //   lastName: "Oseghale",
  //   email: "oseghalelonard39@gmail.com"
  // }
  return (
    <main className="no-scrollbar flex w-full flex-row max-xl:max-h-screen max-xl:overflow-y-scroll">
      <div className="no-scrollbar flex w-full flex-1 flex-col gap-8 px-5! py-7! sm:px-8! lg:py-12! xl:max-h-screen xl:overflow-y-scroll">
        <Header
          type="greeting"
          title="Welcome"
          subText="Access and manage your account and transactions effeciently"
          user={loggedInUser?.firstName || "guest"}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TotalBalanceBox
            accounts={[]}
            totalBanks={1}
            totalCurrentBalance={1268.38}
          />

          <TotalBalanceBox
            accounts={[]}
            totalBanks={1}
            totalCurrentBalance={1268.38}
          />

          <TotalBalanceBox
            accounts={[]}
            totalBanks={1}
            totalCurrentBalance={1268.38}
          />

          <TotalBalanceBox
            accounts={[]}
            totalBanks={1}
            totalCurrentBalance={1268.38}
          />
        </div>



      </div>

      {/* // right sidebar */}
      <RightSidebar
        user={loggedInUser as User}
        transactions={[]}
        banks={[
          {currentBalance: 123.58, mask: "12 3432" },
          {currentBalance: 1492.58, mask: "23 2343"}
        ]}
      />
    </main>
  )
}

export default Home