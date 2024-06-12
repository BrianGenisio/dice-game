import { v4 as uuidv4 } from 'uuid';

// Player Interface
export interface Player {
  uid: string;
  name: string;
  score: number;
}

// Utility functions
export const getUserId = (): string => {
  const localStorageKey = 'userId';
  let userId = localStorage.getItem(localStorageKey);

  if (!userId) {
    userId = uuidv4();
    localStorage.setItem(localStorageKey, userId);
  }

  return userId;
};