import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { 
  LoginScreen, 
  DashboardScreen, 
  RegisterScreen,
  TodoListScreen,
  MFAVerificationScreen,
  MfaSettingsScreen
} from '../screens';
import GDPRSettingsScreen from '../screens/GDPRSettingsScreen';
import { ToastProvider } from '../context/ToastContext';
import SecurityInitializer from '../components/SecurityInitializer';
import store from '../context/store';
import { COLORS } from '../constants/colors';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <SecurityInitializer>
          <ToastProvider>
            <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.white,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{
              title: 'Iniciar Sesión',
              headerShown: false, // Ocultamos el header en login para un look más limpio
            }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{
              title: 'Crear Cuenta',
              headerShown: false, // Ocultamos el header en registro para un look más limpio
            }}
          />
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{
              headerShown: false, // Ocultamos el header para un look más limpio y moderno
            }}
          />
          <Stack.Screen 
            name="MFAVerification" 
            component={MFAVerificationScreen}
            options={{
              title: 'Verificación MFA',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="MfaSettings" 
            component={MfaSettingsScreen}
            options={{
              title: 'Configuración MFA',
              headerStyle: {
                backgroundColor: '#6366f1',
              },
              headerTintColor: COLORS.white,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen 
            name="TodoList" 
            component={TodoListScreen}
            options={{
              title: 'TODO List',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="GDPRSettings" 
            component={GDPRSettingsScreen}
            options={{
              title: 'Protección de Datos',
              headerStyle: {
                backgroundColor: '#6366f1',
              },
              headerTintColor: COLORS.white,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
        </Stack.Navigator>
        </NavigationContainer>
        </ToastProvider>
      </SecurityInitializer>
    </Provider>
    </SafeAreaProvider>
  );
};

export default AppNavigator;