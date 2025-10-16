/**
 * 📋 GDPRSettingsScreen
 * 
 * Pantalla de configuración GDPR
 * Permite al usuario ejercer sus derechos sobre datos personales
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share
} from 'react-native';
import { useSelector } from 'react-redux';
import GDPRComplianceService from '../services/GDPRComplianceService';
import EncryptionService from '../services/EncryptionService';
import { COLORS } from '../constants/colors';

const GDPRSettingsScreen = ({ navigation }) => {
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [complianceReport, setComplianceReport] = useState(null);

  useEffect(() => {
    loadComplianceReport();
  }, []);

  const loadComplianceReport = async () => {
    try {
      setLoading(true);
      const report = await GDPRComplianceService.generateComplianceReport(user.id);
      setComplianceReport(report);
    } catch (error) {
      console.error('Error cargando reporte:', error);
    } finally {
      setLoading(false);
    }
  };

  // Art. 15 - Derecho de Acceso
  const handleAccessData = async () => {
    try {
      setLoading(true);
      Alert.alert(
        '📖 Derecho de Acceso',
        'Vas a acceder a todos tus datos personales almacenados en la aplicación.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Ver Datos',
            onPress: async () => {
              const userData = await GDPRComplianceService.getUserData(user.id);
              
              Alert.alert(
                'Tus Datos Personales',
                `Fecha de solicitud: ${new Date(userData.requestDate).toLocaleString()}\n\n` +
                `Categorías de datos: ${Object.keys(userData.personalData).length}\n\n` +
                `Período de retención: ${userData.metadata.retentionPeriod}`,
                [{ text: 'OK' }]
              );
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudieron obtener tus datos');
    } finally {
      setLoading(false);
    }
  };

  // Art. 20 - Derecho a la Portabilidad
  const handleExportData = async () => {
    try {
      setLoading(true);
      Alert.alert(
        '📦 Exportar Datos',
        'Selecciona el formato de exportación:',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'JSON',
            onPress: async () => {
              const result = await GDPRComplianceService.exportUserData(user.id, 'JSON');
              
              // Compartir archivo
              await Share.share({
                message: result.data,
                title: 'Mis Datos Personales'
              });

              Alert.alert(
                '✅ Exportación Exitosa',
                `Formato: ${result.format}\nTamaño: ${(result.size / 1024).toFixed(2)} KB`
              );
            }
          },
          {
            text: 'CSV',
            onPress: async () => {
              const result = await GDPRComplianceService.exportUserData(user.id, 'CSV');
              
              await Share.share({
                message: result.data,
                title: 'Mis Datos Personales'
              });

              Alert.alert('✅ Exportación Exitosa', `Datos exportados en formato CSV`);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudieron exportar tus datos');
    } finally {
      setLoading(false);
    }
  };

  // Art. 17 - Derecho al Olvido
  const handleDeleteAllData = async () => {
    Alert.alert(
      '🗑️ Eliminar Todos los Datos',
      '⚠️ ADVERTENCIA: Esta acción es IRREVERSIBLE.\n\n' +
      'Se eliminarán permanentemente:\n' +
      '• Perfil de usuario\n' +
      '• Preferencias\n' +
      '• Historial\n' +
      '• Datos personales\n' +
      '• Configuración\n\n' +
      '¿Estás seguro de que deseas continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Todo',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              const report = await GDPRComplianceService.deleteUserData(
                user.id,
                'user_request'
              );

              Alert.alert(
                '✅ Datos Eliminados',
                `Se eliminaron ${report.deletedItems.length} elementos.\n\n` +
                'Tu cuenta será cerrada y deberás registrarte nuevamente para usar la aplicación.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Logout y regresar al login
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }]
                      });
                    }
                  }
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'No se pudieron eliminar tus datos');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Art. 18 - Derecho a la Limitación
  const handleLimitProcessing = async () => {
    try {
      setLoading(true);
      
      Alert.alert(
        '🔒 Limitar Procesamiento',
        'Puedes limitar cómo se procesan tus datos. Selecciona una opción:',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Limitar Todo',
            onPress: async () => {
              await GDPRComplianceService.limitDataProcessing(user.id, 'all');
              Alert.alert('✅ Procesamiento Limitado', 'Tus datos no serán procesados excepto para almacenamiento.');
            }
          },
          {
            text: 'Limitar Marketing',
            onPress: async () => {
              await GDPRComplianceService.limitDataProcessing(user.id, 'marketing');
              Alert.alert('✅ Marketing Limitado', 'No recibirás comunicaciones de marketing.');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo limitar el procesamiento');
    } finally {
      setLoading(false);
    }
  };

  const renderGDPROption = (title, description, icon, onPress, danger = false) => (
    <TouchableOpacity
      style={[styles.optionCard, danger && styles.dangerCard]}
      onPress={onPress}
      disabled={loading}
    >
      <View style={styles.optionHeader}>
        <Text style={styles.optionIcon}>{icon}</Text>
        <View style={styles.optionContent}>
          <Text style={[styles.optionTitle, danger && styles.dangerText]}>
            {title}
          </Text>
          <Text style={styles.optionDescription}>{description}</Text>
        </View>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  if (loading && !complianceReport) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando configuración GDPR...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚖️ Protección de Datos (GDPR)</Text>
        <Text style={styles.headerSubtitle}>
          Tus derechos sobre tus datos personales
        </Text>
      </View>

      {complianceReport && (
        <View style={styles.complianceCard}>
          <Text style={styles.complianceTitle}>📊 Estado de Cumplimiento</Text>
          <View style={styles.complianceRow}>
            <Text style={styles.complianceLabel}>Minimización de datos:</Text>
            <Text style={complianceReport.compliance.dataMinimization ? styles.yes : styles.no}>
              {complianceReport.compliance.dataMinimization ? '✅ Sí' : '❌ No'}
            </Text>
          </View>
          <View style={styles.complianceRow}>
            <Text style={styles.complianceLabel}>Cifrado activo:</Text>
            <Text style={styles.yes}>✅ AES-256</Text>
          </View>
          <View style={styles.complianceRow}>
            <Text style={styles.complianceLabel}>Auditoría:</Text>
            <Text style={styles.yes}>✅ Activa</Text>
          </View>
          <View style={styles.complianceRow}>
            <Text style={styles.complianceLabel}>Retención:</Text>
            <Text style={styles.complianceInfo}>
              {complianceReport.statistics.dataRetentionDays} días
            </Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Derechos GDPR</Text>

        {renderGDPROption(
          'Acceder a mis Datos',
          'Art. 15 - Ver todos tus datos personales almacenados',
          '📖',
          handleAccessData
        )}

        {renderGDPROption(
          'Exportar mis Datos',
          'Art. 20 - Descargar tus datos en formato portable',
          '📦',
          handleExportData
        )}

        {renderGDPROption(
          'Limitar Procesamiento',
          'Art. 18 - Restringir cómo se usan tus datos',
          '🔒',
          handleLimitProcessing
        )}

        {renderGDPROption(
          'Eliminar Todos mis Datos',
          'Art. 17 - Derecho al olvido (acción irreversible)',
          '🗑️',
          handleDeleteAllData,
          true
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>ℹ️ Información</Text>
        <Text style={styles.infoText}>
          Esta aplicación cumple con el Reglamento General de Protección de Datos (GDPR) de la Unión Europea.
        </Text>
        <Text style={styles.infoText}>
          Todos tus datos personales están cifrados con AES-256 y almacenados de forma segura.
        </Text>
        <Text style={styles.infoText}>
          Puedes ejercer tus derechos en cualquier momento desde esta pantalla.
        </Text>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.white} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
  },
  complianceCard: {
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  complianceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: COLORS.text,
  },
  complianceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  complianceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  yes: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  no: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.error,
  },
  complianceInfo: {
    fontSize: 14,
    color: COLORS.text,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 16,
    marginBottom: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dangerCard: {
    borderWidth: 2,
    borderColor: COLORS.error,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  dangerText: {
    color: COLORS.error,
  },
  optionDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  arrow: {
    fontSize: 24,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  infoSection: {
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.lightBlue,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GDPRSettingsScreen;
