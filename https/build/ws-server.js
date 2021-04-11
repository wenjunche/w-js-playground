"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws = __importStar(require("ws"));
const https = __importStar(require("https"));
const fs = __importStar(require("fs"));
const url = __importStar(require("url"));
const path = __importStar(require("path"));
const PORT = 8443;
const options = {
    key: fs.readFileSync('server-key.pem'),
    cert: fs.readFileSync('server-crt.pem'),
    requestCert: true,
    rejectUnauthorized: true,
    //    ca: [ fs.readFileSync('client-crt.pem') ]
    ca: [fs.readFileSync('client-crt.pem'), fs.readFileSync('client-crt2.pem')]
};
const httpsServer = https.createServer(options);
httpsServer.listen(PORT, () => console.log(`Listening ${PORT}`));
//const wss: ws.Server = new ws.Server({server: httpsServer});
const wss = new ws.Server({ noServer: true });
wss.on('connection', ws => {
    ws.on('message', msg => {
        console.log(`received: ${msg}`);
    });
    ws.send('Welcome');
});
httpsServer.on('upgrade', function upgrade(request, socket, head) {
    console.log('upgrade', request.url);
    const pathname = url.parse(request.url).pathname;
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
        let uri = url.parse(req.url).pathname, filename = path.join(process.cwd(), uri);
        fs.exists(filename, function (exists) {
            if (!exists) {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.write("404 Not Found\n");
                res.end();
                console.log("404 " + req.url);
                return;
            }
            if (fs.statSync(filename).isDirectory()) {
                filename += '/index.html';
            }
            fs.readFile(filename, "binary", function (err, file) {
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
