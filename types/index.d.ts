/* eslint-disable no-unused-vars */

declare type SearchParamProps = {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// ========================================

declare type SignUpParams = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  dateofbirth: string;
  SSN: string;
  email: string;
  password: string;
};

declare type LoginUser = {
  email: string;
  password: string;
};

declare type User = {
  uid: string;
  email: string;
  userId: string;
  dwollaCustomerUrl: string;
  dwollaCustomerId: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  dateofbirth: string;
  SSN: string;
};

declare type NewUserParams = {
  userId: string;
  email: string;
  name: string;
  password: string;
};

declare type Account = {
  id: string;
  availableBalance: number;
  currentBalance: number;
  officialName: string;
  mask: string;
  institutionId: string;
  name: string;
  type: string;
  subtype: string;
  firebaseItemId: string;
  sharableId: string;
};

// 1. Define the dependent types first
declare type FirebaseTimestamp = {
  _seconds: number;
  seconds?: number;
  nanoseconds?: number;
  toDate: () => Date;
};

// 2. Define the main type, grouped logically
declare type Transaction = {
  // Identifiers
  id: string;
  accountId?: string;
  senderBankId: string;
  receiverBankId: string;

  // Financial Details
  amount: number;
  type: string; // e.g., 'debit' or 'credit'
  pending?: boolean;
  
  // Transaction Metadata
  name: string;
  category: string;
  paymentChannel: string;
  channel: string; // Note: You might want to combine this with paymentChannel if they do the same thing!
  image?: string;
  
  // Dates
  date: string; // The formatted ISO string for the frontend
  createdAt?: FirebaseTimestamp; // The raw database timestamp
};

declare type Bank = {
  uid: string;
  accountId: string;
  bankId: string;
  accessToken: string;
  fundingSourceUrl: string;
  userId: string;
  sharableId: string;
  accountNumber?: string;
  availableBalance?: number;
};

declare type AccountTypes =
  | "depository"
  | "credit"
  | "loan "
  | "investment"
  | "other";

declare type Category = "Food and Drink" | "Travel" | "Transfer";

declare type CategoryCount = {
  name: string;
  count: number;
  totalCount: number;
};

declare type Receiver = {
  firstName: string;
  lastName: string;
};

declare type TransferParams = {
  sourceFundingSourceUrl: string;
  destinationFundingSourceUrl: string;
  amount: string;
};

declare type AddFundingSourceParams = {
  dwollaCustomerId: string;
  processorToken: string;
  bankName: string;
};

declare type NewDwollaCustomerParams = {
  firstName?: string;
  lastName?: string;
  email: string;
  type: string;
  address1: string;
  city: string;
  state: string;
  postalCode: string;
  dateOfBirth: string;
  ssn: string;
};

declare interface CreditCardProps {
  key: string;
  account: Account;
  userName: string;
  showBalance?: boolean;
}

declare interface BankInfoProps {
  account: Account;
  firebaseItemId?: string;
  type: "full" | "card";
}

declare interface HeaderBoxProps {
  type?: "title" | "greeting";
  title: string;
  subText: string;
  user?: string;
}

declare interface MobileNavProps {
  user: User;
}

declare interface PageHeaderProps {
  topTitle: string;
  bottomTitle: string;
  topDescription: string;
  bottomDescription: string;
  connectBank?: boolean;
}

declare interface PaginationProps {
  page: number;
  totalPages: number;
}

declare interface PlaidLinkProps {
  user: User;
  variant?: "primary" | "ghost";
  dwollaCustomerId?: string;
  onExchangeToken: (props: exchangePublicTokenProps) => Promise<any>;
}

// declare type User = sdk.Models.Document & {
//   accountId: string;
//   email: string;
//   name: string;
//   items: string[];
//   accessToken: string;
//   image: string;
// };

declare interface AuthFormProps {
  type: "sign-in" | "sign-up";
}

declare interface BankDropdownProps {
  accounts: Account[];
  setValue?: UseFormSetValue<any>;
  otherStyles?: string;
}

declare interface BankTabItemProps {
  account: Account;
  firebaseItemId?: string;
}

declare interface TotlaBalanceBoxProps {
  accounts: Account[];
  totalBanks: number;
  totalCurrentBalance: number;
}

