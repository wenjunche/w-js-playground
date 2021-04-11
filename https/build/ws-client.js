"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const client = new ws_1.default('wss://localhost:8443');
client.on('open', () => {
    console.log('connected');
    client.send('Hello');
});
client.on('message', (msg) => {
    console.log(`received: ${msg}`);
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
