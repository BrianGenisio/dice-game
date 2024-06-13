import { DocumentReference, doc, FirestoreDataConverter, setDoc, getDoc } from 'firebase/firestore';
import { getDb } from '../firebaseConfig';
import { Player } from "./Player";

// Constants
const GAMES_COLLECTION = 'games';

// GameState Interface
export interface GameState {
  diceValues: number[];
  currentPlayer: number;
  rolling: boolean;
  scoreGoal: number;
  maxPlayers: number;
  players: Player[];
  state: 'waiting' | 'inProgress' | 'gameOver';
  createdBy: string;
  scoringDice: number[];  // New property to track dice set aside for scoring
  turnScore: number;      // New property to track the turn score
}

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

// Function to get GameState by Game ID
export const getGameStateById = async (gameId: string): Promise<GameState | null> => {
  const gameDocRef = getGameDocRef(gameId);
  if (!gameDocRef) return null;

  const gameSnapshot = await getDoc(gameDocRef);
  if (!gameSnapshot.exists()) return null;

  return gameSnapshot.data() as GameState;
};

// Function to save GameState by Game ID
export const saveGameState = async (gameId: string, gameState: GameState): Promise<void> => {
  const gameDocRef = getGameDocRef(gameId);
  if (!gameDocRef) throw new Error('Invalid game ID');

  await setDoc(gameDocRef, gameState);
};