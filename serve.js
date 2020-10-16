const express = require('express');

const app = express();
const port = process.env.PORT || 2020;

app.use(express.static('public'));
app.use('/push', require('./serve-push'));
app.disable('x-powered-by');

app.get('/appcache/appcache.manifest', function(req, res) {
    res.set('Content-type', 'text/cache-manifest').status(200).send();
});

const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');

const isDirectory = source => lstatSync(source).isDirectory();
const getDirectories = source =>
  readdirSync(source).map(name => name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))//.filter(isDirectory).map(name => name);

const dirs = getDirectories('public').join('|');

// const files = getDirectories('public-common');

// for (file of files) {
//     app.get(getRegExp(file), function (req, res) {
//         res.sendFile()
//     });
// }

function getRegExp(path) {
    return new RegExp(`/(${dirs})/${path}`);
}

app.get(getRegExp('weather.json'), async function(req, res) {
    let temp;
    let description;
    let details;

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function pad(num) {
        return (num < 10 ? '0' : '') + num;
    }

    weatherTypes = [
        'Mostly Sunny',
        'Partly Sunny',
        'Mostly Cloudy',
        'Partly Cloudy',
        'Rain',
        'Snow'
    ];

    temp = getRandomInt(0, 99);
    description = weatherTypes[getRandomInt(0, weatherTypes.length - 1)];
    details = [
        {label: 'Feels Like', value: getRandomInt(temp - 10, temp + 10) + '°'},
        {label: 'Wind', value: getRandomInt(0, 35) + ' mph'},
        {label: 'Barometer', value: getRandomInt(29, 31) + '.' + pad(getRandomInt(0, 99)) + ' in'},
        {label: 'Visibility', value: getRandomInt(1, 50) + ' mi'},
        {label: 'Humidity', value: getRandomInt(20, 90) + '%'},
        {label: 'Dew Point', value: getRandomInt(temp - 20, temp - 5) + '°'}
    ];

    setTimeout(function() {
        res.status(200).send({
            temp: temp,
            description: description,
            details: details,
            time: Date.now()
        });
    }, 2000);
});

app.get('/appcache(/index.html)?', function(req, res) {
    res.sendFile(__dirname + '/public/' + req.params[1] + '/index.html');
});

app.get(getRegExp('manifest.json'), function(req, res) {
    res.sendFile(__dirname + '/public-common/manifest.json');
});
app.get(getRegExp('fonts/(.*)'), function(req, res) {
  res.sendFile(__dirname + '/public-common/fonts/' + req.params[1]);
});
app.get(getRegExp('images/(.*)'), function(req, res) {
  res.sendFile(__dirname + '/public-common/images/' + req.params[1]);
});
app.get(getRegExp('(index.html|bg.jpg|fallback.html|styles.css|common.js|util.js)?'), function(req, res) {
    res.sendFile(__dirname + '/public-common/' + (req.params[1] === undefined ? 'index.html' : req.params[1]));
});

app.listen(port, function() {
    console.log('Server listening on port ' + port);
});
