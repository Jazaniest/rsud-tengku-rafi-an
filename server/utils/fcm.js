// server/utils/fcm.js
const admin = require('firebase-admin');
const serviceAccount = require('../rsud-tengku-rafi-an-fc8f1-firebase-adminsdk-fbsvc-67a44e01d5.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

function sendNotification(fcmToken, payload) {
    const message = {
        tokens: Array.isArray(fcmToken) ? fcmToken : [fcmToken],
        notification: payload.notification,
    };
    return admin.messaging().sendEachForMulticast(message);
}

module.exports = { sendNotification };
