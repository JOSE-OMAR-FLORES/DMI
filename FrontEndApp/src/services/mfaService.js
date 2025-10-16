/**
 * 🔐 Servicio de Autenticación Multi-Factor (MFA)
 * Integración con Laravel MFA Backend
 */

import axios from 'axios';
import AuthStorage from '../utils/AuthStorage';
import { API_CONFIGS } from '../utils/config';

const API_BASE_URL = API_CONFIGS.BACKEND.BASE_URL;

class MFAService {
  constructor() {
    // Configurar axios con timeout
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/auth-mfa`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 15000, // 15 segundos
    });

    // Interceptor para agregar token automáticamente
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AuthStorage.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * 🔑 Login con soporte MFA
   * Si el usuario tiene MFA habilitado, retorna requiresMFA: true
   */
  async login(email, password) {
    try {
      const response = await this.api.post('/login', {
        email,
        password
      });

      // Si requiere MFA, no guardamos el token aún
      if (response.data.mfa_required) {
        return {
          success: true,
          requiresMFA: true,
          userId: response.data.user_id,
          email: email,
          message: response.data.message || 'Código de verificación enviado a tu email',
          expiresIn: response.data.expires_in || 300
        };
      }

      // Si no requiere MFA, guardamos el token
      if (response.data.access_token) {
        await AuthStorage.saveToken(response.data.access_token);
        await AuthStorage.saveUser(response.data.user);
      }

      return {
        success: true,
        requiresMFA: false,
        user: response.data.user,
        token: response.data.access_token
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al iniciar sesión',
        details: error.response?.data
      };
    }
  }

  /**
   * ✅ Verificar código MFA (6 dígitos)
   */
  async verifyMFACode(userId, code) {
    try {
      console.log('📤 Enviando verificación MFA:', { userId, code });
      
      const response = await this.api.post('/verify-mfa', {
        user_id: userId,
        code: code.toString()
      });

      console.log('📥 Respuesta MFA completa:', JSON.stringify(response.data, null, 2));

      // Guardar token después de verificación exitosa
      if (response.data.access_token) {
        console.log('💾 Intentando guardar token...');
        const tokenSaved = await AuthStorage.saveToken(response.data.access_token);
        console.log('✅ Token guardado:', tokenSaved);
        
        if (response.data.user) {
          console.log('💾 Intentando guardar usuario...');
          const userSaved = await AuthStorage.saveUser(response.data.user);
          console.log('✅ Usuario guardado:', userSaved, response.data.user.name);
        } else {
          console.log('⚠️ No hay usuario en la respuesta');
        }
        
        // Verificar que se guardó correctamente
        const tokenCheck = await AuthStorage.getToken();
        const userCheck = await AuthStorage.getUser();
        console.log('🔍 Verificación - Token existe:', !!tokenCheck);
        console.log('🔍 Verificación - Usuario existe:', !!userCheck);
      } else {
        console.log('❌ No hay access_token en la respuesta');
      }

      return {
        success: true,
        user: response.data.user,
        token: response.data.access_token,
        message: 'Código verificado correctamente'
      };
    } catch (error) {
      console.log('❌ Error MFA:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Código inválido o expirado',
        attemptsRemaining: error.response?.data?.attempts_remaining,
        blocked: error.response?.data?.blocked || false
      };
    }
  }

  /**
   * 🔄 Reenviar código MFA
   */
  async resendCode(email) {
    try {
      const response = await this.api.post('/resend-code', {
        email
      });

      return {
        success: true,
        message: response.data.message || 'Nuevo código enviado',
        expiresIn: response.data.expires_in || 300
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al reenviar código'
      };
    }
  }

  /**
   * 🔓 Verificar código de respaldo (8 caracteres hexadecimales)
   */
  async verifyBackupCode(userId, backupCode) {
    try {
      const response = await this.api.post('/verify-backup-code', {
        user_id: userId,
        backup_code: backupCode.toUpperCase()
      });

      // Guardar token después de verificación exitosa
      if (response.data.access_token) {
        await AuthStorage.saveToken(response.data.access_token);
        await AuthStorage.saveUser(response.data.user);
      }

      return {
        success: true,
        user: response.data.user,
        token: response.data.access_token,
        message: 'Código de respaldo verificado. IMPORTANTE: Este código ya no puede usarse.',
        codesRemaining: response.data.backup_codes_remaining
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Código de respaldo inválido'
      };
    }
  }

  /**
   * 🔐 Habilitar MFA para el usuario actual
   */
  async enableMFA() {
    try {
      const response = await this.api.post('/enable-mfa');

      return {
        success: true,
        message: 'MFA habilitado exitosamente',
        backupCodes: response.data.backup_codes,
        user: response.data.user
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al habilitar MFA'
      };
    }
  }

  /**
   * 🔓 Deshabilitar MFA para el usuario actual
   */
  async disableMFA() {
    try {
      const response = await this.api.post('/disable-mfa');

      return {
        success: true,
        message: 'MFA deshabilitado exitosamente',
        user: response.data.user
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al deshabilitar MFA'
      };
    }
  }

  /**
   * 🔄 Regenerar códigos de respaldo
   */
  async regenerateBackupCodes() {
    try {
      const response = await this.api.post('/regenerate-backup-codes');

      return {
        success: true,
        message: 'Nuevos códigos de respaldo generados',
        backupCodes: response.data.backup_codes
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al regenerar códigos'
      };
    }
  }

  /**
   * ℹ️ Verificar estado de MFA del usuario actual
   */
  async getMFAStatus() {
    try {
      const response = await this.api.get('/mfa-status');

      // El backend devuelve los datos dentro de response.data.data
      const data = response.data.data || response.data;

      return {
        success: true,
        mfaEnabled: data.mfa_enabled || false,
        mfaEnabledAt: data.mfa_enabled_at || null,
        hasBackupCodes: data.has_backup_codes || false
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener estado MFA',
        mfaEnabled: false
      };
    }
  }
}

// Exportar instancia singleton
export default new MFAService();
