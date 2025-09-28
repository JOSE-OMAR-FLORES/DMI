import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { CustomButton, CustomInput, LoadingSpinner } from '../components';
import { useToast } from '../context/ToastContext';
import { GLOBAL_STYLES } from '../constants/styles';
import { validateLoginForm } from '../utils/validation';
import { loginUser, clearError } from '../context/authSlice';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState(''); // Cambiamos username por email
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);
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
    // Validación del formulario (adaptamos para usar email)
    const validation = validateLoginForm(email, password);
    
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      showError(firstError);
      return;
    }

    try {
      // Usar Redux thunk para login con JWT
      const resultAction = await dispatch(loginUser({ email, password }));
      
      if (loginUser.fulfilled.match(resultAction)) {
        // Éxito - el useEffect se encargará de la navegación
        showSuccess('¡Bienvenido! Iniciando sesión...', 2000);
      }
      // Los errores se manejan en el useEffect de arriba
      
    } catch (error) {
      showError('Error de conexión. Verifica tu internet.');
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