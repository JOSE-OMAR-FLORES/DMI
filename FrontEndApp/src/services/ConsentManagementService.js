/**
 * 📋 ConsentManagementService
 * 
 * Servicio de gestión de consentimiento explícito
 * Cumplimiento: GDPR (Art. 6, 7) y CCPA/CPRA
 * 
 * Características:
 * - Consentimiento granular por propósito
 * - Registro de cambios de consentimiento
 * - Revocación de consentimiento
 * - Consentimiento explícito e informado
 * - Historial completo de consentimientos
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ConsentManagementService {
  constructor() {
    // Propósitos de procesamiento de datos
    this.CONSENT_PURPOSES = {
      ESSENTIAL: {
        id: 'essential',
        name: 'Funcionalidad Esencial',
        description: 'Datos necesarios para el funcionamiento básico de la aplicación (autenticación, seguridad)',
        required: true,
        legal_basis: 'Necesario para la ejecución del contrato'
      },
      ANALYTICS: {
        id: 'analytics',
        name: 'Análisis y Mejora',
        description: 'Análisis del uso de la aplicación para mejorar la experiencia del usuario',
        required: false,
        legal_basis: 'Consentimiento explícito'
      },
      PERSONALIZATION: {
        id: 'personalization',
        name: 'Personalización',
        description: 'Personalización de contenido y preferencias del usuario',
        required: false,
        legal_basis: 'Consentimiento explícito'
      },
      MARKETING: {
        id: 'marketing',
        name: 'Marketing y Comunicaciones',
        description: 'Envío de comunicaciones promocionales, ofertas y noticias',
        required: false,
        legal_basis: 'Consentimiento explícito'
      },
      THIRD_PARTY_SHARING: {
        id: 'third_party_sharing',
        name: 'Compartir con Terceros',
        description: 'Compartir datos con socios comerciales y proveedores de servicios',
        required: false,
        legal_basis: 'Consentimiento explícito'
      },
      LOCATION: {
        id: 'location',
        name: 'Datos de Ubicación',
        description: 'Recopilación y uso de datos de ubicación geográfica',
        required: false,
        legal_basis: 'Consentimiento explícito'
      },
      PROFILING: {
        id: 'profiling',
        name: 'Perfilado y Decisiones Automatizadas',
        description: 'Creación de perfiles de usuario y toma de decisiones automatizadas',
        required: false,
        legal_basis: 'Consentimiento explícito'
      }
    };

    this.STORAGE_KEYS = {
      CONSENT_RECORD: 'user_consent_record',
      CONSENT_HISTORY: 'user_consent_history',
      PRIVACY_POLICY_ACCEPTED: 'privacy_policy_accepted',
      CONSENT_VERSION: 'consent_version'
    };

    this.CURRENT_CONSENT_VERSION = '2.0'; // Incrementar cuando cambian políticas
  }

  /**
   * Obtiene el estado actual de consentimiento del usuario
   */
  async getConsentStatus(userId) {
    try {
      const consentRecord = await SecureStore.getItemAsync(
        `${this.STORAGE_KEYS.CONSENT_RECORD}_${userId}`
      );

      if (!consentRecord) {
        return this.getDefaultConsentStatus();
      }

      return JSON.parse(consentRecord);
    } catch (error) {
      console.error('❌ Error obteniendo estado de consentimiento:', error);
      return this.getDefaultConsentStatus();
    }
  }

  /**
   * Estado de consentimiento por defecto
   */
  getDefaultConsentStatus() {
    const status = {
      version: this.CURRENT_CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      purposes: {}
    };

    // Solo consentimientos esenciales activados por defecto
    Object.values(this.CONSENT_PURPOSES).forEach(purpose => {
      status.purposes[purpose.id] = {
        granted: purpose.required,
        timestamp: new Date().toISOString(),
        method: purpose.required ? 'implied' : 'not_granted',
        required: purpose.required
      };
    });

    return status;
  }

  /**
   * GDPR Art. 7 - Solicitar consentimiento explícito
   * @param {string} userId - ID del usuario
   * @param {object} consents - Objeto con consentimientos { purposeId: boolean }
   * @param {string} method - Método de obtención (popup, form, etc)
   */
  async requestConsent(userId, consents, method = 'form') {
    try {
      console.log('📋 Solicitando consentimiento explícito...');

      const currentStatus = await this.getConsentStatus(userId);
      const newStatus = { ...currentStatus };
      const changes = [];

      // Actualizar consentimientos
      for (const [purposeId, granted] of Object.entries(consents)) {
        const purpose = Object.values(this.CONSENT_PURPOSES).find(p => p.id === purposeId);
        
        if (!purpose) {
          console.warn(`⚠️ Propósito desconocido: ${purposeId}`);
          continue;
        }

        // No permitir revocar consentimientos esenciales
        if (purpose.required && !granted) {
          console.warn(`⚠️ No se puede revocar consentimiento esencial: ${purposeId}`);
          continue;
        }

        const previousStatus = currentStatus.purposes[purposeId]?.granted || false;
        
        newStatus.purposes[purposeId] = {
          granted: granted,
          timestamp: new Date().toISOString(),
          method: method,
          required: purpose.required
        };

        if (previousStatus !== granted) {
          changes.push({
            purposeId: purposeId,
            purposeName: purpose.name,
            from: previousStatus,
            to: granted,
            timestamp: new Date().toISOString()
          });
        }
      }

      newStatus.version = this.CURRENT_CONSENT_VERSION;
      newStatus.lastUpdated = new Date().toISOString();

      // Guardar nuevo estado
      await SecureStore.setItemAsync(
        `${this.STORAGE_KEYS.CONSENT_RECORD}_${userId}`,
        JSON.stringify(newStatus)
      );

      // Registrar cambios en historial
      if (changes.length > 0) {
        await this.logConsentChanges(userId, changes, method);
      }

      console.log('✅ Consentimiento registrado exitosamente');
      console.log(`📊 Cambios: ${changes.length}`);

      return {
        success: true,
        status: newStatus,
        changes: changes
      };
    } catch (error) {
      console.error('❌ Error registrando consentimiento:', error);
      throw error;
    }
  }

  /**
   * Registra cambios de consentimiento en historial (auditoría)
   */
  async logConsentChanges(userId, changes, method) {
    try {
      const historyKey = `${this.STORAGE_KEYS.CONSENT_HISTORY}_${userId}`;
      const existingHistory = await SecureStore.getItemAsync(historyKey);
      const history = existingHistory ? JSON.parse(existingHistory) : [];

      const entry = {
        timestamp: new Date().toISOString(),
        method: method,
        changes: changes,
        ipAddress: 'N/A', // En producción, obtener IP real
        userAgent: 'Mobile App'
      };

      history.push(entry);

      // Mantener últimos 100 cambios
      if (history.length > 100) {
        history.shift();
      }

      await SecureStore.setItemAsync(historyKey, JSON.stringify(history));
      console.log('📝 Cambio de consentimiento registrado en historial');
    } catch (error) {
      console.error('❌ Error registrando historial:', error);
    }
  }

  /**
   * GDPR Art. 7(3) - Revocar consentimiento
   */
  async revokeConsent(userId, purposeIds) {
    try {
      console.log('🔄 Revocando consentimientos...');

      const consents = {};
      purposeIds.forEach(purposeId => {
        consents[purposeId] = false;
      });

      const result = await this.requestConsent(userId, consents, 'revocation');
      
      console.log('✅ Consentimientos revocados');
      return result;
    } catch (error) {
      console.error('❌ Error revocando consentimiento:', error);
      throw error;
    }
  }

  /**
   * Verifica si un usuario ha dado consentimiento para un propósito específico
   */
  async hasConsent(userId, purposeId) {
    try {
      const status = await this.getConsentStatus(userId);
      return status.purposes[purposeId]?.granted || false;
    } catch (error) {
      console.error('❌ Error verificando consentimiento:', error);
      return false;
    }
  }

  /**
   * Obtiene historial completo de consentimientos (para auditoría)
   */
  async getConsentHistory(userId) {
    try {
      const historyKey = `${this.STORAGE_KEYS.CONSENT_HISTORY}_${userId}`;
      const history = await SecureStore.getItemAsync(historyKey);
      
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('❌ Error obteniendo historial:', error);
      return [];
    }
  }

  /**
   * CCPA/CPRA - "Do Not Sell My Personal Information"
   * Registra la solicitud de no venta de datos
   */
  async doNotSellMyData(userId) {
    try {
      console.log('🛑 Procesando solicitud "Do Not Sell"...');

      const consents = {
        third_party_sharing: false,
        marketing: false,
        profiling: false
      };

      const result = await this.requestConsent(userId, consents, 'do_not_sell');

      // Registrar solicitud específica CCPA
      await SecureStore.setItemAsync(
        `ccpa_do_not_sell_${userId}`,
        JSON.stringify({
          requested: true,
          timestamp: new Date().toISOString(),
          status: 'active'
        })
      );

      console.log('✅ Solicitud "Do Not Sell" procesada');
      return result;
    } catch (error) {
      console.error('❌ Error procesando "Do Not Sell":', error);
      throw error;
    }
  }

  /**
   * Verifica si políticas de privacidad han sido aceptadas
   */
  async hasAcceptedPrivacyPolicy(userId) {
    try {
      const accepted = await SecureStore.getItemAsync(
        `${this.STORAGE_KEYS.PRIVACY_POLICY_ACCEPTED}_${userId}`
      );
      
      if (!accepted) return false;

      const data = JSON.parse(accepted);
      return data.version === this.CURRENT_CONSENT_VERSION && data.accepted === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Registra aceptación de política de privacidad
   */
  async acceptPrivacyPolicy(userId, policyVersion = this.CURRENT_CONSENT_VERSION) {
    try {
      const acceptance = {
        accepted: true,
        version: policyVersion,
        timestamp: new Date().toISOString(),
        method: 'explicit_acceptance'
      };

      await SecureStore.setItemAsync(
        `${this.STORAGE_KEYS.PRIVACY_POLICY_ACCEPTED}_${userId}`,
        JSON.stringify(acceptance)
      );

      console.log('✅ Política de privacidad aceptada');
      return acceptance;
    } catch (error) {
      console.error('❌ Error registrando aceptación:', error);
      throw error;
    }
  }

  /**
   * Genera reporte de consentimiento para el usuario (transparencia)
   */
  async generateConsentReport(userId) {
    try {
      const status = await this.getConsentStatus(userId);
      const history = await this.getConsentHistory(userId);
      const ccpaStatus = await SecureStore.getItemAsync(`ccpa_do_not_sell_${userId}`);

      const report = {
        userId: userId,
        reportDate: new Date().toISOString(),
        consentVersion: status.version,
        currentConsents: {},
        history: history,
        ccpaOptOut: ccpaStatus ? JSON.parse(ccpaStatus) : { requested: false }
      };

      // Formatear consentimientos actuales
      for (const [purposeId, consent] of Object.entries(status.purposes)) {
        const purpose = Object.values(this.CONSENT_PURPOSES).find(p => p.id === purposeId);
        if (purpose) {
          report.currentConsents[purposeId] = {
            name: purpose.name,
            description: purpose.description,
            granted: consent.granted,
            required: consent.required,
            legalBasis: purpose.legal_basis,
            grantedAt: consent.timestamp,
            method: consent.method
          };
        }
      }

      console.log('📋 Reporte de consentimiento generado');
      return report;
    } catch (error) {
      console.error('❌ Error generando reporte:', error);
      throw error;
    }
  }

  /**
   * Verifica si se requiere renovación de consentimiento
   * (por ejemplo, si las políticas han cambiado)
   */
  async requiresConsentRenewal(userId) {
    try {
      const status = await this.getConsentStatus(userId);
      return status.version !== this.CURRENT_CONSENT_VERSION;
    } catch (error) {
      return true; // Si hay error, solicitar consentimiento por seguridad
    }
  }

  /**
   * Elimina todos los registros de consentimiento (derecho al olvido)
   */
  async deleteAllConsentRecords(userId) {
    try {
      console.log('🗑️ Eliminando registros de consentimiento...');

      await SecureStore.deleteItemAsync(`${this.STORAGE_KEYS.CONSENT_RECORD}_${userId}`);
      await SecureStore.deleteItemAsync(`${this.STORAGE_KEYS.CONSENT_HISTORY}_${userId}`);
      await SecureStore.deleteItemAsync(`${this.STORAGE_KEYS.PRIVACY_POLICY_ACCEPTED}_${userId}`);
      await SecureStore.deleteItemAsync(`ccpa_do_not_sell_${userId}`);

      console.log('✅ Registros de consentimiento eliminados');
    } catch (error) {
      console.error('❌ Error eliminando registros:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de consentimiento (para administración)
   */
  getConsentStatistics() {
    return {
      totalPurposes: Object.keys(this.CONSENT_PURPOSES).length,
      requiredPurposes: Object.values(this.CONSENT_PURPOSES).filter(p => p.required).length,
      optionalPurposes: Object.values(this.CONSENT_PURPOSES).filter(p => !p.required).length,
      purposes: this.CONSENT_PURPOSES,
      currentVersion: this.CURRENT_CONSENT_VERSION
    };
  }

  /**
   * Obtiene consentimientos en formato simple {purpose: boolean}
   */
  async getConsents(userId) {
    try {
      const status = await this.getConsentStatus(userId);
      const consents = {};
      
      Object.entries(status.purposes).forEach(([purposeId, consent]) => {
        consents[purposeId] = consent.granted;
      });
      
      return consents;
    } catch (error) {
      console.error('❌ Error obteniendo consentimientos:', error);
      return this.getDefaultConsents();
    }
  }

  /**
   * Consentimientos por defecto en formato simple
   */
  getDefaultConsents() {
    const consents = {};
    Object.values(this.CONSENT_PURPOSES).forEach(purpose => {
      consents[purpose.id] = purpose.required;
    });
    return consents;
  }

  /**
   * Obtiene el estado de CCPA opt-out
   */
  async getCCPAOptOutStatus(userId) {
    try {
      const ccpaData = await SecureStore.getItemAsync(`ccpa_do_not_sell_${userId}`);
      if (!ccpaData) return false;
      
      const data = JSON.parse(ccpaData);
      return data.requested && data.status === 'active';
    } catch (error) {
      console.error('❌ Error obteniendo estado CCPA:', error);
      return false;
    }
  }
}

export default new ConsentManagementService();
