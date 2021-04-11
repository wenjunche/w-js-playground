// share web worker
// debug: chrome://inspect/#workers

let connections = 0;

onconnect = function (e) {
    console.log('shared worker connected', e);
	connections++;
	var port = e.ports[0];
	port.onmessage = function (e) {
		port.postMessage("Hello " + e.data + " (port #" + connections + ")");
	};
};

console.log('shared worker started');