import * as socketIO from  "socket.io";
import Socket = SocketIO.Socket;

const port: number = 8000;
const io: SocketIO.Server = socketIO();

io.on('connection', (client: Socket) => {
    console.log('connected', client.id);
    client.on('subscribeToTimer', (interval: number) => {
        console.log('client is subscribing to timer with interval ', interval);
        setInterval(() => {
            client.emit('timer', new Date());
        }, interval);
    });
});


io.listen(port);
console.log('listening on port ', port);
