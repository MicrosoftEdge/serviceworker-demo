const { Subscription } = require('./db');
const configuredWebPush = require('./configured-web-push');

const init = async function() {
    let pushMessage = "Extreme weather! Come check it out!";

    try {
        const cursor = Subscription.find().cursor();
        await cursor.eachAsync(function(sub) {
            return configuredWebPush.webPush.sendNotification({
                endpoint: sub.endpoint,
                keys: {
                    auth: sub.keys.auth,
                    p256dh: sub.keys.p256dh
                }
            }, pushMessage, {contentEncoding: 'aes128gcm'})
            .then(function(push) {
                console.log(push);
            })
            .catch(function(e) {
                // 404 for FCM AES128GCM
                if (e.statusCode === 410 || e.statusCode === 404) {
                    // delete invalid registration
                   return Subscription.remove({endpoint: sub.endpoint}).exec()
                        .then(function(sub) {
                            console.log('Deleted: ' + sub.endpoint);
                        })
                        .catch(function(sub) {
                            console.error('Failed to delete: ' + sub.endpoint);
                        });
                }
            });
        });
    } catch (e) {
        console.log(e);
    }

    console.log('Job executed correctly');
};

init().catch(function(err) {
    console.error(err);
    process.exit(1);
});
