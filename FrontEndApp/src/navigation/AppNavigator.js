import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { LoginScreen, DashboardScreen, RegisterScreen } from '../screens';
import { ToastProvider } from '../context/ToastContext';
import store from '../context/store';
import { COLORS } from '../constants/colors';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Provider store={store}>
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
              title: 'Panel Principal',
              headerLeft: null, // Evitamos que se pueda regresar al login
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      </ToastProvider>
    </Provider>
  );
};

export default AppNavigator;