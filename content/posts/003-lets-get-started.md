+++
title = "Let's Get Started"
date = 2024-05-29T20:26:24-04:00
draft = false
+++

OK, just to get us started, I'm going to use [Create React App](https://create-react-app.dev/) with [TpeScript](https://create-react-app.dev/docs/adding-typescript/) to start.

```
> npx create-react-app passthecheese.ai --template typescript
```

I'll check that in and get it pushed to a new repo: [pass-the-cheese/passthecheese.ai](https://github.com/pass-the-cheese/passthecheese.ai/tree/80e16635f36dac8d2ad0cfb0cacc79f4bd65dc78).


Now I have a shell.  I'm trying to learn Cursor so I'm going to "chat" with the `App.tsx` file.  Let's see how this goes.

```
I'm making a multi-player dice game.  Can you become a game board with
more than one player where we roll dice and add it all up?
```

In doing so, it suggested that I change `App.jsx` to look like this:
```tsx
function Dice({ roll, value }: { roll: () => void, value: number }) {
  const renderDiceFace = (value: number) => {
    const dots = Array.from({ length: value }, (_, i) => <span key={i} className="dot"></span>);
    return <div className="face">{dots}</div>;
  };

  return (
    <div className="dice" onClick={roll}>
      {renderDiceFace(value)}
    </div>
  );
}

function GameBoard() {
  const [diceValue, setDiceValue] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [scores, setScores] = useState([0, 0]); // scores for player 1 and player 2

  const rollDice = () => {
    const newValue = Math.floor(Math.random() * 6) + 1;
    setDiceValue(newValue);
    updateScore(newValue);
  };

  const updateScore = (newValue: number) => {
    const newScores = [...scores];
    newScores[currentPlayer - 1] += newValue;
    setScores(newScores);
    switchPlayer();
  };

  const switchPlayer = () => {
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };

  return (
    <div>
      <h1>Player {currentPlayer}'s Turn</h1>
      <Dice roll={rollDice} value={diceValue} />
      <h2>Player 1 Score: {scores[0]}</h2>
      <h2>Player 2 Score: {scores[1]}</h2>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <GameBoard />
    </div>
  );
}
```

And it also gave me some CSS to start with:
```css
.dice {
  width: 100px;
  height: 100px;
  background-color: white;
  border: 2px solid black;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.face {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  width: 80%;
  height: 80%;
}

.dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: black;
}

/* Example specific dot positions for each value */
/* You would need to adjust the grid areas based on the dice value to position dots correctly */
```

## Cool!  What does this look like when it runs?
It created a reasonable starting point for me.  It's not the prettiest but hopefully we'll fix that as we go.  It defaulted to having two players. Every time we click on the dice, it creates a new "roll", sums the points, and moves to the next player.  There is no end to this game but we'll work on that too.

![An animation showing the game.  A crude dice image randomly changes when clicked and adds to the player's score](../../003-dice-shell.gif)

## Clean it up a bit?
I don't love that `GameBoard`, `Dice`, and `App` are all in the same file.  I'll "chat" with the file again.

```
I don't like that there are several components in this file.  Can we
move the components into their own files?
```

The AI obliged.  It didn't create the files and move things.  But it _did_ tell me to create the files and then let me apply the code to them when I had them selected.  It didn't get things completely correct. For example, it didn't properly import the dependant files.  I was able to fix this by typing `command-.` and it fixed all my problems.

The result of this first experiment can be found in this [commit in the repo](https://github.com/pass-the-cheese/passthecheese.ai/commit/08f90cdf9a4d0af644eb2a77e45b8ebde87e7a9e).

## What's next?
I think next I'll want to add support for a variable number of players and more dice.  I'll do that in the next post.
