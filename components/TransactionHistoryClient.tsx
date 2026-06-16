'use client'

import React, { useState, useMemo } from 'react'
import TransactionsTable from './TransactionsTable'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn, formatAmount } from '@/lib/utils'
import { Download, BanknoteArrowUp, BanknoteArrowDown } from 'lucide-react'
import { Slider } from '@/components/ui/slider'

type data = { data: Account; }

interface TransactionHistoryClientProps {
  account: data
  transactions: Transaction[]
}

const TransactionHistoryClient = ({ account, transactions }: TransactionHistoryClientProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')
  const [amountRange, setAmountRange] = useState([0, 1000])
  const [amountTouched, setAmountTouched] = useState(false) //* don't apply the [0,1000] default until the user moves the slider, otherwise transactions over $1000 are hidden on load
  const [statusFilter, setStatusFilter] = useState<'all' | 'debit' | 'credit'>('all')

  // Get unique categories from transactions - FILTER OUT EMPTY/INVALID VALUES
  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      transactions
        .map(t => t.category)
        .filter(cat => cat && cat.trim() !== '') // Remove empty/null/undefined
    )
    return Array.from(uniqueCategories).sort()
  }, [transactions])

  // Filter transactions based on search and filters
  // Filter transactions based on search and filters
  const filteredTransactions = useMemo(() => {
    let filtered = transactions

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter)
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date()
      let daysAgo = 0
      
      switch(timeFilter) {
        case '7days':
          daysAgo = 7
          break
        case '30days':
          daysAgo = 30
          break
        case '90days':
          daysAgo = 90
          break
      }
      
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo)
      
      filtered = filtered.filter(t => new Date(t.date) >= cutoffDate)
    }

    // Amount range filter - NEW
    if (amountTouched) { //* only filter by amount once the user has actually adjusted the slider
      filtered = filtered.filter(t => {
        const amount = Math.abs(t.amount)
        return amount >= amountRange[0] && amount <= amountRange[1]
      })
    }

    // Status filter (Debit/Credit) - NEW
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => {
        if (statusFilter === 'credit') {
          // Keep if it says 'credit' OR the amount is positive
          return t.type === 'credit' || t.amount > 0;
        }
        if (statusFilter === 'debit') {
          // Keep if it says 'debit' OR the amount is negative
          return t.type === 'debit' || t.amount < 0;
        }
        return true;
      });
    }

    return filtered
  }, [transactions, searchQuery, categoryFilter, timeFilter, amountRange, amountTouched, statusFilter])

  // Calculate max amount for slider - NEW
  const maxAmount = useMemo(() => {
    return Math.max(...transactions.map(t => Math.abs(t.amount)), 1000)
  }, [transactions])

  // Export to CSV
  const handleExportCSV = () => {
    // Calculate totals
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'credit' || t.amount > 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'debit' || t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const netAmount = totalIncome - totalExpenses

    // Summary section
    const summary = [
      ['Transaction History Export'],
      [`Generated: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}`],
      [`Account: ${account?.data.officialName || 'N/A'}`],
      [`Period: ${timeFilter === 'all' ? 'All Time' : timeFilter === '7days' ? 'Last 7 Days' : timeFilter === '30days' ? 'Last 30 Days' : 'Last 90 Days'}`],
      [''],
      ['Summary'],
      [`Total Transactions: ${filteredTransactions.length}`],
      [`Total Income: $${totalIncome.toFixed(2)}`],
      [`Total Expenses: $${totalExpenses.toFixed(2)}`],
      [`Net Amount: $${netAmount.toFixed(2)}`],
      [''],
      ['']
    ]

    // Headers with better names
    const headers = [
      'Date',
      'Description',
      'Amount',
      'Debit',
      'Credit',
      'Type',
      'Category',
      'Channel',
      'Status',
      'Balance Impact'
    ]

    // Format transaction data
    const csvData = filteredTransactions.map((t, index) => {
      const amount = Math.abs(t.amount)
      const isDebit = t.type === 'debit' || t.amount < 0
      const formattedDate = new Date(t.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      
      return [
        formattedDate,
        t.name, //* quote-escaping now happens uniformly at serialization (see below), no per-field escape needed
        `$${amount.toFixed(2)}`,
        isDebit ? `$${amount.toFixed(2)}` : '',
        isDebit ? '' : `$${amount.toFixed(2)}`,
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        t.category || 'Uncategorized',
        t.paymentChannel ? t.paymentChannel.charAt(0).toUpperCase() + t.paymentChannel.slice(1) : 'N/A',
        'Completed',
        isDebit ? 'Decrease' : 'Increase'
      ]
    })

    // Combine everything
    const allRows = [
      ...summary.map(row => Array.isArray(row) ? row : [row]),
      headers,
      ...csvData
    ]

    // Create CSV content
    const csvContent = allRows
      //* escape every cell's embedded quotes (RFC 4180) so a value like Food "Premium" can't break parsing
      .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    
    // Better filename with date and account info
    const accountName = account?.data.name?.replace(/[^a-z0-9]/gi, '_') || 'account'
    const dateStr = new Date().toISOString().split('T')[0]
    a.download = `${accountName}_transactions_${dateStr}.csv`
    
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className='space-y-6!'>
      {/* Account Info Card */}
      <div className='flex flex-col justify-between gap-4 rounded-lg border-y bg-blue-600 px-4! py-5! md:flex-row'>
        <div className='flex flex-col gap-2'>
          <h2 className='text-18 font-bold text-white'>
            {account?.data.name}
          </h2>
          <p className='text-14 text-blue-25'>
            {account?.data.officialName}
          </p>
          <p className="text-14 font-semibold tracking-[1.1px] text-white">
            ●●●● ●●●● ●●●● <span className="text-16">{account?.data.mask}</span>
          </p>
        </div>

        <div className='flex-center flex-col gap-2 rounded-md bg-blue-25/20 px-4! py-2 text-white'>
          <p className='text-14'>Current Balance</p>
          <p className='text-24 text-center font-bold'>
            {formatAmount(account?.data.availableBalance)}
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className='space-y-4 rounded-lg bg-white p-1.5! shadow-sm'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center bg-white rounded-lg'>
        <div className='flex-1'>
          <Input 
            placeholder="Search transactions..." 
            className="w-full pl-3! pr-3!"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className='flex flex-row gap-2'>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[130px] pl-3! pr-3!">
            <SelectValue placeholder="Category"/>
          </SelectTrigger>
          <SelectContent className='bg-white shadow-lg rounded-lg border border-gray-200 p-1! max-h-[300px] overflow-y-auto'>
            <SelectItem 
              value="all"
              className="cursor-pointer rounded-md px-2! py-1! text-sm font-semibold text-gray-900 hover:bg-blue-50! hover:text-blue-700! focus:bg-blue-50! focus:text-blue-700! transition-colors"
            >
              All Categories
            </SelectItem>
            
            {categories.length > 0 && (
              <div className="my-1! h-px bg-gray-200" />
            )}
            
            {categories.map(cat => (
              <SelectItem 
                key={cat} 
                value={cat}
                className="cursor-pointer rounded-md px-2! py-1! text-sm font-medium text-gray-700 hover:bg-blue-50! hover:text-blue-700! focus:bg-blue-50! focus:text-blue-700! transition-colors capitalize"
              >
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-full md:w-[130px] pl-3! pr-3!">
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent className='bg-white shadow-lg rounded-lg border border-gray-200 p-1!'>
            <SelectItem 
              value="all" 
              className="cursor-pointer rounded-md px-2! py-1! text-sm font-medium text-gray-700 hover:bg-blue-50! hover:text-blue-700! focus:bg-blue-50! focus:text-blue-700! transition-colors"
            >
              All time
            </SelectItem>
            <SelectItem 
              value="7days"
              className="cursor-pointer rounded-md px-2! py-1! text-sm font-medium text-gray-700 hover:bg-blue-50! hover:text-blue-700! focus:bg-blue-50! focus:text-blue-700! transition-colors"
            >
              Last 7 days
            </SelectItem>
            <SelectItem 
              value="30days"
              className="cursor-pointer rounded-md px-2! py-1! text-sm font-medium text-gray-700 hover:bg-blue-50! hover:text-blue-700! focus:bg-blue-50! focus:text-blue-700! transition-colors"
            >
              Last 30 days
            </SelectItem>
            <SelectItem 
              value="90days"
              className="cursor-pointer rounded-md px-2! py-1! text-sm font-medium text-gray-700 hover:bg-blue-50! hover:text-blue-700! focus:bg-blue-50! focus:text-blue-700! transition-colors"
            >
              Last 90 days
            </SelectItem>
          </SelectContent>
        </Select>
        </div>

        <div className='flex gap-4 flex-row md:items-center max-md:justify-between'>
          <div className='flex flex-col gap-2 w-full'>
            <div className='inline-flex rounded-lg border justify-between border-gray-200 p-1! bg-gray-50'>
              <button
                onClick={() => setStatusFilter('all')}
                className={cn(
                  'px-3! py-0.5! text-sm font-medium rounded-md transition-all',
                  statusFilter === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('credit')}
                className={cn(
                  'px-3! py-2! text-sm font-medium rounded-md transition-all',
                  statusFilter === 'credit'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
                title="Income"
              >
                <BanknoteArrowUp className="h-4 w-4 text-green-600 md:hidden" />
                <p className="hidden md:block">Income</p>
              </button>
              <button
                onClick={() => setStatusFilter('debit')}
                className={cn(
                  'px-3! py-2! text-sm font-medium rounded-md transition-all',
                  statusFilter === 'debit'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <BanknoteArrowDown className="h-4 w-4 text-red-600 md:hidden" />
                <p className="hidden md:block">Expense</p>
              </button>
            </div>
          </div>

          <div className='space-y-3 hidden items-center justify-center mx-auto flex-col md:inline-flex rounded-lg border border-gray-200 p-1! bg-gray-50'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 text-sm font-medium'>
                <span className='px-1! py-1! bg-blue-50 text-blue-700 text-6 rounded-md'>
                  ${amountRange[0].toFixed(2)}
                </span>
                <span className='text-gray-400'>-</span>
                <span className='px-1! py-1! bg-blue-50 text-blue-700 text-6 rounded-md'>
                  ${amountRange[1].toFixed(2)}
                </span>
              </div>
            </div>
            
            <Slider
              value={amountRange}
              onValueChange={(v) => { setAmountTouched(true); setAmountRange(v); }} //* mark slider as touched so the amount filter activates
              max={maxAmount}
              step={10}
              className="w-full max-w-[150px] mt-2!"
            />
          </div>

          {/* Export Button */}
          <button 
            onClick={handleExportCSV}
            className='flex items-center gap-2 rounded-lg border border-gray-300 px-2! py-1! font-semibold text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap w-full'
          >
            <Download className="h-4 w-4" />
            Export<span className="font-bold hidden md:block">CSV</span>
          </button>
        </div>
      </div>
    </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing
          <span className="font-semibold">
            {filteredTransactions.length}
          </span> of{' '}
          <span className="font-semibold">
            {transactions.length}
          </span> transactions
        </p>
        
        {(searchQuery || categoryFilter !== 'all' || timeFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('')
              setCategoryFilter('all')
              setTimeFilter('all')
              setStatusFilter('all')
              setAmountTouched(false) //* clearing filters should also reset the amount filter
              setAmountRange([0, maxAmount])
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Transactions Table */}
      <section className="flex w-full flex-col gap-6">
        {filteredTransactions.length > 0 ? (
          <TransactionsTable 
            transactions={filteredTransactions}
            variant="full"
            rows={8}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500 text-lg">No transactions found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default TransactionHistoryClient