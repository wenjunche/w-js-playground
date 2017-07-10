"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socketIO = require("socket.io");
var port = 8000;
var io = socketIO();
io.on('connection', function (client) {
    console.log('connected', client.id);
    client.on('subscribeToTimer', function (interval) {
        console.log('client is subscribing to timer with interval ', interval);
        setInterval(function () {
            client.emit('timer', new Date());
        }, interval);
    });
});
io.listen(port);
console.log('listening on port ', port);
//# sourceMappingURL=serverTS.js.map