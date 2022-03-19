const express = require('express');
const fetch = require('node-fetch');
const WebSocket = require('ws');
const config = require('../config');

const app = express();
app.use(require('cookie-parser')());

const server = new WebSocket.Server({
    port: 8080
});

let sockets = [];
server.on('connection', function(socket) {
    sockets.push(socket);

    socket.on('message', function(msg) {

    });

    socket.on('close', function() {
        sockets = sockets.filter(s => s !== socket);
    });
});

let states = [];
let sessions = [];

class Session{
    constructor(token, res, url){
        this.token = token;
        this.error = null;
        this.id = require('uuid').v1() + require('uuid').v4() + require('uuid').v1() + require('uuid').v4() + require('uuid').v1();
        this.user = null;
        this.guilds = null;
        sessions.push(this);

        res.cookie('_token', this.id, { maxAge: 31557600000 });

        this.firstStage();

        this.afterFirst = () => {
            let count = 0

            let afterGotData = () => {
                if(url){
                    res.redirect(url.url);
                } else{
                    res.redirect('/')
                }
            }

            this.fetch('https://discord.com/api/users/@me', ( user ) => {
                this.user = user;
                count++;

                if(count >= 2){
                    afterGotData();
                }
            });

            this.fetch('https://discord.com/api/users/@me/guilds', ( guilds ) => {
                this.guilds = guilds;
                count++;

                if(count >= 2){
                    afterGotData();
                }
            });
        }
    }
    firstStage(){
        fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: config.app.auth.clientID,
                client_secret: config.app.auth.secret,
                code: this.token,
                grant_type: 'authorization_code',
                redirect_uri: 'http://localhost/api/v1/auth/callback',
                scope: 'identify',
            })
        }).then(data => data.json()).then(data => {
            if(data.error)return this.onError(data);

            this.accessToken = data.access_token;
            this.refreshToken = data.refresh_token;
            this.tokenType = data.token_type;
            this.scope = data.scope;

            this.afterFirst();
        })
    }
    fetch(url, cb){
        fetch(url, {
            headers: {
                authorization: `${this.tokenType} ${this.accessToken}`,
            }
        }).then(data => data.json()).then(udata => {
            cb(udata);
        })
    }
    onError(e){
        console.error(JSON.stringify(e));
    }
}

app.get('/api/v1/auth/callback', (req, res) => {
    if(req.query.code){
        let url = states.find(x => x.state = req.query.state);
        states = states.fill(x => x.state !== req.query.state);

        new Session(req.query.code, res, url);
    } else{
        let state = generateRandomString();
        states.push({state, url: req.query.r || '/' });

        res.redirect('https://discord.com/api/oauth2/authorize?client_id=865965649343152169&redirect_uri=http%3A%2F%2Flocalhost%2Fapi%2Fv1%2Fauth%2Fcallback&response_type=code&scope=identify%20guilds&state='+state);
    }
})

app.get('/player', (req, res) => {
    let token = req.cookies._token;
    if(!token)return res.redirect('/api/v1/auth/callback?r='+req.url);
    let ses = sessions.find(x => x.id === token);
    if(!ses)return res.redirect('/api/v1/auth/callback?r='+req.url);

    res.render('player.ejs', { id: req.query.id, token: ses.token });
})

app.listen(80);

let generateRandomString = () => {
	let randomString = '';
	const randomNumber = Math.floor(Math.random() * 10);

	for (let i = 0; i < 20 + randomNumber; i++) {
        let c = 65 + Math.floor(Math.random() * 25)
		randomString += String.fromCharCode(c);
	}

	return randomString;
}