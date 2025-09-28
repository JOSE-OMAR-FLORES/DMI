// AuthStorage.js - Manejo seguro de tokens JWT (Expo compatible)
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_data';

class AuthStorage {
  // Guardar token usando AsyncStorage
  static async saveToken(token) {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      console.log('Token guardado correctamente');
      return true;
    } catch (error) {
      console.error('Error al guardar token:', error);
      return false;
    }
  }

  // Obtener token
  static async getToken() {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  }

  // Eliminar token
  static async removeToken() {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      console.log('Token eliminado correctamente');
      return true;
    } catch (error) {
      console.error('Error al eliminar token:', error);
      return false;
    }
  }

  // Guardar datos del usuario
  static async saveUser(userData) {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error al guardar datos del usuario:', error);
      return false;
    }
  }

  // Obtener datos del usuario
  static async getUser() {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
  }

  // Eliminar datos del usuario
  static async removeUser() {
    try {
      await AsyncStorage.removeItem(USER_KEY);
      return true;
    } catch (error) {
      console.error('Error al eliminar datos del usuario:', error);
      return false;
    }
  }

  // Limpiar toda la sesión
  static async clearSession() {
    try {
      await Promise.all([
        this.removeToken(),
        this.removeUser()
      ]);
      console.log('Sesión limpiada completamente');
      return true;
    } catch (error) {
      console.error('Error al limpiar sesión:', error);
      return false;
    }
  }
}

export default AuthStorage;