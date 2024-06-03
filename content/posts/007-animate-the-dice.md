+++
title = "Animate the Dice"
date = 2024-05-31T20:29:24-04:00
draft = false
+++

I don't _love_ how static the dice feel when they roll.  You hit the "Roll Dice" button and you get new dice, but I'd like for there to be a bit more suspense.  Just a little.

```
I would like for the dice to have an animation when the dice
are rolling.  Update the Dice compoent to support a rolling
animation.
```

We get a new rolling state that adds the `rolling` class name when it is rolling.  This is cool.  The AI also gave us the CSS to do something with it.

```jsx
function Dice({ value, rolling }: { value: number, rolling: boolean }) {
  const renderDiceFace = (value: number) => {
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
    return <div className="face">{dots}</div>;
  };

  return (
    <div className={`dice ${rolling ? 'rolling' : ''}`}>
      {renderDiceFace(value)}
    </div>
  );
}
```

```css
.rolling {
  animation: roll 1s infinite;
}

@keyframes roll {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(90deg); }
  50% { transform: rotate(180deg); }
  75% { transform: rotate(270deg); }
  100% { transform: rotate(360deg); }
}
```

## This isn't enough though.  We need the GameBoard to enable it.

It did what I said.  I asked it to update the `Dice` component and it did.  But the `GameBoard` needs to do something with that.  I could have probably re-worded my request earlier so that it would have happened in one step.  This is the sort of thing I'm trying to learn so I'll just keep moving forward.

```
Update the GameBoard to enable the rolling animation when
we roll the dice.
```

This gives us a new `rolling` state in the game board which gets set and then unset via a timeout.  Looks like it thinks 1 second is a good length for the animation

```tsx
const [rolling, setRolling] = useState(false);

  const rollDice = () => {
    if (gameOver || rolling) return;
    setRolling(true);
    setTimeout(() => {
      const newValues = Array.from({ length: 6 }, () => Math.floor(Math.random() * 6) + 1);
      setDiceValues(newValues);
      updateScore(newValues.reduce((acc, value) => acc + value, 0));
      setRolling(false);
    }, 1000); // Match the duration of the rolling animation
  };
```

## Can we do better?
This is what we needed.  Now when it runs, the dice will rotate around the center for 1 second and then we'll get the result.  It still feels a bit clunky to me.  Let's see is we can mix it up a bit?

```
When real dice roll, they cycle randomly through different values.
Can you simulate that while the dice component is rolling?
```

Now it is updating the dice to mix randomly.  We're getting there!

```tsx
 const rollDice = () => {
    if (gameOver || rolling) return;
    setRolling(true);

    const intervalId = setInterval(() => {
      const randomValues = Array.from({ length: 6 }, () => Math.floor(Math.random() * 6) + 1);
      setDiceValues(randomValues);
    }, 100); // Update dice values every 100ms

    setTimeout(() => {
      clearInterval(intervalId);
      const newValues = Array.from({ length: 6 }, () => Math.floor(Math.random() * 6) + 1);
      setDiceValues(newValues);
      updateScore(newValues.reduce((acc, value) => acc + value, 0));
      setRolling(false);
    }, 1000); // Match the duration of the rolling animation
  };
```

Better!  But now the updating 10 times per second feels _too_ fast.

```
With these updates, the dice will cycle through random values
every 100ms during the 1-second rolling animation, simulating the
appearance of real dice rolling.
```

```tsx
const intervalId = setInterval(() => {
    const randomValues = Array.from({ length: 6 }, () => Math.floor(Math.random() * 6) + 1);
    setDiceValues(randomValues);
}, 250);
```

Yeah.  That feels good. We get a bit of some suspense and action.  It feels a bit more like rolling dice.  Can we do better? Sure!  But I think this is a good spot for now.

One thing I'm starting to notice: it took me WAY more time to write this blog post than it did to make this improvement.  I chatted with the code a couple of times and it landed to a place where I was happy.  It probablly took less than 3 minutes to do this.  I can say for sure: I would never have been able to write this code nearly as quickly.  We'll see how this scales with the complexity of the behavior as we grow, but this was seriously pretty cool.

Here's the [code for this change](https://github.com/pass-the-cheese/passthecheese.ai/commit/110e86559feb5781576e1a0177f43e094c87c75f).

Here's what it looks like now: ![An animation of the latest verion of the game.  When we click the Roll Dice button, the dice go through a bit of "rolling" animation adding suspense and motion to the game.](../../007-animated-dice.gif)