
import * as ws from 'ws';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const client: ws = new ws('wss://localhost:8443');

client.on('open', () => {
    console.log('connected');
    client.send('Hello');
});

client.on('message', (msg) => {
   console.log(`received: ${msg}`);
});
