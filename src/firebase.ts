import admin from "firebase-admin";
var serviceAccount = require("../serviceAccountKey.json");

// Ensure this path is correct

let messaging: admin.messaging.Messaging;

const initializeFirebase = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount), // Type casting for TypeScript
    });
    messaging = admin.messaging();
    console.log("Firebase has been initialized");
  } else {
    messaging = admin.messaging();
    console.log("Firebase was already initialized");
  }
};
console.log("this is messaging");
// console.log(messaging);

export { initializeFirebase, messaging };
