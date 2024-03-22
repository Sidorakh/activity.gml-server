# activity.gml-server

Companion repository and the server component of [activity.gml](https://github.com/Sidorakh/activity.gml)

Prerequisites: 
- Node.JS v20.9.0 (most recent versions should work)
- NPM v10.2.5

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

It's a bit convoluted, but using this allows you to run the server component and a GameMaker game locally without having to deal with recompiling your GameMaker game every time, instead just hitting play in the IDE


Setup (production)
1. Follow steps for development
2. Change the `ENVIRONMENT` to `PROD`
3. Build your GameMaker game as loose files, and place them in the `./static` folder. it should look like this
```
 ./static
  |
   - html5game
   - index.html
```
4. Start the server with `node ./server.js`