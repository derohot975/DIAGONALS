import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { User } from "@shared/schema"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Shared utility functions
export const getCreatorName = (creatorId: number, users: User[]): string => {
  const creator = users.find(user => user.id === creatorId);
  return creator ? creator.name : 'Sconosciuto';
};

export const formatEventName = (eventName: string): string => {
  return eventName.toUpperCase();
};

export const formatEventDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getWineOwner = (userId: number, users: Array<{id: number, name: string}>) => {
  const user = users.find(u => u.id === userId);
  return user?.name || 'Anonimo';
};

export const calculateProgress = (totalUsers: number, votedUsers: number) => {
  if (totalUsers === 0) return 0;
  return Math.round((votedUsers / totalUsers) * 100);
};

export const formatPrice = (price: number) => {
  return `€${price.toFixed(2)}`;
};

export const isLoadingState = (usersLoading: boolean, eventsLoading: boolean) => {
  return usersLoading || eventsLoading;
};