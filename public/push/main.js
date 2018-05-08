if (navigator.serviceWorker) {
    registerServiceWorker().then(function() {
        registerPush().then(function(sub) {
            sendMessage(sub, 'Extreme weather! Come check it out!');
        });
    });
} else {
    // service worker is not supported, so it won't work!
    console.log('SW & Push are Not Supported');
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.refresh').addEventListener('click', function(event) {
        event.preventDefault();
        document.querySelector('.wrapper').style.opacity = .5;
        
        fetch('./weather.json')
            .then(function(response) {
                return response.json();
            })
            .then(function(json) {
                updatePage(json);
                document.body.className = '';
            })
            .catch(function() {
                document.querySelector('.wrapper').style.opacity = 1;
                document.body.className = 'desaturate';
            });
    });

    function showLoading() {

    }

    function hideLoading() {
        document.querySelector('.wrapper').style.visibility = 'visible';
    }

    showLoading();

    var networkDone = false;
    
    var networkRequest = fetch('./weather.json')
        .then(function(response) {
            return response.json();
        })
        .then(function(json) {
            networkDone = true;
            updatePage(json);
            document.body.className = '';
        });
    
    caches.match('./weather.json')
        .then(function(response) {
            if (!response) {
                throw Error('No data');
            }
    
            return response.json();
        })
        .then(function(json) {
            if (!networkDone) updatePage(json);
        })
        .catch(function() {return networkRequest;})
        .catch(function() {
            displayNetworkError();
        })
        .then(hideLoading);
});

function registerServiceWorker() {
    return navigator.serviceWorker.register('sw.js');
}

function resetServiceWorkerAndPush() {
    return navigator.serviceWorker.getRegistration()
        .then(function(registration) {
            if (registration) {
                return registration.unregister();
            }
        })
        .then(function() {
            return registerServiceWorker().then(function(registration) {
                return registerPush();
            });
        });
}

function registerPush() {
    return navigator.serviceWorker.ready
        .then(function(registration) {
            return registration.pushManager.getSubscription().then(function(subscription) {
                if (subscription) {
                    // renew subscription if we're within 5 days of expiration
                    if (subscription.expirationTime && Date.now() > subscription.expirationTime - 432000000) {
                        return subscription.unsubscribe().then(function() {
                            return subscribePush(registration);
                        });
                    }

                    return subscription;
                }

                return subscribePush(registration);
            });
        })
        .then(function(subscription) {
            saveSubscription(subscription);
            return subscription;
        });
}

function sendMessage(sub, message) {
    const data = {
        subscription: sub,
        payload: message
    }

    return fetch('./api/notify', {
        method: 'post',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}
