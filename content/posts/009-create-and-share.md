+++
title = "Create and Share the Game"
date = 2024-06-03T19:57:24-04:00
draft = false
+++

This one took me a few tries to get working.  We're already out of the realm of "describe the feature" and more into "tell the AI what you'd like it to do".  It's feeling a bit more like a paired programming session where one person knows what needs to happen and the other person makes it happen.  When I think about it that way, it increases the need for me to be a competent engineer, but the AI in the coding seat is a 10x coder.

I wanted to get two pages in place:
- One page to create the game
- Another page to show and share the game

This requires that we move the `GameState` initialization out of the `GameBoard` component.  To do that, I wanted to extract some logic out to make it easier for the AI to figure out what to do.  Honestly, this was the key detail that got this working.  I tried and failed about 4 times before this because the AI couldn't figure out how to extract the state initialization.

## Be direct

```
Extract the code that initializes the game state into a function.
```

```tsx
const initializeGameState = (numberOfPlayers: number): GameState => {
  const initialScores = Array.from({ length: numberOfPlayers }, () => 0);
  return {
    diceValues: Array.from({ length: 6 }, () => 1),
    currentPlayer: 1,
    scores: initialScores,
    gameOver: false,
    rolling: false,
  };
};
```

```
Move the setDoc into initializeGameState
```

```tsx
const initializeGameState = async (numberOfPlayers: number, gameDocRef: any) => {
  const initialScores = Array.from({ length: numberOfPlayers }, () => 0);
  const initialState: GameState = {
    diceValues: Array.from({ length: 6 }, () => 1),
    currentPlayer: 1,
    scores: initialScores,
    gameOver: false,
    rolling: false,
  };

  try {
    await setDoc(gameDocRef, initialState);
  } catch (err) {
    console.error('Error setting initial state:', err);
  }
};
```

```
Great. Now add the scoreGoal to the game state
```

**GameState.tsx**
```tsx
export interface GameState {
  diceValues: number[];
  currentPlayer: number;
  scores: number[];
  gameOver: boolean;
  rolling: boolean;
  scoreGoal: number; // Add scoreGoal to the GameState interface
}
```

**GameBoard.tsx**
```tsx
const initializeGameState = async (numberOfPlayers: number, scoreGoal: number, gameDocRef: any) => {
  const initialScores = Array.from({ length: numberOfPlayers }, () => 0);
  const initialState: GameState = {
    diceValues: Array.from({ length: 6 }, () => 1),
    currentPlayer: 1,
    scores: initialScores,
    gameOver: false,
    rolling: false,
    scoreGoal, // Set the scoreGoal in the initial state
  };

  try {
    await setDoc(gameDocRef, initialState);
  } catch (err) {
    console.error('Error setting initial state:', err);
  }
};
```

## Now create the two pages
I knew this ahead of time: it's time to introduce a router.  The AI clearly knew it too.  I spelled it out as plainly as I could without being verbose.  This was another learning from my failed attempts at doing this.  I simply can't rely on the AI to have the entire system in its head anymore.  It needs direct guidance.

```
I'd like to split the game into two pages.

1. / will provide an opportunity to create a new game. The user
enters the number of players and the points goal.  We initialize
a new state witn a unique key.

2. /games/:gameId will take the unique key as a parameter and
pass it to GameBoard.  GameBoard will no longer initialize the
game state. Instead, it will read it from the data store using
the unique key and display the game based on the loaded game state.
```

First thing, it asked me to install `react-router-dom`.  Good job AI!

```
yarn add react-router-dom
```

**App.tsx**
```tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import GameBoard from './GameBoard';

function App() {
    return (
    <Router>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games/:gameId" element={<GameBoard />} />
        </Routes>
    </Router>
    );
}

export default App;
```

**Home.tsx (new)***
```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

function Home() {
  const [numberOfPlayers, setNumberOfPlayers] = useState(2);
  const [scoreGoal, setScoreGoal] = useState(100);
  const navigate = useNavigate();

  const createGame = async () => {
    const gameId = `game-${Date.now()}`;
    const gameDocRef = doc(db, 'games', gameId);
    const initialScores = Array.from({ length: numberOfPlayers }, () => 0);
    const initialState = {
      diceValues: Array.from({ length: 6 }, () => 1),
      currentPlayer: 1,
      scores: initialScores,
      gameOver: false,
      rolling: false,
      scoreGoal,
      numberOfPlayers,
    };
    await setDoc(gameDocRef, initialState);
    navigate(`/games/${gameId}`);
  };

  return (
    <div>
      <h1>Create a New Game</h1>
      <label>
        Number of Players:
        <input type="number" value={numberOfPlayers} onChange={(e) => setNumberOfPlayers(Number(e.target.value))} />
      </label>
      <label>
        Score Goal:
        <input type="number" value={scoreGoal} onChange={(e) => setScoreGoal(Number(e.target.value))} />
      </label>
      <button onClick={createGame}>Create Game</button>
    </div>
  );
}

export default Home;
```

***GameBoard.tsx***
```tsx
import { useParams } from 'react-router-dom';

export default function GameBoard() {
    const { gameId } = useParams();
    const gameDocRef = useMemo(() => doc(db, 'games', gameId).withConverter<GameState>({
    toFirestore: (gameState: GameState) => gameState,
    fromFirestore: (snapshot) => snapshot.data() as GameState
    }), [gameId]);
    const [gameState, loading, error] = useDocumentData<GameState>(gameDocRef);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!gameState) return null;

    // ... rest of the component remains the same
}
```

## Clean the key
The `GameState` key -- the one that is used in the URL -- is really long.  It's also possible that when this game blows up, two people could create the same key at the same time.  Let's fix that.

```
Instead of using Date.now() for the game ID, can we create
a more unique id?  But also something kind of short?
```

```
 npm install uuid
 ```

```tsx
const gameId = uuidv4().split('-')[0];
```

Hmmm.  Ok.  Well, that will not be unique either but it _is_ shorter.  Let's go with it for now.  The chances for collisions happening near each other are much lower now at least, so I'll take it.  If this ever becomes a problem in the future, we can move this to a backend cloud function to ensure uniqueness.  That's a "future us" problem for sure.

## Summary
With that, we now have the ability for anyone to create a game and share it with their friends.  The game isn't super exciting and engaging (yet) but it works.

![An animation of the game.  Start on the home screen and create a new game.  Share the URL with a friend in a separate browser. Start playing.](../../009-share-the-game.gif)

[The code for this change](https://github.com/pass-the-cheese/passthecheese.ai/commit/eddaa88c6d7420605f65bc11149a8c4800dd648f)

