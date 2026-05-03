// Shared utility functions

export const formatEventName = (eventName: string): string => {
  return eventName.toUpperCase();
};

export const formatEventDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('it-IT', { month: 'long' });
  const year = date.getFullYear();

  // Capitalize first letter of month
  const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1);

  return `${day} ${formattedMonth} ${year}`;
};

export const formatPrice = (price: number) => {
  return `€${price.toFixed(2)}`;
};

export const isLoadingState = (usersLoading: boolean, eventsLoading: boolean) => {
  return usersLoading || eventsLoading;
};
