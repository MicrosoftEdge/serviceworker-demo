if (navigator.serviceWorker) {
    navigator.serviceWorker.register('sw.js').then(function() { console.log('SW registered!') });
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
