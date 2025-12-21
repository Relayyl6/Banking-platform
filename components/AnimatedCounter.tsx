"use client"

import React from 'react'
import CountUp from 'react-countup'

const AnimatedCounter = ({
  amount
}: {
    amount: number
}) => {
  return (
    <div className='w-full flex items-center rounded-lg border border-gray-40 shadow-chart p-2!'>
        <CountUp
            end={amount}
            decimals={2}
            separator=','
            decimal="."
            prefix="$ "
        />
    </div>
  )
}

export default AnimatedCounter