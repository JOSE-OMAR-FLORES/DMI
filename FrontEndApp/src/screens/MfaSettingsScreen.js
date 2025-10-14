import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert
} from 'react-native';
import { CustomButton } from '../components';
import { useToast } from '../context/ToastContext';
import { COLORS } from '../constants/colors';
import { GLOBAL_STYLES } from '../constants/styles';
import mfaService from '../services/mfaService';
import * as Clipboard from 'expo-clipboard';

const MFASettingsScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaEnabledAt, setMfaEnabledAt] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  
  const { showSuccess, showError, showWarning } = useToast();

  useEffect(() => {
    loadMFAStatus();
  }, []);

  const loadMFAStatus = async () => {
    setIsLoading(true);
    try {
      const result = await mfaService.getMFAStatus();
      
      if (result.success) {
        setMfaEnabled(result.mfaEnabled);
        setMfaEnabledAt(result.mfaEnabledAt);
      } else {
        showError('Error al cargar estado de MFA');
      }
    } catch (error) {
      showError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableMFA = async () => {
    Alert.alert(
      '🔐 Habilitar MFA',
      'La autenticación multi-factor añade una capa extra de seguridad. Cada vez que inicies sesión, recibirás un código de 6 dígitos por email.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Habilitar', 
          onPress: async () => {
            setIsProcessing(true);
            try {
              const result = await mfaService.enableMFA();
              
              if (result.success) {
                setMfaEnabled(true);
                setBackupCodes(result.backupCodes);
                setShowBackupCodesModal(true);
                showSuccess('✅ MFA habilitado exitosamente');
              } else {
                showError(result.error);
              }
            } catch (error) {
              showError('Error al habilitar MFA');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handleDisableMFA = async () => {
    Alert.alert(
      '⚠️ Deshabilitar MFA',
      '¿Estás seguro? Tu cuenta será menos segura sin la autenticación multi-factor.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Deshabilitar', 
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              const result = await mfaService.disableMFA();
              
              if (result.success) {
                setMfaEnabled(false);
                setMfaEnabledAt(null);
                showSuccess('MFA deshabilitado');
              } else {
                showError(result.error);
              }
            } catch (error) {
              showError('Error al deshabilitar MFA');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handleRegenerateBackupCodes = async () => {
    Alert.alert(
      '🔄 Regenerar Códigos de Respaldo',
      'Los códigos de respaldo actuales dejarán de funcionar. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Regenerar', 
          onPress: async () => {
            setIsProcessing(true);
            try {
              const result = await mfaService.regenerateBackupCodes();
              
              if (result.success) {
                setBackupCodes(result.backupCodes);
                setShowBackupCodesModal(true);
                showSuccess('Nuevos códigos generados');
              } else {
                showError(result.error);
              }
            } catch (error) {
              showError('Error al regenerar códigos');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handleCopyAllCodes = async () => {
    const codesText = backupCodes.join('\n');
    await Clipboard.setStringAsync(codesText);
    showSuccess('📋 Códigos copiados al portapapeles');
  };

  const handleCopyCode = async (code) => {
    await Clipboard.setStringAsync(code);
    showSuccess('📋 Código copiado');
  };

  const renderBackupCodesModal = () => (
    <Modal
      visible={showBackupCodesModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowBackupCodesModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>🔑 Códigos de Respaldo</Text>
          
          <Text style={styles.modalWarning}>
            ⚠️ IMPORTANTE: Guarda estos códigos en un lugar seguro. Cada código solo puede usarse una vez.
          </Text>

          <ScrollView style={styles.codesScrollView}>
            {backupCodes.map((code, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.codeItem}
                onPress={() => handleCopyCode(code)}
              >
                <Text style={styles.codeNumber}>{index + 1}.</Text>
                <Text style={styles.codeText}>{code}</Text>
                <Text style={styles.copyIcon}>📋</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <CustomButton
            title="📋 Copiar Todos"
            onPress={handleCopyAllCodes}
            style={{ marginTop: 15 }}
          />

          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowBackupCodesModal(false)}
          >
            <Text style={styles.modalCloseText}>He guardado mis códigos</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={GLOBAL_STYLES.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando configuración...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={GLOBAL_STYLES.container}>
      <View style={styles.content}>
        <View style={GLOBAL_STYLES.card}>
          <Text style={GLOBAL_STYLES.title}>🔐 Autenticación Multi-Factor</Text>
          
          {/* Estado actual */}
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Estado:</Text>
            <View style={styles.statusBadge}>
              <Text style={[
                styles.statusText,
                mfaEnabled ? styles.statusEnabled : styles.statusDisabled
              ]}>
                {mfaEnabled ? '✅ Habilitado' : '❌ Deshabilitado'}
              </Text>
            </View>
          </View>

          {mfaEnabled && mfaEnabledAt && (
            <Text style={styles.infoText}>
              Habilitado el: {new Date(mfaEnabledAt).toLocaleDateString('es-MX')}
            </Text>
          )}

          {/* Descripción */}
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>¿Qué es MFA?</Text>
            <Text style={styles.descriptionText}>
              La autenticación multi-factor añade una capa extra de seguridad a tu cuenta. 
              Cada vez que inicies sesión, recibirás un código de 6 dígitos por email que 
              deberás ingresar para completar el acceso.
            </Text>
          </View>

          {/* Beneficios */}
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>✨ Beneficios:</Text>
            <Text style={styles.benefitItem}>🔒 Mayor seguridad para tu cuenta</Text>
            <Text style={styles.benefitItem}>🛡️ Protección contra accesos no autorizados</Text>
            <Text style={styles.benefitItem}>📧 Notificación de intentos de acceso</Text>
            <Text style={styles.benefitItem}>🔑 Códigos de respaldo de emergencia</Text>
          </View>

          {/* Acciones */}
          {!mfaEnabled ? (
            <CustomButton
              title={isProcessing ? 'Habilitando...' : '🔐 Habilitar MFA'}
              onPress={handleEnableMFA}
              disabled={isProcessing}
              style={{ marginTop: 20 }}
            />
          ) : (
            <View style={styles.actionsContainer}>
              <CustomButton
                title={isProcessing ? 'Procesando...' : '🔄 Regenerar Códigos de Respaldo'}
                onPress={handleRegenerateBackupCodes}
                disabled={isProcessing}
                style={{ marginBottom: 15 }}
              />
              
              <CustomButton
                title={isProcessing ? 'Deshabilitando...' : '⚠️ Deshabilitar MFA'}
                onPress={handleDisableMFA}
                disabled={isProcessing}
                variant="secondary"
              />
            </View>
          )}

          {/* Información adicional */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>ℹ️ Información Importante</Text>
            <Text style={styles.infoCardText}>
              • Los códigos de verificación expiran en 5 minutos{'\n'}
              • Tienes 5 intentos antes de que la cuenta se bloquee temporalmente{'\n'}
              • Puedes usar códigos de respaldo si no recibes el email{'\n'}
              • Cada código de respaldo solo funciona una vez
            </Text>
          </View>
        </View>
      </View>

      {renderBackupCodesModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginTop: 15,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusEnabled: {
    color: '#10b981',
  },
  statusDisabled: {
    color: '#ef4444',
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  descriptionCard: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e0f2fe',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0369a1',
  },
  descriptionText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  benefitsCard: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
  },
  benefitsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#166534',
  },
  benefitItem: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 5,
  },
  actionsContainer: {
    marginTop: 20,
  },
  infoCard: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#92400e',
  },
  infoCardText: {
    fontSize: 13,
    color: '#451a03',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalWarning: {
    fontSize: 14,
    color: '#ef4444',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  codesScrollView: {
    maxHeight: 300,
  },
  codeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  codeNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginRight: 10,
    width: 30,
  },
  codeText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  copyIcon: {
    fontSize: 18,
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default MFASettingsScreen;
