import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format token balance to readable string
export function formatBalance(balance: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const wholePart = balance / divisor;
  const fractionalPart = balance % divisor;

  if (fractionalPart === BigInt(0)) {
    return wholePart.toString();
  }

  const fractionalString = fractionalPart.toString().padStart(decimals, "0");
  const trimmedFractional = fractionalString.replace(/\.?0+$/, "");

  return `${wholePart}.${trimmedFractional}`;
}

// Format USD value
export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format token balance for display in a compact, readable way
 * - Numbers >= 1: Limit to 4 decimal places max
 * - Numbers < 1: Show up to 6 significant digits, compact notation for very small numbers
 * - Handles very small numbers (like 0.000000541) efficiently
 * - Prevents UI breaking on small screens
 */
export function formatCompactBalance(balance: string): string {
  const num = parseFloat(balance);

  // Handle invalid numbers
  if (isNaN(num) || !isFinite(num)) {
    return balance;
  }

  // Handle zero
  if (num === 0) {
    return "0";
  }

  // For numbers >= 1, limit decimal places to 4
  if (num >= 1) {
    const decimalPart = balance.split(".")[1];
    if (!decimalPart) {
      return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
    }

    // Limit to 4 decimal places for numbers >= 1
    const rounded = Math.round(num * 10000) / 10000;
    if (rounded === Math.floor(rounded)) {
      return rounded.toLocaleString("en-US", { maximumFractionDigits: 0 });
    }
    return rounded.toLocaleString("en-US", {
      maximumFractionDigits: 4,
      minimumFractionDigits: 0,
    });
  }

  // For numbers < 1
  const balanceStr = balance.toString();

  // Check if it's a very small number (starts with 0.000...)
  const match = balanceStr.match(/^0\.(0+)([1-9]\d*)/);

  if (match) {
    const leadingZeros = match[1].length;
    const significantDigits = match[2];

    // If 4 or more leading zeros, use compact notation for better readability
    if (leadingZeros >= 4) {
      // Show first 4-6 significant digits with compact notation
      const digitsToShow = significantDigits.slice(0, 6);
      return `0.(${leadingZeros})${digitsToShow}`;
    } else {
      // Show as normal decimal with up to 6 digits total (leading zeros + significant)
      const totalDigits = leadingZeros + Math.min(significantDigits.length, 6);
      const formatted = num.toFixed(totalDigits).replace(/\.?0+$/, "");
      // Ensure it doesn't exceed reasonable length
      if (formatted.length > 12) {
        const digitsToShow = significantDigits.slice(0, 6);
        return `0(${leadingZeros})${digitsToShow}`;
      }
      return formatted;
    }
  }

  // For regular small numbers (< 1 but starts with non-zero digit after decimal)
  // Show up to 6 digits after decimal point
  const formatted = num.toFixed(6).replace(/\.?0+$/, "");

  // If still too long, truncate to 12 characters max
  if (formatted.length > 12) {
    return formatted.slice(0, 12) + "...";
  }

  return formatted;
}
