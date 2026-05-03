import { User } from '@shared/schema';

export const usePagellaPermissions = (currentUser: User | null) => {
  // Determina se l'utente può editare (solo DERO e TOMMY)
  const canEdit = Boolean(
    currentUser && ['DERO', 'TOMMY'].includes(currentUser.name.toUpperCase())
  );

  return { canEdit };
};
