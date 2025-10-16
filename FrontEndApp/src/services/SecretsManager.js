/**
 * 🔐 SecretsManager
 * 
 * Gestor centralizado de secretos y credenciales
 * Elimina claves hardcoded y las almacena de forma segura
 * 
 * Características:
 * - Almacenamiento en Keychain/Keystore nativo
 * - Carga dinámica de secretos
 * - Rotación de claves
 * - Validación de integridad
 */

import * as SecureStore from 'expo-secure-store';
import EncryptionService from './EncryptionService';

class SecretsManager {
  constructor() {
    this.secrets = new Map();
    this.initialized = false;
    
    // Nombres de secretos (NO los valores)
    this.SECRET_KEYS = {
      API_KEY: 'api_key',
      API_SECRET: 'api_secret',
      FIREBASE_API_KEY: 'firebase_api_key',
      FIREBASE_AUTH_DOMAIN: 'firebase_auth_domain',
      FIREBASE_PROJECT_ID: 'firebase_project_id',
      ENCRYPTION_SALT: 'encryption_salt',
      JWT_SECRET: 'jwt_secret_key',
      OAUTH_CLIENT_ID: 'oauth_client_id',
      OAUTH_CLIENT_SECRET: 'oauth_client_secret',
    };
  }

  /**
   * Inicializa el gestor de secretos
   * Carga los secretos desde el almacenamiento seguro
   */
  async initialize() {
    try {
      if (this.initialized) {
        console.log('ℹ️ SecretsManager ya inicializado');
        return;
      }

      console.log('🔐 Inicializando SecretsManager...');
      
      // Cargar secretos desde SecureStore
      await this.loadSecrets();
      
      this.initialized = true;
      console.log('✅ SecretsManager inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando SecretsManager:', error);
      throw new Error('No se pudo inicializar el gestor de secretos');
    }
  }

  /**
   * Carga todos los secretos desde el almacenamiento seguro
   */
  async loadSecrets() {
    try {
      console.log('📥 Cargando secretos...');
      
      for (const [name, key] of Object.entries(this.SECRET_KEYS)) {
        try {
          const value = await SecureStore.getItemAsync(key);
          if (value) {
            this.secrets.set(name, value);
            console.log(`✅ Secreto "${name}" cargado`);
          } else {
            console.warn(`⚠️ Secreto "${name}" no encontrado`);
          }
        } catch (error) {
          console.error(`❌ Error cargando secreto "${name}":`, error);
        }
      }
      
      console.log(`📊 Total secretos cargados: ${this.secrets.size}`);
    } catch (error) {
      console.error('❌ Error cargando secretos:', error);
      throw error;
    }
  }

  /**
   * Obtiene un secreto de forma segura
   * @param {string} secretName - Nombre del secreto
   * @returns {string|null} Valor del secreto
   */
  getSecret(secretName) {
    if (!this.initialized) {
      console.warn('⚠️ SecretsManager no inicializado, inicializando...');
      this.initialize();
    }

    const secret = this.secrets.get(secretName);
    
    if (!secret) {
      console.warn(`⚠️ Secreto "${secretName}" no encontrado`);
      return null;
    }

    console.log(`🔑 Secreto "${secretName}" recuperado`);
    return secret;
  }

  /**
   * Almacena un nuevo secreto de forma segura
   * @param {string} secretName - Nombre del secreto
   * @param {string} value - Valor del secreto
   */
  async setSecret(secretName, value) {
    try {
      const key = this.SECRET_KEYS[secretName];
      
      if (!key) {
        throw new Error(`Nombre de secreto "${secretName}" no válido`);
      }

      // Almacenar en SecureStore
      await SecureStore.setItemAsync(key, value);
      
      // Actualizar caché en memoria
      this.secrets.set(secretName, value);
      
      console.log(`✅ Secreto "${secretName}" almacenado de forma segura`);
    } catch (error) {
      console.error(`❌ Error almacenando secreto "${secretName}":`, error);
      throw error;
    }
  }

