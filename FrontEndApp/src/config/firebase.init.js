// Inicialización de Firebase para la app React Native (Expo / web SDK)
// Usa `firebaseConfig` desde `firebase.config.js`.
// Si en tu proyecto prefieres `react-native-firebase`, reemplaza estas funciones con esa librería.

import { firebaseConfig } from './firebase.config';

// Ejemplo de uso (ya inicializamos en AuthService):
export function getFirebaseConfig() {
  return firebaseConfig;
}

// NOTA: En Expo gestionamos credenciales vía .env y no commiteamos secrets.
