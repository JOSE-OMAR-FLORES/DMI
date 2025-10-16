/**
 * ⚙️ ConsentManagementScreen
 * 
 * Pantalla de gestión de preferencias de privacidad y consentimientos
 * Permite al usuario revisar y modificar sus consentimientos
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import ConsentManagementService from '../services/ConsentManagementService';
import ComplianceTrackingService from '../services/ComplianceTrackingService';
import AuthStorage from '../utils/AuthStorage';

export default function ConsentManagementScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [consents, setConsents] = useState({});
  const [consentHistory, setConsentHistory] = useState([]);
  const [ccpaOptOut, setCcpaOptOut] = useState(false);

  useEffect(() => {
    loadConsentData();
  }, []);

  const loadConsentData = async () => {
    try {
      setLoading(true);

      const user = await AuthStorage.getUser();
      if (!user || !user.id) {
        Alert.alert('Error', 'Usuario no autenticado');
        navigation.goBack();
        return;
      }

      // Cargar consentimientos actuales
      const currentConsents = await ConsentManagementService.getConsents(user.id);
      setConsents(currentConsents);

      // Cargar estado CCPA
      const optOutStatus = await ConsentManagementService.getCCPAOptOutStatus(user.id);
      setCcpaOptOut(optOutStatus);

      // Cargar historial
      const history = await ConsentManagementService.getConsentHistory(user.id);
      setConsentHistory(history.slice(0, 5)); // Últimos 5
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar las preferencias');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleConsent = async (purpose) => {
    if (purpose === 'essential') {
      Alert.alert(
        'No se puede desactivar',
        'Las funcionalidades esenciales son necesarias para el funcionamiento de la aplicación.'
      );
      return;
    }

    try {
      const user = await AuthStorage.getUser();
      const newValue = !consents[purpose];

      // Actualizar localmente primero
      setConsents(prev => ({ ...prev, [purpose]: newValue }));

      if (newValue) {
        // Dar consentimiento
        await ConsentManagementService.requestConsent(
          user.id,
          { [purpose]: true },
          'preference_change'
        );
      } else {
        // Revocar consentimiento
        await ConsentManagementService.revokeConsent(user.id, [purpose]);
      }

      // Registrar en compliance tracking
      await ComplianceTrackingService.logProcessingActivity(user.id, {
        type: newValue ? 'consent_granted' : 'consent_revoked',
        purpose: purpose,
        legalBasis: ComplianceTrackingService.LEGAL_BASIS.CONSENT,
        dataCategories: ['user_preferences'],
        purpose: `User ${newValue ? 'granted' : 'revoked'} consent for ${purpose}`
      });

      Alert.alert(
        '✅ Preferencia Actualizada',
        `Has ${newValue ? 'activado' : 'desactivado'} ${getConsentName(purpose)}.`
      );

      // Recargar datos
      await loadConsentData();
    } catch (error) {
      console.error('Error actualizando consentimiento:', error);
      // Revertir cambio local
      setConsents(prev => ({ ...prev, [purpose]: !newValue }));
      Alert.alert('Error', 'No se pudo actualizar la preferencia');
    }
  };

  const handleCCPAOptOut = async () => {
    try {
      const user = await AuthStorage.getUser();
      
      Alert.alert(
        '🛡️ No Vender Mis Datos',
        ccpaOptOut 
          ? '¿Deseas permitir que se compartan tus datos con terceros?'
          : '¿Deseas optar por NO vender/compartir tus datos personales? (CCPA/CPRA)',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: ccpaOptOut ? 'Permitir' : 'No Vender',
            onPress: async () => {
              try {
                if (!ccpaOptOut) {
                  await ConsentManagementService.doNotSellMyData(user.id);
                  setCcpaOptOut(true);
                  
                  Alert.alert(
                    '✅ Preferencia Guardada',
                    'Hemos registrado tu solicitud de NO vender/compartir tus datos personales.'
                  );
                } else {
                  // Revocar opt-out
                  await ConsentManagementService.revokeConsent(user.id, ['third_party_sharing']);
                  setCcpaOptOut(false);
                  
                  Alert.alert(
                    '✅ Preferencia Actualizada',
                    'Has permitido el intercambio de datos con terceros de confianza.'
                  );
                }

                await loadConsentData();
              } catch (error) {
                console.error('Error con CCPA opt-out:', error);
                Alert.alert('Error', 'No se pudo actualizar la preferencia');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleViewHistory = () => {
    navigation.navigate('ConsentHistory', { history: consentHistory });
  };

  const handleDownloadReport = async () => {
    try {
      setLoading(true);
      const user = await AuthStorage.getUser();

      const report = await ConsentManagementService.generateConsentReport(user.id);

      Alert.alert(
        '📊 Reporte Generado',
        `Total de consentimientos: ${report.consents.length}\nHistorial de cambios: ${report.history.length}`,
        [
          { text: 'OK' }
        ]
      );

      console.log('Reporte completo:', report);
    } catch (error) {
      console.error('Error generando reporte:', error);
      Alert.alert('Error', 'No se pudo generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const getConsentName = (purpose) => {
    const names = {
      essential: 'Funcionalidades Esenciales',
      analytics: 'Análisis y Mejoras',
      personalization: 'Personalización',
      marketing: 'Marketing',
      third_party_sharing: 'Compartir con Terceros',
      location: 'Ubicación',
      profiling: 'Perfilado'
    };
    return names[purpose] || purpose;
  };

  const getConsentDescription = (purpose) => {
    const descriptions = {
      essential: 'Necesario para el funcionamiento de la app',
      analytics: 'Análisis de uso para mejorar la experiencia',
      personalization: 'Personalización de contenido',
      marketing: 'Comunicaciones promocionales',
      third_party_sharing: 'Compartir datos con partners',
      location: 'Servicios basados en ubicación',
      profiling: 'Recomendaciones personalizadas'
    };
    return descriptions[purpose] || '';
  };

  const getActiveConsentsCount = () => {
    return Object.values(consents).filter(v => v).length;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Cargando preferencias...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadConsentData();
          }} />
        }
      >
        {/* Header con estadísticas */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔒 Privacidad y Consentimientos</Text>
          <Text style={styles.headerSubtitle}>
            {getActiveConsentsCount()} de {Object.keys(consents).length} propósitos activos
          </Text>
        </View>

        {/* CCPA/CPRA "Do Not Sell" */}
        <View style={styles.ccpaSection}>
          <View style={styles.ccpaHeader}>
            <Text style={styles.ccpaTitle}>🛡️ California Privacy Rights (CCPA/CPRA)</Text>
          </View>
          <TouchableOpacity
            style={[styles.ccpaButton, ccpaOptOut && styles.ccpaButtonActive]}
            onPress={handleCCPAOptOut}
          >
            <Text style={[styles.ccpaButtonText, ccpaOptOut && styles.ccpaButtonTextActive]}>
              {ccpaOptOut ? '✅ No Vender Mis Datos (Activo)' : 'Do Not Sell My Personal Information'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.ccpaDescription}>
            {ccpaOptOut
              ? 'Has optado por NO vender/compartir tus datos personales'
              : 'Clic para ejercer tu derecho a no vender tus datos personales'}
          </Text>
        </View>

        {/* Lista de consentimientos */}
        <View style={styles.consentsSection}>
          <Text style={styles.sectionTitle}>Gestión de Consentimientos</Text>
          
          {Object.keys(consents).map((purpose) => {
            const isActive = consents[purpose];
            const isEssential = purpose === 'essential';

            return (
              <View key={purpose} style={styles.consentItem}>
                <View style={styles.consentInfo}>
                  <Text style={styles.consentName}>{getConsentName(purpose)}</Text>
                  <Text style={styles.consentDesc}>{getConsentDescription(purpose)}</Text>
                  {isEssential && (
                    <Text style={styles.requiredBadge}>* Requerido</Text>
                  )}
                </View>
                <Switch
                  value={isActive}
                  onValueChange={() => handleToggleConsent(purpose)}
                  disabled={isEssential}
                  trackColor={{ false: '#767577', true: '#4CAF50' }}
                  thumbColor={isActive ? '#fff' : '#f4f3f4'}
                />
              </View>
            );
          })}
        </View>

        {/* Historial reciente */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Historial Reciente</Text>
            <TouchableOpacity onPress={handleViewHistory}>
              <Text style={styles.viewAllLink}>Ver Todo →</Text>
            </TouchableOpacity>
          </View>

          {consentHistory.length > 0 ? (
            consentHistory.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyAction}>{item.action}</Text>
                <Text style={styles.historyDate}>
                  {new Date(item.timestamp).toLocaleString('es-ES')}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noHistory}>No hay historial disponible</Text>
          )}
        </View>

        {/* Acciones */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDownloadReport}
          >
            <Text style={styles.actionButtonText}>📊 Descargar Reporte de Consentimientos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Text style={styles.actionButtonText}>📜 Ver Política de Privacidad</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={() => navigation.navigate('DataRights')}
          >
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
              ⚖️ Ejercer Derechos de Privacidad
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer informativo */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔒 Tus datos están protegidos con cifrado AES-256{'\n'}
            ✅ Cumplimos con GDPR, CCPA y CPRA{'\n'}
            📧 Contacto: privacy@tuapp.com
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  ccpaSection: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    elevation: 2,
  },
  ccpaHeader: {
    marginBottom: 12,
  },
  ccpaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  ccpaButton: {
    backgroundColor: '#FFF3E0',
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF9800',
    marginBottom: 8,
  },
  ccpaButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  ccpaButtonText: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  ccpaButtonTextActive: {
    color: '#fff',
  },
  ccpaDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  consentsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  consentItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  consentInfo: {
    flex: 1,
    marginRight: 12,
  },
  consentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  consentDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  requiredBadge: {
    fontSize: 11,
    color: '#FF9800',
    marginTop: 4,
    fontStyle: 'italic',
  },
  historySection: {
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllLink: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  historyItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyAction: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
  },
  noHistory: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 16,
  },
  actionsSection: {
    padding: 16,
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
    elevation: 2,
  },
  actionButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  dangerButton: {
    borderColor: '#F44336',
  },
  dangerButtonText: {
    color: '#F44336',
  },
  footer: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#1976D2',
    lineHeight: 20,
  },
});
