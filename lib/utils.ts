/* eslint-disable no-prototype-builtins */
import { type ClassValue, clsx } from "clsx";
import qs from "query-string";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertTimestamps(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  if (obj._seconds !== undefined && obj._nanoseconds !== undefined) {
    return new Date(obj._seconds * 1000 + obj._nanoseconds / 1000000).toISOString();
  }

  const newObj: any = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    newObj[key] = convertTimestamps(obj[key]);
  }
  return newObj;
}

export const inferCategoryFromName = (name: string): string => {
  const lowerName = name.toLowerCase();

  // Define keyword maps for standard Plaid/Bank categories
  if (lowerName.match(/uber|lyft|delta|airlines|amtrak|mta|transit/)) return "Travel";
  if (lowerName.match(/mcdonalds|starbucks|doordash|grubhub|chipotle|subway|wendys/)) return "Food and Drink";
  if (lowerName.match(/amazon|walmart|target|costco|cvs|walgreens/)) return "Shopping";
  if (lowerName.match(/netflix|spotify|hulu|apple|disney|playstation|xbox/)) return "Entertainment";
  if (lowerName.match(/zelle|venmo|cash app|paypal|transfer/)) return "Transfer";
  if (lowerName.match(/chevron|shell|exxon|bp|mobil|gas/)) return "Travel"; // Or "Auto"
  if (lowerName.match(/planet fitness|gym|equinox/)) return "Personal Care";

  // Default fallback if no keywords match
  return "Miscellaneous";
};

