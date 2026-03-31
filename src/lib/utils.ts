/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  return 'http://localhost:3000'
}


export function cleanPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    cleaned = `1${cleaned}`;
  }
  return cleaned;
}

// Formats a stored phone number for display in US format: (407) 555-1234
// Handles DB values like "14075551234" (11 digits) or "4075551234" (10 digits)
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');
  // Strip leading country code "1" if 11 digits
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.substring(1);
  }
  if (digits.length !== 10) return phone; // can't format, return as-is
  return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
}
