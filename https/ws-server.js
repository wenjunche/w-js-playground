"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ws = require("ws");
var https = require("https");
var fs = require("fs");
var PORT = 8443;
var options = {
    key: fs.readFileSync('server-key.pem'),
    cert: fs.readFileSync('server-crt.pem')
};
var httpsServer = https.createServer(options);
httpsServer.listen(PORT, function () { return console.log("Listening " + PORT); });
var wss = new ws.Server({ server: httpsServer });
wss.on('connection', function (ws) {
    ws.on('message', function (msg) {
        console.log("received: " + msg);
    });
    ws.send('Welcome');
});
