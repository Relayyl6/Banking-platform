import Sidebar from '@/components/sidebar'
import React from 'react'
import Image from 'next/image'
import MobileNavbar from '@/components/MobileNavbar'
import { getLoggedInUser } from '@/lib/user.server'
import { convertTimestamps } from '@/lib/utils'

export default async function Layout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const loggedIn = convertTimestamps(await getLoggedInUser());

  return (
    <main className="flex h-screen w-full font-inter">
      <Sidebar user={loggedIn} />

      <div className="flex flex-col size-full">
        <div className="flex h-16 items-center justify-between p-5! shadow-credit-card sm:p-8! md:hidden">
          <Image
            src="/icons/logo.svg"
            width={30}
            height={30}
            alt="logo"
          />
          <div>
            <MobileNavbar user={loggedIn} />
          </div>
        </div>
        {children}
      </div>
    </main>
  )
}

// export default Layout