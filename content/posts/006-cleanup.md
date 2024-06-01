+++
title = "Cleanup"
date = 2024-05-30T21:33:24-04:00
draft = false
+++

I don't like the `README.md` and `LICENSE` files.  Let's see how the AI can work with these non-code files.  Now I want to go beyond the file or component but "chat" with the codebase.  This is a neat feature in Cursor that where instead of typing `enter` to chat with the current file, I can type `command-enter` and chat with the entire codebase.  This turned out to be useful for updating the `README.md` file.

```
Describe this app and update the README to represent the
changes we've made since the boilerplate README was created.
```

```md
## Overview

Dice Game is a simple multiplayer game where players take turns rolling dice to accumulate points. The first player to reach the score goal wins the game.

## Features

- Multiplayer support with customizable number of players
- Dice rolling with visual representation
- Score tracking and display
- Game over detection and winner announcement
```

Next, I want to update it so that the "Contributing" section defines the rule that only AI may write code in this repo.

```
Update the "Contributing" section to describe how to contribute
to this game, including the requirement that only AI isallowed
to write the code.
```

```md
4. **Generate Code Using AI**: Use an AI tool to generate the necessary code changes. Ensure that the code adheres to the project's style and guidelines.
```

## Great! Now let's generate a LICENSE
```
Can you generate a LICENCE file for me?
```

```
MIT License

Copyright (c) 2023 Brian Genisio

Permission is hereby granted, free of charge, to any person obtaining a copy
...
```

Interesting.  It chose 2023.  I suppose the AI doesn't really know what year this is.  Or does it?

```
Fix the year
```

```
Copyright (c) 2024 Brian Genisio
```

Ok.  Maybe it does.  Here's the code for this [round of changes](https://github.com/pass-the-cheese/passthecheese.ai/commit/314ba381f4755c1396188555a4a54bf016be54d5#diff-c693279643b8cd5d248172d9c22cb7cf4ed163a3c98c8a3f69c2717edd3eacb7).

## Review your own code?
I aked it to review its own code for the `Gameboard.tsx`.


```
Review this code
```

It did a few things.  First back when we created a `scoreGoal`, it didn't add the type to `GameBoardProps`.  But this time, it recognized that it should have and fixed it:

```tsx
interface GameBoardProps {
  numberOfPlayers: number;
  scoreGoal: number;
}
```

It also taught me something interesting I didn't know about.  `useMemo` lets you do something once so that it doesn't need to re-compute every time.  It memoized the `initialScores` which are used as a default state for the `scores` state:

```tsx
  const initialScores = useMemo(() => Array.from({ length: numberOfPlayers }, () => 0), [numberOfPlayers]);
  const [diceValues, setDiceValues] = useState(Array.from({ length: 6 }, () => 1));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [scores, setScores] = useState(initialScores);
```

Here is the [full set of changes it made](https://github.com/pass-the-cheese/passthecheese.ai/commit/0f8f613837ee7d43313de014ee7def4b2214d826).


