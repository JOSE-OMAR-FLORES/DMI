/**
 * 📋 ConsentDialogScreen
 * 
 * Pantalla de diálogo de consentimiento inicial
 * Se muestra al usuario en su primer uso de la aplicación
 * Implementa GDPR Art. 7 (consentimiento explícito)
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
  ActivityIndicator
} from 'react-native';
import ConsentManagementService from '../services/ConsentManagementService';
import AuthStorage from '../utils/AuthStorage';

export default function ConsentDialogScreen({ navigation, route }) {
  const [loading, setLoading] = useState(false);
  const [consents, setConsents] = useState({
    essential: true, // Siempre activado
    analytics: false,
    personalization: false,
    marketing: false,
    third_party_sharing: false,
    location: false,
    profiling: false
  });

  const consentDescriptions = {
    essential: {
      title: '✅ Funcionalidades Esenciales',
      description: 'Necesario para el funcionamiento básico de la aplicación (autenticación, seguridad). No se puede desactivar.',
      required: true
    },
    analytics: {
      title: '📊 Análisis y Mejoras',
      description: 'Nos ayuda a entender cómo usas la aplicación para mejorarla. Recopilamos datos anónimos de uso.',
      required: false
    },
    personalization: {
      title: '🎨 Personalización',
      description: 'Personaliza tu experiencia según tus preferencias y comportamiento en la app.',
      required: false
    },
    marketing: {
      title: '📢 Marketing y Comunicaciones',
      description: 'Te enviamos ofertas, promociones y novedades que podrían interesarte.',
      required: false
    },
    third_party_sharing: {
      title: '🤝 Compartir con Terceros',
      description: 'Compartimos información con partners de confianza para servicios mejorados.',
      required: false
    },
    location: {
      title: '📍 Ubicación',
      description: 'Accedemos a tu ubicación para funcionalidades basadas en localización.',
      required: false
    },
    profiling: {
      title: '👤 Perfilado Automático',
      description: 'Creamos perfiles basados en tu comportamiento para recomendaciones personalizadas.',
      required: false
    }
  };

  const handleToggle = (purpose) => {
    if (purpose === 'essential') {
      Alert.alert(
        'No se puede desactivar',
        'Las funcionalidades esenciales son necesarias para el funcionamiento de la aplicación.'
      );
      return;
    }

    setConsents(prev => ({
      ...prev,
      [purpose]: !prev[purpose]
    }));
  };

  const handleAcceptSelected = async () => {
    try {
      setLoading(true);

      const user = await AuthStorage.getUser();
      if (!user || !user.id) {
        Alert.alert('Error', 'Usuario no autenticado');
        return;
      }

      // Registrar consentimientos
      await ConsentManagementService.requestConsent(
        user.id,
        consents,
        'explicit_ui' // Método de consentimiento
      );

      Alert.alert(
        '✅ Consentimiento Registrado',
        'Tus preferencias han sido guardadas. Puedes cambiarlas en cualquier momento desde Configuración.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (route.params?.returnScreen) {
                navigation.navigate(route.params.returnScreen);
              } else {
                navigation.navigate('Dashboard');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error guardando consentimientos:', error);
      Alert.alert('Error', 'No se pudieron guardar tus preferencias. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAll = () => {
    setConsents({
      essential: true,
      analytics: true,
      personalization: true,
      marketing: true,
      third_party_sharing: true,
      location: true,
      profiling: true
    });
  };

  const handleRejectAll = () => {
    setConsents({
      essential: true, // No se puede desactivar
      analytics: false,
      personalization: false,
      marketing: false,
      third_party_sharing: false,
      location: false,
      profiling: false
    });
  };

  const getAcceptedCount = () => {
    return Object.values(consents).filter(v => v).length;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🔒 Tu Privacidad es Importante</Text>
          <Text style={styles.subtitle}>
            Valoramos tu privacidad. Por favor, revisa y acepta cómo queremos usar tus datos.
          </Text>
          <Text style={styles.regulationInfo}>
            Cumplimos con GDPR, CCPA y CPRA
          </Text>
        </View>

        {/* Opciones de consentimiento */}
        <View style={styles.consentsContainer}>
          {Object.keys(consentDescriptions).map((purpose) => {
            const info = consentDescriptions[purpose];
            const isActive = consents[purpose];

            return (
              <View key={purpose} style={styles.consentItem}>
                <View style={styles.consentHeader}>
                  <Text style={styles.consentTitle}>{info.title}</Text>
                  <Switch
                    value={isActive}
                    onValueChange={() => handleToggle(purpose)}
                    disabled={info.required}
                    trackColor={{ false: '#767577', true: '#4CAF50' }}
                    thumbColor={isActive ? '#fff' : '#f4f3f4'}
                  />
                </View>
                <Text style={styles.consentDescription}>{info.description}</Text>
                {info.required && (
                  <Text style={styles.requiredLabel}>* Requerido</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Información legal */}
        <View style={styles.legalInfo}>
          <Text style={styles.legalTitle}>📖 Información Legal</Text>
          <Text style={styles.legalText}>
            • Puedes cambiar tus preferencias en cualquier momento{'\n'}
            • Puedes revocar tu consentimiento cuando quieras{'\n'}
            • Tienes derecho a acceder, rectificar y eliminar tus datos{'\n'}
            • No vendemos tu información personal{'\n'}
            • Lee nuestra{' '}
            <Text 
              style={styles.link}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              Política de Privacidad
            </Text>
          </Text>
        </View>

        {/* Estadísticas */}
        <View style={styles.stats}>
          <Text style={styles.statsText}>
            {getAcceptedCount()} de {Object.keys(consents).length} propósitos aceptados
          </Text>
        </View>
      </ScrollView>

      {/* Botones de acción */}
      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={handleRejectAll}
            disabled={loading}
          >
            <Text style={styles.rejectButtonText}>Rechazar Opcionales</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.acceptAllButton]}
            onPress={handleAcceptAll}
            disabled={loading}
          >
            <Text style={styles.acceptAllButtonText}>Aceptar Todo</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.confirmButton]}
          onPress={handleAcceptSelected}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirmar Selección</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  regulationInfo: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 8,
    fontWeight: '600',
  },
  consentsContainer: {
    padding: 16,
  },
  consentItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  consentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  consentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  requiredLabel: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 4,
    fontStyle: 'italic',
  },
  legalInfo: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  legalText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  link: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  stats: {
    padding: 16,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF5722',
  },
  rejectButtonText: {
    color: '#FF5722',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptAllButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#4CAF50',
  },
  acceptAllButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
