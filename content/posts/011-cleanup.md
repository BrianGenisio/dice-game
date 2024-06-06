+++
title = "Cleanup and Refactor"
date = 2024-06-05T20:31:24-04:00
draft = false
+++

Before I move on, I'd like to extract most of the document creation and management code into the model file and out of the React view code.  I won't go through all the details, but it included some request like:

```
Extract createGame, except for the navigate call,
into the GameState model file.
```

```
Can most of the rollDice function be extracted into
the GameState model file?
```

```
I think the details about how to construct a gameDocRef can
also be extracted into the GameState model file?
```

## Cleanup
Now that I have all this code moved into the model file, I can clean it up a bit.

```
Can we clean this code up?
```

And now I have a model file with all of the relavent details

**GameState.tsx**
```tsx
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
```

I used this same method to clean up the rest of the files and I like [how it all looks](https://github.com/pass-the-cheese/passthecheese.ai/commit/947b4550c9b27cc33b5e99d1e4e16ea8da4122e0).  I'm particularly impressed that it all still works!