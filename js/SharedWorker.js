var list = [];

setInterval(function () {
    for (var i = 0; i < list.length; ++i) {
        list[i].postMessage("#connections = " + list.length);
    }
}, 1000);

onconnect = function (event) {
    list.push(event.ports[0]);
}; 