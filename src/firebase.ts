import admin from "firebase-admin";
var serviceAccount = require("../serviceAccountKey.json");

let messaging: admin.messaging.Messaging;

const initializeFirebase = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    messaging = admin.messaging();
    console.log("Firebase has been initialized");
  } else {
    messaging = admin.messaging();
    console.log("Firebase was already initialized");
  }
};

export { initializeFirebase, messaging };
