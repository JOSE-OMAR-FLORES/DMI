import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { 
  LoginScreen, 
  DashboardScreen, 
  RegisterScreen,
  FavoritesScreen,
  AddFavoriteScreen,
  FavoriteDetailScreen,
  EditFavoriteScreen
} from '../screens';
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
            name="Favorites" 
            component={FavoritesScreen}
            options={{
              title: 'Mis Favoritos',
              headerStyle: {
                backgroundColor: COLORS.primary,
              },
              headerTintColor: COLORS.white,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen 
            name="AddFavorite" 
            component={AddFavoriteScreen}
            options={{
              title: 'Agregar Ciudad',
              headerStyle: {
                backgroundColor: COLORS.primary,
              },
              headerTintColor: COLORS.white,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen 
            name="FavoriteDetail" 
            component={FavoriteDetailScreen}
            options={{
              title: 'Detalle',
              headerStyle: {
                backgroundColor: COLORS.primary,
              },
              headerTintColor: COLORS.white,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen 
            name="EditFavorite" 
            component={EditFavoriteScreen}
            options={{
              title: 'Editar Favorito',
              headerStyle: {
                backgroundColor: COLORS.primary,
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