import React from 'react'

const Footer = ({ user, type }: { user: User, type?: "desktop" | "mobile" }) => {
  return (
    <footer className="flex cursor-pointer items-center justify-between gap-2 py-6!">
        <div className={
            type === "mobile"
            ? "flex size-10 items-center justify-center rounded-full bg-gray-200"
            : "flex size-10 items-center justify-center rounded-full bg-gray-200 max-xl:hidden"
        }>
            <p className="text-xl font-bold text-gray-700">{user?.firstName[0]}</p>
        </div>

        <div className={
            type === "mobile"
            ? "flex flex-1 flex-col justify-center" 
            : "flex flex-1 flex-col justify-center max-xl:hidden"
        }>
            <h1 className="text-[14px] tracking-widest truncate font-normal text-gray-600">
                {user?.firstName} {user?.lastName}
            </h1>
        </div>
    </footer>
  )
}

export default Footer
