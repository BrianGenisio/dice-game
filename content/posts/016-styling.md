+++
title = "Styling the Game"
date = 2024-06-15T15:40:24-04:00
draft = false
+++

It's amazing what a coat of paint can do to the game.  Since we're building this game completely with AI, I figure the assets should be generated via AI as well.  I worked with DALL-E to generate me some images.

```
Can you make an image that I can use for my web-based
game called "Pass the cheese"? I think it should be a
simple image of a mouse with real dice that look like
they were made of cheese.
```

It made an image of a mouse with a single cheese die.  It was good!  But I wanted a bit more.

```
The second one is great. Add more dice and make them
look a bit more like they're made of cheese.
```

```
Now, can you add the title of the game to the image?
The title is "Pass the Cheese!"
```

![A cartoon image of a mouse holding a block of cheese that looks like dice](../../Pass-the-cheese.webp)

## Downside of AI Images
Maybe I don't know how to do it, but DALL-E can't replicate the style of images it created very well.  For example, when I wanted some more images for different stages of the game, I couldn't get it to replicate the exact style, even when uploading the image to DALL-E for inspiration.  I fear the AI artist who created my original image is lost forever.  You'll see as I show the different styled stages of the game, it lacks a bit of cohesion.

## Style it
I used a feature of Carbon that I hadn't tried yet.  I uploaded this image in the chat along with this message:

```
This is the landing page for the game, called "Pass the Cheese".
I'd like to give it a much better look and feel.  I'd like to
incorporate this image on the page.  Use it as the inspiration
for the look and feel / style for the site.
```

The changes to `Home.tsx` and the new `Home.css` were pretty great!  Good enough that I really didn't need to do anything else.  I'm sure some day I'll do another pass and make the design a bit more rich, but this is so much better than what I started with that I'm thrilled.

![A screenshot of the game with the new colors, font, button style, and the image](../../016-home.png)

## Rinse and Repeat (and another new feature!)
I loved what it did with `Home.tsx` and I really wanted it to apply the same treatment to the waiting room, the actual game, and the `GameOver.tsx` page.  I can use the `@` feature where I refer to another file.  It works pretty well.  I also wonder if some of the previous struggles I've had with unit tests might be made better with this feature.  I'll try that in future iterations.

```
Use the same styles you used in @Home.tsx in this component
```

![A screenshot of the game with the new colors, font, button style, and the image](../../016-waiting-room.png)

I wanted the dice to look like they fit a bit better into the new style.  I asked DALL-E to give me an image with only the cheese and then attached the image to this request in the `Dice.tsx` file:
```
I'd like you to style the dice more like this image of
a die made out of cheese
```

![A screenshot of the game with the new colors, font, and button style](../../016-play-game.png)
![A screenshot of the game with the new colors, font, button style, and the image](../../016-game-over.png)


[The Code](https://github.com/pass-the-cheese/passthecheese.ai)
[The game so far](https://pass-the-cheese.web.app/)