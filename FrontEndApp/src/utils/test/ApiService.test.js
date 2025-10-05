// ApiService.test.js

// --- Mocks de módulos nativos (deben ir ANTES de cualquier import) ---
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  }
}));

jest.mock('expo-secure-store', () => ({
  __esModule: true,
  default: {
    getItemAsync: jest.fn(() => Promise.resolve(null)),
    setItemAsync: jest.fn(() => Promise.resolve()),
    deleteItemAsync: jest.fn(() => Promise.resolve()),
  }
}));

import apiService from '../ApiService'; // Importamos la instancia singleton
import AuthStorage from '../AuthStorage';
import SecureAuthStorage from '../SecureAuthStorage';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// --- Mocks Iniciales (NO BORRAR) ---
jest.mock('../AuthStorage');
jest.mock('../SecureAuthStorage');
jest.mock('@env', () => ({
  API_BASE_URL: 'http://test-api.com/api/v1',
  API_TIMEOUT: 15000,
}), { virtual: true });
// --- Fin de Mocks ---

describe('ApiService', () => {
  let mock;
  const BASE_URL = 'http://test-api.com/api/v1';

  beforeEach(() => {
    // Se crea una instancia del mock de axios ANTES de cada prueba
    // Se adjunta a la instancia de axios que usa apiService
    mock = new MockAdapter(apiService.api);

    // Limpiamos todos los mocks para asegurar que las pruebas estén aisladas
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restauramos el comportamiento original de axios después de cada prueba
    mock.restore();
  });

  // ===============================================
  // == PRUEBAS PARA LOS INTERCEPTORES DE PETICIÓN ==
  // ===============================================
  describe('Request Interceptor', () => {
    it('debe agregar el header "Authorization" si se encuentra un token', async () => {
      const token = 'mi-token-secreto-123';
      // Simula que SecureAuthStorage devuelve un token
      SecureAuthStorage.getToken.mockResolvedValue(token);

      // Simula una respuesta exitosa para cualquier llamada GET
      mock.onGet('/jwt/profile').reply(200, { user: { name: 'Test' } });

      await apiService.getProfile();

      // Verificamos que el header se haya añadido correctamente a la petición
      expect(mock.history.get[0].headers.Authorization).toBe(`Bearer ${token}`);
    });

    it('NO debe agregar el header "Authorization" si no hay token', async () => {
      // Simulamos que ambos almacenamientos devuelven null
      SecureAuthStorage.getToken.mockResolvedValue(null);
      AuthStorage.getToken.mockResolvedValue(null);

      mock.onGet('/jwt/profile').reply(200, { user: { name: 'Test' } });

      await apiService.getProfile();

      // Verificamos que el header NO esté definido
      expect(mock.history.get[0].headers.Authorization).toBeUndefined();
    });
  });

  // =================================================
  // == PRUEBAS PARA LOS INTERCEPTORES DE RESPUESTA ==
  // =================================================
  describe('Response Interceptor (Error Handling)', () => {
    it('debe limpiar la sesión y los datos seguros al recibir un error 401', async () => {
      // Simulamos que la API devuelve un error 401 Unauthorized
      mock.onGet('/jwt/profile').reply(401, { message: 'Token expired' });

      // La llamada a la API fallará, por eso usamos try/catch
      try {
        await apiService.getProfile();
      } catch (error) {
        // No hacemos nada en el catch, solo nos aseguramos de que no detenga la prueba
      }

      // Verificamos que se hayan llamado las funciones para limpiar la sesión
      expect(SecureAuthStorage.removeAllSecureData).toHaveBeenCalledTimes(1);
      expect(AuthStorage.clearSession).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================
  // == PRUEBAS PARA EL MÉTODO DE login() ==
  // ==========================================
  describe('login()', () => {
    it('debe iniciar sesión y guardar el token y usuario de forma segura', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const responseData = {
        access_token: 'nuevo-token-de-login',
        user: { id: 1, name: 'Usuario de Prueba' },
      };

  // Simulamos la respuesta exitosa del endpoint de login (ruta relativa a la instancia)
  mock.onPost('/jwt/login').reply(200, responseData);
      
      // Simulamos que el almacenamiento seguro funciona
      SecureAuthStorage.saveToken.mockResolvedValue(true);
      SecureAuthStorage.saveUser.mockResolvedValue(true);

      const result = await apiService.login(credentials);

      // Verificamos que el resultado sea el esperado
      expect(result.success).toBe(true);
      expect(result.data).toEqual(responseData);

      // Verificamos que se intentó guardar el token y el usuario
      expect(SecureAuthStorage.saveToken).toHaveBeenCalledWith(responseData.access_token);
      expect(SecureAuthStorage.saveUser).toHaveBeenCalledWith(responseData.user);
    });

    it('debe manejar un fallo en el inicio de sesión', async () => {
      const credentials = { email: 'test@example.com', password: 'wrongpassword' };
      const errorResponse = { message: 'Credenciales inválidas' };

  // Simulamos una respuesta de error 401
  mock.onPost('/jwt/login').reply(401, errorResponse);

      const result = await apiService.login(credentials);

      // Verificamos que el resultado indique el fallo
      expect(result.success).toBe(false);
      expect(result.message).toBe('Credenciales inválidas');
      
      // Verificamos que NO se intentó guardar ningún token
      expect(SecureAuthStorage.saveToken).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // == PRUEBAS PARA EL MÉTODO DE logout() ==
  // ==========================================
  describe('logout()', () => {
    it('debe limpiar todos los almacenamientos incluso si la llamada a la API falla', async () => {
  // Simulamos un error de red en el endpoint de logout (ruta relativa)
  mock.onPost('/jwt/logout').networkError();

      const result = await apiService.logout();

      // Verificamos que el resultado sea exitoso a nivel local
      expect(result.success).toBe(true);
      expect(result.message).toBe('Sesión cerrada localmente');

      // ¡Lo más importante! Verificamos que la limpieza se realizó de todas formas
      expect(SecureAuthStorage.removeAllSecureData).toHaveBeenCalledTimes(1);
      expect(AuthStorage.clearSession).toHaveBeenCalledTimes(1);
    });
  });
});