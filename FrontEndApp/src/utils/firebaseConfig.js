// firebaseConfig.js - Configuración de Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from '@env';

/**
 * Configuración de Firebase
 * Las credenciales vienen del archivo .env
 * 
 * Para obtener estas credenciales:
 * 1. Ve a https://console.firebase.google.com/
 * 2. Selecciona tu proyecto o crea uno nuevo
 * 3. Ve a Project Settings (⚙️) > General
 * 4. En "Your apps", agrega una app web (</>) si no existe
 * 5. Copia las credenciales y agrégalas al archivo .env
 */
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY || 'demo-api-key',
  authDomain: FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: FIREBASE_APP_ID || '1:123456789:web:abcdef123456',
};

// Validar que las credenciales estén configuradas
const validateFirebaseConfig = () => {
  const isConfigured = 
    FIREBASE_API_KEY && 
    FIREBASE_API_KEY !== 'your_firebase_api_key_here' &&
    FIREBASE_PROJECT_ID && 
    FIREBASE_PROJECT_ID !== 'your-project-id';

  if (!isConfigured) {
    console.warn('⚠️ Firebase no está configurado correctamente.');
    console.warn('Por favor, configura las credenciales en el archivo .env');
    console.warn('Instrucciones: https://console.firebase.google.com/');
    return false;
  }

  return true;
};

// Inicializar Firebase
let app;
let db;

try {
  const isConfigured = validateFirebaseConfig();
  
  if (isConfigured) {
    console.log('🔥 Inicializando Firebase...');
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('✅ Firebase inicializado correctamente');
    console.log(`📦 Proyecto: ${firebaseConfig.projectId}`);
  } else {
    console.log('⚠️ Firebase en modo demo (sin conexión real)');
    console.log('Configura las credenciales en .env para usar Firebase');
  }
} catch (error) {
  console.error('❌ Error inicializando Firebase:', error.message);
  console.warn('La app funcionará sin Firebase hasta que se configure');
}

// Exportar instancias
export { app, db };
export default firebaseConfig;

/**
 * Colecciones de Firestore
 * Nombres estandarizados para las colecciones
 */
export const COLLECTIONS = {
  USER_FAVORITES: 'userFavorites',
  WEATHER_CACHE: 'weatherCache',      // Para uso futuro
  USER_SETTINGS: 'userSettings',      // Para uso futuro
};

/**
 * Verificar si Firebase está configurado
 */
export const isFirebaseConfigured = () => {
  return db !== undefined && db !== null;
};
