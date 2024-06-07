import { DocumentReference, doc, setDoc, updateDoc, FirestoreDataConverter, arrayUnion, getDoc } from 'firebase/firestore';
import { getDb } from '../firebaseConfig';
import { v4 as uuidv4 } from 'uuid';

// Constants
const GAMES_COLLECTION = 'games';
const DICE_SIDES = 6;
const INITIAL_DICE_VALUE = 1;
const ROLL_DELAY_MS = 1000;

// GameState Interface
export interface GameState {
  diceValues: number[];
  currentPlayer: number;
  scores: number[];
  rolling: boolean;
  scoreGoal: number;
  maxPlayers: number; // Maximum number of players
  players: string[]; // Actual players
  state: 'waiting' | 'inProgress' | 'gameOver';
}

// Add functions to manage players and start the game
export const addPlayer = async (gameDocRef: any, playerName: string) => {
  const gameSnapshot = await getDoc(gameDocRef);
  const gameState = gameSnapshot.data() as GameState;

  if (gameState.players.length >= gameState.maxPlayers) {
    throw new Error('Maximum number of players reached');
  }

  await updateDoc(gameDocRef, {
    players: arrayUnion(playerName),
    scores: arrayUnion(0),
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
  const initialScores = Array(maxPlayers).fill(0);
  const initialState: GameState = {
    diceValues: Array(DICE_SIDES).fill(INITIAL_DICE_VALUE),
    currentPlayer: 1,
    scores: initialScores,
    rolling: false,
    scoreGoal,
    maxPlayers,
    players: [], // Start with an empty array of players
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
const calculateNewScores = (gameState: GameState, newValues: number[]): number[] => {
  const newScores = [...gameState.scores];
  const totalNewValue = newValues.reduce((acc, value) => acc + value, 0);
  newScores[gameState.currentPlayer - 1] += totalNewValue;
  return newScores;
};

// Determine next player
const determineNextPlayer = (gameState: GameState, newGameOver: boolean): number => {
  return newGameOver ? gameState.currentPlayer : (gameState.currentPlayer % gameState.maxPlayers) + 1;
};

// Roll dice
export const rollDice = async (gameState: GameState, gameDocRef: DocumentReference<GameState>): Promise<void> => {
  if (gameState.state === 'gameOver' || gameState.rolling) return;

  await setDoc(gameDocRef, { ...gameState, rolling: true });

  setTimeout(async () => {
    const newValues = rollDiceValues();
    const newScores = calculateNewScores(gameState, newValues);
    const newGameOver = newScores[gameState.currentPlayer - 1] >= gameState.scoreGoal;
    const newCurrentPlayer = determineNextPlayer(gameState, newGameOver);

    await setDoc(gameDocRef, {
      ...gameState,
      diceValues: newValues,
      scores: newScores,
      rolling: false,
      currentPlayer: newCurrentPlayer,
      state: newGameOver ? 'gameOver' : 'inProgress',
    });
  }, ROLL_DELAY_MS);
};
