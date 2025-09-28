// SecureAuthStorage.js - Almacenamiento seguro y cifrado para datos sensibles
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'jwt_token_secure';
const USER_KEY = 'user_data_secure';
const REFRESH_TOKEN_KEY = 'refresh_token_secure';
const SESSION_KEY = 'session_data_secure';

/**
 * Clase para manejo seguro de almacenamiento de datos de autenticación
 * Utiliza Expo SecureStore que implementa:
 * - Cifrado AES-256 
 * - iOS: Keychain Services
 * - Android: Keystore + EncryptedSharedPreferences
 */
class SecureAuthStorage {
  
  /**
   * Configuración de seguridad para SecureStore
   */
  static secureOptions = {
    // Requerir autenticación del usuario (biometría/PIN)
    requireAuthentication: true,
    // Prompt que se muestra al usuario
    authenticationPrompt: 'Autenticación requerida para acceder a datos seguros',
    // Tipo de autenticación (biometría preferida)
    authenticationType: SecureStore.AUTHENTICATION_TYPE.BIOMETRIC_OR_DEVICE_PASSCODE,
  };

  /**
   * Guardar token JWT de forma segura
   * @param {string} token - Token JWT a almacenar
   * @returns {Promise<boolean>} - Éxito de la operación
   */
  static async saveToken(token) {
    try {
      if (!token || typeof token !== 'string') {
        console.error('Token inválido para almacenamiento');
        return false;
      }

      // Almacenamiento cifrado con autenticación requerida
      await SecureStore.setItemAsync(TOKEN_KEY, token, this.secureOptions);
      
      // Log sin exponer el token completo
      console.log('✅ Token JWT almacenado de forma segura');
      console.log(`📱 Longitud del token: ${token.length} caracteres`);
      
      return true;
    } catch (error) {
      console.error('❌ Error al almacenar token seguro:', error.message);
      
      // Fallback a almacenamiento básico si falla la autenticación
      if (error.code === 'UserCancel' || error.code === 'BiometryNotAvailable') {
        console.warn('⚠️ Autenticación cancelada, usando almacenamiento básico');
        return await this.saveTokenBasic(token);
      }
      
      return false;
    }
  }

  /**
   * Obtener token JWT de forma segura
   * @returns {Promise<string|null>} - Token JWT o null si no existe
   */
  static async getToken() {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY, this.secureOptions);
      
      if (token) {
        console.log('✅ Token JWT recuperado de almacenamiento seguro');
        // Validar estructura básica del JWT
        if (this.isValidJWT(token)) {
          return token;
        } else {
          console.error('❌ Token recuperado tiene formato inválido');
          await this.removeToken(); // Limpiar token corrupto
          return null;
        }
      }
      