declare interface FooterProps {
  user: User;
}

declare interface RightSidebarProps {
  user: User;
  transactions: Transaction[];
  banks: Bank[] & Account[];
}

declare interface SiderbarProps {
  user: User;
}

declare interface RecentTransactionsProps {
  accounts: Account[];
  transactions: Transaction[];
  firebaseItemId: string;
  page: number;
}

declare interface TransactionHistoryTableProps {
  transactions: Transaction[];
  page: number;
}

declare interface CategoryBadgeProps {
  category: string;
  color?: string;
}

declare interface TransactionTableProps {
  transactions: Transaction[];
}

declare interface CategoryProps {
  category: CategoryCount;
}

declare interface DoughnutChartProps {
  accounts: Account[];
}

declare interface PaymentTransferFormProps {
  accounts: Account[];
}

// Actions
declare interface getAccountsProps {
  userId: string;
}

declare interface getAccountProps {
  firebaseItemId: string;
}

declare interface getInstitutionProps {
  institutionId: string;
}

declare interface getTransactionsProps {
  accessToken: string;
}

declare interface CreateFundingSourceOptions {
  customerId: string; // Dwolla Customer ID
  fundingSourceName: string; // Dwolla Funding Source Name
  plaidToken: string; // Plaid Account Processor Token
  _links: object; // Dwolla On Demand Authorization Link
}

declare interface CreateTransactionProps {
  name: string;
  amount: string;
  senderId: string;
  senderBankId: string;
  receiverId: string;
  receiverBankId: string;
  email: string;
}

declare interface getTransactionsByBankIdProps {
  bankId: string;
}

declare interface signInProps {
  email: string;
  password: string;
}

declare interface getUserInfoProps {
  userId: string;
}

declare interface exchangePublicTokenProps {
  publicToken: string;
  user: User;
}

declare interface createBankAccountProps {
  accessToken: string;
  userId: string;
  accountId: string;
  bankId: string;
  fundingSourceUrl: string;
  sharableId: string;
}

declare interface getBanksProps {
  userId: string;
}

declare interface getBankProps {
  documentId: string;
}

declare interface UpdateBankBalanceProps {
  userId: string;       // e.g., "o131YotTwFh8eYdp9lVOoAkeeHB2"
  documentId: string;   // e.g., "Cfod7QwMXFOzK9tc9dF5" (uid)
  newBalance: number;
}

declare interface getBankByAccountIdProps {
  accountId: string;
}

declare interface Account {
  id: string,
  availableBalance: number,
  currentBalance: number,
  institutionId: string,
  name: string,
  officialName: string | null, 
  mask: string,
  type: string,
  subtype: string,
  firebaseItemId: string,
  sharableId: string,
}

declare interface TransactionStatusConfig {
  processingDays?: number;
  statusProcessing?: string;
  statusCompleted?: string;
  useBusinessDays?: boolean;
  timezone?: string;
  normalizeToDate?: boolean;
}

declare interface FormatAmountConfig {
  // Currency settings
  currency?: string;
  currencyDisplay?: "symbol" | "code" | "name";
  
  // Number formatting
  locale?: string | string[];
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  minimumIntegerDigits?: number;
  minimumSignificantDigits?: number;
  maximumSignificantDigits?: number;

  // Style types
  style?: "currency" | "decimal" | "percent" | "unit";
  unit?: string;
  unitDisplay?: "short" | "long" | "narrow";

  // Large number handling
  notation?: "standard" | "scientific" | "engineering" | "compact";
  compactDisplay?: "short" | "long";

  // Sign and display
  signDisplay?: "auto" | "never" | "always" | "exceptZero";
  roundingMode?: "ceil" | "floor" | "expand" | "halfCeil" | "halfFloor" | "halfEven" | "halfExpand" | "trunc";
  roundingPriority?: "auto" | "lessPrecision" | "morePrecision";
  
  // Input handling
  handleCents?: boolean;
  handlePercent?: boolean;
  fallbackValue?: string;
  
  // Special formatting
  showZeroAsDash?: boolean;
  hideCurrencySymbol?: boolean;
  addSpacing?: boolean;
  useGrouping?: boolean;
}