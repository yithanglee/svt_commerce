importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBN4irx6LVWSxBYULhi_9bKdAGJLI-9Ugk",
  authDomain: "netsphere-7a2eb.firebaseapp.com",
  projectId: "netsphere-7a2eb",
  storageBucket: "netsphere-7a2eb.firebasestorage.app",
  messagingSenderId: "681642701899",
  appId: "1:681642701899:web:12ba9585c18012fa9fc9ce"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message: ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    // icon: payload.notification.icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
