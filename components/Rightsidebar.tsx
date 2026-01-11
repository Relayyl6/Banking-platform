import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import BankCard from './BankCard'
import { HoverCardDemo } from './HoverCard'


const RightSidebar = ({
  user,
  transactions,
  banks
}: RightSidebarProps) => {
  return (
    <aside className="no-scrollbar hidden h-screen max-h-screen flex-col border-l border-gray-200 xl:flex w-[355px] xl:overflow-y-scroll important!">
      <section className="flex flex-col pb-8!">
        <div className="h-[120px] w-full bg-gradient-mesh bg-cover bg-no-repeat" />
        <div className="relative px-6! flex max-xl:justify-center">
          <div className="profile-img">
            <HoverCardDemo button={user?.firstName?.[0] ?? "?"} />
          </div>
          <div className="flex flex-col pt-24!">
            <h1 className="text-24 font-semibold tracking-wide">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-16 font-normal text-gray-600">
              {user.email}
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col justify-between gap-8 px-6! py-8!">
        <div className="flex w-full justify-between">
          <h2 className="header-2">
            Available Banks
          </h2>
          <Link href="/my-banks" className="flex gap-2">
            <Image
              src="/icons/plus.svg"
              width={20}
              height={20}
              alt="add bank"
            />
            <h2 className="text-14 font-semibold text-gray-600">
              Add Bank
            </h2>
          </Link>
        </div>

        {
          banks.length > 0 && (
            <div className="relative flex flex-1 flex-col items-center justify-center gap-5">
              <div className="relative z-10">
                <BankCard
                  key={banks[0]?.id}
                  account={banks[0]}
                  userName={`${user.firstName} ${user.lastName}`}
                  showBalance={false}
                />
              </div>
              {
                banks[1] && (
                  <div className="absolute right-0 top-8 z-0 w-[90%]">
                    <BankCard
                      key={banks[1]?.id}
                      account={banks[1]}
                      userName={`${user.firstName} ${user.lastName}`}
                      showBalance={false}
                    />
                  </div>
                )
              }
            </div>
          )
        }
      </section>
    </aside>
  )
}

export default RightSidebar