+++
title = "Pass and Cut the Cheese"
date = 2024-06-15T09:13:24-04:00
draft = false
+++

Now we get to the fun part!  The game rules!  I'm going to introduce three new concepts to the game and in doing so, set up the majority of the gameplay mechanics that will make up "Pass the Cheese".

1. Scoring rules
2. Cutting the Cheese
3. Passing the Cheese

## Scoring Rules
This went exceedingly well.  It took a couple of iterations with the AI to get what I wanted, mostly because it took me a bit to realize what I wanted.  Here are some prompts that got us to a scoring function:

```
I need a new function to score a set of dice. The input can be
between 1 and 6 dice.  Here are the rules:

1. A "straignt" happens when 6 dice have the values of
   1, 2, 3, 4, 5, 6 in any order.  This is worth 1500 points.
2. A "three of a kind" is worth 100x the number.  So
   [6,6,6] is worth 600 points. [5,5,5] is worth 500 points
   etc.  The only exception is that [1,1,1] is worth 1000 points
3. A 1 by itself is worth 100 points
4. A 5 by itself is worth 50 points

Any given die in the set can only count for one of these scoring
so try to score the highest combos possible and then don't reuse
these dice.  So if you have [1,1,1], that is 1000 points, not
1300 points.
```

```
this function should return more information about the score.
Have it return:
- Total Score
- A list of unscored dice
- A list of the reasons the dice scored along with the
  values that caused it.
```

```tsx
export const scoreDice = (dice: number[]): { totalScore: number, unscoredDice: number[], scoringDetails: { reason: string, values: number[] }[] } => {
  if (dice.length < 1 || dice.length > 6) {
    throw new Error('Invalid number of dice');
  }

  const diceCount = new Array(7).fill(0);
  dice.forEach(die => diceCount[die]++);

  let totalScore = 0;
  const scoringDetails: { reason: string, values: number[] }[] = [];
  const unscoredDice: number[] = [];

  // Check for a straight
  if (dice.length === 6 && diceCount.slice(1).every(count => count === 1)) {
    return {
      totalScore: 1500,
      unscoredDice: [],
      scoringDetails: [{ reason: 'Straight', values: dice }]
    };
  }

  // Check for three of a kind
  for (let i = 1; i <= 6; i++) {
    if (diceCount[i] >= 3) {
      const score = (i === 1 ? 1000 : i * 100);
      totalScore += score;
      scoringDetails.push({ reason: 'Three of a kind', values: Array(3).fill(i) });
      diceCount[i] -= 3;
    }
  }

  // Check for single 1s and 5s
  if (diceCount[1] > 0) {
    const score = diceCount[1] * 100;
    totalScore += score;
    scoringDetails.push({ reason: 'Single 1s', values: Array(diceCount[1]).fill(1) });
    diceCount[1] = 0;
  }

  if (diceCount[5] > 0) {
    const score = diceCount[5] * 50;
    totalScore += score;
    scoringDetails.push({ reason: 'Single 5s', values: Array(diceCount[5]).fill(5) });
    diceCount[5] = 0;
  }

  // Collect unscored dice
  for (let i = 1; i <= 6; i++) {
    for (let j = 0; j < diceCount[i]; j++) {
      unscoredDice.push(i);
    }
  }

  return {
    totalScore,
    unscoredDice,
    scoringDetails
  };
};
```

```
write unit tests for this function
```

