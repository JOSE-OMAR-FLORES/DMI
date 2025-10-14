// ApiService.js - Servicio para comunicación con el backend JWT
import axios from 'axios';
import AuthStorage from './AuthStorage';
import SecureAuthStorage from './SecureAuthStorage';
import { API_CONFIGS } from './config';

// Configuración base de la API
// Usar tu IP real para que el móvil pueda conectarse
const API_BASE_URL = API_CONFIGS.BACKEND.BASE_URL;

class ApiService {
  constructor() {
    console.log('🔧 ApiService Constructor:');
    console.log('  - API_BASE_URL:', API_BASE_URL);
    
    // Crear instancia de axios
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 15000, // Número fijo para evitar problemas de tipo
    });

    // Interceptor para agregar token automáticamente
    this.api.interceptors.request.use(
      async (config) => {
        // 🔒 Buscar token en almacenamiento seguro primero, luego básico
        let token = await SecureAuthStorage.getToken();
        if (!token) {
          token = await AuthStorage.getToken();
        }
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 Token agregado al header Authorization');
        } else {
          console.log('⚠️ No se encontró token para la petición');
        }
        
        console.log('Request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar respuestas y errores
    this.api.interceptors.response.use(
      (response) => {
        console.log('✅ Response SUCCESS:', response.status, response.config.url);
        return response;
      },
      async (error) => {
        console.error('❌ Response ERROR Details:');
        console.error('  - Message:', error.message);
        console.error('  - Code:', error.code);
        console.error('  - URL:', error.config?.url);
        console.error('  - Status:', error.response?.status);
        console.error('  - Data:', error.response?.data);
        console.error('  - Network Error:', !error.response);
        
        // Si el token es inválido (401), cerrar sesión automáticamente
        if (error.response?.status === 401) {
          console.log('Token inválido, cerrando sesión...');
          // 🔒 Limpiar AMBOS almacenamientos
          await SecureAuthStorage.removeAllSecureData();
          await AuthStorage.clearSession();
          console.log('Token eliminado correctamente');
          console.log('Sesión limpiada completamente');
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Registro de usuario con almacenamiento seguro
  async register(userData) {
    try {
      console.log('🚀 Iniciando registro...');
      console.log('📍 Base URL:', this.api.defaults.baseURL);
      console.log('📤 Datos a enviar:', userData);
      
      const response = await this.api.post('/jwt/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password_confirmation,
      });
      
      if (response.data.access_token) {
        // 🔒 Usar almacenamiento básico por ahora (más estable en desarrollo)
        await AuthStorage.saveToken(response.data.access_token);
        
        if (response.data.user) {
          await AuthStorage.saveUser(response.data.user);
        }
        
        console.log('✅ Registro exitoso - Token y usuario guardados');
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Usuario registrado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error en el registro',
        errors: error.response?.data || {}
      };
    }
  }

  // Inicio de sesión con almacenamiento seguro
  async login(credentials) {
    try {
      const response = await this.api.post('/jwt/login', {
        email: credentials.email,
        password: credentials.password,
      });
      
      if (response.data.access_token) {
        // 🔒 Usar almacenamiento básico por ahora (más estable en desarrollo)
        await AuthStorage.saveToken(response.data.access_token);
        
        if (response.data.user) {
          await AuthStorage.saveUser(response.data.user);
        }
        
        console.log('✅ Login exitoso - Token y usuario guardados');
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Inicio de sesión exitoso'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Credenciales inválidas',
        errors: error.response?.data || {}
      };
    }
  }

  // Obtener perfil del usuario
  async getProfile() {
    try {
      const response = await this.api.get('/jwt/profile');
      
      // Actualizar datos del usuario en storage
      if (response.data.user) {
        await AuthStorage.saveUser(response.data.user);
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Perfil obtenido correctamente'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener perfil',
        errors: error.response?.data || {}
      };
    }
  }

  // Cerrar sesión con limpieza segura completa
  async logout() {
    try {
      await this.api.post('/jwt/logout');
      
      // 🔒 Limpiar TODOS los almacenamientos (seguro y básico)
      await SecureAuthStorage.removeAllSecureData();
      await AuthStorage.clearSession();
      
      console.log('🧹 Limpieza completa de datos seguros realizada');
      
      return {
        success: true,
        message: 'Sesión cerrada correctamente'
      };
    } catch (error) {
      // 🔒 Aún así limpiar TODOS los almacenamientos
      await SecureAuthStorage.removeAllSecureData();
      await AuthStorage.clearSession();
      
      return {
        success: true, // Consideramos exitoso aunque falle en el servidor
        message: 'Sesión cerrada localmente'
      };
    }
  }

  // Verificar si el usuario está autenticado
  async isAuthenticated() {
    try {
      const token = await AuthStorage.getToken();
      if (!token) {
        return false;
      }
      
      // Verificar token con el servidor
      const profileResult = await this.getProfile();
      return profileResult.success;
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      return false;
    }
  }

  // Obtener datos del usuario desde storage
  async getCurrentUser() {
    return await AuthStorage.getUser();
  }
}

// Exportar instancia única (singleton)
const apiService = new ApiService();
export default apiService;