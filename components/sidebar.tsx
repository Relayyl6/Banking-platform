"use client"

import { sidebarLinks } from '@/constants'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const Sidebar = ({
  user
}: SiderbarProps) => {
  const pathname = usePathname();
  return (
    <section className="sticky left-0 top-0 flex h-screen w-fit flex-col justify-between border-r border-gray-200 bg-white pt-8! text-white max-md:hidden sm:p-4! xl:p-6! 2xl:w-[355px]">
      <nav className="flex flex-col gap-4">
        <Link href="/" className='mb-12 cursor-pointer items-center gap-2 flex flex-row'>
          <Image
            src="/icons/logo.svg"
            width={34} height={34}
            alt="Bevel Banking"
            className="size-6 max-xl:size-14"
          />
          <h1 className="font-ibm text-[26px] 2xl:text-26 font-bold text-black-1 max-xl:hidden pr-3!">
            Bevel
          </h1>
        </Link>

        {
          sidebarLinks.map(({ imgURL, route, label }, index) => {
            const isActive = pathname === route || pathname.startsWith(`${route}/`)
            return (
              <Link
                href={route}
                key={label || index}
                className={cn('flex gap-3 py-1! md:p-3! 2xl:p-4! rounded-lg justify-center xl:justify-start bg-black', { 'bg-bank-gradient': isActive })}>
                <div className="relative size-6">
                  <Image
                    src={imgURL}
                    alt={label}
                    width={22}
                    height={22}
                    fill
                  />
                </div>
                {label}
              </Link>
            )
          })
        }
      </nav>
    </section>
  )
}

export default Sidebar