```tsx
describe('scoreDice', () => {
  test('should throw an error for invalid number of dice', () => {
    expect(() => scoreDice([])).toThrow('Invalid number of dice');
    expect(() => scoreDice([1, 2, 3, 4, 5, 6, 7])).toThrow('Invalid number of dice');
  });

  test('should score a straight correctly', () => {
    const result = scoreDice([1, 2, 3, 4, 5, 6]);
    expect(result).toEqual({
      totalScore: 1500,
      unscoredDice: [],
      scoringDetails: [{ reason: 'Straight', values: [1, 2, 3, 4, 5, 6] }]
    });
  });

  test('should score three of a kind correctly', () => {
    const result = scoreDice([1, 1, 1, 2, 3, 4]);
    expect(result).toEqual({
      totalScore: 1000,
      unscoredDice: [2, 3, 4],
      scoringDetails: [{ reason: 'Three of a kind', values: [1, 1, 1] }]
    });
  });

  test('should score single 1s and 5s correctly', () => {
    const result = scoreDice([1, 5, 2, 3, 4, 6]);
    expect(result).toEqual({
      totalScore: 150,
      unscoredDice: [2, 3, 4, 6],
      scoringDetails: [
        { reason: 'Single 1s', values: [1] },
        { reason: 'Single 5s', values: [5] }
      ]
    });
  });

  test('should score a combination of three of a kind and single 1s and 5s correctly', () => {
    const result = scoreDice([1, 1, 1, 5, 5, 2]);
    expect(result).toEqual({
      totalScore: 1100,
      unscoredDice: [2],
      scoringDetails: [
        { reason: 'Three of a kind', values: [1, 1, 1] },
        { reason: 'Single 5s', values: [5, 5] }
      ]
    });
  });

  test('should return unscored dice correctly', () => {
    const result = scoreDice([2, 3, 4, 6]);
    expect(result).toEqual({
      totalScore: 0,
      unscoredDice: [2, 3, 4, 6],
      scoringDetails: []
    });
  });
});
```

I have to say: this was pretty incredible.  It took my rules and it created a function that I can use to determine everything I'll need for the next two parts of the game.  The unit tests were pretty good too.  If I wrote them, I may have added some more edge cases but these are not bad at all.  This is where AI-driven development shines IMO.  I have a function with well-defined rules; write it for me.

[Here's the code for this part](https://github.com/pass-the-cheese/passthecheese.ai/commit/a840cb55ccbe4491b5b4b4a685f426fe5583c68c)

## Cut the Cheese
In this game, you must set aside at least one scoring die every time you roll the dice.  If you fail to do so, you've "cut the cheese".  It's kind of like busting in Blackjack. Your turn is over and you don't score anything this turn.  It creates a choice for the player: do I take the points I have or do I gamble and try for more knowing I could lose them all?

### Grab the score from the dice values
```tsx
const { totalScore, scoringDetails } = scoreDice(selectedDiceValues);
```
```
Also get the totalScore from the diceValues
```

```tsx
const { totalScore: selectedDiceScore, scoringDetails } = scoreDice(selectedDiceValues);
const { totalScore: diceValuesScore } = scoreDice(gameState.diceValues);
```

```
If the dice values that were not set aside do not score
anything, they have "cut the cheese".  Let them know.
They should not be given the chance to set aside dice.
Their turn is over and they don't get any of the points
they've accumulated this turn.
```

Prompts like these get us to a place where we have a mostly functional "cut the cheese" mechanic. ([code](https://github.com/pass-the-cheese/passthecheese.ai/commit/e80c46f5263fbfee4f629d7efde04317162c089a))

![A screenshot of the game showing a failed roll indicating that they "cut the cheese"](../../015-cut-the-cheese.png)

## Pass the Cheese
The final major mechanic is the opposite of "cut the cheese".  When you "pass the cheese", you are successfully scoring with all six of the dice.  There isn't any special incentive to "pass the cheese" yet (the power of yet!) but it will be coming shortly as there will be incentives to "pass the cheese" in future mechanics of the game.

```
The player has "passed the cheese" when there are no more
dice values left, meaning they have scored with all of the
dice. The turn is over and they will score the points they've
accumulated.
```

```tsx
const hasPassedTheCheese = gameState.diceValues.length === 0;
```
```tsx
{hasPassedTheCheese && <h3>🎉 Congratulations! You passed the cheese! 🎉</h3>}
```

That was pretty easy ([code](https://github.com/pass-the-cheese/passthecheese.ai/commit/7be491c163e043726fa99b0feb2576d6c94aad2d)).  This concludes the primary dice mechanics of the game.  The next part we need to introduce is the card drawing portion of the game.  We'll do that in a future change.  For now, we can bask in the glory of a playable game of Pass the Cheese!

![A screenshot of the game showing a successfull pass of the dice and they "pass the cheese"](../../015-pass-the-cheese.png)

You can play the latest version of the game at [https://pass-the-cheese.web.app/](https://pass-the-cheese.web.app/)
