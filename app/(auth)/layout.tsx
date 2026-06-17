import Image from 'next/image'
import React from 'react'

const RootLayout = ({
    children
}: {
    children: React.ReactNode
}) => {
  return (
    <main className="no-scrollbar flex min-h-screen w-full justify-between font-inter">
      {children}
      <div className='no-scrollbar flex h-screen w-full sticky top-0 items-center justify-end bg-sky-1 max-lg:hidden'>
        <div>
            <Image
                src="/icons/auth-image.png"
                alt="Auth image"
                width={500}
                height={500}
                className='scale-170 rounded-20'
            />
        </div>
      </div>
    </main>
  )
}

export default RootLayout
