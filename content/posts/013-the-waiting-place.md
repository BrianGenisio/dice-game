+++
title = "The Waiting Place"
date = 2024-06-07T19:51:24-04:00
draft = false
+++

![An image from the Dr. Seuss book "Oh, the places you go!". A scene where lots of people are sitting or standing around waiting](../../013-the-waiting-place.webp)

Ever read [Oh, the Places You'll Go!](https://www.amazon.com/Oh-Places-Youll-Dr-Seuss/dp/0679805273)?  Perhaps you remember [The Waiting Place](https://silverbirchpress.wordpress.com/2012/08/22/the-waiting-place-by-dr-seuss/)?  That was my most recent set of changes.  Up until this point, the game had a very weak concept of a player.  You define the number of players and then cycle through Player 1, Player 2, etc.  Although this game is online and designed to be multi-player, there is no sense of who's turn it is and who is allowed to move the game forward.  Anyone can click "Roll Dice" for any player.

If we're going to build out a game where players make choices and act on their own turn, we need to add a few concepts.
- A Waiting Room.  Before the game starts, I want this waiting room where the game creator can share the URL and players can join the game.  When the game is ready, the game creator can move into the actual game.
- User Identity. I want this game to work without login.  But I also want the user to persist across reloads.  We need some sort of identity that we'll store in local storage.
- Player-based state. Only the player who's turn it is currently can progress the game.  This will be crutial when the game becomes more complicated and the player's turn is more complicated than a simple "roll dice" action.

This sort of thing is a pretty big limitation with AI-driven development and one of the many reasons a human engineer is (and will likely be for a long time) still requied to build anything significant. I can't just tell the AI what the game rules are and let it build the game.  I need to tell it *how* to do it.  Good thing I'm a human engineer!

## I'm still impressed!
That being said, I'm still surprised each time I sit down to work on this game.  Once I say how I want to build the game, it does a pretty good job of doing what I want.

I find myself committing very small changes and then amentind the commit (before pushing of course).  Mostly because this process sometimes goes off the rails.  I find it easier to reset from the last commit point than to figure out what went wrong and re-try.  Even so, this latest set of changes has been represented by three commits.  Here are the commits along with some of the AI chat messages that started them.  There were a lot more back-and-forth to make these commits complete.  I'm not going to include the entire conversation because that's a lot.

- [Create the Waiting Room](https://github.com/pass-the-cheese/passthecheese.ai/commit/b6183a55d2e08cf41c6428e501a94220f488789e)
```
I'd like there to be a new game state that I'll call the
"waiting room".  The waiting room is a place to gather players.
When  a player joins a link, they can add themselves as a
player and wait for the creator of the game to start the
game and move it into "in progress".
```

```
The GameState.numberOfPlayers should represent the maximum number
of players, not the total number of players.  I think we can use
the players array to track the actual number of players.
```

- [Player State Management](https://github.com/pass-the-cheese/passthecheese.ai/commit/6cac428c748b3bf49c91393204886672a7525a8a)
```
Indicate which player is you.  You can use the getUserId
function from the GameState file
```

```
Use the actual player's name here
```

```
Disallow rolling dice if you are not the current player
```

```
If this player is you, indicate that you are the winner.
You can use getUserId from the GameState file to determine this.
```

- [Limit "Start Game" to the game creator](https://github.com/pass-the-cheese/passthecheese.ai/commit/cb8f62c473b6e675e576f8cbef5382a5bdb90c0a)
```
I'd like to keep track of the user who created the game.
That way, only they have the ability to start the game.
```

```
Otherwise, tell the user they are waiting for the game
creator to start the game.
```

## A risk is emerging
The codebase is getting bigger and harder to keep in my head.  Having mental models in our heads are important to us being effective and productive engineers.  The problem is: I'm not writing this code.  I'm telling the AI what I want.  I'm trying to review all the changes the AI makes every time but I'm already getting review fatigue.  I miss some details; especially since the code isn't written the way I'd write it.  This means that there is a lot of "fog of war" in my mental map of the code.

I think this is a risk of developing code this way.  I'm going to track it and see what I can do to avoid it from bringing us (me and the AI) into a slog

## A quick demo
![A demo of the game. Go to the site. Create a game. Share the URL. Add names. Roll dice one turn at a time until someone gets to 100](../../013-player-state.gif)

And here is the latest version of the [game](https://pass-the-cheese.web.app/games/1c24242d).


