+++
title = "Expanding the Game"
date = 2024-06-13T20:05:24-04:00
draft = false
+++

The next step in the game is to make it more interactive. The player's turn is more stateful.  They make choices. They roll many times.  I'll be honest: I tried a LOT of ways to make this work but every time, the AI kept coding itself into a corner.  The biggest issue is that the model code was inconsistent with how we interact with it.  It included a lot of code related to the actual mechanics of loading and storing data via FireStore.  As such, the AI would make a change to the logic or model but would have no idea how to get the tests passing.  We ran into similar problems like before where it simply didn't know how to write unit tests for the code it wrote.

I could just scrap the unit tests but honestly, I don't want to.  I want to build software with the AI in a way that is maintainable and I can continue to build.  I needed another approach.

## Another refactoring/cleanup step
Yeah.  We did this before.  Quite recently, in fact!  But it wasn't enough.  I needed to do a few things first:
1. Separate business/game logic from model concerns
2. Write tests against the logic witout concern for the data framework.
3. Make the interfaces for changing state and storing data consistent across all mutations

To do this, I talked to the model code and worked to create some of these consistent model retrieval/saving functions:

```
I'd like to add a function for getting the GameState
from Firestore given a Game ID.
```

```tsx
export const getGameStateById = async (gameId: string): Promise<GameState | null> => {
  const gameDocRef = getGameDocRef(gameId);
  if (!gameDocRef) return null;

  const gameSnapshot = await getDoc(gameDocRef);
  if (!gameSnapshot.exists()) return null;

  return gameSnapshot.data() as GameState;
};
```

```
Great.  Now I'd like a function that takes a gameID and
a gameState and saves it to Firestore.
```

```tsx
export const saveGameState = async (gameId: string, gameState: GameState): Promise<void> => {
  const gameDocRef = getGameDocRef(gameId);
  if (!gameDocRef) throw new Error('Invalid game ID');

  await setDoc(gameDocRef, gameState);
};
```

```
I'd like for the createGame function to only create the initial state and return it but not worry about storing it in Firestore.
```

```tsx
export const createGame = (
    maxPlayers: number,
    scoreGoal: number,
    createdBy: string,
): {
    gameId: string,
    initialState: GameState,
} => {
  const gameId = uuidv4().split('-')[0]; // Shorten the UUID
  const initialPlayers: Player[] = [];
  const initialState: GameState = {
    diceValues: Array(DICE_SIDES).fill(INITIAL_DICE_VALUE),
    currentPlayer: 1,
    rolling: false,
    scoreGoal,
    maxPlayers,
    players: initialPlayers,
    state: 'waiting',
    createdBy,
  };
  return { gameId, initialState };
};
```

Doing this sort of work and working through all the model code gets us to a [codebase that is much easier to modify](https://github.com/pass-the-cheese/passthecheese.ai/commit/cf775237af477e18a6c1a5f7ff99f42a320479b9).

## Try to introduce a interactive gameplay experience
The above refactoring helped tremendously.  I'm now able to get the AI to do what I want without coding itself into a corner. We won't get there in one shot.  For this change, I just want to break the rolling step into multiple steps:

1. Roll the dice
2. Set aside dice and keep a sub-score
3. If we're not done, repeat step 1
4. Finish the turn and take the score

In order to do this, we need to introduce some new cloud state:

```
We need to keep track of dice set aside for scoring.
When we do this, we also need to create state for the
turn score.
```

```tsx
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
```

(Side note: for some reason, the AI started adding these annoying comments to the code.  I needed to select the lines and say `please remove these comments`.  This was really annoying and I have no idea why it decided to start doing this.)

```
I need a new function.  One that lets players set aside
a subset of the currently rolled dice.  When we do that,
we need to calculate the turnScore but don't put it on the
player's score yet.
```

```tsx
export const setAsideDice = (gameState: GameState, diceIndices: number[]): GameState => {
  if (gameState.state !== 'inProgress') {
    throw new Error('Game is not in progress');
  }

  const newScoringDice = [...gameState.scoringDice];
  const remainingDiceValues = gameState.diceValues.filter((_, index) => !diceIndices.includes(index));
  let turnScore = gameState.turnScore;

  diceIndices.forEach(index => {
    if (index < 0 || index >= NUMBER_OF_DICE) {
      throw new Error('Invalid dice index');
    }
    if (newScoringDice.includes(index)) {
      throw new Error('Dice already set aside');
    }

    newScoringDice.push(index);
    turnScore += gameState.diceValues[index];
  });

  return {
    ...gameState,
    diceValues: remainingDiceValues,
    scoringDice: newScoringDice,
    turnScore
  };
};
```

And so on, and so on.  What we get is a turn that is broken up into the steps I mentioned above.

- [Here is the code for this change](https://github.com/pass-the-cheese/passthecheese.ai/commit/aedb0af550b9f06b8d9c83ff55a4194ffc9093d2)
- [Here is the latest version of the game](https://pass-the-cheese.web.app/)
- ![An updated animation of the game, showing rolling the dice, setting aside dice, and rolling again multiple times before ending the trun](../../014-set-aside-dice.gif)