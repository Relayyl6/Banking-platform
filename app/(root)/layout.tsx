import Sidebar from '@/components/sidebar'
import React from 'react'
import Image from 'next/image'
import MobileNavbar from '@/components/MobileNavbar'

export default function Layout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const loggedIn = {
    firstName: "Leonard",
    lastName: "Oseghale"
  }
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