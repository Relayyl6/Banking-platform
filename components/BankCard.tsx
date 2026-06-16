import { formatAmount } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import Copy from './Copy'

const BankCard = ({
    key,
    account,
    userName,
    showBalance = true
}: CreditCardProps) => {
  return (
    <div className="flex flex-col" key={key}>
        <Link className="bank-card" href={`/transaction-history/?id=${account?.firebaseItemId}`}>
            <div className="bank-card-content">
                <div>
                    <h1 className="text-16 font-semibold text-white tracking-wide">
                        {account.name || userName}
                    </h1>
                    <p className='font-ibm font-black text-white'>
                        {formatAmount(account.availableBalance)}
                    </p>
                </div>

                <article className="flex flex-col gap-2">
                    <div className="flex justify-between">
                        <h1 className="font-semibold text-12 text-white tracking-wide">
                            {userName}
                        </h1>
                        <h2 className="font-semibold text-12 text-white">
                           ** / **
                        </h2>
                    </div>

                    <p className="text-14 font-semibold tracking-[1.1px] text-white">
                        ●●●● ●●●● ●●●● <span className="text-16">{account.mask}</span>
                    </p>
                </article>
            </div>

            <div className="bank-card-icon">
                <Image
                    src="/icons/Paypass.svg"
                    width={20}
                    height={24}
                    alt="pay"
                />
                <Image
                    src="/icons/mastercard.svg"
                    width={45}
                    height={32}
                    alt="mastercard"
                    className="ml-5!"
                />
            </div>

            <Image src="/icons/lines.svg" alt="lines" width={316} height={190} className='absolute top-0 left-0'/>
        </Link>

        {
            showBalance && <Copy title={account?.sharableId} />
        }
    </div>
  )
}

export default BankCard