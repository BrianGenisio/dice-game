import { DocumentReference, doc, setDoc, updateDoc, FirestoreDataConverter, arrayUnion, getDoc } from 'firebase/firestore';
import { getDb } from '../firebaseConfig';
import { v4 as uuidv4 } from 'uuid';

// Constants
const GAMES_COLLECTION = 'games';
const DICE_SIDES = 6;
const INITIAL_DICE_VALUE = 1;
const ROLL_DELAY_MS = 1000;

// Player Interface
export interface Player {
  uid: string;
  name: string;
  score: number;
}

// GameState Interface
export interface GameState {
  diceValues: number[];
  currentPlayer: number;
  rolling: boolean;
  scoreGoal: number;
  maxPlayers: number; // Maximum number of players
  players: Player[]; // Actual players
  state: 'waiting' | 'inProgress' | 'gameOver';
}

export const getUserId = (): string => {
  const localStorageKey = 'userId';
  let userId = localStorage.getItem(localStorageKey);

  if (!userId) {
    userId = uuidv4();
    localStorage.setItem(localStorageKey, userId);
  }

  return userId;
};

export const isCurrentUserInGame = (players: Player[]): boolean => {
  const currentUserId = getUserId();
  return players.some(player => player.uid === currentUserId);
};

// Add functions to manage players and start the game
export const addPlayer = async (gameDocRef: any, playerName: string) => {
  const gameSnapshot = await getDoc(gameDocRef);
  const gameState = gameSnapshot.data() as GameState;

  if (gameState.players.length >= gameState.maxPlayers) {
    throw new Error('Maximum number of players reached');
  }

  const userId = getUserId();
  if (isCurrentUserInGame(gameState.players)) {
    throw new Error('User is already in the game');
  }

  const newPlayer: Player = { uid: userId, name: playerName, score: 0 };
  await updateDoc(gameDocRef, {
    players: arrayUnion(newPlayer),
  });
};

export const startGame = async (gameDocRef: any) => {
  await updateDoc(gameDocRef, {
    state: 'inProgress'
  });
};

// Create a new game
export const createGame = async (maxPlayers: number, scoreGoal: number): Promise<string> => {
  const gameId = uuidv4().split('-')[0]; // Shorten the UUID
  const gameDocRef = doc(getDb(), GAMES_COLLECTION, gameId);
  const initialPlayers: Player[] = [];
  const initialState: GameState = {
    diceValues: Array(DICE_SIDES).fill(INITIAL_DICE_VALUE),
    currentPlayer: 1,
    rolling: false,
    scoreGoal,
    maxPlayers,
    players: initialPlayers,
    state: 'waiting',
  };
  await setDoc(gameDocRef, initialState);
  return gameId;
};

// Firestore data converter for GameState
export const gameStateConverter: FirestoreDataConverter<GameState> = {
  toFirestore: (gameState: GameState) => gameState,
  fromFirestore: (snapshot) => snapshot.data() as GameState,
};

// Get game document reference
export const getGameDocRef = (gameId: string | undefined): DocumentReference<GameState> | null => {
  if (!gameId) return null;
  return doc(getDb(), GAMES_COLLECTION, gameId).withConverter(gameStateConverter);
};

// Roll dice values
const rollDiceValues = (): number[] => Array.from({ length: DICE_SIDES }, () => Math.floor(Math.random() * DICE_SIDES) + 1);

// Calculate new scores
const calculateNewScores = (gameState: GameState, newValues: number[]): Player[] => {
  const newPlayers = [...gameState.players];
  const totalNewValue = newValues.reduce((acc, value) => acc + value, 0);
  newPlayers[gameState.currentPlayer - 1].score += totalNewValue;
  return newPlayers;
};

// Determine next player
const determineNextPlayer = (gameState: GameState, newGameOver: boolean): number => {
  return newGameOver ? gameState.currentPlayer : (gameState.currentPlayer % gameState.players.length) + 1;
};

// Roll dice
export const rollDice = async (gameState: GameState, gameDocRef: DocumentReference<GameState>): Promise<void> => {
  const currentUserId = getUserId();
  const currentPlayerId = gameState.players[gameState.currentPlayer - 1].uid;

  if (currentUserId !== currentPlayerId) {
    throw new Error('It is not your turn to roll the dice');
  }

  if (gameState.state === 'gameOver' || gameState.rolling) return;

  await setDoc(gameDocRef, { ...gameState, rolling: true });

  setTimeout(async () => {
    const newValues = rollDiceValues();
    const newPlayers = calculateNewScores(gameState, newValues);
    const newGameOver = newPlayers[gameState.currentPlayer - 1].score >= gameState.scoreGoal;
    const newCurrentPlayer = determineNextPlayer(gameState, newGameOver);

    await setDoc(gameDocRef, {
      ...gameState,
      diceValues: newValues,
      players: newPlayers,
      rolling: false,
      currentPlayer: newCurrentPlayer,
      state: newGameOver ? 'gameOver' : 'inProgress',
    });
  }, ROLL_DELAY_MS);
};
