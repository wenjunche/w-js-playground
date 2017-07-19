import * as openSocket from 'socket.io-client';

const socket: SocketIOClient.Socket = openSocket('http://localhost:8000');

socket.on('timer', d => console.log(d));

socket.emit('subscribeToTimer', 1000);