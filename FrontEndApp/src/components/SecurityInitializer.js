// SecurityInitializer.js - Componente para inicializar y verificar seguridad
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import SecureAuthStorage from '../utils/SecureAuthStorage';
import { checkSecureAuthStatus } from '../context/authSlice';

/**
 * Componente que inicializa y verifica la seguridad de la aplicación
 * - Verifica disponibilidad de almacenamiento seguro
 * - Migra datos existentes a almacenamiento cifrado
 * - Restaura sesión segura si existe
 */
const SecurityInitializer = ({ children }) => {
  const [securityStatus, setSecurityStatus] = useState({
    isInitializing: true,
    secureStorageAvailable: false,
    migrationCompleted: false,
    errorMessage: null
  });
  
  const dispatch = useDispatch();

  useEffect(() => {
    initializeSecurity();
  }, []);

  const initializeSecurity = async () => {
    try {
      console.log('🔒 Iniciando verificación de seguridad...');
      
      // 1. Verificar disponibilidad de almacenamiento seguro
      const isSecureAvailable = await SecureAuthStorage.isSecureStorageAvailable();
      
      setSecurityStatus(prev => ({
        ...prev,
        secureStorageAvailable: isSecureAvailable
      }));
      
      if (isSecureAvailable) {
        console.log('✅ Almacenamiento seguro disponible');
        
        // 2. Migrar datos existentes si es necesario
        const migrationSuccess = await SecureAuthStorage.migrateFromAsyncStorage();
        
        setSecurityStatus(prev => ({
          ...prev,
          migrationCompleted: migrationSuccess
        }));
        
        if (migrationSuccess) {
          console.log('✅ Migración de datos completada');
        }
        
        // 3. Verificar y restaurar sesión segura
        await dispatch(checkSecureAuthStatus());
        
      } else {
        console.warn('⚠️ Almacenamiento seguro no disponible, usando modo básico');
        Alert.alert(
          'Información de Seguridad',
          'El almacenamiento seguro no está disponible en este dispositivo. Se utilizará almacenamiento básico.',
          [{ text: 'Entendido' }]
        );
      }
      
      // 4. Completar inicialización
      setSecurityStatus(prev => ({
        ...prev,
        isInitializing: false
      }));
      
      console.log('✅ Inicialización de seguridad completada');
      
    } catch (error) {
      console.error('❌ Error en inicialización de seguridad:', error);
      
      setSecurityStatus({
        isInitializing: false,
        secureStorageAvailable: false,
        migrationCompleted: false,
        errorMessage: error.message
      });
      
      Alert.alert(
        'Error de Seguridad',
        'Ocurrió un error al inicializar la seguridad. La aplicación funcionará en modo básico.',
        [{ text: 'Continuar' }]
      );
    }
  };

  // Mostrar pantalla de carga durante inicialización
  if (securityStatus.isInitializing) {
    return (
      <View style={styles.initContainer}>
        <Text style={styles.initTitle}>🔒 Inicializando Seguridad</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            🔍 Verificando almacenamiento seguro...
          </Text>
          {securityStatus.secureStorageAvailable && (
            <Text style={styles.statusText}>
              ✅ Almacenamiento seguro detectado
            </Text>
          )}
          {securityStatus.migrationCompleted && (
            <Text style={styles.statusText}>
              🔄 Migración de datos completada
            </Text>
          )}
        </View>
        <Text style={styles.infoText}>
          Configurando cifrado AES-256 para proteger tus datos
        </Text>
      </View>
    );
  }

  // Mostrar error si la inicialización falló
  if (securityStatus.errorMessage) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>⚠️ Error de Seguridad</Text>
        <Text style={styles.errorMessage}>
          {securityStatus.errorMessage}
        </Text>
        <Text style={styles.errorInfo}>
          La aplicación continuará en modo básico
        </Text>
        {children}
      </View>
    );
  }

  // Renderizar la aplicación normal después de inicializar
  return (
    <View style={styles.container}>
      {/* Indicador de estado de seguridad */}
      <View style={styles.securityIndicator}>
        <Text style={styles.securityText}>
          {securityStatus.secureStorageAvailable ? '🔒 Seguro' : '⚠️ Básico'}
        </Text>
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  initContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  initTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    minWidth: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 16,
    color: '#555',
    marginVertical: 5,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff5f5',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorInfo: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  securityIndicator: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    zIndex: 1000,
  },
  securityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default SecurityInitializer;