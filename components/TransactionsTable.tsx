import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn, formatAmount, formatDateTime, getTransactionStatus, removeSpecialCharacters } from '@/lib/utils'
import { transactionCategoryStyles } from '@/constants'

const CategoryBadge = ({ category, color }: CategoryBadgeProps) => {
    const {
        borderColor,
        backgroundColor,
        textColor,
        chipBackgroundColor
    } = transactionCategoryStyles[category as keyof typeof transactionCategoryStyles] || transactionCategoryStyles.default

    return (
        <div className={cn("flex items-center w-fit max-w-[200px] gap-1 rounded-2xl border-[1.5px] py-0.5 pl-1.5 pr-2", chipBackgroundColor, borderColor)}>
            <div 
                className={cn("size-2 rounded-full shrink-0", backgroundColor)}
                style={{ backgroundColor: backgroundColor }}
            />
            <p className={cn("text-[12px] font-medium truncate", textColor)}>
                {category}
            </p>
        </div>
    )
}

const TransactionsTable = ({
    transactions,
    variant = "full",
    rows
}: TransactionTableProps & { variant?: "compact" | "full", rows: number }) => {
  
  const displayTransactions = variant === "compact" 
    ? transactions.slice(0, rows) 
    : transactions;

  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-[700px] lg:min-w-full">
        <TableHeader className='bg-[#F9FAFB]'>
            <TableRow>
              <TableHead className="px-2 whitespace-nowrap">Transaction</TableHead>
              <TableHead className="px-2 whitespace-nowrap">Amount</TableHead>
              <TableHead className="px-2 whitespace-nowrap">Status</TableHead>
              <TableHead className="px-2 whitespace-nowrap">Date</TableHead>
              <TableHead className={`px-2 whitespace-nowrap ${variant === "compact" ? "max-lg:hidden" : "max-md:hidden"}`}>
                Channel
              </TableHead>
              <TableHead className={`px-2 whitespace-nowrap ${variant === "compact" ? "max-lg:hidden" : "max-md:hidden"}`}>
                Category
              </TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {displayTransactions.map((t: Transaction) => {
                const status = getTransactionStatus(new Date(t.date));
                const amount = formatAmount(t.amount)
                const isDebit = t.type === "debit";
                const isCredit = t.type === "credit";

                return (
                    <TableRow 
                      key={t.id} 
                      className={`${isDebit || amount[0] === '-' ? 'bg-[#FFFBFA]' : 'bg-[#f6fef9]'} hover:bg-gray-50 border-b`}
                    >
                        <TableCell className="px-2 py-3">
                            <div className="min-w-[150px] max-w-[250px]">
                                <h1 className="text-14 font-semibold text-[#344054] truncate" title={removeSpecialCharacters(t.name)}>
                                    {removeSpecialCharacters(t.name)}
                                </h1>
                            </div>
                        </TableCell>

                        <TableCell className={`px-2 py-3 font-semibold whitespace-nowrap ${isDebit || amount[0] === '-' ? 'text-[#f04438]' : 'text-success-600'}`}>
                            {isDebit ? `-${amount}` : isCredit ? amount : amount}
                        </TableCell>  

                        <TableCell className="px-2 py-3 whitespace-nowrap">
                            <CategoryBadge
                                category={status}
                                color={isDebit || amount[0] === '-' ? '#f10303' : '#20f427'}
                            />
                        </TableCell>

                        <TableCell className="px-2 py-3 whitespace-nowrap">
                            {formatDateTime(new Date(t.date)).dateTime}
                        </TableCell>

                        <TableCell className={`px-2 py-3 capitalize whitespace-nowrap ${variant === "compact" ? "max-lg:hidden" : "max-md:hidden"}`}>
                            <span className="truncate block max-w-[150px]" title={t.paymentChannel}>
                                {t.paymentChannel}
                            </span>
                        </TableCell> 

                        <TableCell className={`px-2 py-3 ${variant === "compact" ? "max-lg:hidden" : "max-md:hidden"}`}>
                            <CategoryBadge category={t.category} />
                        </TableCell>             
                    </TableRow>
                )
            })}
        </TableBody>
      </Table>
      
      {variant === "compact" && transactions.length > rows && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Showing {displayTransactions.length} of {transactions.length} transactions
        </div>
      )}
    </div>
  )
}

export default TransactionsTable