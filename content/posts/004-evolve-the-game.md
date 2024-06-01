+++
title = "Evolve the game"
date = 2024-05-29T20:54:24-04:00
draft = false
+++

The basic game it gave me was a good start, but it is a bit rigid.  The game I want to build will roll six dice, not one.  And I'd like to support an arbitrary number of players.  Let's see how Cursor handles my requests.  I'll talk to the `GameBoard` component.

```
I'd like the game to support an arbitrary number of players.  Can you
change the code to support this?
```

And it did!  It modified the `GameBoard` to support this:
```tsx
interface GameBoardProps {
  numberOfPlayers: number;
}

export default function GameBoard({ numberOfPlayers }: GameBoardProps) {
  // ...
  useState(Array.from({ length: numberOfPlayers }, () => 0));

  // ...
  const switchPlayer = () => {
    setCurrentPlayer(currentPlayer === numberOfPlayers ? 1 : currentPlayer + 1);
  };
```

But now it doesn't compile.  It knew enough to add the parameter to `GameBoard` but didn't update `App` to pass in the number of players as a parameter.  I just typed `command-.` and it fixed it for me.

```tsx
<div className="App">
  <GameBoard numberOfPlayers={3} />
</div>
```

## Now let's support six dice instead of one

```
I'd like there to be six dice instead of one.  Can you modify the
code to support an array of dice?
```

```tsx
const [diceValues, setDiceValues] = useState(Array.from({ length: 6 }, () => 1));

// ...
const rollDice = () => {
  const newValues = Array.from({ length: 6 }, () => Math.floor(Math.random() * 6) + 1);
  setDiceValues(newValues);
  updateScore(newValues.reduce((acc, value) => acc + value, 0));
};

// ... etc
```

## Cool.  Now, instead of pressing the dice, create a button to roll the dice.

```
Instead of clicking directly on the dice, create a button called
"Roll Dice" to do it
```

```tsx
<button onClick={rollDice}>Roll Dice</button>
// ... etc
```

Similar to before, it took the `rollDice` function off the `Dice` component but the `Dice` component was expecting this callback.  I tried to fix it with `control-.` but it didn't seem to work.  Instead, I used the "AI Fix in Chat" function (shift-control-E) and it told me what to do (remove the parameter).

## The dice pattern does not look like dice.  Can it do this correctly?

```
The dice do not look like traditional dice.  Can you modify the way
the dice look so they look more traditional?
```

I thought this might be a bit lift for the AI but it did pretty good!

```tsx
    const positions = [
      [], // 0 dots (not used)
      ['center'], // 1 dot
      ['top-left', 'bottom-right'], // 2 dots
      ['top-left', 'center', 'bottom-right'], // 3 dots
      ['top-left', 'top-right', 'bottom-left', 'bottom-right'], // 4 dots
      ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'], // 5 dots
      ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'], // 6 dots
    ];

    const dots = positions[value].map((pos, i) => <span key={i} className={`dot ${pos}`}></span>);
```

```css
    .dot {
        width: 20px; /* Size of the dots */
        height: 20px;
        background-color: black; /* Dot color */
        border-radius: 50%; /* Round dots */
        position: absolute;
    }

    .top-left { top: 10%; left: 10%; }
    .top-right { top: 10%; right: 10%; }
    .center { top: 50%; left: 50%; transform: translate(-50%, -50%); }
    .bottom-left { bottom: 10%; left: 10%; }
    .bottom-right { bottom: 10%; right: 10%; }
    .middle-left { top: 50%; left: 10%; transform: translateY(-50%); }
    .middle-right { top: 50%; right: 10%; transform: translateY(-50%); }
```

Wow!  Ok, this is cool.  The game is starting to look more substantial now. There is still no "win" state. We can do that later.

![An animation of the dice game.  Three players and six dice.  Every time "Roll Dice" is clicked, all six dice are randomized and the score increments.](../../004-evolved-state.gif)

Time to check the code in.  [Here's what we have so far](https://github.com/pass-the-cheese/passthecheese.ai/commit/e0aeb51cc7f075d1011ba519e85988f61ec8fa8e).