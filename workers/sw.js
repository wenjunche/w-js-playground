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

// A Service Worker which skips cache if the request contains
// a cookie.
this.addEventListener('fetch', event => {
    let request = event.request;
    if (request.headers.has('Cookie') || request.url.indexOf('TTL.png') > 0) {
        // Cookie present. Add Cache-Control: no-cache.
        let newHeaders = new Headers(request.headers);
        newHeaders.set('Cache-Control', 'no-cache');
        console.log('sw.js adding cache control', event.request.url);
        event.respondWith(fetch(request, {headers: newHeaders}))
    }
    // Use default behavior.
    return
});

// A Service Worker which replaces {{URL}} with the contents of
// the URL. (A simplified version of "Edge Side Includes".)
addEventListener("fetchxx", event => {
    event.respondWith(fetchAndInclude(event.request))
});
async function fetchAndInclude(request) {
    // Fetch from origin server.
    let response = await fetch(request)

    // Make sure we only modify text, not images.
    let type = response.headers.get("Content-Type") || ""
    if (!type.startsWith("text/")) {
        // Not text. Don't modify.
        return response
    }

    // Read response body.
    let text = await response.text()

    // Search for instances of {{URL}}.
    let regexp = /{{([^}]*)}}/g
    let parts = []
    let pos = 0
    let match
    while (match = regexp.exec(text)) {
        let url = new URL(match[1], request.url)
        parts.push({
            before: text.slice(pos, match.index),
            // Start asynchronous fetch of this URL.
            promise: fetch(url.toString())
                .then((response) => response.text())
        })
        pos = regexp.lastIndex
    }

    // Now that we've started all the subrequests,
    // wait for each and collect the text.
    let chunks = []
    for (let part of parts) {
        chunks.push(part.before)
        // Wait for the async fetch from earlier to complete.
        chunks.push(await part.promise)
    }
    chunks.push(text.slice(pos))
    // Concatenate all text and return.
    return new Response(chunks.join(""), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
    })
}

self.addEventListener("push", async ev => {
    const data = ev.data.text();
    console.log("got push", data);
    console.log("sent default notification");
    self.registration.showNotification(data, {
            body: "Hello new subscriber!",
            icon:
              "https://raw.githubusercontent.com/snwh/paper-icon-theme/master/Paper/512x512/apps/preferences-color.png"
          }        
        );
  });
  
  self.addEventListener('message', function handler (event) {
    console.log(`receiving message: ${event.data}`);
  });
  

  function andrew() {
      let i = 0;
      if (i === 0) {
          let k = 1;
          var m = 1;

      }
      k = 1;
      m = 2
  }




