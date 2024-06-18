+++
title = "Turning the Crank"
date = 2024-06-18T11:09:24-04:00
draft = false
+++

The past couple of days have been a handful of small changes to the game.  The prompts have been simple and very similar to the previous posts.  Things like:

## Give a bonus for "passing the cheese"
```
If the diceValues is empty, they've "Passed the cheese".
Give them a 500 point bonus for passing the cheese.
```

[Resulting Code](https://github.com/pass-the-cheese/passthecheese.ai/commit/ca50b4000c81e485ae35d731fe6d9f186e845912)

## Extracting the Scoreboard component and re-using it

```tsx
{players.map((player, index) => (
  <h2 key={index}>
    {player.name} Score: {player.score} {player.uid === userId && '(You)'} {(index + 1) === currentPlayer && '←'}
  </h2>
))}
```
```
Extract this as a scoreboard component for the game.
Style it similar to @Home.css except make it look
more like a scoreboard
```
**RE-using it**
```
You can replace this with @Scoreboard.tsx
```

[Resulting Code](https://github.com/pass-the-cheese/passthecheese.ai/commit/2094263ba9339be780e27d8bdeae238587fa30e1)

## Re-branding
```
The page title says "React App".  Can we change it to "Pass the Cheese!"?
```

[Resulting Code](https://github.com/pass-the-cheese/passthecheese.ai/commit/f1b87f8201d41e895985db75e6ed11ff613b57cf)

## Some UX cleanup
```
Only allow selecting of dice if it is your turn AND
the turnState is settingAside.
```
```
Only show this section if you are the current user.
```
```
Merge "Set aside: " and "Points" into a single section that says "Set Aside: points" where points is the turn score
```

Etc, etc etc
[Resulting Code](https://github.com/pass-the-cheese/passthecheese.ai/commit/9bc3e4fcda6ea854259abb7016854c0c0c0532d2)

## Add a Game Rules modal
```
On this page, I'd like to include a "help" section.
The user will click on "help" and a modal or something
will display the game rules.
```

[Resulting Code](https://github.com/pass-the-cheese/passthecheese.ai/commit/2b06ae24f90700ae7eb275a209f242f986a3014a)

## Summary
In all, nothing too exciting.  I just think the entire User Experience is much tighter now.  The next step is to start adding the card-playing aspect of the game.

![A screenshot of a two-player game showing the update UX](../../017-game-screenshot.png)
[The Latest Version of the Game](https://pass-the-cheese.web.app/)