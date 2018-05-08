if (navigator.serviceWorker) {
    navigator.serviceWorker.register('sw.js').then(function() { console.log('SW registered!'); });
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

    fetch('./weather.json')
        .then(function(response) {
            return response.json();
        })
        .then(function(json) {
            updatePage(json);
            document.querySelector('.wrapper').style.visibility = 'visible';
        })
        .catch(function() {
            displayNetworkError();
        });
});
