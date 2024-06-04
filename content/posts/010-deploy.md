+++
title = "Ship it!"
date = 2024-06-04T17:31:24-04:00
draft = false
+++

This may have been the *easiest* thing I've done yet.  I'd like to deploy the game to the web.  I have used Firebase in the past but I'm only vaguely familiar with how to set it up for hosting.  Let's see what the AI has to say:

```
I'd like to deploy this game to the cloud.
How should I do it?
```

> Step 1: Install Firebase CLI
> First, ensure you have the Firebase CLI installed. If not, install it using npm:
> ```
> npm install -g firebase-tools`
> ```
>
> Step 2: Initialize Firebase in Your Project
> Navigate to your project directory and initialize Firebase:
> ```
> firebase init
> ```
> - Select Hosting from the options.
> - Choose an existing Firebase project or create a new one.
> - Set build as the public directory.
> - Configure as a single-page app (yes).
>
> Step 3: Build Your React App
> Build your React app for production:
> ```
> npm run build
> ```
>
> Step 4: Deploy to Firebase
> Deploy your app to Firebase Hosting:
> ```
> firebase deploy
> ```

## And it's live!
Go to [https://pass-the-cheese.web.app/](https://pass-the-cheese.web.app/), create a new game, and share the URL with friends!

## Make it easy in the future

```
Can you help me write an NPM script to handle
deploying the site?
```

**package.json**
```json
"scripts": {
    "deploy": "npm run build && firebase deploy"
}
```

Yep.  That does it.  Now I just need to run `npm run deploy` and my site is deployed.

[Here's the code](https://github.com/pass-the-cheese/passthecheese.ai/commit/350202f2a4f3559e37fdb85246e9e12ae718ab65)