var CACHE = 'cache-only';

console.log('inside ws.js');

self.addEventListener('install', function(evt) {
    console.log('The service worker is being installed.');
    evt.waitUntil(precache());
});

self.addEventListener('fetch', function(evt) {
    console.log('The service worker is serving the asset.');
    evt.respondWith(fromCache(evt.request));
});

function precache() {
    return caches.open(CACHE).then(function (cache) {
        return cache.addAll([
            '../index.html',
            '../childWindow.html'
        ]);
    });
}

function fromCache(request) {
    return caches.open(CACHE).then(function (cache) {
        return cache.match(request).then(function (matching) {
            return matching || Promise.reject('no-match');
        });
    });
}