      // Intentar fallback a almacenamiento básico
      return await this.getTokenBasic();
      
    } catch (error) {
      console.error('❌ Error al recuperar token seguro:', error.message);
      
      // Fallback a almacenamiento básico
      if (error.code === 'UserCancel') {
        console.warn('⚠️ Autenticación cancelada por usuario');
        return null;
      }
      
      return await this.getTokenBasic();
    }
  }

  /**
   * Guardar datos del usuario de forma segura
   * @param {object} userData - Datos del usuario a almacenar
   * @returns {Promise<boolean>} - Éxito de la operación
   */
  static async saveUser(userData) {
    try {
      if (!userData || typeof userData !== 'object') {
        console.error('Datos de usuario inválidos');
        return false;
      }

      // Filtrar datos sensibles antes del almacenamiento
      const safeUserData = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        // NO almacenar password, tokens adicionales, etc.
      };

      await SecureStore.setItemAsync(
        USER_KEY, 
        JSON.stringify(safeUserData), 
        this.secureOptions
      );
      
      console.log('✅ Datos de usuario almacenados de forma segura');
      return true;
      
    } catch (error) {
      console.error('❌ Error al almacenar datos de usuario:', error.message);
      return false;
    }
  }

  /**
   * Obtener datos del usuario de forma segura
   * @returns {Promise<object|null>} - Datos del usuario o null
   */
  static async getUser() {
    try {
      const userData = await SecureStore.getItemAsync(USER_KEY, this.secureOptions);
      
      if (userData) {
        const parsedData = JSON.parse(userData);
        console.log('✅ Datos de usuario recuperados:', parsedData.email);
        return parsedData;
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Error al recuperar datos de usuario:', error.message);
      return null;
    }
  }

  /**
   * Guardar datos de sesión temporal
   * @param {object} sessionData - Datos de sesión
   * @returns {Promise<boolean>}
   */
  static async saveSession(sessionData) {
    try {
      const sessionInfo = {
        loginTime: new Date().toISOString(),
        deviceInfo: sessionData.deviceInfo || 'Unknown',
        lastActivity: new Date().toISOString(),
        sessionId: sessionData.sessionId || Math.random().toString(36),
      };

      await SecureStore.setItemAsync(
        SESSION_KEY,
        JSON.stringify(sessionInfo),
        this.secureOptions
      );
      
      console.log('✅ Datos de sesión almacenados');
      return true;
      
    } catch (error) {
      console.error('❌ Error al almacenar sesión:', error.message);
      return false;
    }
  }

  /**
   * Eliminar todos los datos seguros (logout completo)
   * @returns {Promise<boolean>} - Éxito de la operación
   */
  static async removeAllSecureData() {
    try {
      const keys = [TOKEN_KEY, USER_KEY, REFRESH_TOKEN_KEY, SESSION_KEY];
      const promises = keys.map(key => SecureStore.deleteItemAsync(key));
      
      await Promise.all(promises);
      
      // También limpiar almacenamiento básico por seguridad
      await this.removeTokenBasic();
      
      console.log('✅ Todos los datos seguros eliminados');
      return true;
      
    } catch (error) {
      console.error('❌ Error al eliminar datos seguros:', error.message);
      return false;
    }
  }

  /**
   * Verificar disponibilidad de almacenamiento seguro
   * @returns {Promise<boolean>}
   */
  static async isSecureStorageAvailable() {
    try {
      // Verificar que SecureStore esté disponible
      const isAvailable = await SecureStore.isAvailableAsync();
      console.log(`📱 Almacenamiento seguro disponible: ${isAvailable}`);
      return isAvailable;
    } catch (error) {
      console.error('❌ Error verificando disponibilidad:', error.message);
      return false;
    }
  }

  /**
   * Validar formato básico de JWT
   * @param {string} token 
   * @returns {boolean}
   */
  static isValidJWT(token) {
    if (!token || typeof token !== 'string') return false;
    
    // JWT debe tener 3 partes separadas por puntos
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Verificar que no esté vacío
    return parts.every(part => part.length > 0);
  }

  // === MÉTODOS DE FALLBACK PARA COMPATIBILIDAD ===
  
  /**
   * Almacenamiento básico como fallback (AsyncStorage)
   */
  static async saveTokenBasic(token) {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('jwt_token_basic', token);
      console.log('⚠️ Token almacenado en modo básico (no cifrado)');
      return true;
    } catch (error) {
      console.error('❌ Error en almacenamiento básico:', error);
      return false;
    }
  }

  static async getTokenBasic() {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('jwt_token_basic');
      if (token) {
        console.log('⚠️ Token recuperado de almacenamiento básico');
      }
      return token;
    } catch (error) {
      console.error('❌ Error recuperando token básico:', error);
      return null;
    }
  }

  static async removeTokenBasic() {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem('jwt_token_basic');
      await AsyncStorage.removeItem('jwt_token'); // Limpiar versión anterior
      await AsyncStorage.removeItem('user_data');
    } catch (error) {
      console.error('❌ Error limpiando almacenamiento básico:', error);
    }
  }

  // === MÉTODOS DE MIGRACIÓN ===

  /**
   * Migrar datos de AsyncStorage a SecureStore
   * @returns {Promise<boolean>}
   */
  static async migrateFromAsyncStorage() {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      // Obtener datos existentes
      const oldToken = await AsyncStorage.getItem('jwt_token');
      const oldUser = await AsyncStorage.getItem('user_data');
      
      if (oldToken) {
        console.log('🔄 Migrando token a almacenamiento seguro...');
        await this.saveToken(oldToken);
        await AsyncStorage.removeItem('jwt_token');
      }
      
      if (oldUser) {
        console.log('🔄 Migrando datos de usuario a almacenamiento seguro...');
        await this.saveUser(JSON.parse(oldUser));
        await AsyncStorage.removeItem('user_data');
      }
      
      console.log('✅ Migración completada');
      return true;
      
    } catch (error) {
      console.error('❌ Error en migración:', error.message);
      return false;
    }
  }
}

export default SecureAuthStorage;