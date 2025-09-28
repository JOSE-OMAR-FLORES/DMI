// authSlice.js - Redux slice para autenticación con almacenamiento seguro
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../utils/ApiService';
import AuthStorage from '../utils/AuthStorage';
import SecureAuthStorage from '../utils/SecureAuthStorage';

// Thunks asíncronos para las operaciones de autenticación
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const result = await ApiService.login(credentials);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result);
      }
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: 'Error de conexión',
        errors: {}
      });
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const result = await ApiService.register(userData);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result);
      }
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: 'Error de conexión',
        errors: {}
      });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await ApiService.logout();
      console.log('🔒 Logout con limpieza segura completado');
      return null;
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: 'Error al cerrar sesión',
        errors: {}
      });
    }
  }
);

// 🔒 Nuevo: Verificar autenticación con almacenamiento seguro
export const checkSecureAuthStatus = createAsyncThunk(
  'auth/checkSecureAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 Verificando estado de autenticación seguro...');
      
      // Verificar disponibilidad de almacenamiento seguro
      const isSecureAvailable = await SecureAuthStorage.isSecureStorageAvailable();
      console.log(`📱 Almacenamiento seguro disponible: ${isSecureAvailable}`);
      
      // Intentar migrar datos si existen en AsyncStorage
      await SecureAuthStorage.migrateFromAsyncStorage();
      
      // Obtener token de almacenamiento seguro primero
      let token = await SecureAuthStorage.getToken();
      let user = await SecureAuthStorage.getUser();
      
      // Fallback a almacenamiento básico si es necesario
      if (!token) {
        console.log('⚠️ Verificando almacenamiento básico como fallback...');
        token = await AuthStorage.getToken();
        user = await AuthStorage.getUser();
      }
      
      if (token && user) {
        console.log('✅ Usuario autenticado encontrado:', user.email);
        return { user, token };
      } else {
        console.log('❌ No se encontró sesión válida');
        return null;
      }
      
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      return rejectWithValue({
        success: false,
        message: 'Error verificando sesión',
        errors: {}
      });
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const isAuthenticated = await ApiService.isAuthenticated();
      if (isAuthenticated) {
        const user = await AuthStorage.getUser();
        return { user };
      } else {
        await AuthStorage.clearSession();
        return rejectWithValue({ 
          success: false, 
          message: 'No autenticado',
          errors: {} 
        });
      }
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: 'Error verificando autenticación',
        errors: {}
      });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.message = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    resetAuthState: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.message = 'Inicio de sesión exitoso';
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload?.message || 'Error en el inicio de sesión';
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.message = 'Registro exitoso';
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload?.message || 'Error en el registro';
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.message = 'Sesión cerrada correctamente';
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        // Aún así limpiar el estado
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload?.message || 'Error al cerrar sesión';
      })
      
      // Check Auth Status
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      
      // 🔒 Check Secure Auth Status
      .addCase(checkSecureAuthStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkSecureAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.message = 'Sesión segura restaurada';
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
        }
        state.error = null;
      })
      .addCase(checkSecureAuthStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload?.message || 'Error verificando sesión segura';
      });
  },
});

export const { clearError, clearMessage, resetAuthState } = authSlice.actions;
export default authSlice.reducer;