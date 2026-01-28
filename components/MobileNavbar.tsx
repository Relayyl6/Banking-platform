"use client"

import React from 'react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import Image from 'next/image'
import Link from 'next/link'
import { sidebarLinks } from '@/constants'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Footer from './Footer'

const MobileNavbar = ({
  user
}: {
  user: MobileNavProps
}) => {
  const pathname = usePathname(); 
  return (
    <section className="w-full max-w-[264px]">
      <Sheet>
        <SheetTrigger>
          <Image
            src="/icons/hamburger.svg"
            width={30}
            height={30}
            alt="menu"
            className="cursor-pointer"
          />
        </SheetTrigger>
        <SheetContent side="left" className="border-none bg-white p-2!">
          <Link href="/" className='cursor-pointer items-center gap-1 px-4! flex'>
            <Image
              src="/icons/logo.svg"
              width={34} height={34}
              alt="Bevel Banking"
              className="size-6 max-xl:size-14"
            />
            <h1 className="font-ibm text-26 font-bold text-black-1">
              Bevel Finance
            </h1>
          </Link>

          <div className="flex h-[calc(100vh-72px)] flex-col justify-between overflow-y-auto">
            <SheetClose asChild>
              <nav className="flex h-full flex-col gap-6 pt-16! text-white">
                {
                  sidebarLinks.map(({ imgURL, route, label }, index) => {
                    const isActive = pathname === route || pathname.startsWith(`${route}/`)
                    return (
                      <SheetClose asChild key={route}>
                        <Link
                          href={route}
                          key={label || index}
                          className={cn('mobile-nav-link w-full ', { 'bg-bank-gradient': isActive })}>
                            <Image
                              src={imgURL}
                              alt={label}
                              width={20}
                              height={20}
                              className={cn({ 'brightness-[3]! invert-0': isActive })}
                            />
                          <p className={cn('text-16 font-semibold text-black-2', { 'text-white!': isActive })}>
                            {label}
                          </p>
                        </Link>
                      </SheetClose>
                    )
                  })
                }
              </nav>
            </SheetClose>
            <Footer user={user} type="mobile" />
          </div>
        </SheetContent>
      </Sheet>
    </section>
  )
}

export default MobileNavbar