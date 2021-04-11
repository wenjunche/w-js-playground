
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('sw.js', { scope: '/' }).then(function(reg) {
//         if(reg.installing) {
//             console.log('Service worker installing');            
//         } else if(reg.waiting) {
//             console.log('Service worker installed');
//         } else if(reg.active) {
//             console.log('Service worker active');
//         }
//         window.bigreg = reg;

//     }).catch(function(error) {
//         // registration failed
//         console.log('Registration failed with ' + error);
//     });
// }

// const worker = new Worker('ww.js');

// worker.addEventListener('message', e => {
//     console.log('From Worker', e.data);
// });
// worker.postMessage({name: 'OpenFin'});

const worker = new SharedWorker("shw.js");

worker.port.onmessage = function(e) {
	console.log('from share worker: ', e);
};

// worker.port.start();

worker.port.postMessage("Hello From main");