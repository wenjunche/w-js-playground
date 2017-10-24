
import * as ws from 'ws';
import * as https from 'https';
import * as fs from 'fs';
import * as url from "url";
import * as path from "path";

const PORT: number = 8443;

const options: https.ServerOptions = {
    key:  fs.readFileSync('server-key.pem'),
    cert: fs.readFileSync('server-crt.pem')
};

const httpsServer = https.createServer(options);
httpsServer.listen(PORT, () => console.log(`Listening ${PORT}`));

const wss: ws.Server = new ws.Server({server: httpsServer});

wss.on('connection', ws => {
    ws.on('message', msg => {
        console.log(`received: ${msg}`);
    });
    ws.send('Welcome');
});
