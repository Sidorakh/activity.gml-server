require('dotenv').config();


const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

app.listen(process.env.PORT);

app.use('/api*',express.json());

app.post('/api/auth/token',async(req,res)=>{
    const result = await fetch('https://discord.com/api/oauth2/token',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: req.body.code,
        }),
    });
    res.json(await result.json());
})


if (process.env.ENVIRONMENT == 'DEV') {
    // proxy local GameMaker IDE
    app.use('*',createProxyMiddleware({target: process.env.GAMEMAKER_HTTP_URL}));
} else {
    // serve compiled game files
    app.use('*',express.static('./static'));
}