"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ws = require("ws");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var client = new ws('wss://localhost:8443');
client.on('open', function () {
    console.log('connected');
    client.send('Hello');
});
client.on('message', function (msg) {
    console.log("received: " + msg);
});
/*
    From OpenFin

    const socket = new WebSocket('wss://localhost:8443');
    socket.addEventListener('open', function (event) {
        socket.send('Hello Server!');
    });
    socket.addEventListener('message', function (event) {
        console.log('Message from server ', event.data);
    });

*/ 
