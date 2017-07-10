import openSocket from 'socket.io-client';

const socket = openSocket('http://localhost:8000');

socket.on('timer', d => console.log(d));

socket.emit('subscribeToTimer', 1000);