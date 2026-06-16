import React from 'react'

const Header = ({
    type="title",
    title,
    subText,
    user
}: HeaderBoxProps) => {
  return (
    <div className='flex flex-col gap-1'>
        <h1 className="text-24 lg:text-30 font-semibold text-gray-900">
            {title}
            {type === "greeting" && (
                <span className="text-bank-gradient">
                    &nbsp;{user}
                </span>
            )}
        </h1>
        <p className="text-14 lg:text-16 font-normal text-gray-600">{subText}</p>
    </div>
  )
}

export default Header