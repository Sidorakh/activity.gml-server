require('dotenv').config();

// libraries
const http = require('http');
const express = require('express');
const { WebSocket, WebSocketServer } = require('ws');
const { createProxyMiddleware } = require('http-proxy-middleware');
const crypto = require('crypto');

// http setup
const app = express();
const server = http.createServer(app)
server.listen(process.env.PORT);

app.use('/api*',express.json());

app.get('/api/tokens',(req,res)=>{
    res.json(tokens);
})

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
    const json = await result.json();

    // fetch user data to assign them a websocket token
    const user_data = await fetch(`https://discord.com/api/users/@me`, {headers: {Authorization: `Bearer ${json.access_token}`}});
    const user_json = await user_data.json();
    const token = generate_websocket_token(user_json.id);
    
    res.json({...json, user_data: user_json, websocket_token: token});
})


if (process.env.ENVIRONMENT == 'DEV') {
    // proxy local GameMaker IDE
    app.use('*',createProxyMiddleware({target: process.env.GAMEMAKER_HTTP_URL}));
} else {
    // serve compiled game files
    app.use('*',express.static('./static'));
}


// multiplayer data setup
const tokens = {};
const connections = {};
const instances = {};

function generate_websocket_token(user_id) {
    const token = crypto.randomBytes(24).toString('base64url');
    tokens[user_id] = token;
    return token;
}


const wss = new WebSocketServer({ server });

// add websocket server logic here



wss.on('connection',(socket,request) => {
    console.log(request.url);
    const [id, token, instance] = request.url.slice(1).split('/');

    if (tokens[id] == token) {
        delete tokens[id];
    }

    // save user ID on socket object, store in connections
    socket.id = id;
    socket.instance = instance;
    connections[id] = socket;

    instance_add_connection(socket);

    socket.on('message',(data)=>{
        let packet = JSON.parse(data.toString('utf8'));
        
        if (packet.type == "update-position") {
            instance_set_data(socket,{x: packet.parameters.x, y: packet.parameters.y});
        }
    });
    socket.on('close',()=>{
        instance_remove_connection(socket);
    });
});

function instance_add_connection(socket) {
    if (instances[socket.instance] == undefined) {
        instances[socket.instance] = {
            clients: {},
            client_data: {},
        }
    }
    instances[socket.instance].clients[socket.id] = socket;
    instances[socket.instance].client_data[socket.id] = {x: 960 / 2, y: 540 / 2};
}

function instance_set_data(socket,data) {
    if (instances[socket.instance] == undefined) return;
    instances[socket.instance].client_data[socket.id] = {...instances[socket.instance].client_data[socket.id], ...data };
}

function instance_remove_connection(socket) {
    if (instances[socket.instance] == undefined) return;
    delete instances[socket.instance].clients[socket.id];


    if (Object.keys(instances[socket.instance].clients).length == 0) {
        delete instances[socket.instance];
    }
}

function instance_broadcast_data(instance, data) {
    const packet = Buffer.from(JSON.stringify(data),'utf8');
    const clients = Object.values(instances[instance].clients);
    for (const client of clients) {
        try {
            client.send(packet)
        } catch(e) {

        }
    }
}

setInterval(()=>{
    const instance_keys = Object.keys(instances);

    for (key of instance_keys) {
        const instance = instances[key];
        if (instance == undefined) continue;
        const packet = {
            type: 'update-position',
            parameters: instance.client_data
        }
        instance_broadcast_data(key,packet);
    }
},100);