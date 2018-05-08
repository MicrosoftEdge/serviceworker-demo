function updatePage(details) {
    document.querySelector('.current').innerText = details.temp;
    document.querySelector('.weather-info .description').innerText = details.description;

    document.querySelector('.weather-info .details').innerHTML = '';
    for (var i = 0; i < details.details.length; i++) {
        var li = document.createElement('li');
        var span = document.createElement('span');
        span.innerText = details.details[i].label;
        var text = document.createTextNode(' ' + details.details[i].value);
        li.appendChild(span);
        li.appendChild(text);
        document.querySelector('.weather-info .details').appendChild(li);
    }

    var time = new Date(details.time);
    var hours = time.getHours();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    var minutes = time.getMinutes();
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = (minutes < 10 ? '0' : '') + minutes;
    var lastUpdated = hours + ':' + minutes + ' ' + ampm;

    document.querySelector('.weather-info .last-updated .time').innerText = lastUpdated;

    document.querySelector('.wrapper').style.opacity = 1;
}

function displayNetworkError() {
    var wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'wrapper';
    var infoDiv = document.createElement('div');
    infoDiv.className = 'weather-info';
    var textSpan = document.createElement('span');
    textSpan.className = 'last-updated';
    textSpan.style.textAlign = 'center';
    textSpan.style.paddingTop = '18rem';
    textSpan.innerText = 'Please connect to the internet and retry.';
    infoDiv.appendChild(textSpan);
    wrapperDiv.appendChild(infoDiv);
    document.querySelector('.wrapper').style.display = 'none';
    document.querySelector('.bg').appendChild(wrapperDiv);
}