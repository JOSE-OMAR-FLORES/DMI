import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { CustomButton, CustomInput, LoadingSpinner } from '../components';
import { useToast } from '../context/ToastContext';
import { GLOBAL_STYLES } from '../constants/styles';
import { validateLoginForm } from '../utils/validation';
import { loginUser, clearError } from '../context/authSlice';
import mfaService from '../services/mfaService';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useDispatch();
  const { error, isAuthenticated } = useSelector((state) => state.auth);
  const { showSuccess, showError, showWarning } = useToast();

  // Navegación automática si ya está autenticado
  React.useEffect(() => {
    if (isAuthenticated) {
      navigation.navigate('Dashboard');
    }
  }, [isAuthenticated, navigation]);

  // Mostrar errores del Redux
  React.useEffect(() => {
    if (error) {
      showError(error);
      dispatch(clearError());
    }
  }, [error, showError, dispatch]);

  const handleLogin = async () => {
    // Validación del formulario
    const validation = validateLoginForm(email, password);
    
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      showError(firstError);
      return;
    }

    setIsLoading(true);

    try {
      // Intentar login con soporte MFA
      const result = await mfaService.login(email, password);
      
      if (result.success) {
        if (result.requiresMFA) {
          // Usuario tiene MFA habilitado, navegar a pantalla de verificación
          showSuccess('📧 Código de verificación enviado a tu email');
          navigation.navigate('MFAVerification', { 
            email,
            userId: result.userId 
          });
        } else {
          // Login exitoso sin MFA
          showSuccess('¡Bienvenido!');
          
          // Actualizar Redux state si es necesario
          dispatch(loginUser.fulfilled(result));
          
          // La navegación se hará automáticamente por el useEffect
        }
      } else {
        showError(result.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      showError('Error de conexión. Verifica tu internet.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    showWarning('Función próximamente disponible');
  };

  return (
    <KeyboardAvoidingView 
      style={GLOBAL_STYLES.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={GLOBAL_STYLES.centerContainer}>
        <View style={[GLOBAL_STYLES.card, { width: '90%', maxWidth: 400 }]}>
          <Text style={GLOBAL_STYLES.title}>Iniciar Sesión</Text>
          
          <CustomInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />
          
          <CustomInput
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
          
          <CustomButton
            title="Iniciar Sesión"
            onPress={handleLogin}
            style={{ marginTop: 20 }}
            disabled={isLoading}
          />
          
          <CustomButton
            title="¿Olvidaste tu contraseña?"
            onPress={handleForgotPassword}
            style={{ 
              marginTop: 10, 
              backgroundColor: 'transparent',
              elevation: 0,
              shadowOpacity: 0,
            }}
            textStyle={{ 
              color: '#666',
              fontSize: 14,
              fontWeight: 'normal',
            }}
            disabled={isLoading}
          />
          
          <CustomButton
            title="Crear Nueva Cuenta"
            onPress={() => navigation.navigate('Register')}
            style={{ 
              marginTop: 15, 
              backgroundColor: '#4CAF50',
            }}
            textStyle={{ 
              color: '#fff',
              fontSize: 16,
              fontWeight: 'bold',
            }}
            disabled={isLoading}
          />
        </View>
      </View>
      
      <LoadingSpinner 
        visible={isLoading} 
        message="Verificando credenciales..." 
      />
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;