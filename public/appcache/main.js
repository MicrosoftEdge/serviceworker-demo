document.addEventListener('DOMContentLoaded', function() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            updatePage(JSON.parse(this.responseText));
            document.querySelector('.wrapper').style.visibility = 'visible';
        }
    };
    xhr.open('GET', './weather.json', true);
    xhr.send();
});
