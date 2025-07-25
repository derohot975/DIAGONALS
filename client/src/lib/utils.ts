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
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
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
