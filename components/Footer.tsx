import { logOutClient } from '@/lib/user.action'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

const Footer = ({ user, type }: { user: User, type?: "desktop" | "mobile" }) => {
  const router = useRouter()
  const handleLogout = async () => {
    const logout = await logOutClient()
    if (logout) router.push('/sign-in')
  }
  return ( 
    <footer className="flex cursor-pointer items-center justify-between gap-2 py-6!">
        <div className={
            type === "mobile"
            ? "flex size-10 items-center justify-center rounded-full bg-gray-200"
            : "flex size-10 items-center justify-center rounded-full bg-gray-200 max-xl:hidden"
        }>
            <p className="text-xl font-semibold text-gray-700">
                {user?.firstName[0]}
            </p>
        </div>

        <div className={
            type === "mobile"
            ? "flex flex-1 flex-col justify-center" 
            : "flex flex-1 flex-col justify-center max-xl:hidden"
        }>
            <h1 className="text-[14px] tracking-widest truncate font-normal text-gray-600">
                {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-14 truncate font-normal text-gray-600">
                {user?.email}
            </p>
        </div>

        <div
            className="relative size-5 max-xl:w-full max-xl:flex max-xl:justify-center max-xl:items-center"
            onClick={handleLogout}>
            <Image src="icons/logout.svg" alt="logout" fill
            
            />
        </div>
    </footer>
  )
}

export default Footer
