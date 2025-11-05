// User-related handlers - functions that manage user operations
// These handlers wrap domain mutations and maintain exact same behavior

import { UseMutationResult } from '@tanstack/react-query';

interface UserMutationParams {
  name: string;
  isAdmin: boolean;
}

interface UserHandlerDependencies {
  createUserMutation: UseMutationResult<any, Error, UserMutationParams, unknown>;
}

export const addUser = (
  deps: UserHandlerDependencies,
  name: string,
  isAdmin: boolean
) => {
  deps.createUserMutation.mutate({ name, isAdmin });
};
