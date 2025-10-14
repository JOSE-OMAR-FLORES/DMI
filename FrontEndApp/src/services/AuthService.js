import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { firebaseConfig } from '../config/firebase.config';

// Inicializar Firebase (si no está inicializado)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const API_BASE = process.env.API_URL || 'http://localhost:8000'; // backend placeholder

export class AuthService {
  // Registro con email/password (luego el segundo factor se solicita vía backend)
  static async signUp(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Notificar al backend para inicializar MFA (opcional)
      try {
        await axios.post(`${API_BASE}/api/auth/mfa/enroll`, { uid: userCredential.user.uid, email });
      } catch (e) {
        // Backend puede no existir aún; lo ignoramos pero logueamos
        console.warn('No se pudo notificar al backend para enroll MFA:', e.message);
      }
      return userCredential;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  // Login con email/password. Si el backend indica MFA requerido, el frontend debe solicitar OTP.
  static async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Consultar al backend si requiere segundo factor
      try {
        const resp = await axios.post(`${API_BASE}/api/auth/mfa/check`, { uid: userCredential.user.uid });
        // backend debería devolver { mfaRequired: true/false, methods: ['email','sms'] }
        return { user: userCredential.user, mfa: resp.data };
      } catch (e) {
        // Si el backend no responde, asumimos sin MFA
        return { user: userCredential.user, mfa: { mfaRequired: false } };
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  // Solicitar OTP vía backend. method: 'email' o 'sms'
  static async requestOTP(uid, method = 'email') {
    try {
      const resp = await axios.post(`${API_BASE}/api/auth/mfa/send-otp`, { uid, method });
      // backend debe enviar el OTP al usuario (email o SMS)
      return resp.data;
    } catch (error) {
      console.error('Error solicitando OTP:', error);
      throw error;
    }
  }

  // Verificar el OTP contra el backend. El backend debe devolver un token de sesión (por ejemplo Firebase ID token o JWT propio)
  static async verifyOTP(uid, code) {
    try {
      const resp = await axios.post(`${API_BASE}/api/auth/mfa/verify-otp`, { uid, code });
      const { token } = resp.data;
      if (token) {
        await SecureStore.setItemAsync('authToken', token);
      }
      return resp.data;
    } catch (error) {
      console.error('Error verificando OTP:', error);
      throw error;
    }
  }

  static async storeAuthToken(token) {
    try {
      await SecureStore.setItemAsync('authToken', token);
    } catch (error) {
      console.error('Error guardando token:', error);
      throw error;
    }
  }

  static async getAuthToken() {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Error obteniendo token:', error);
      throw error;
    }
  }

  static async getCurrentUser() {
    return new Promise((resolve) => {
      const unsub = onAuthStateChanged(auth, (user) => {
        unsub();
        resolve(user);
      });
    });
  }

  static async signOut() {
    try {
      await firebaseSignOut(auth);
      await SecureStore.deleteItemAsync('authToken');
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }
}