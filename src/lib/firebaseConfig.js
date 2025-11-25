import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import Cookies from 'js-cookie';
import { PHX_ENDPOINT, PHX_HTTP_PROTOCOL, PHX_COOKIE } from '$lib/constants';
import { postData } from '$lib/index.js';
import { isToastOpen } from '$lib/stores/toast';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
// Basic runtime validation to surface common misconfigurations early
function validateFirebaseConfig(config) {
  const required = ['apiKey', 'projectId', 'messagingSenderId', 'appId'];
  const missing = required.filter((k) => !config[k]);
  if (missing.length) {
    console.error('Missing Firebase env(s):', missing.join(', '));
    return false;
  }
  const expected = `1:${config.messagingSenderId}:web:`;
  if (!String(config.appId).startsWith(expected)) {
    console.warn('Firebase appId does not match messagingSenderId. Check your envs belong to the same Firebase project.');
  }
  return true;
}

validateFirebaseConfig(firebaseConfig);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
let messaging = null;

// Initialize messaging only on the client side and after service worker registration
if (typeof window !== 'undefined') {
  // Initialize messaging after making sure service worker is registered
  const initializeMessaging = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        });
        
        // Wait for the service worker to be ready
        await navigator.serviceWorker.ready;
        
        messaging = getMessaging(app);
        console.log('Firebase messaging initialized with service worker:', registration);
      }
    } catch (error) {
      console.error('Failed to initialize Firebase messaging:', error);
    }
  };

  initializeMessaging();
}

async function requestNotificationPermission() {
  try {
    if (!messaging) {
      throw new Error('Messaging not initialized');
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Make sure we have a service worker registration
      const serviceWorkerRegistration = await navigator.serviceWorker.ready;
      
      const currentToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration
      });

      if (currentToken) {
        await saveTokenToServer(currentToken);
        isToastOpen.notify('FCM Token Saved Successfully');
        return currentToken;
      }
    }

    throw new Error('No registration token available');
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    throw error;
  }
}

function onMessageListener() {
  if (!messaging) return;

  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
}

async function saveTokenToServer(token) {
  try {
    console.log('Checking existing user...');
    const storedCookie = Cookies.get(PHX_COOKIE);

    if (storedCookie) {
      const response = await fetch(
        `${PHX_HTTP_PROTOCOL}${PHX_ENDPOINT}/svt_api/webhook?scope=get_cookie_merchant&cookie=${storedCookie}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const storedUser = await response.json();

      if (storedUser) {
        let url = `${PHX_HTTP_PROTOCOL}${PHX_ENDPOINT}`;
        await postData(
          { 
            token: token, 
            user_token: storedUser.cookie, 
            scope: 'user_fcm_token' 
          },
          { endpoint: `${url}/svt_api/webhook` }
        );
        console.log('FCM token saved successfully');
      }
    }
  } catch (error) {
    console.error('Error saving token:', error);
    throw error;
  }
}

export { auth, requestNotificationPermission, onMessageListener };


