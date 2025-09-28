// authSlice.js - Redux slice para autenticación
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../utils/ApiService';
import AuthStorage from '../utils/AuthStorage';

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
      });
  },
});

export const { clearError, clearMessage, resetAuthState } = authSlice.actions;
export default authSlice.reducer;