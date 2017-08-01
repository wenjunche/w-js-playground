"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var openSocket = require("socket.io-client");
fin.desktop.main(function () {
    var socket = openSocket('http://localhost:8000');
    socket.on('timer', function (d) { return console.log(d); });
    socket.emit('subscribeToTimer', 1000);
});
//# sourceMappingURL=clientTS.js.map