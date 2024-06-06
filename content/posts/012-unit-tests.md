+++
title = "Unit Tests"
date = 2024-06-06T08:42:24-04:00
draft = false
+++

This was tricky.  I was able to create unit tests for ll of the model/business logic code AND all of the existing components using AI.  But the AI could not have done it all by itself.

The prompt for each file is simple:
```
Can you add unit tests for this component?
```

The AI would then tell me the name of the file to create and generate the code for me.  That part was easy.  Getting the tests to pass, on the other hand, required a human touch.  I've still succeeded in my goal of not writing a line of code myself to this project and only adding code that the AI generates.  A common theme is emerging: the AI still needs me, a competent engineer, to do the right thing.

## Self Correcting
An interesting note here is that for every single test suite it generated, not a single one worked or had lint-passing code on the first try.  Thankfully, the Cursor browser has really good integration with unit tests and executes them on save so it's pretty quick to know if and when a test fails.  In _most_ cases, the AI was able to fix itself with Cursor's "AI Fix in Chat" functionality.

Let's look at the most simple failure for **GameOver.tsx**. It generated a test that looks like this:
```tsx
import React from 'react';
import { render } from '@testing-library/react';
import GameOver from './GameOver';

describe('GameOver Component', () => {
  it('renders the correct message for player 1', () => {
    const { getByText } = render(<GameOver currentPlayer={1} />);
    expect(getByText('Game Over! Player 1 wins!')).toBeInTheDocument();
  });

  it('renders the correct message for player 2', () => {
    const { getByText } = render(<GameOver currentPlayer={2} />);
    expect(getByText('Game Over! Player 2 wins!')).toBeInTheDocument();
  });
});
```

In this case, there is an eslint rule (`testing-library/prefer-screen-queries`) that prefers `getByText` to be `screen.getByText`.  Hovering over the error and clicking on "AI Fix in Chat" then updated it to be correct.

```tsx
describe('GameOver Component', () => {
  it('renders the correct message for player 1', () => {
    render(<GameOver currentPlayer={1} />);
    expect(screen.getByText('Game Over! Player 1 wins!')).toBeInTheDocument();
  });

  it('renders the correct message for player 2', () => {
    render(<GameOver currentPlayer={2} />);
    expect(screen.getByText('Game Over! Player 2 wins!')).toBeInTheDocument();
  });
});
```

The same was true of other errors.  Sometimes the test would verify text that wasn't quite correct.  Sometimes it would try to match full text when it should be a subset.  There were all sorts of reasons why the first pass of the tests didn't work the first time but 90% of the use cases were able to auto-fix.

## The last 10%
The last 10% took 90% of my time to get right.  The biggest troubles came when I tried to test the **GameState.tx** file.  It has code that interacts with some third-party packages like `firebase` and `uuid`.  We need to mock these functions in order to test the code and the AI knew that!  It just didn't know how to deal with the order-of-execution problems that so often plagues us when mocking third-party packages.

It chose to use `jest.mock('firebase/firestore', ...)` to mock the third-party packages. I think this is the right choice.  But *how* to do it is the real question and one humans (like myself) struggle to solve *without* AI.

Here's an example of a test for the `createGame` function, which uses `uuid` (a third-party package) to generate a game ID.  It also uses some functions from `firestore`. Both these need to be mocked in order for it to be deterministic.  This is what we (me and the AI) settled on after a good amount of back-and-forth:

```tsx
import { createGame, getGameDocRef, rollDice } from './GameState';
import { setDoc, doc, getFirestore } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// Mock Firebase functions
jest.mock('firebase/firestore', () => ({
  setDoc: jest.fn(),
  doc: jest.fn(),
  getFirestore: jest.fn(),
}));

// Mock UUID function
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('createGame', () => {
  const mockGameId = 'testgameid';
  const mockDocRef = { id: mockGameId };
  const mockFirestore = {}; // Mock Firestore instance

  beforeEach(() => {
    (uuidv4 as jest.Mock).mockReturnValue(`${mockGameId}-uuid`);
    (doc as jest.Mock).mockReturnValue(mockDocRef);
    (getFirestore as jest.Mock).mockReturnValue(mockFirestore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new game with the correct initial state', async () => {
    const numberOfPlayers = 4;
    const scoreGoal = 100;

    const gameId = await createGame(numberOfPlayers, scoreGoal);

    expect(gameId).toBe(mockGameId);
    expect(doc).toHaveBeenCalledWith(mockFirestore, 'games', mockGameId);
    expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
      diceValues: Array(6).fill(1),
      currentPlayer: 1,
      scores: Array(numberOfPlayers).fill(0),
      gameOver: false,
      rolling: false,
      scoreGoal,
      numberOfPlayers,
    });
  });
});
```

All other incantations of this failed because of the order in which these packages got loaded.  Another problem we had was with the Firebase config, which looked like this:

```tsx
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "<stub>",
  authDomain: "<stub>",
  projectId: "<stub>",
  storageBucket: "<stub>",
  messagingSenderId: "<stub>",
  appId: "<stub>",
  measurementId: "<stub>"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
```

Up until now, this works.  Because of the order of things getting loaded and executed, this code will have been executed *before* the mocking happens.  It took me a long time to figure this out and the AI was no help to do so.  Once I figured it out, the fix was pretty easy.

```
Make this lazy-loaded
```

```tsx
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

let db;

const getFirebaseConfig = () => {
  const firebaseConfig = {
    apiKey: "<stub>",
    authDomain: "<stub>",
    projectId: "<stub>",
    storageBucket: "<stub>",
    messagingSenderId: "<stub>",
    appId: "<stub>",
    measurementId: "<stub>"
  };

  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
};

const getDb = () => {
  if (!db) {
    getFirebaseConfig();
  }
  return db;
};

export { getDb };
```

Now the consumers need to call `getDb()` instead of import `db` but that's not a big problem.  This lets us mock out the third-party packages before the code executes and the tests pass.

## Was it worth it?
Yeah, I think so.  I have tests now.  Are the the *best* tests? No.  I do think, however, that these tests will help me as I build out the rest of the game.  In fact, I think it is necessary.  Currently, the game rules are quite simple and the UX is also simple.  As I build this system out more, I really need to be able to trust that I didn't break anything.  When the AI comes through and makes a lot of changes, it is very easy for me to miss subtleties.  I'm not the author of this code; I'm only a reviewer. So unit tests are just as important, if not more important because I don't trust the AI to do it correctly enough to just let it go.

So this is a good exercise for me.  Every time I build a new feature for this game going forward, I'll need to run the existing tests and add new tests.  No problem with that; that's what I'd do anyways.

Here is the commit for [these unit tests](https://github.com/pass-the-cheese/passthecheese.ai/commit/12bb34a401ab96fc1e43c5967300552a2e5b912c).
And here is a [link to the game](https://pass-the-cheese.web.app) in case you'd like to see how it is evolving.