// FORMAT DATE TIME
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const dateDayOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    year: "numeric", // numeric year (e.g., '2023')
    month: "2-digit", // abbreviated month name (e.g., 'Oct')
    day: "2-digit", // numeric day of the month (e.g., '25')
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-US",
    dateTimeOptions
  );

  const formattedDateDay: string = new Date(dateString).toLocaleString(
    "en-US",
    dateDayOptions
  );

  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-US",
    dateOptions
  );

  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-US",
    timeOptions
  );

  return {
    dateTime: formattedDateTime,
    dateDay: formattedDateDay,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

// export function formatAmount(amount: number): string {
//   const formatter = new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "USD",
//     minimumFractionDigits: 2,
//   });

//   return formatter.format(amount);
// }

export const parseStringify = (value: any) => JSON.parse(JSON.stringify(value));

export const removeSpecialCharacters = (value: string) => {
  return value.replace(/[^\w\s]/gi, "");
};

interface UrlQueryParams {
  params: string;
  key: string;
  value: string;
}

export function formUrlQuery({ params, key, value }: UrlQueryParams) {
  const currentUrl = qs.parse(params);

  currentUrl[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}

export function getAccountTypeColors(type: AccountTypes) {
  switch (type) {
    case "depository":
      return {
        bg: "bg-blue-25",
        lightBg: "bg-blue-100",
        title: "text-blue-900",
        subText: "text-blue-700",
      };

    case "credit":
      return {
        bg: "bg-success-25",
        lightBg: "bg-success-100",
        title: "text-success-900",
        subText: "text-success-700",
      };

    default:
      return {
        bg: "bg-green-25",
        lightBg: "bg-green-100",
        title: "text-green-900",
        subText: "text-green-700",
      };
  }
}

export function countTransactionCategories(
  transactions: Transaction[]
): CategoryCount[] {
  const categoryCounts: { [category: string]: number } = {};
  let totalCount = 0;

  // Iterate over each transaction
  transactions &&
    transactions.forEach((transaction) => {
      // Extract the category from the transaction
      const category = transaction.category;

      // If the category exists in the categoryCounts object, increment its count
      if (categoryCounts.hasOwnProperty(category)) {
        categoryCounts[category]++;
      } else {
        // Otherwise, initialize the count to 1
        categoryCounts[category] = 1;
      }

      // Increment total count
      totalCount++;
    });

  // Convert the categoryCounts object to an array of objects
  const aggregatedCategories: CategoryCount[] = Object.keys(categoryCounts).map(
    (category) => ({
      name: category,
      count: categoryCounts[category],
      totalCount,
    })
  );

  // Sort the aggregatedCategories array by count in descending order
  aggregatedCategories.sort((a, b) => b.count - a.count);

  return aggregatedCategories;
}

export function extractCustomerIdFromUrl(url: string) {
  // Split the URL string by '/'
  const parts = url.split("/");

  // Extract the last part, which represents the customer ID
  const customerId = parts[parts.length - 1];

  return customerId;
}

export function encryptId(id: string) {
  return btoa(id);
}

export function decryptId(id: string) {
  return atob(id);
}

export const getTransactionStatus = (
  date: Date,
  config: TransactionStatusConfig = {}
): string => {
  // Default configuration
  const {
    processingDays = 2,
    statusProcessing = "Processing",
    statusCompleted = "Success",
    useBusinessDays = false,
    timezone = "UTC",
    normalizeToDate = true
  } = config;

  // Helper: Check if a date is a weekend
  const isWeekend = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  // Helper: Normalize date to start of day (removes time component)
  const normalizeDate = (date: Date, tz: string): Date => {
    if (!normalizeToDate) return new Date(date);
    
    if (tz === "UTC") {
      const normalized = new Date(date);
      normalized.setUTCHours(0, 0, 0, 0);
      return normalized;
    }
    
    // For timezone-aware normalization
    const normalized = new Date(date.toLocaleString("en-US", { timeZone: tz }));
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  // Helper: Calculate cutoff date with business days support
  const getCutoffDate = (now: Date): Date => {
    if (!useBusinessDays) {
      const cutoff = new Date(now);
      cutoff.setDate(now.getDate() - processingDays);
      return normalizeDate(cutoff, timezone);
    }

    // Business days calculation (excludes weekends)
    const cutoff = new Date(now);
    let businessDaysCounted = 0;
    
    while (businessDaysCounted < processingDays) {
      cutoff.setDate(cutoff.getDate() - 1);
      if (!isWeekend(cutoff)) {
        businessDaysCounted++;
      }
    }
    
    return normalizeDate(cutoff, timezone);
  };

  // Main logic
  const now = new Date();
  const cutoffDate = getCutoffDate(now);
  const transactionDate = normalizeDate(date, timezone);

  // Determine status with explicit comparison
  if (transactionDate > cutoffDate) {
    return statusProcessing;
  }
  
  if (transactionDate <= cutoffDate) {
    return statusCompleted;
  }
  
  // Fallback for edge cases (should never reach here)
  return "Pending";
};

export function formatAmount(
  amount: number | string | bigint | null | undefined,
  config: FormatAmountConfig = {}
): string {
  // ========== DEFAULTS ==========
  const {
    // Currency defaults
    currency = "USD",
    currencyDisplay = "symbol",
    
    // Number defaults
    locale = "en-US",
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    minimumIntegerDigits = 1,
    minimumSignificantDigits,
    maximumSignificantDigits,
    
    // Style defaults
    style = "currency",
    unit = "meter",
    unitDisplay = "short",
    
    // Notation defaults
    notation = "standard",
    compactDisplay = "short",
    
    // Sign defaults
    signDisplay = "auto",
    roundingMode = "halfExpand",
    roundingPriority = "auto",
    
    // Input handling defaults
    handleCents = false,
    handlePercent = false,
    fallbackValue = "0",
    
    // Special formatting defaults
    showZeroAsDash = false,
    hideCurrencySymbol = false,
    addSpacing = false,
    useGrouping = true
  } = config;

  // ========== HELPER FUNCTIONS ==========
  
  // Parse various input types
  const parseAmount = (input: unknown): number | null => {
    if (input === null || input === undefined) return null;
    
    let num: number;
    
    if (typeof input === "bigint") {
      num = Number(input);
    } else if (typeof input === "string") {
      // Remove currency symbols, commas, spaces and convert
      const clean = input.replace(/[^0-9.-]/g, "");
      num = parseFloat(clean);
    } else if (typeof input === "number") {
      num = input;
    } else {
      return null;
    }
    
    if (isNaN(num) || !isFinite(num)) return null;
    
    return num;
  };
  
  // Handle cents conversion (e.g., 12345 cents -> $123.45)
  const adjustForCents = (value: number): number => {
    return handleCents ? value / 100 : value;
  };
  
  // Handle percent conversion (e.g., 0.45 -> 45%)
  const adjustForPercent = (value: number): number => {
    return handlePercent ? value * 100 : value;
  };
  
  // Apply rounding based on mode
  const applyRounding = (value: number): number => {
    const factor = Math.pow(10, maximumFractionDigits);
    let rounded: number;
    
    switch (roundingMode) {
      case "ceil":
        rounded = Math.ceil(value * factor) / factor;
        break;
      case "floor":
        rounded = Math.floor(value * factor) / factor;
        break;
      case "trunc":
        rounded = Math.trunc(value * factor) / factor;
        break;
      case "halfCeil":
        rounded = Math.round(value * factor) / factor;
        break;
      case "halfFloor":
        rounded = Math.round(value * factor) / factor;
        break;
      case "halfEven":
        rounded = Math.round(value * factor) / factor;
        break;
      case "halfExpand":
        rounded = Math.round(value * factor) / factor;
        break;
      case "expand":
        rounded = value;
        break;
      default:
        rounded = Math.round(value * factor) / factor;
    }
    
    return rounded;
  };
  
  // Handle special case: zero as dash
  const formatAsDash = (value: number, formatted: string): string => {
    if (showZeroAsDash && Math.abs(value) < 0.0001) {
      return addSpacing ? "—" : "—";
    }
    return formatted;
  };
  
  // Apply spacing and symbol hiding
  const applyFinalFormatting = (formatted: string): string => {
    let result = formatted;
    
    if (hideCurrencySymbol && style === "currency") {
      result = result.replace(/[$€£¥₹₽₩₪₫₦₴₸₺₼₿]/g, "").trim();
    }
    
    if (addSpacing && style === "currency" && !hideCurrencySymbol) {
      result = result.replace(/([$€£¥₹₽₩₪₫₦₴₸₺₼₿])/, "$1 ");
    }
    
    return result;
  };
  
  // ========== MAIN LOGIC ==========
  
  // Parse and validate input
  let parsedAmount = parseAmount(amount);
  if (parsedAmount === null) {
    return fallbackValue;
  }
  
  // Apply conversions
  parsedAmount = adjustForCents(parsedAmount);
  parsedAmount = adjustForPercent(parsedAmount);
  parsedAmount = applyRounding(parsedAmount);
  
  // Build formatter options
  const formatterOptions: Intl.NumberFormatOptions = {
    style,
    notation,
    signDisplay,
    roundingMode: roundingMode as Intl.NumberFormatOptions["roundingMode"],
    roundingPriority: roundingPriority as Intl.NumberFormatOptions["roundingPriority"],
    useGrouping,
    minimumIntegerDigits: minimumIntegerDigits,
    minimumFractionDigits,
    maximumFractionDigits
  };
  
  // Add style-specific options
  if (style === "currency") {
    formatterOptions.currency = currency;
    formatterOptions.currencyDisplay = currencyDisplay as Intl.NumberFormatOptions["currencyDisplay"];
  }
  
  if (style === "unit") {
    formatterOptions.unit = unit;
    formatterOptions.unitDisplay = unitDisplay as Intl.NumberFormatOptions["unitDisplay"];
  }
  
  // Add significant digits if specified
  if (minimumSignificantDigits !== undefined) {
    formatterOptions.minimumSignificantDigits = minimumSignificantDigits;
  }
  if (maximumSignificantDigits !== undefined) {
    formatterOptions.maximumSignificantDigits = maximumSignificantDigits;
  }
  
  // Add compact display for compact notation
  if (notation === "compact") {
    formatterOptions.compactDisplay = compactDisplay;
  }
  
  // Format the amount
  try {
    const formatter = new Intl.NumberFormat(locale, formatterOptions);
    let formatted = formatter.format(parsedAmount);
    
    formatted = formatAsDash(parsedAmount, formatted);
    formatted = applyFinalFormatting(formatted);
    
    return formatted;
  } catch (error) {
    console.error("Amount formatting error:", error);
    return fallbackValue;
  }
}