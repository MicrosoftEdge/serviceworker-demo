const express = require('express');
const bodyParser = require('body-parser');
const configuredWebPush = require('./configured-web-push');
const { Subscription } = require('./db');
const router = express.Router();
router.use(bodyParser.json());

// Push Logic
router.get('/api/key', function(req, res) {
    if (configuredWebPush.vapidPublicKey !== '') {
        res.send({
            key: configuredWebPush.vapidPublicKey
        });
    } else {
        res.status(500).send({
            key: 'VAPID KEYS ARE NOT SET'
        });
    }
});

router.post('/api/subscribe', async function(req, res) {
    try {
        const sub = req.body.subscription;

        // Find if user is already subscribed searching by `endpoint`
        const exists = await Subscription.findOne({ endpoint: sub.endpoint });

        if (exists) {
            res.status(400).send('Subscription already exists');

            return;
        }
        
        await (new Subscription(sub)).save();

        res.status(200).send('Success');
    } catch (e) {
        res.status(500).send(e.message);
    }
});

router.post('/api/unsubscribe', async function(req, res) {
    try {
        const sub = req.body.subscription;

        await Subscription.remove({endpoint: sub.endpoint});
        console.log('Deleted: ' + sub.endpoint);

        res.status(200).send('Success');
    } catch (e) {
        res.status(500).send(e.message);
    }
});

router.post('/api/notify', async function(req, res) {
    try {
        const data = req.body;
        
        await configuredWebPush.webPush.sendNotification(data.subscription, data.payload, { contentEncoding: data.encoding })
            .then(function (response) {
                console.log('Response: ' + JSON.stringify(response, null, 4));
                res.status(201).send(response);
            })
            .catch(function (e) {
                console.log('Error: ' + JSON.stringify(e, null, 4));
                res.status(201).send(e);
            });
    } catch (e) {
        res.status(500)
            .send(e.message);
    }
});

module.exports = router;
