/**
 * 📋 GDPRComplianceService
 * 
 * Servicio de cumplimiento GDPR (General Data Protection Regulation)
 * Implementa derechos de los usuarios sobre sus datos personales
 * 
 * Derechos GDPR implementados:
 * - Derecho de acceso (Art. 15)
 * - Derecho de rectificación (Art. 16)
 * - Derecho de supresión / "Derecho al olvido" (Art. 17)
 * - Derecho a la portabilidad (Art. 20)
 * - Derecho a la limitación del tratamiento (Art. 18)
 * - Principio de minimización de datos (Art. 5)
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptionService from './EncryptionService';
import SecretsManager from './SecretsManager';

class GDPRComplianceService {
  constructor() {
    this.DATA_RETENTION_DAYS = 365; // 1 año de retención
    this.PERSONAL_DATA_KEYS = [
      'user_data',
      'user_profile',
      'user_preferences',
      'user_settings',
      'personal_info',
      'contact_info',
      'location_data',
      'usage_statistics'
    ];
  }

  /**
   * Art. 15 GDPR - Derecho de acceso
   * Permite al usuario acceder a todos sus datos personales
   */
  async getUserData(userId) {
    try {
      console.log('📖 GDPR: Accediendo a datos del usuario (Art. 15)...');
      
      const userData = {
        requestDate: new Date().toISOString(),
        userId: userId,
        personalData: {},
        metadata: {
          dataController: 'Tu Aplicación S.A.',
          legalBasis: 'Consentimiento del usuario',
          retentionPeriod: `${this.DATA_RETENTION_DAYS} días`,
          rights: [
            'Derecho de acceso',
            'Derecho de rectificación',
            'Derecho de supresión',
            'Derecho de portabilidad',
            'Derecho de limitación'
          ]
        }
      };

      // Recopilar todos los datos personales
      for (const key of this.PERSONAL_DATA_KEYS) {
        try {
          // Intentar recuperar de SecureStore
          const secureData = await SecureStore.getItemAsync(key);
          if (secureData) {
            userData.personalData[key] = JSON.parse(secureData);
          }

          // Intentar recuperar de AsyncStorage
          const asyncData = await AsyncStorage.getItem(key);
          if (asyncData && !userData.personalData[key]) {
            userData.personalData[key] = JSON.parse(asyncData);
          }

          // Intentar recuperar datos cifrados
          const encryptedData = await EncryptionService.secureRetrieve(key);
          if (encryptedData && !userData.personalData[key]) {
            userData.personalData[key] = JSON.parse(encryptedData);
          }
        } catch (error) {
          console.warn(`⚠️ No se pudo recuperar "${key}":`, error.message);
        }
      }

      console.log('✅ Datos del usuario recopilados');
      console.log(`📊 Total de categorías de datos: ${Object.keys(userData.personalData).length}`);
      
      return userData;
    } catch (error) {
      console.error('❌ Error accediendo a datos del usuario:', error);
      throw error;
    }
  }

  /**
   * Art. 16 GDPR - Derecho de rectificación
   * Permite al usuario corregir datos inexactos
   */
  async updateUserData(userId, dataKey, newValue) {
    try {
      console.log(`✏️ GDPR: Rectificando dato "${dataKey}" (Art. 16)...`);
      
      // Registrar la modificación para auditoría
      await this.logDataModification(userId, dataKey, 'UPDATE');

      // Actualizar dato cifrado
      await EncryptionService.secureStore(dataKey, JSON.stringify(newValue));
      
      console.log(`✅ Dato "${dataKey}" rectificado exitosamente`);
      
      return {
        success: true,
        message: 'Dato actualizado correctamente',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ Error rectificando dato "${dataKey}":`, error);
      throw error;
    }
  }

  /**
   * Art. 17 GDPR - Derecho de supresión (Derecho al olvido)
   * Elimina todos los datos personales del usuario
   */
  async deleteUserData(userId, reason = 'user_request') {
    try {
      console.log('🗑️ GDPR: Eliminando todos los datos del usuario (Art. 17)...');
      console.log(`📝 Motivo: ${reason}`);
      
      // Registrar la solicitud de eliminación
      await this.logDataDeletion(userId, reason);

      const deletionReport = {
        userId: userId,
        timestamp: new Date().toISOString(),
        reason: reason,
        deletedItems: [],
        errors: []
      };

      // Eliminar datos de SecureStore
      for (const key of this.PERSONAL_DATA_KEYS) {
        try {
          await SecureStore.deleteItemAsync(key);
          deletionReport.deletedItems.push(`SecureStore:${key}`);
        } catch (error) {
          deletionReport.errors.push({ key, error: error.message });
        }
      }

      // Eliminar datos de AsyncStorage
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const userKeys = allKeys.filter(key => 
          this.PERSONAL_DATA_KEYS.some(pdKey => key.includes(pdKey))
        );
        
        await AsyncStorage.multiRemove(userKeys);
        deletionReport.deletedItems.push(...userKeys.map(k => `AsyncStorage:${k}`));
      } catch (error) {
        deletionReport.errors.push({ storage: 'AsyncStorage', error: error.message });
      }

      // Eliminar datos cifrados
      await EncryptionService.deleteAllUserData();

      // Eliminar secretos
      await SecretsManager.deleteAllSecrets();

      console.log('✅ Todos los datos del usuario eliminados (GDPR)');
      console.log(`📊 Items eliminados: ${deletionReport.deletedItems.length}`);
      console.log(`❌ Errores: ${deletionReport.errors.length}`);
      
      return deletionReport;
    } catch (error) {
      console.error('❌ Error eliminando datos del usuario:', error);
      throw error;
    }
  }

  /**
   * Art. 20 GDPR - Derecho a la portabilidad
   * Exporta todos los datos en formato legible y transferible
   */
  async exportUserData(userId, format = 'JSON') {
    try {
      console.log('📦 GDPR: Exportando datos del usuario (Art. 20)...');
      console.log(`📄 Formato: ${format}`);
      
      // Obtener todos los datos
      const userData = await this.getUserData(userId);

      const exportPackage = {
        exportInfo: {
          userId: userId,
          exportDate: new Date().toISOString(),
          format: format,
          version: '1.0.0',
          dataController: 'Tu Aplicación S.A.',
          compliance: 'GDPR Art. 20 - Derecho a la portabilidad'
        },
        data: userData.personalData,
        metadata: userData.metadata
      };

      // Convertir a formato solicitado
      let exportedData;
      switch (format.toUpperCase()) {
        case 'JSON':
          exportedData = JSON.stringify(exportPackage, null, 2);
          break;
        case 'CSV':
          exportedData = this.convertToCSV(exportPackage.data);
          break;
        default:
          exportedData = JSON.stringify(exportPackage, null, 2);
      }

      console.log('✅ Datos exportados exitosamente');
      console.log(`📊 Tamaño: ${exportedData.length} bytes`);
      
      // Registrar exportación para auditoría
      await this.logDataExport(userId, format);

      return {
        success: true,
        format: format,
        data: exportedData,
        size: exportedData.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error exportando datos:', error);
      throw error;
    }
  }

  /**
   * Art. 18 GDPR - Derecho a la limitación del tratamiento
   * Marca datos para procesamiento limitado
   */
  async limitDataProcessing(userId, limitScope = 'all') {
    try {
      console.log('🔒 GDPR: Limitando procesamiento de datos (Art. 18)...');
      
      const limitation = {
        userId: userId,
        scope: limitScope,
        limitedAt: new Date().toISOString(),
        status: 'PROCESSING_LIMITED'
      };

      await SecureStore.setItemAsync(
        'data_processing_limitation',
        JSON.stringify(limitation)
      );

      console.log('✅ Procesamiento de datos limitado');
      
      return limitation;
    } catch (error) {
      console.error('❌ Error limitando procesamiento:', error);
      throw error;
    }
  }

  /**
   * Art. 5 GDPR - Principio de minimización de datos
   * Verifica que solo se recopilen datos necesarios
   */
  async verifyDataMinimization() {
    try {
      console.log('🔍 GDPR: Verificando minimización de datos (Art. 5)...');
      
      const allKeys = await AsyncStorage.getAllKeys();
      const allSecureKeys = Object.values(this.PERSONAL_DATA_KEYS);

      const analysis = {
        totalDataPoints: allKeys.length,
        necessaryDataPoints: allSecureKeys.length,
        excessiveDataPoints: [],
        compliance: true,
        recommendations: []
      };

      // Identificar datos excesivos
      for (const key of allKeys) {
        const isNecessary = allSecureKeys.some(necessary => key.includes(necessary));
        if (!isNecessary && !key.startsWith('redux_')) {
          analysis.excessiveDataPoints.push(key);
        }
      }

      if (analysis.excessiveDataPoints.length > 0) {
        analysis.compliance = false;
        analysis.recommendations.push(
          `Eliminar ${analysis.excessiveDataPoints.length} puntos de datos innecesarios`
        );
      }

      console.log('📊 Análisis de minimización completado');
      console.log(`✅ Cumplimiento: ${analysis.compliance ? 'SÍ' : 'NO'}`);
      
      return analysis;
    } catch (error) {
      console.error('❌ Error verificando minimización:', error);
      throw error;
    }
  }

  /**
   * Verifica la antigüedad de los datos y elimina datos obsoletos
   */
  async enforceDataRetention(userId) {
    try {
      console.log('🗓️ GDPR: Aplicando política de retención de datos...');
      
      const retentionReport = {
        userId: userId,
        retentionDays: this.DATA_RETENTION_DAYS,
        itemsChecked: 0,
        itemsDeleted: 0,
        timestamp: new Date().toISOString()
      };

      // Verificar cada dato personal
      for (const key of this.PERSONAL_DATA_KEYS) {
        try {
          const metadataKey = `${key}_metadata`;
          const metadata = await SecureStore.getItemAsync(metadataKey);
          
          if (metadata) {
            const { createdAt } = JSON.parse(metadata);
            const ageInDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
            
            retentionReport.itemsChecked++;

            if (ageInDays > this.DATA_RETENTION_DAYS) {
              // Dato obsoleto, eliminar
              await SecureStore.deleteItemAsync(key);
              await SecureStore.deleteItemAsync(metadataKey);
              retentionReport.itemsDeleted++;
              console.log(`🗑️ Dato obsoleto eliminado: ${key} (${Math.floor(ageInDays)} días)`);
            }
          }
        } catch (error) {
          console.warn(`⚠️ Error verificando "${key}":`, error.message);
        }
      }

      console.log('✅ Política de retención aplicada');
      console.log(`📊 Eliminados: ${retentionReport.itemsDeleted}/${retentionReport.itemsChecked}`);
      
      return retentionReport;
    } catch (error) {
      console.error('❌ Error aplicando retención:', error);
      throw error;
    }
  }

  /**
   * Registra modificaciones de datos para auditoría
   */
  async logDataModification(userId, dataKey, action) {
    try {
      const log = {
        userId,
        dataKey,
        action,
        timestamp: new Date().toISOString()
      };

      const logs = await this.getAuditLogs();
      logs.push(log);

      await SecureStore.setItemAsync('gdpr_audit_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('❌ Error registrando modificación:', error);
    }
  }

  /**
   * Registra eliminaciones de datos
   */
  async logDataDeletion(userId, reason) {
    await this.logDataModification(userId, 'ALL_DATA', `DELETE:${reason}`);
  }

  /**
   * Registra exportaciones de datos
   */
  async logDataExport(userId, format) {
    await this.logDataModification(userId, 'ALL_DATA', `EXPORT:${format}`);
  }

  /**
   * Obtiene logs de auditoría GDPR
   */
  async getAuditLogs() {
    try {
      const logs = await SecureStore.getItemAsync('gdpr_audit_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Convierte datos a formato CSV
   */
  convertToCSV(data) {
    const rows = [];
    
    for (const [category, values] of Object.entries(data)) {
      if (typeof values === 'object') {
        for (const [key, value] of Object.entries(values)) {
          rows.push(`${category},${key},${JSON.stringify(value)}`);
        }
      } else {
        rows.push(`${category},,${JSON.stringify(values)}`);
      }
    }

    return `Category,Key,Value\n${rows.join('\n')}`;
  }

  /**
   * Genera reporte de cumplimiento GDPR
   */
  async generateComplianceReport(userId) {
    try {
      console.log('📋 Generando reporte de cumplimiento GDPR...');
      
      const [
        userData,
        minimization,
        retention,
        auditLogs
      ] = await Promise.all([
        this.getUserData(userId),
        this.verifyDataMinimization(),
        this.enforceDataRetention(userId),
        this.getAuditLogs()
      ]);

      const report = {
        userId: userId,
        reportDate: new Date().toISOString(),
        compliance: {
          dataMinimization: minimization.compliance,
          dataRetention: retention.itemsDeleted === 0,
          userRights: true,
          encryption: true,
          auditTrail: auditLogs.length > 0
        },
        statistics: {
          totalDataCategories: Object.keys(userData.personalData).length,
          auditLogEntries: auditLogs.length,
          dataRetentionDays: this.DATA_RETENTION_DAYS
        },
        recommendations: minimization.recommendations
      };

      console.log('✅ Reporte de cumplimiento generado');
      
      return report;
    } catch (error) {
      console.error('❌ Error generando reporte:', error);
      throw error;
    }
  }
}

export default new GDPRComplianceService();
