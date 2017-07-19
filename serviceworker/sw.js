// service worker

this.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open('v1').then(function (cache) {
            return cache.addAll(['TTL.png']);
        })
    );
});

this.addEventListener('fetch', function(event) {
    event.respondWith(caches.match(event.request).catch(function() {
        return fetch(event.request);
    }).then(function(mresponse) {
        if (mresponse) {
            console.log('return matched response', event.request.url);
            return mresponse;
        } else {
            console.log('fetching', event.request.url);
            return fetch(event.request).then(response => {
                return caches.open('v1').then(function (cache) {
                    console.log('putting', event.request.url);
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        }
    }).catch(function() {
        console.error("Mismatch", event.request)
    }));
});