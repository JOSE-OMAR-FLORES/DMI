import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { CustomButton, CustomInput, LoadingSpinner } from '../components';
import { useToast } from '../context/ToastContext';
import { GLOBAL_STYLES } from '../constants/styles';
import { validateLoginForm } from '../utils/validation';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { showSuccess, showError, showWarning } = useToast();

  const handleLogin = async () => {
    // Validación del formulario
    const validation = validateLoginForm(username, password);
    
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      showError(firstError);
      return;
    }

    setIsLoading(true);

    try {
      // Simulamos una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mostramos notificación de éxito
      showSuccess('¡Bienvenido! Iniciando sesión...', 2000);
      
      // Navegamos al Dashboard después de un pequeño delay
      setTimeout(() => {
        setIsLoading(false);
        navigation.navigate('Dashboard');
      }, 1500);
      
    } catch (error) {
      setIsLoading(false);
      showError('Error al iniciar sesión. Inténtalo de nuevo.');
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
            placeholder="Usuario"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
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