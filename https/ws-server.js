"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ws = require("ws");
var https = require("https");
var fs = require("fs");
var url = require("url");
var path = require("path");
var PORT = 8443;
var options = {
    key: fs.readFileSync('server-key.pem'),
    cert: fs.readFileSync('server-crt.pem'),
    requestCert: true,
    rejectUnauthorized: true,
    //    ca: [ fs.readFileSync('client-crt.pem') ]
    ca: [fs.readFileSync('client-crt.pem'), fs.readFileSync('client-crt2.pem')]
};
var httpsServer = https.createServer(options);
httpsServer.listen(PORT, function () { return console.log("Listening " + PORT); });
//const wss: ws.Server = new ws.Server({server: httpsServer});
var wss = new ws.Server({ noServer: true });
wss.on('connection', function (ws) {
    ws.on('message', function (msg) {
        console.log("received: " + msg);
    });
    ws.send('Welcome');
});
httpsServer.on('upgrade', function upgrade(request, socket, head) {
    console.log('upgrade', request.url);
    var pathname = url.parse(request.url).pathname;
    if (pathname === '/ws') {
        wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request);
        });
    }
    else {
        socket.destroy();
    }
});
httpsServer.on('request', function (req, res) {
    if (req.method === 'GET') {
        var uri = url.parse(req.url).pathname, filename_1 = path.join(process.cwd(), uri);
        fs.exists(filename_1, function (exists) {
            if (!exists) {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.write("404 Not Found\n");
                res.end();
                console.log("404 " + req.url);
                return;
            }
            if (fs.statSync(filename_1).isDirectory()) {
                filename_1 += '/index.html';
            }
            fs.readFile(filename_1, "binary", function (err, file) {
                if (err) {
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.write(err + "\n");
                    res.end();
                    console.log("500 " + req.url);
                    return;
                }
                res.write(file, "binary");
                console.log("200 " + req.url);
                res.end();
            });
        });
    }
});
