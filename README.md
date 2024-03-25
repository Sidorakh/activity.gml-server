# activity.gml-server

Companion repository and the server component of [activity.gml](https://github.com/Sidorakh/activity.gml)

Prerequisites: 
- Node.JS v20.9.0 (most recent versions should work)
- NPM v10.2.5
- `cloudflared` for local development

Setup (development)

1. Clone this repository to your PC
2. Copy `example.env`, name it `.env`
3. Replace the following in `.env`
  - `DISCORD_CLIENT_ID` with your Discord applications client ID 
  - `DISCORD_CLIENT_SECRET` with your Discord applications client secret
  - Other fields documented below
  - `PORT` with any unused port (the default should be fine)
  - `GAMEMAKER_URL` is where GameMaker's inbuilt HTTP server hosts your game, ensure the port matches the one GameMaker uses
  - `ENVORINMENT` should be set to `DEV` on a local machine, and `PROD` when in production
4. Run `npm i` in the repository's folder
5. Run the application with `node ./server.js`

It's a convoluted process, but it allows your HTML5 game to act as if it's hosted on this server without having to export it every time

Make sure to follow [Discord's official guide for testing an activity locally](https://discord.com/developers/docs/activities/development-guides#run-your-application-locally). 

Setup (production)
1. Follow steps for development
2. Change the `ENVIRONMENT` to `PROD`
3. Build your GameMaker game as loose files, and place them in the `./static` folder. it should look like this
```
 server.js
 static
  |
  |- html5game
  |- index.html
```
4. Start the server with `node ./server.js`