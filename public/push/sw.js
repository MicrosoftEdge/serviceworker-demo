importScripts('./util.js');

self.oninstall = function(event) {
    event.waitUntil(
        caches.open('assets-v1').then(function(cache) {
            return cache.addAll([
                './',
                './index.html',
                './styles.css',
                './bg.jpg',
                './common.js',
                './util.js',
                './main.js'
            ]);
        })
    );
}

self.onactivate = function(event) {
    var keepList = ['assets-v1'];
 
    event.waitUntil(
        caches.keys().then(function(cacheNameList) {
            return Promise.all(cacheNameList.map(function(cacheName) { 
                if (keepList.indexOf(cacheName) === -1) {
                    return caches.delete(cacheName);
                }
            }));
        })
    );
}

function fetchAndCache(request) {
    return fetch(request).then(function(response) {
        caches.open('dynamic').then(function(cache) {
            cache.put(request, response);
        });
        return response.clone();
    });
}

self.onfetch = function(event) {
    if (event.request.url.indexOf('weather.json') !== -1) {
        event.respondWith(fetchAndCache(event.request));
    } else {
        event.respondWith(
            caches.match(event.request).then(function(response) {
                return response || fetchAndCache(event.request);
            })
        );
    }
}

self.onpush = function(event) {
    const payload = event.data ? event.data.text() : 'no payload';
    event.waitUntil(
        registration.showNotification('Weather Advisory', {
            body: payload,
            icon: 'icon.png'
        })
    );
}

self.onnotificationclick = function(event) {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function(clientList) {
                if (clientList.length > 0) {
                    let client = clientList[0];
                    for (let i = 0; i < clientList.length; i++) {
                        if (clientList[i].focused) { client = clientList[i]; }
                    }
                    return client.focus();
                }

                return clients.openWindow('/push/');
            })
    );
}

self.onpushsubscriptionchange = function(event) {
    event.waitUntil(
        Promise.all([
            Promise.resolve(event.oldSubscription ?    
                deleteSubscription(event.oldSubscription) : true),
            Promise.resolve(event.newSubscription ?
                event.newSubscription :
                subscribePush(registration))
                    .then(function(sub) { return saveSubscription(sub); })
        ])
    );
}
