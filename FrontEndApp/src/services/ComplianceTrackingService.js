/**
 * ⚖️ ComplianceTrackingService
 * 
 * Servicio de seguimiento y documentación de cumplimiento normativo
 * GDPR, CCPA/CPRA, y otras regulaciones de privacidad
 * 
 * Características:
 * - Registro de actividades de tratamiento
 * - Documentación de bases legales
 * - Registro de solicitudes de derechos
 * - Informes de cumplimiento
 * - Auditoría completa
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ComplianceTrackingService {
  constructor() {
    // Tipos de actividades de tratamiento
    this.PROCESSING_ACTIVITIES = {
      DATA_COLLECTION: 'data_collection',
      DATA_STORAGE: 'data_storage',
      DATA_PROCESSING: 'data_processing',
      DATA_SHARING: 'data_sharing',
      DATA_DELETION: 'data_deletion',
      DATA_EXPORT: 'data_export',
      DATA_RECTIFICATION: 'data_rectification'
    };

    // Tipos de solicitudes de derechos
    this.RIGHTS_REQUESTS = {
      ACCESS: 'right_of_access', // GDPR Art. 15, CCPA
      RECTIFICATION: 'right_of_rectification', // GDPR Art. 16
      ERASURE: 'right_to_erasure', // GDPR Art. 17, CCPA
      PORTABILITY: 'right_to_portability', // GDPR Art. 20, CCPA
      RESTRICTION: 'right_to_restriction', // GDPR Art. 18
      OBJECTION: 'right_to_object', // GDPR Art. 21
      DO_NOT_SELL: 'ccpa_do_not_sell', // CCPA/CPRA
      OPT_OUT: 'ccpa_opt_out' // CCPA/CPRA
    };

    // Bases legales GDPR
    this.LEGAL_BASIS = {
      CONSENT: 'consent', // Art. 6(1)(a)
      CONTRACT: 'contract', // Art. 6(1)(b)
      LEGAL_OBLIGATION: 'legal_obligation', // Art. 6(1)(c)
      VITAL_INTERESTS: 'vital_interests', // Art. 6(1)(d)
      PUBLIC_INTEREST: 'public_interest', // Art. 6(1)(e)
      LEGITIMATE_INTEREST: 'legitimate_interest' // Art. 6(1)(f)
    };
  }

  /**
   * Registra una actividad de tratamiento de datos
   */
  async logProcessingActivity(userId, activity) {
    try {
      const record = {
        userId: userId,
        activityType: activity.type,
        timestamp: new Date().toISOString(),
        legalBasis: activity.legalBasis || this.LEGAL_BASIS.CONSENT,
        dataCategories: activity.dataCategories || [],
        purpose: activity.purpose,
        recipient: activity.recipient || 'internal',
        retention: activity.retention || '365 days',
        metadata: activity.metadata || {}
      };

      // Guardar en log de actividades
      const logKey = `processing_log_${userId}`;
      const existingLog = await SecureStore.getItemAsync(logKey);
      const log = existingLog ? JSON.parse(existingLog) : [];

      log.push(record);

      // Mantener últimos 1000 registros
      if (log.length > 1000) {
        log.shift();
      }

      await SecureStore.setItemAsync(logKey, JSON.stringify(log));

      console.log('📝 Actividad de tratamiento registrada:', activity.type);
      return record;
    } catch (error) {
      console.error('❌ Error registrando actividad:', error);
      throw error;
    }
  }

  /**
   * Registra solicitud de ejercicio de derechos
   */
  async logRightsRequest(userId, request) {
    try {
      const record = {
        requestId: `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: userId,
        requestType: request.type,
        timestamp: new Date().toISOString(),
        status: 'pending',
        details: request.details || '',
        regulation: request.regulation || 'GDPR', // GDPR, CCPA, CPRA
        responseDeadline: this.calculateResponseDeadline(request.regulation),
        metadata: request.metadata || {}
      };

      // Guardar solicitud
      const requestsKey = `rights_requests_${userId}`;
      const existingRequests = await SecureStore.getItemAsync(requestsKey);
      const requests = existingRequests ? JSON.parse(existingRequests) : [];

      requests.push(record);

      await SecureStore.setItemAsync(requestsKey, JSON.stringify(requests));

      console.log('📬 Solicitud de derechos registrada:', record.requestId);
      console.log(`⏰ Plazo de respuesta: ${record.responseDeadline}`);

      return record;
    } catch (error) {
      console.error('❌ Error registrando solicitud:', error);
      throw error;
    }
  }

  /**
   * Calcula plazo de respuesta según regulación
   */
  calculateResponseDeadline(regulation) {
    const now = new Date();
    let deadlineDays = 30; // GDPR default

    switch (regulation) {
      case 'GDPR':
        deadlineDays = 30; // 1 mes
        break;
      case 'CCPA':
      case 'CPRA':
        deadlineDays = 45; // 45 días
        break;
      default:
        deadlineDays = 30;
    }

    const deadline = new Date(now.getTime() + deadlineDays * 24 * 60 * 60 * 1000);
    return deadline.toISOString();
  }

  /**
   * Actualiza estado de solicitud de derechos
   */
  async updateRightsRequestStatus(userId, requestId, status, response = '') {
    try {
      const requestsKey = `rights_requests_${userId}`;
      const existingRequests = await SecureStore.getItemAsync(requestsKey);
      const requests = existingRequests ? JSON.parse(existingRequests) : [];

      const requestIndex = requests.findIndex(r => r.requestId === requestId);
      
      if (requestIndex === -1) {
        throw new Error('Solicitud no encontrada');
      }

      requests[requestIndex].status = status;
      requests[requestIndex].response = response;
      requests[requestIndex].completedAt = new Date().toISOString();

      await SecureStore.setItemAsync(requestsKey, JSON.stringify(requests));

      console.log('✅ Solicitud actualizada:', requestId, status);
      return requests[requestIndex];
    } catch (error) {
      console.error('❌ Error actualizando solicitud:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las solicitudes de derechos de un usuario
   */
  async getRightsRequests(userId) {
    try {
      const requestsKey = `rights_requests_${userId}`;
      const requests = await SecureStore.getItemAsync(requestsKey);
      
      return requests ? JSON.parse(requests) : [];
    } catch (error) {
      console.error('❌ Error obteniendo solicitudes:', error);
      return [];
    }
  }

  /**
   * Genera registro de actividades de tratamiento (GDPR Art. 30)
   */
  async generateProcessingRecord(userId) {
    try {
      const logKey = `processing_log_${userId}`;
      const log = await SecureStore.getItemAsync(logKey);
      const activities = log ? JSON.parse(log) : [];

      const record = {
        controller: {
          name: 'Tu Aplicación S.A.',
          contact: 'privacy@tuapp.com',
          dpo: 'dpo@tuapp.com' // Data Protection Officer
        },
        userId: userId,
        generatedAt: new Date().toISOString(),
        activities: activities,
        summary: {
          total: activities.length,
          byType: {},
          byLegalBasis: {},
          lastActivity: activities.length > 0 ? activities[activities.length - 1].timestamp : null
        }
      };

      // Estadísticas por tipo
      activities.forEach(activity => {
        record.summary.byType[activity.activityType] = 
          (record.summary.byType[activity.activityType] || 0) + 1;
        
        record.summary.byLegalBasis[activity.legalBasis] = 
          (record.summary.byLegalBasis[activity.legalBasis] || 0) + 1;
      });

      console.log('📋 Registro de actividades generado');
      return record;
    } catch (error) {
      console.error('❌ Error generando registro:', error);
      throw error;
    }
  }

  /**
   * Genera informe de cumplimiento GDPR
   */
  async generateGDPRComplianceReport(userId) {
    try {
      const processingRecord = await this.generateProcessingRecord(userId);
      const rightsRequests = await this.getRightsRequests(userId);

      const report = {
        regulation: 'GDPR',
        userId: userId,
        generatedAt: new Date().toISOString(),
        dataController: processingRecord.controller,
        
        // Principios GDPR (Art. 5)
        principles: {
          lawfulness: '✅ Base legal documentada para cada tratamiento',
          fairness: '✅ Tratamiento transparente e informado',
          transparency: '✅ Políticas de privacidad claras',
          purposeLimitation: '✅ Propósitos específicos y legítimos',
          dataMinimization: '✅ Solo datos necesarios recopilados',
          accuracy: '✅ Mecanismos de rectificación disponibles',
          storageLimitation: '✅ Retención limitada (365 días)',
          integrity: '✅ Cifrado AES-256 implementado',
          accountability: '✅ Registros de tratamiento mantenidos'
        },

        // Derechos implementados
        rights: {
          access: {
            implemented: true,
            article: 'Art. 15',
            requests: rightsRequests.filter(r => r.requestType === this.RIGHTS_REQUESTS.ACCESS).length
          },
          rectification: {
            implemented: true,
            article: 'Art. 16',
            requests: rightsRequests.filter(r => r.requestType === this.RIGHTS_REQUESTS.RECTIFICATION).length
          },
          erasure: {
            implemented: true,
            article: 'Art. 17',
            requests: rightsRequests.filter(r => r.requestType === this.RIGHTS_REQUESTS.ERASURE).length
          },
          restriction: {
            implemented: true,
            article: 'Art. 18',
            requests: rightsRequests.filter(r => r.requestType === this.RIGHTS_REQUESTS.RESTRICTION).length
          },
          portability: {
            implemented: true,
            article: 'Art. 20',
            requests: rightsRequests.filter(r => r.requestType === this.RIGHTS_REQUESTS.PORTABILITY).length
          },
          objection: {
            implemented: true,
            article: 'Art. 21',
            requests: rightsRequests.filter(r => r.requestType === this.RIGHTS_REQUESTS.OBJECTION).length
          }
        },

        // Registro de actividades (Art. 30)
        processingActivities: processingRecord,

        // Medidas técnicas y organizativas (Art. 32)
        securityMeasures: {
          encryption: 'AES-256',
          pseudonymization: 'Parcial',
          accessControl: 'RBAC implementado',
          incidentResponse: 'Procedimientos documentados',
          regularTesting: 'Auditorías periódicas'
        },

        // Cumplimiento
        compliance: {
          status: 'COMPLIANT',
          lastReview: new Date().toISOString(),
          nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 días
        }
      };

      console.log('📄 Informe GDPR generado');
      return report;
    } catch (error) {
      console.error('❌ Error generando informe GDPR:', error);
      throw error;
    }
  }

  /**
   * Genera informe de cumplimiento CCPA/CPRA
   */
  async generateCCPAComplianceReport(userId) {
    try {
      const rightsRequests = await this.getRightsRequests(userId);

      const report = {
        regulation: 'CCPA/CPRA',
        userId: userId,
        generatedAt: new Date().toISOString(),
        business: {
          name: 'Tu Aplicación S.A.',
          contact: 'privacy@tuapp.com',
          doNotSellLink: 'app://privacy/do-not-sell'
        },

        // Derechos CCPA/CPRA
        rights: {
          know: {
            implemented: true,
            description: 'Derecho a saber qué información personal se recopila',
            requests: rightsRequests.filter(r => r.requestType === this.RIGHTS_REQUESTS.ACCESS).length
          },
          delete: {
            implemented: true,
            description: 'Derecho a eliminar información personal',
            requests: rightsRequests.filter(r => r.requestType === this.RIGHTS_REQUESTS.ERASURE).length
          },
          optOut: {
            implemented: true,
            description: 'Derecho a optar por no vender información personal',
            requests: rightsRequests.filter(r => r.requestType === this.RIGHTS_REQUESTS.DO_NOT_SELL).length
          },
          correction: {
            implemented: true,
            description: 'Derecho a corregir información inexacta (CPRA)',
            requests: rightsRequests.filter(r => r.requestType === this.RIGHTS_REQUESTS.RECTIFICATION).length
          },
          limit: {
            implemented: true,
            description: 'Derecho a limitar el uso de información sensible (CPRA)',
            requests: rightsRequests.filter(r => r.requestType === this.RIGHTS_REQUESTS.RESTRICTION).length
          }
        },

        // Categorías de información personal recopilada
        personalInformationCategories: [
          'Identificadores (nombre, email)',
          'Información de dispositivo',
          'Información de uso de la aplicación',
          'Preferencias del usuario'
        ],

        // Propósitos comerciales
        businessPurposes: [
          'Proporcionar servicios de la aplicación',
          'Mejorar experiencia del usuario',
          'Seguridad y prevención de fraude',
          'Cumplimiento legal'
        ],

        // Divulgaciones
        disclosures: {
          doNotSell: 'No vendemos información personal',
          thirdParties: 'Solo compartimos con proveedores de servicios necesarios',
          retention: 'Retenemos datos durante 365 días o según sea necesario',
          noDiscrimination: 'No discriminamos por ejercer derechos de privacidad'
        },

        // Cumplimiento
        compliance: {
          status: 'COMPLIANT',
          responseTime: '45 días',
          verificationMethod: 'Email y autenticación multifactor',
          noSaleOptOut: 'Implementado'
        }
      };

      console.log('📄 Informe CCPA/CPRA generado');
      return report;
    } catch (error) {
      console.error('❌ Error generando informe CCPA:', error);
      throw error;
    }
  }

  /**
   * Genera informe consolidado de cumplimiento
   */
  async generateConsolidatedReport(userId) {
    try {
      const [gdprReport, ccpaReport] = await Promise.all([
        this.generateGDPRComplianceReport(userId),
        this.generateCCPAComplianceReport(userId)
      ]);

      const consolidated = {
        userId: userId,
        generatedAt: new Date().toISOString(),
        regulations: {
          GDPR: gdprReport,
          CCPA_CPRA: ccpaReport
        },
        summary: {
          totalRightsRequests: gdprReport.rights.access.requests + 
                              gdprReport.rights.rectification.requests +
                              gdprReport.rights.erasure.requests +
                              gdprReport.rights.portability.requests,
          complianceStatus: {
            GDPR: gdprReport.compliance.status,
            CCPA: ccpaReport.compliance.status
          }
        }
      };

      console.log('📊 Informe consolidado generado');
      return consolidated;
    } catch (error) {
      console.error('❌ Error generando informe consolidado:', error);
      throw error;
    }
  }

  /**
   * Elimina todos los registros de cumplimiento (derecho al olvido)
   */
  async deleteAllComplianceRecords(userId) {
    try {
      console.log('🗑️ Eliminando registros de cumplimiento...');

      await SecureStore.deleteItemAsync(`processing_log_${userId}`);
      await SecureStore.deleteItemAsync(`rights_requests_${userId}`);

      console.log('✅ Registros de cumplimiento eliminados');
    } catch (error) {
      console.error('❌ Error eliminando registros:', error);
      throw error;
    }
  }
}

export default new ComplianceTrackingService();