  /**
   * Elimina un secreto
   * @param {string} secretName - Nombre del secreto
   */
  async deleteSecret(secretName) {
    try {
      const key = this.SECRET_KEYS[secretName];
      
      if (!key) {
        throw new Error(`Nombre de secreto "${secretName}" no válido`);
      }

      await SecureStore.deleteItemAsync(key);
      this.secrets.delete(secretName);
      
      console.log(`🗑️ Secreto "${secretName}" eliminado`);
    } catch (error) {
      console.error(`❌ Error eliminando secreto "${secretName}":`, error);
      throw error;
    }
  }

  /**
   * Rota (reemplaza) un secreto
   * @param {string} secretName - Nombre del secreto
   * @param {string} newValue - Nuevo valor
   */
  async rotateSecret(secretName, newValue) {
    try {
      console.log(`🔄 Rotando secreto "${secretName}"...`);
      
      // Almacenar nuevo valor
      await this.setSecret(secretName, newValue);
      
      console.log(`✅ Secreto "${secretName}" rotado exitosamente`);
      
      // Registrar evento de rotación
      await this.logSecretRotation(secretName);
    } catch (error) {
      console.error(`❌ Error rotando secreto "${secretName}":`, error);
      throw error;
    }
  }

  /**
   * Registra evento de rotación de secreto
   */
  async logSecretRotation(secretName) {
    try {
      const rotationLog = {
        secretName: secretName,
        timestamp: new Date().toISOString(),
        action: 'ROTATION'
      };

      const existingLogs = await SecureStore.getItemAsync('secret_rotation_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      
      logs.push(rotationLog);
      
      // Mantener solo los últimos 50 eventos
      if (logs.length > 50) {
        logs.shift();
      }

      await SecureStore.setItemAsync('secret_rotation_logs', JSON.stringify(logs));
      console.log('📝 Rotación registrada en logs');
    } catch (error) {
      console.error('❌ Error registrando rotación:', error);
    }
  }

  /**
   * Valida que todos los secretos críticos estén presentes
   * @returns {object} Estado de validación
   */
  validateSecrets() {
    const criticalSecrets = [
      'API_KEY',
      'FIREBASE_API_KEY',
      'FIREBASE_PROJECT_ID'
    ];

    const validation = {
      isValid: true,
      missing: [],
      present: []
    };

    for (const secretName of criticalSecrets) {
      if (this.secrets.has(secretName)) {
        validation.present.push(secretName);
      } else {
        validation.missing.push(secretName);
        validation.isValid = false;
      }
    }

    if (!validation.isValid) {
      console.warn('⚠️ Secretos críticos faltantes:', validation.missing);
    } else {
      console.log('✅ Todos los secretos críticos presentes');
    }

    return validation;
  }

  /**
   * GDPR: Elimina todos los secretos (derecho al olvido)
   */
  async deleteAllSecrets() {
    try {
      console.log('🧹 Eliminando todos los secretos...');
      
      for (const key of Object.values(this.SECRET_KEYS)) {
        await SecureStore.deleteItemAsync(key);
      }
      
      this.secrets.clear();
      this.initialized = false;
      
      console.log('✅ Todos los secretos eliminados');
    } catch (error) {
      console.error('❌ Error eliminando secretos:', error);
      throw error;
    }
  }

  /**
   * Migra secretos desde variables de entorno (.env)
   * Solo para primera inicialización
   */
  async migrateFromEnv() {
    try {
      console.log('📦 Migrando secretos desde variables de entorno...');
      
      // Leer de variables de entorno (si existen)
      const envSecrets = {
        FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      };

      let migrated = 0;
      
      for (const [name, value] of Object.entries(envSecrets)) {
        if (value && !this.secrets.has(name)) {
          await this.setSecret(name, value);
          migrated++;
        }
      }

      console.log(`✅ ${migrated} secretos migrados desde .env`);
      console.log('⚠️ IMPORTANTE: Elimina los valores del archivo .env después de la migración');
      
      return migrated;
    } catch (error) {
      console.error('❌ Error migrando secretos:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de uso de secretos
   */
  getStats() {
    return {
      initialized: this.initialized,
      totalSecrets: this.secrets.size,
      secretNames: Array.from(this.secrets.keys()),
      timestamp: new Date().toISOString()
    };
  }
}

export default new SecretsManager();
