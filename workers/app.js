
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('sw.js', { scope: '/serviceworker/' }).then(function(reg) {
//
//         if(reg.installing) {
//             console.log('Service worker installing');
//         } else if(reg.waiting) {
//             console.log('Service worker installed');
//         } else if(reg.active) {
//             console.log('Service worker active');
//         }
//
//     }).catch(function(error) {
//         // registration failed
//         console.log('Registration failed with ' + error);
//     });
// }

const worker = new Worker('ww.js');

    worker.addEventListener('message', e => {
        console.log('From Worker', e.data);
    });
    worker.postMessage({name: 'OpenFin'});
