import { DocumentReference, doc, setDoc, FirestoreDataConverter } from 'firebase/firestore';
import { db } from '../firebaseConfig';
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
  gameOver: boolean;
  rolling: boolean;
  scoreGoal: number;
  numberOfPlayers: number;
}

// Create a new game
export const createGame = async (numberOfPlayers: number, scoreGoal: number): Promise<string> => {
  const gameId = uuidv4().split('-')[0]; // Shorten the UUID
  const gameDocRef = doc(db, GAMES_COLLECTION, gameId);
  const initialScores = Array(numberOfPlayers).fill(0);
  const initialState: GameState = {
    diceValues: Array(DICE_SIDES).fill(INITIAL_DICE_VALUE),
    currentPlayer: 1,
    scores: initialScores,
    gameOver: false,
    rolling: false,
    scoreGoal,
    numberOfPlayers,
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
  return doc(db, GAMES_COLLECTION, gameId).withConverter(gameStateConverter);
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
  return newGameOver ? gameState.currentPlayer : (gameState.currentPlayer % gameState.numberOfPlayers) + 1;
};

// Roll dice
export const rollDice = async (gameState: GameState, gameDocRef: DocumentReference<GameState>): Promise<void> => {
  if (gameState.gameOver || gameState.rolling) return;

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
      gameOver: newGameOver,
      rolling: false,
      currentPlayer: newCurrentPlayer,
    });
  }, ROLL_DELAY_MS);
};
