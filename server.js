var server = require('http').createServer()
    , url = require('url')
    , WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({ server: server })
    , express = require('express')
    , app = express()
    , port = 4080;

app.use(function(req, res) {
    res.send({ msg: "hello" });
});

wss.on('connection', function connection(ws) {
    var location = url.parse(ws.upgradeReq.url, true);
    // you might use location.query.access_token to authenticate or share sessions 
    // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312) 

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        var m = JSON.parse(message);
        console.log('callback_id', m.callback_id);
        var i = 0;
        while (i < 10) {
            setTimeout(function() {
                ws.send(JSON.stringify({
                    callback_id: m.callback_id,
                    text: 'this is msg ' + i
                }));
                
            }, 3000);
            i++;
        }
    });
    ws.send(JSON.stringify({ msg: 'Socket Connected to Server' }));
});

server.on('request', app);
server.listen(port, function() { console.log('Listening on ' + server.address().port) });