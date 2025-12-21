import React from 'react'
import AnimatedCounter from './AnimatedCounter'
import DoughnutChart from '@/components/DoughnutChart'

const TotalBalanceBox = ({
    accounts=[],
    totalBanks,
    totalCurrentBalance
}: TotlaBalanceBoxProps) => {
  return (
    <section className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4! sm:p-6! shadow-chart sm:gap-4">
        <div className="flex size-full max-w-[100px] sm:max-w-[120px] items-center">
          {/* //doughnutchart */}
          <DoughnutChart accounts={accounts} />
        </div>

        <div className="flex flex-col gap-6 flex-center">
          <h2 className="flex flex-col gap-1">
            {totalBanks} Bank Account{totalBanks > 1 ? "s" : ""}
          </h2>

          <div className="flex flex-col gap-2 flex-center">
            <p className="text-14 font-medium text-gray-600">
              Total Current Balance
            </p>

            <div className='flex-center text-24 lg:text-30 flex-1 font-semibold text-gray-900 gap-2'>
              <AnimatedCounter amount={totalCurrentBalance} />
            </div>
          </div>
        </div>
    </section>
  )
}

export default TotalBalanceBox