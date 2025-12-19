import Sidebar from '@/components/sidebar'
import React from 'react'

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
      {children}
    </main>
  )
}

// export default Layout