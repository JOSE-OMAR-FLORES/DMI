// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth,
  getReactNativePersistence 
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYF-VHF_2YkFY1dKXuAKbztAWIo7qKFos",
  authDomain: "dmi-app-88868.firebaseapp.com",
  projectId: "dmi-app-88868",
  storageBucket: "dmi-app-88868.firebasestorage.app",
  messagingSenderId: "118695185005",
  appId: "1:118695185005:web:48642a050a148f4f89cd64",
  measurementId: "G-TFD4D9JM05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { app, auth };
export default app;
