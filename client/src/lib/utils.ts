// Shared utility functions
export const getCreatorName = (createdBy: number, users: Array<{id: number, name: string}>) => {
  const user = users.find(u => u.id === createdBy);
  return user?.name || 'Unknown';
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