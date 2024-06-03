+++
title = "A bit too far"
date = 2024-06-03T16:29:24-04:00
draft = false
+++

I thought I'd take a leap with the AI and have it try to do something bigger.  Let's see if we can get this game into the cloud.

```
I think I'd like to move this game to the cloud such that the
two players can be in different locations.  How can I adapt this
code to support that need?
```

It didn't do too bad.  It gave some general advice:

> 1. Set up a backend server to manage game state and player interactions.
> 2. Use WebSockets or another real-time communication method to sync game state between players.
> 3. Update your frontend to communicate with the backend.

It created me a [Node](https://nodejs.org/en)/[Express](https://expressjs.com/) backend server with [socket.io](https://socket.io/).  This could work, but I really want something a bit more abstract here.  I should have been more explicit.  As the driver of this code, I have some opinions and I'd like to use Firebase.  It's just so easy to setup realtime models, handle login, and host.  This higher-level platform is more what I'm looking for.

## Try again

```
I'd like to adapt this game to live in the cloud and support
multiple players remotely.  I'd like to use Firebase to do this
as they have good models for realtime updates.  What do I need
to to to support that?
```

Now we're talking.  It told me to install firebase (`npm install firebase`) and create a Firebase project.  A bit thin, but I can work with it. The problem we run into now is that it isn't doing _anything_ to help manage the state.  Failure to do so caused me troubles because it is difficult to tease out the persistable state from the transient app state. It's basically putting the database call AND state initializateion into a `useEffect` call.  This did _not_ work off the bat and was pretty hard to figure out why.

```tsx
export default function GameBoard({ gameId, playerId }: GameBoardProps) {
  const [diceValues, setDiceValues] = useState(Array.from({ length: 6 }, () => 1));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [scores, setScores] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    const gameRef = ref(database, `games/${gameId}`);
    onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDiceValues(data.diceValues || []);
        setCurrentPlayer(data.currentPlayer || 1);
        setScores(data.scores || []);
        setGameOver(data.gameOver || false);
      }
    });
  }, [gameId]);
```

## Try again, again
I have opinions and my opinions matter.  Instead of writing this nasty initialization code in a `useEffect`, I'd like to use a React Hooks integration with FireStore.  Let's try a new approach:

```
I'd like to move this code to the cloud using Firebase and
integrate it with react-firebase-hooks.  I think we need to
extract the game state into a single model to support this.
Can you show me how to do that?
```

It extracted the model into a type.  Good step!

```tsx
export interface GameState {
  diceValues: number[];
  currentPlayer: number;
  scores: number[];
  gameOver: boolean;
  rolling: boolean;
}
```

It is still doing too much in the component, but it's a bit better now.

```tsx
export default function GameBoard({ numberOfPlayers, scoreGoal }: GameBoardProps) {
  const gameDocRef = doc(db, 'games', 'game1'); // Replace 'game1' with a dynamic game ID if needed
  const [gameState, loading, error] = useDocumentData<GameState>(gameDocRef);

  useEffect(() => {
    if (!loading && !gameState) {
      const initialScores = Array.from({ length: numberOfPlayers }, () => 0);
      const initialState: GameState = {
        diceValues: Array.from({ length: 6 }, () => 1),
        currentPlayer: 1,
        scores: initialScores,
        gameOver: false,
        rolling: false,
      };
      setDoc(gameDocRef, initialState);
    }
  }, [loading, gameState, numberOfPlayers, gameDocRef]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!gameState) return null;
```

## Roll up my sleeves. Time to debug.
When I run this new code, it just sits there saying `Loading...` and never gets further.  Without trying to figure it out, I figured I'd ask the AI:

```
When I do this and run it, it just says "Loading..." and
doesn't progress.  What's wrong?
```

It gives me some suggestions:

> 1. Check Firestore Rules
> 2. Verify Document Path
> 3. Debugging the Initial State Setup
> 4. Ensure Firestore Initialization

Hmmmm.  This doesn't help too much.  I tried these things and it still doesn't work.  I'm opening up the console and I see an infinite loop.  Grabbing the error in the console, I'll ask the AI again.

```
I'm also getting this error in the console: "Maximum update depth
exceeded.This can happen when a component calls setState inside
useEffect, but useEffect either doesn't have a dependency array,
or one of the dependencies changes on every render."
```

It gave a bunch of things to look at and even made a code suggestion that changed nothing at all.  I'm still stuck.  Now I need to do some debugging.  I figured out the problem and told the AI:

```
I think the problem is that gameDocRef is new every render which
causes useEffect to re-trigger?
```

This was the nudge it needed:

> You're correct. If gameDocRef is being recreated on every render, it will cause the useEffect to re-trigger. To prevent this, you should memoize gameDocRef using useMemo.

```tsx
const gameDocRef = useMemo(() => doc(db, 'games', 'game1'), [db]); // Replace 'game1' with a dynamic game ID if needed
```

That fixed the loop!  Now I'm gettin an error that we can't store the data.  It was always there, but the endless loop was making it hard to see.

```
I'm getting an error that I can't save the data.  What should I do?
```

It gave me the suggestion to change my firebase rules on the backend.

```
service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      allow read, write: if true;
    }
  }
}
```

This was a GREAT suggstion from the AI.  It didn't suggest that this is a security problem (anyone can write to these documents). But this _does_ work when I add it to the Firebase console.  Let's put a pin in this for the future.

## It works! (kinda)
Now I have a system that is syncing state with the backend!  If I open up two browsers and go to the same site, I can see the actions get synchronized!  Kind of.  Sometimes it doesn't work.  I tried to get the AI to fix this and it just gave me a bunch of vague responses.

```
When I open the site in two browsers and click "Roll Dice" in one,
I can see the other browser roll dice but land on a different result.
Sometimes, the scores don't update. It is very inconsistent.
```

I know what the problem is, but the AI is trying to take me down the wrong path.

> The issue you're experiencing is likely due to race conditions and the asynchronous nature of setDoc in Firebase. When multiple clients are updating the same document, they might overwrite each other's changes if not handled properly.
> To ensure consistency, you should use Firestore transactions or batched writes. Transactions allow you to read and write data atomically, ensuring that no other client can modify the data in between your read and write operations.

Sorry AI, I'm not letting you go down this path.

## Holding the AI's hand
The AI is correct that this is a race condition!  It's because the animation code is setting the state and then sending that state up to the cloud.  It does this 4 times a second and we get into race conditions.  This is because there are two kinds of state in an application like this: persistable state (the scores, the roles, etc) and transient app state (the animation state).

We need to hold the AI's hand here.  Thankfully it understands what I'm trying to do and it is able to modify the code!

```
I think we need to move the setInterval into the Dice component.
It isn't part of the game state and we don't want to setDoc
in that case.
```

**Dice.tsx**
```tsx
export default function Dice({ value, rolling }: DiceProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (rolling) {
      const intervalId = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 250);

      return () => clearInterval(intervalId);
    } else {
      setDisplayValue(value);
    }
  }, [rolling, value]);

  return <div>{displayValue}</div>;
}
```

That did it but now we've lost all our styling for the dice and the rolling animation.  I needed to try a few different ways but eventually got it back.

```
Hmmm.  We lost all the styling on the Dice component.
Can we put that back?
```

```
While the dice are rolling, randomize the values that the user
sees similar to what we did in GameBoard.
```

It's all back now and working.  Finally.  That was a lot but I now have a set of changes that gets my data syncing to the cloud.

![An animation of the game showing two browsers.  When one rolls the dice, the other updates.](../../008-cloud-sync-dice.gif)
Here's the [full commit](https://github.com/pass-the-cheese/passthecheese.ai/commit/5d8500bc32db09cd23e6588e5df163deee4e13bd).

## What did I learn?
I learned that the AI has limits.  Some particular limits learned here:
- We can't ask the AI to do too much at once.  It may seem like a simple request to sync the data to the cloud but it implied a few other things
  - The data model needs to be extracted
  - Persistable state needs to be separated from transient state
  - I need to tell it _how_ to put the data in the cloud
- The AI is not great at debugging the application as a system.
- The AI is not generating the most secure code.
- The AI really needs an experienced engineer to hold its hand

That being said, the application is still moving along much faster than had I written the code from scratch.  I would have also likely produced similar bugs and needed to debug it.  In the future, I should anticipate the edges of the AI's capabilities and work with it.  Baby steps are best.