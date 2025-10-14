/**
 * 🔐 Servicio de Autenticación Híbrida
 * Integra Firebase Auth + JWT Backend + MFA
 */

import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  PhoneAuthProvider,
  multiFactor,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier
} from 'firebase/auth';
import { auth } from '../config/firebase';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:8000/api/v1';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.jwtToken = null;
    
    // Listener de cambios en autenticación Firebase
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
    });
  }

  /**
   * 📝 Registro tradicional (sin Firebase)
   */
  async register(name, email, password, passwordConfirmation) {
    try {
      const response = await axios.post(`${API_BASE_URL}/secure/register`, {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation
      });

      return {
        success: true,
        data: response.data,
        message: 'Usuario registrado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrar usuario'
      };
    }
  }

  /**
   * 📝 Registro con Firebase
   */
  async registerWithFirebase(email, password, displayName) {
    try {
      // 1. Crear usuario en Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Actualizar perfil
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // 3. Enviar verificación de email
      await sendEmailVerification(user);

      // 4. Obtener token de Firebase
      const firebaseToken = await user.getIdToken();

      // 5. Registrar en backend y obtener JWT
      const backendResponse = await axios.post(`${API_BASE_URL}/secure/login-firebase`, {
        firebase_token: firebaseToken
      });

      // 6. Guardar JWT
      const jwtToken = backendResponse.data.access_token;
      await this.saveToken(jwtToken);

      return {
        success: true,
        user: backendResponse.data.user,
        firebaseUser: user,
        mfaEnabled: backendResponse.data.mfa_enabled,
        message: 'Registro exitoso. Por favor verifica tu email.'
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleFirebaseError(error)
      };
    }
  }

  /**
   * 🔑 Login tradicional (puede requerir MFA)
   */
  async login(email, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/secure/login`, {
        email,
        password
      });

      // Verificar si requiere MFA
      if (response.data.mfa_required) {
        return {
          success: true,
          mfaRequired: true,
          mfaToken: response.data.mfa_token,
          message: response.data.message
        };
      }

      // Si no requiere MFA, guardar token
      await this.saveToken(response.data.access_token);

      return {
        success: true,
        user: response.data.user,
        token: response.data.access_token,
        mfaRequired: false
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al iniciar sesión'
      };
    }
  }

  /**
   * 🔑 Login con Firebase
   */
  async loginWithFirebase(email, password) {
    try {
      // 1. Autenticar con Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Obtener token de Firebase
      const firebaseToken = await user.getIdToken();

      // 3. Autenticar en backend
      const response = await axios.post(`${API_BASE_URL}/secure/login-firebase`, {
        firebase_token: firebaseToken
      });

      // 4. Manejar respuesta según nivel de riesgo
      if (response.data.mfa_required) {
        return {
          success: true,
          mfaRequired: true,
          riskLevel: response.data.risk_level,
          message: 'Se requiere verificación adicional debido al nivel de riesgo'
        };
      }

      // 5. Guardar JWT
      await this.saveToken(response.data.access_token);

      return {
        success: true,
        user: response.data.user,
        firebaseUser: response.data.firebase_user,
        token: response.data.access_token,
        mfaEnabled: response.data.mfa_enabled,
        riskLevel: response.data.risk_level
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleFirebaseError(error)
      };
    }
  }

  /**
   * ✅ Verificar código MFA
   */
  async verifyMfa(mfaToken, otpCode) {
    try {
      const response = await axios.post(`${API_BASE_URL}/secure/verify-mfa`, {
        mfa_token: mfaToken,
        otp_code: otpCode
      });

      await this.saveToken(response.data.access_token);

      return {
        success: true,
        user: response.data.user,
        token: response.data.access_token
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Código MFA inválido'
      };
    }
  }

  /**
   * 📱 Solicitar código MFA
   */
  async requestMfa() {
    try {
      const token = await this.getToken();
      const response = await axios.post(
        `${API_BASE_URL}/secure/request-mfa`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      return {
        success: true,
        message: response.data.message,
        expiresIn: response.data.expires_in
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al solicitar MFA'
      };
    }
  }

  /**
   * 🔓 Habilitar MFA
   */
  async enableMfa(otpCode) {
    try {
      const token = await this.getToken();
      const response = await axios.post(
        `${API_BASE_URL}/secure/enable-mfa`,
        { otp_code: otpCode },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      return {
        success: true,
        user: response.data.user,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al habilitar MFA'
      };
    }
  }

  /**
   * 🔒 Deshabilitar MFA
   */
  async disableMfa(password) {
    try {
      const token = await this.getToken();
      const response = await axios.post(
        `${API_BASE_URL}/secure/disable-mfa`,
        { password },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      return {
        success: true,
        user: response.data.user,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al deshabilitar MFA'
      };
    }
  }

  /**
   * 👤 Obtener perfil del usuario
   */
  async getUserProfile() {
    try {
      const token = await this.getToken();
      const response = await axios.get(`${API_BASE_URL}/secure/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return {
        success: true,
        user: response.data.user,
        security: response.data.security
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener perfil'
      };
    }
  }

  /**
   * 🚪 Cerrar sesión
   */
  async logout() {
    try {
      const token = await this.getToken();
      
      // Logout en backend
      if (token) {
        await axios.post(
          `${API_BASE_URL}/secure/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }

      // Logout en Firebase (si está autenticado)
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }

      // Limpiar almacenamiento local
      await this.removeToken();

      return { success: true };
    } catch (error) {
      // Limpiar de todas formas
      await this.removeToken();
      return { success: true }; // Consideramos exitoso aunque falle el backend
    }
  }

  /**
   * 🔄 Refrescar token
   */
  async refreshToken() {
    try {
      const token = await this.getToken();
      const response = await axios.post(
        `${API_BASE_URL}/secure/refresh`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      await this.saveToken(response.data.access_token);

      return {
        success: true,
        token: response.data.access_token
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al refrescar token'
      };
    }
  }

  /**
   * 💾 Guardar token JWT
   */
  async saveToken(token) {
    try {
      await AsyncStorage.setItem('jwt_token', token);
      this.jwtToken = token;
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  /**
   * 📖 Obtener token JWT
   */
  async getToken() {
    try {
      if (this.jwtToken) return this.jwtToken;
      
      const token = await AsyncStorage.getItem('jwt_token');
      this.jwtToken = token;
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * 🗑️ Eliminar token
   */
  async removeToken() {
    try {
      await AsyncStorage.removeItem('jwt_token');
      this.jwtToken = null;
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  /**
   * ✅ Verificar si está autenticado
   */
  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }

  /**
   * 🔧 Manejar errores de Firebase
   */
  handleFirebaseError(error) {
    const errorMessages = {
      'auth/email-already-in-use': 'El email ya está en uso',
      'auth/invalid-email': 'Email inválido',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/weak-password': 'Contraseña muy débil',
      'auth/user-disabled': 'Usuario deshabilitado',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/network-request-failed': 'Error de red. Verifica tu conexión'
    };

    return errorMessages[error.code] || error.message || 'Error de autenticación';
  }
}

// Exportar instancia única
export default new AuthService();
