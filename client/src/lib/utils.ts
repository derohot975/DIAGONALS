import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Wine, Vote } from '@shared/schema';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const formatted = date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  // Trova il mese nella stringa e converti la prima lettera in maiuscola
  const parts = formatted.split(' ');
  if (parts.length >= 2) {
    // Il mese è la seconda parte (indice 1)
    const month = parts[1];
    parts[1] = month.charAt(0).toUpperCase() + month.slice(1);
  }
  
  return parts.join(' ');
}

export function formatPrice(price: string): string {
  return `€${parseFloat(price).toFixed(2)}`;
}

export function calculateProgress(wines: Wine[], votes: Vote[]): number {
  if (wines.length === 0) return 0;
  
  const totalPossibleVotes = wines.length;
  const actualVotes = votes.length;
  
  return Math.round((actualVotes / totalPossibleVotes) * 100);
}
