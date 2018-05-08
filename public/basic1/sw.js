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
                './main.js',
                './fallback.html'
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

self.onfetch = function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request).catch(function() {
                return caches.match('./fallback.html');
            });
        })
    );
}
