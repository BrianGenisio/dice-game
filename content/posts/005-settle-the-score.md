+++
title = "Settle the Score"
date = 2024-05-30T21:05:24-04:00
draft = false
+++

Let's start to build in some rules to this game.

```
Right now, the game has no end.  I'd like to specifiy a score
goal.  When the first player reaches this goal, the game is over
```

```tsx
export default function GameBoard({ numberOfPlayers, scoreGoal }:
  GameBoardProps & { scoreGoal: number }) {
    // ...

    {gameOver ? (<h1>Game Over! Player {currentPlayer} wins!</h1>

    // ...
```

Hmmm.  I don't love this.  I think `scoreGoal` should have been added to `GameBoardProps` but alas, I want the AI to be in charge here so I'm not going to say anything for now.  Maybe we can ask it to review its own code sometime in the future.

Also, this didn't compile because the `App` component wasn't passing the `scoreGoal`.  When I asked it to fix itself, it did.

Now the game will end when the first player reaches 100.
![The dice game plays through until Player 3 reaches 100. The game ends and Player 3 wins.](../../005-settle-the-score.gif)

Here's the code we created [for this post](https://github.com/pass-the-cheese/passthecheese.ai/commit/9246361a556918be1fe6fd7570f730fda45d14e8).

