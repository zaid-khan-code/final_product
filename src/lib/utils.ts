import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPKR(amount: number): string {
  return 'PKR ' + (amount || 0).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function numberToWords(n: number): string {
  if (n === 0) return 'Zero';
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const num = Math.floor(Math.abs(n));
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? ' ' + ones[num%10] : '');
  if (num < 1000) return ones[Math.floor(num/100)] + ' hundred' + (num%100 ? ' and ' + numberToWords(num%100) : '');
  if (num < 100000) return numberToWords(Math.floor(num/1000)) + ' thousand' + (num%1000 ? ' ' + numberToWords(num%1000) : '');
  if (num < 10000000) return numberToWords(Math.floor(num/100000)) + ' lakh' + (num%100000 ? ' ' + numberToWords(num%100000) : '');
  return numberToWords(Math.floor(num/10000000)) + ' crore' + (num%10000000 ? ' ' + numberToWords(num%10000000) : '');
}

export function getStatusColor(status: string): string {
  if (!status) return 'pill-steel';
  const s = status.toLowerCase();
  if (['present', 'active', 'approved', 'finalized'].includes(s)) return 'pill-green';
  if (['late', 'pending', 'probation', 'draft', 'notice period'].includes(s)) return 'pill-amber';
  if (['absent', 'rejected', 'terminated', 'inactive', 'fired'].includes(s)) return 'pill-red';
  if (['on leave', 'info'].includes(s)) return 'pill-blue';
  return 'pill-steel';
}
