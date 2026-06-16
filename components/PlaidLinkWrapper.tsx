// components/PlaidLinkWrapper.tsx  (NO 'use client' — Server Component)
import PlaidLink from './PlaidLink'
import { exchangePublicToken } from '@/lib/user2.actions'

const PlaidLinkWrapper = ({ user, variant }: { user: User, variant: 'primary' | 'ghost' }) => {
  return (
    <PlaidLink
      user={user}
      variant={variant}
      onExchangeToken={exchangePublicToken}  // passed from server
    />
  )
}

export default PlaidLinkWrapper