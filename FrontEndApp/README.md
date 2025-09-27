# Frontend App - React Native

Este es el proyecto base para la aplicación React Native con una estructura organizada, escalable y con sistema avanzado de notificaciones y animaciones.

## � Quick Start Guide

### **Prerequisites**
- Node.js >= 16.x
- npm o yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (para Android) o Xcode (para iOS)

### **Instalación y Ejecución**
```bash
# 1. Clonar el repositorio
git clone [tu-repo-url]
cd FrontEndApp

# 2. Instalar dependencias
npm install

# 3. Iniciar el proyecto
npm start
# O si el puerto 8081 está ocupado:
npx expo start --port 8082

# 4. Ejecutar en dispositivo específico
npm run android    # Android
npm run ios        # iOS  
npm run web        # Web browser
```

### **Testing Rápido**
```
Usuario: cualquier texto (ej: "admin", "test", "usuario123")
Contraseña: mínimo 6 caracteres (ej: "123456", "password")
```

## 🔄 Flujo Visual de la Aplicación

```
[Inicio] 
    ↓
┌─────────────┐    Validación    ┌─────────────┐
│ LoginScreen │ ────────────────→ │   Error     │
│   - Usuario │                  │  (Toast)    │
│   - Password│                  └─────────────┘
│   - Botón   │                         ↓
└─────────────┘                    Retry Login
    ↓ (Válido)
┌─────────────┐    2s Loading    ┌─────────────┐
│ LoadingSpinner│ ───────────────→│ Success     │
│"Verificando..."│                │  (Toast)    │
└─────────────┘                  └─────────────┘
    ↓                                   ↓
┌─────────────┐    Animación     ┌─────────────┐
│ Dashboard   │←─────────────────│ Navigation  │
│  - Cards    │                  │   Smooth    │
│  - Logout   │                  └─────────────┘
└─────────────┘
    ↓ (Logout)
┌─────────────┐
│  Confirm    │────────────────→ Volver a Login
│  (Toast)    │
└─────────────┘
```

## 🎯 Estados de la Aplicación

### **Estado Global (ToastContext)**
```javascript
{
  visible: boolean,    // Si hay toast visible
  message: string,     // Texto del toast
  type: 'success'|'error'|'warning'|'info',
  duration: number     // Duración en ms
}
```

### **Estado de Login**
```javascript
{
  username: string,    // Campo usuario
  password: string,    // Campo contraseña
  isLoading: boolean   // Estado de carga
}
```

### **Estado de Dashboard**
```javascript
{
  fadeAnim: Animated.Value,   // Animación de entrada
  slideAnim: Animated.Value,  // Deslizamiento
  // Cards renderizadas dinámicamente
}
```

## 📱 Pantallas y Componentes

### **Jerarquía de Componentes**
```
App.js
├── AppNavigator (ToastProvider wrapper)
    ├── LoginScreen
    │   ├── CustomInput (Usuario)
    │   ├── CustomInput (Contraseña) 
    │   ├── CustomButton (Login)
    │   ├── CustomButton (Olvidaste contraseña)
    │   └── LoadingSpinner (condicional)
    └── DashboardScreen
        ├── DashboardCard (4x cards)
        ├── CustomButton (Logout)
        └── ScrollView wrapper
```

## �📁 Estructura del Proyecto

```
FrontEndApp/
├── assets/                 # Recursos estáticos
│   ├── images/
│   ├── icons/
│   └── fonts/
├── src/                    # Código fuente principal
│   ├── components/         # Componentes reutilizables
│   │   ├── CustomButton.js     # Botón con animaciones
│   │   ├── CustomInput.js      # Input con efectos de focus
│   │   ├── CustomToast.js      # Sistema de notificaciones
│   │   ├── LoadingSpinner.js   # Spinner animado
│   │   └── index.js
│   ├── screens/           # Pantallas de la aplicación
│   │   ├── LoginScreen.js      # Login con validaciones y loading
│   │   ├── DashboardScreen.js  # Dashboard con animaciones
│   │   └── index.js
│   ├── navigation/        # Configuración de navegación
│   │   └── AppNavigator.js     # Navegador con ToastProvider
│   ├── context/          # Contextos de React
│   │   └── ToastContext.js     # Contexto para notificaciones
│   ├── constants/         # Constantes globales
│   │   ├── colors.js          # Paleta de colores mejorada
│   │   └── styles.js          # Estilos con sombras y efectos
│   └── utils/            # Funciones utilitarias
│       ├── validation.js      # Validaciones mejoradas
│       └── helpers.js         # Funciones auxiliares
├── App.js                # Punto de entrada principal
├── index.js              # Registro de la aplicación
└── package.json          # Dependencias y scripts
```

## 🚀 Nuevas Funcionalidades Implementadas

### ✨ **Sistema de Notificaciones Avanzado**
- **Notificaciones personalizadas** con diferentes tipos (success, error, warning, info)
- **Animaciones suaves** de entrada y salida
- **Diseño atractivo** con iconos y colores dinámicos
- **Auto-hide** configurable
- **Context API** para uso global

### 🎨 **Animaciones y Efectos**
- **Botones interactivos** con animación de escala al presionar
- **Inputs animados** con efectos de focus y cambio de color
- **Loading spinner** con rotación suave y backdrop
- **Transiciones de pantalla** con fade y slide
- **Cards animadas** con delays escalonados

### 🔧 **Mejoras de UX/UI**
- **Validaciones en tiempo real** con mensajes descriptivos
- **Estados de carga** visuales durante procesos
- **Feedback táctil** en todos los elementos interactivos
- **Diseño más pulido** con sombras y bordes redondeados
- **Tipografía mejorada** con letter-spacing y pesos optimizados

## 🎯 **Funcionalidades por Pantalla**

### � **Login Screen**
- ✅ Validación de email con regex
- ✅ Validación de contraseña (mínimo 6 caracteres)
- ✅ Animaciones en inputs al hacer focus
- ✅ Loading spinner durante autenticación
- ✅ Notificaciones de error específicas
- ✅ Notificación de éxito al completar
- ✅ Botón "¿Olvidaste tu contraseña?" funcional

### 📊 **Dashboard Screen**
- ✅ Animación de entrada de toda la pantalla
- ✅ Cards con animaciones escalonadas
- ✅ Notificación de bienvenida automática
- ✅ Logout con notificación de confirmación
- ✅ Botones informativos para secciones futuras
- ✅ Scroll suave con indicadores ocultos

## 🎨 **Sistema de Notificaciones**

### Tipos de Notificación:
```javascript
// Éxito (verde)
showSuccess('¡Operación completada!');

// Error (rojo)
showError('Algo salió mal');

// Advertencia (amarillo)
showWarning('Ten cuidado con esto');

// Información (azul)
showInfo('Dato importante');
```

### Características:
- **Posicionamiento fijo** en la parte superior
- **Animaciones fluidas** con spring y timing
- **Auto-cierre** configurable (3 segundos por defecto)
- **Iconos dinámicos** según el tipo
- **Sombras y elevación** para mejor visibilidad
- **Responsive** se adapta al ancho de pantalla

## 🎬 **Animaciones Implementadas**

### **Botones**
- Scale down al presionar (0.95x)
- Spring back al soltar
- Timing optimizado para feedback táctil

### **Inputs**
- Cambio de color de borde al hacer focus
- Escala sutil (1.02x) durante focus
- Transición suave de colores

### **Pantallas**
- Fade in desde opacity 0 a 1
- Slide up desde translateY 50 a 0
- Duración: 800ms con easing suave

### **Cards del Dashboard**
- Aparición escalonada con delays
- Fade + slide combinados
- Timing: 600ms por card

### **Loading Spinner**
- Rotación continua 360°
- Scale in/out al aparecer/desaparecer
- Backdrop con fade

## 🛠 **Tecnologías y Librerías**

- **React Native**: Framework principal
- **Expo**: Plataforma de desarrollo
- **React Navigation**: Navegación entre pantallas
- **React Native Reanimated**: Animaciones de alto rendimiento
- **Context API**: Manejo de estado global para notificaciones
- **Animated API**: Animaciones nativas

## 🔧 Environment Variables

### **Configuración por Entorno**
```javascript
// config/environments.js (crear si necesario)
const environments = {
  development: {
    API_BASE_URL: 'http://localhost:3000/api',
    DEBUG_MODE: true,
    TOAST_DURATION: 3000
  },
  staging: {
    API_BASE_URL: 'https://staging-api.tuapp.com/api',
    DEBUG_MODE: true,
    TOAST_DURATION: 2000
  },
  production: {
    API_BASE_URL: 'https://api.tuapp.com/api',
    DEBUG_MODE: false,
    TOAST_DURATION: 2000
  }
};

export default environments[process.env.NODE_ENV || 'development'];
```

## 🐛 Troubleshooting Common Issues

### **Puerto en Uso**
```bash
# Error: Port 8081 is being used by another process
# Solución:
npx expo start --port 8082
# o
npx expo start --port 9000
```

### **Metro Bundle Error**
```bash
# Limpiar cache de Metro
npx expo start --clear

# O manualmente:
npx expo r -c
```

### **Android Build Issues**
```bash
# Verificar Android SDK
npx expo doctor

# Limpiar proyecto Android
cd android && ./gradlew clean && cd ..

# Reinstalar dependencias
rm -rf node_modules
npm install
```

### **iOS Build Issues**
```bash
# Limpiar derivedData (macOS)
rm -rf ~/Library/Developer/Xcode/DerivedData

# Pod install (si usas pods)
cd ios && pod install && cd ..
```

### **Errores Comunes de Desarrollo**

#### **Error: "email is not defined"**
```javascript
// Problema: Variable no actualizada
// Verificar que todas las referencias usen 'username' no 'email'
value={username}  // ✅ Correcto
onChangeText={setUsername}  // ✅ Correcto
```

#### **Toast no aparece**
```javascript
// Verificar que el componente esté dentro de ToastProvider
<ToastProvider>
  <YourComponent /> // ✅ Puede usar useToast()
</ToastProvider>
```

#### **Animaciones no funcionan**
```javascript
// Verificar que useNativeDriver esté configurado correctamente
Animated.timing(value, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true,  // ✅ Importante para performance
}).start();
```

## 💡 Ejemplos de Uso Específicos

### **Agregar Nueva Notificación**
```javascript
// En cualquier componente:
import { useToast } from '../context/ToastContext';

const MyComponent = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  
  const handleAction = async () => {
    try {
      showInfo('Procesando...', 1000);
      await someAsyncOperation();
      showSuccess('¡Operación completada!', 3000);
    } catch (error) {
      showError('Error: ' + error.message, 4000);
    }
  };
};
```

### **Agregar Nueva Validación**
```javascript
// En src/utils/validation.js
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

export const validateRegistrationForm = (data) => {
  const errors = {};
  
  if (!data.username?.trim()) {
    errors.username = 'Usuario requerido';
  }
  
  if (!validatePhoneNumber(data.phone)) {
    errors.phone = 'Teléfono debe tener 10 dígitos';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

### **Crear Nuevo Componente Animado**
```javascript
// src/components/FadeInView.js
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

const FadeInView = ({ children, duration = 500, delay = 0 }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }, delay);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Animated.View style={{ opacity }}>
      {children}
    </Animated.View>
  );
};

export default FadeInView;

// Uso:
<FadeInView duration={600} delay={200}>
  <Text>Este texto aparecerá gradualmente</Text>
</FadeInView>
```

### **Integrar API Real**
```javascript
// src/services/apiClient.js
const API_BASE_URL = 'https://tu-api.com/api';

export const apiClient = {
  request: async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  },
  
  login: (credentials) => apiClient.request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  getDashboard: (token) => apiClient.request('/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  }),
};

// Uso en LoginScreen:
const handleLogin = async () => {
  try {
    setIsLoading(true);
    const result = await apiClient.login({ username, password });
    
    // Guardar token
    await AsyncStorage.setItem('token', result.token);
    
    showSuccess('¡Login exitoso!');
    navigation.navigate('Dashboard');
  } catch (error) {
    showError('Error de autenticación');
  } finally {
    setIsLoading(false);
  }
};
```

## 🧪 Testing Examples

### **Test de Validación**
```javascript
// __tests__/validation.test.js
import { validateLoginForm } from '../src/utils/validation';

describe('validateLoginForm', () => {
  test('should return valid for correct input', () => {
    const result = validateLoginForm('user123', 'password123');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });
  
  test('should return error for empty username', () => {
    const result = validateLoginForm('', 'password123');
    expect(result.isValid).toBe(false);
    expect(result.errors.username).toBe('El nombre de usuario es requerido');
  });
});
```

### **Test de Componente**
```javascript
// __tests__/CustomButton.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomButton from '../src/components/CustomButton';

describe('CustomButton', () => {
  test('should call onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <CustomButton title="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
```

## � **Comandos Útiles**

```bash
# Iniciar el proyecto
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios

# Ejecutar en Web
npm run web

# Iniciar en puerto específico (si hay conflictos)
npx expo start --port 8082
```

## � **Cómo Usar las Nuevas Funcionalidades**

### **Sistema de Notificaciones**
```javascript
import { useToast } from '../context/ToastContext';

const MyComponent = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  
  const handleAction = () => {
    showSuccess('¡Acción completada!', 2000); // Duración personalizada
  };
};
```

### **Loading Spinner**
```javascript
import { LoadingSpinner } from '../components';

const [loading, setLoading] = useState(false);

return (
  <>
    {/* Tu contenido */}
    <LoadingSpinner 
      visible={loading} 
      message="Procesando..." 
    />
  </>
);
```

## 🔄 **Flujo de Usuario Mejorado**

1. **Inicio** → Login con animaciones
2. **Validación** → Mensajes de error específicos
3. **Loading** → Spinner con mensaje descriptivo
4. **Éxito** → Notificación verde + navegación
5. **Dashboard** → Animación de entrada + bienvenida
6. **Interacciones** → Feedback visual en cada acción
7. **Logout** → Notificación de confirmación

## � **Próximos Pasos Sugeridos**

1. **Haptic Feedback**: Agregar vibración en interacciones
2. **Gesture Handlers**: Swipe para cerrar notificaciones
3. **Dark Mode**: Tema oscuro con animaciones
4. **Micro-interactions**: Más animaciones sutiles
5. **Sound Effects**: Sonidos para notificaciones
6. **Custom Fonts**: Tipografías personalizadas

---

**✨ Mejoras Implementadas**: Sistema de notificaciones profesional, animaciones fluidas, mejor UX/UI, validaciones robustas y feedback visual completo.

**🎯 Resultado**: Una aplicación base sólida, atractiva y lista para escalar con patrones profesionales de desarrollo.

---

# 📖 Documentación Técnica Completa

## 🏗️ **Arquitectura del Proyecto**

### **Patrón de Diseño Utilizado**
El proyecto sigue el patrón **Component-Based Architecture** con separación clara de responsabilidades:

- **Presentational Components**: UI pura sin lógica de negocio
- **Container Components**: Manejo de estado y lógica de negocio  
- **Context Providers**: Estado global compartido
- **Utility Functions**: Lógica reutilizable y helpers
- **Constants**: Configuración centralizada

### **Flujo de Datos**
```
User Input → Validation → State Update → API Call → UI Update → Navigation
```

## 📂 **Análisis Detallado por Carpeta**

### **📁 `/src/components/`** - Componentes Reutilizables

#### **`CustomButton.js`**
```javascript
// Botón con animaciones y estados
Props: {
  title: string,           // Texto del botón
  onPress: function,       // Callback al presionar
  style: object,          // Estilos personalizados
  textStyle: object,      // Estilos del texto
  disabled: boolean       // Estado deshabilitado
}

Animaciones:
- Scale down (0.95) al presionar
- Spring back al soltar
- Opacity 0.6 cuando disabled
```

#### **`CustomInput.js`**
```javascript
// Input con efectos de focus animados
Props: {
  placeholder: string,     // Texto placeholder
  value: string,          // Valor controlado
  onChangeText: function, // Callback de cambio
  secureTextEntry: boolean, // Para passwords
  style: object,          // Estilos personalizados
  ...props               // Props nativas de TextInput
}

Animaciones:
- Border color: gray → primary al focus
- Scale: 1.0 → 1.02 durante focus
- Border width: 1 → 2 al focus
```

#### **`CustomToast.js`**
```javascript
// Sistema de notificaciones animadas
Props: {
  visible: boolean,        // Controla visibilidad
  message: string,        // Texto del mensaje
  type: 'success'|'error'|'warning'|'info', // Tipo de notificación
  duration: number,       // Duración en ms (default: 3000)
  onHide: function       // Callback al ocultar
}

Estados:
- translateY: -100 → 0 (slide down)
- opacity: 0 → 1 (fade in)
- scale: 0.8 → 1.0 (scale up)
```

#### **`LoadingSpinner.js`**
```javascript
// Spinner de carga con backdrop
Props: {
  visible: boolean,        // Controla visibilidad
  message: string         // Mensaje de carga
}

Animaciones:
- Rotación continua 360°
- Modal scale: 0 → 1 entrada
- Backdrop fade: 0 → 1
```

### **📁 `/src/screens/`** - Pantallas Principales

#### **`LoginScreen.js`**
```javascript
// Pantalla de autenticación
Estado:
- username: string       // Campo de usuario
- password: string       // Campo de contraseña  
- isLoading: boolean     // Estado de carga

Flujo:
1. handleLogin() → validateLoginForm()
2. Si válido → setIsLoading(true) 
3. Simular API call (2s)
4. showSuccess() → navigate('Dashboard')
5. Si error → showError()

Validaciones:
- Username: no vacío, no solo espacios
- Password: mínimo 6 caracteres
```

#### **`DashboardScreen.js`**
```javascript
// Panel principal con animaciones
Animaciones de entrada:
- fadeAnim: 0 → 1 (800ms)
- slideAnim: 50 → 0 (spring)
- Cards escalonadas: delays 100-400ms

Componentes:
- DashboardCard: tarjetas informativas
- ScrollView: contenido desplazable
- Logout button: con confirmación
```

### **📁 `/src/context/`** - Estado Global

#### **`ToastContext.js`**
```javascript
// Proveedor global de notificaciones
Estado:
{
  visible: boolean,
  message: string,
  type: 'success'|'error'|'warning'|'info',
  duration: number
}

Métodos exportados:
- showToast(message, type, duration)
- showSuccess(message, duration)
- showError(message, duration) 
- showWarning(message, duration)
- showInfo(message, duration)
- hideToast()

Uso en componentes:
const { showSuccess, showError } = useToast();
```

### **📁 `/src/constants/`** - Configuración

#### **`colors.js`**
```javascript
// Paleta de colores del sistema
export const COLORS = {
  // Colores principales
  primary: '#2E86AB',      // Azul principal
  secondary: '#A23B72',    // Rosa secundario
  accent: '#F18F01',       // Naranja acento
  
  // Colores base
  background: '#F5F5F5',   // Fondo general
  white: '#FFFFFF',        // Blanco
  black: '#000000',        // Negro
  
  // Grises
  gray: '#808080',         // Gris medio
  lightGray: '#E0E0E0',    // Gris claro
  darkGray: '#404040',     // Gris oscuro
  
  // Estados
  success: '#28A745',      // Verde éxito
  error: '#DC3545',        // Rojo error
  warning: '#FFC107',      // Amarillo advertencia
  info: '#17A2B8'         // Azul información
};
```

#### **`styles.js`**
```javascript
// Estilos globales reutilizables
Componentes base:
- container: flex: 1, background
- centerContainer: centrado vertical/horizontal
- card: tarjeta con sombras y bordes
- button: botón base con elevación
- input: input base con bordes
- title/subtitle/text: tipografía consistente

Características:
- Border radius: 12-16px
- Shadows: elevation + iOS shadows
- Padding: 16-20px consistente
- Typography: weights y spacing optimizados
```

### **📁 `/src/utils/`** - Utilidades

#### **`validation.js`**
```javascript
// Funciones de validación
validateEmail(email): boolean
validatePassword(password): boolean
validateLoginForm(username, password): {
  isValid: boolean,
  errors: object
}

Reglas actuales:
- Username: no vacío, trim() aplicado
- Password: mínimo 6 caracteres
- Retorna errores específicos por campo
```

#### **`helpers.js`**
```javascript
// Funciones auxiliares
formatDate(date): string        // Formato español
capitalize(str): string         // Primera letra mayúscula
truncateText(text, max): string // Truncar con "..."
generateUniqueId(): string      // ID único basado en timestamp
```

### **📁 `/src/navigation/`** - Navegación

#### **`AppNavigator.js`**
```javascript
// Stack Navigator principal
Configuración:
- initialRouteName: 'Login'
- Header style: primary color
- ToastProvider wrapper global

Pantallas:
- Login: headerShown: false
- Dashboard: headerLeft: null (no back button)

Estructura:
<ToastProvider>
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
    </Stack.Navigator>
  </NavigationContainer>
</ToastProvider>
```

## 🔧 **Configuración y Dependencias**

### **Dependencias Principales**
```json
{
  "expo": "~54.0.10",                    // Plataforma base
  "react": "19.1.0",                     // React core
  "react-native": "0.81.4",             // React Native core
  "@react-navigation/native": "^X.X.X",  // Navegación base
  "@react-navigation/stack": "^X.X.X",   // Stack navigator
  "react-native-screens": "^X.X.X",      // Optimización pantallas
  "react-native-safe-area-context": "^X.X.X", // Safe area
  "react-native-reanimated": "^X.X.X"    // Animaciones avanzadas
}
```

### **Scripts Disponibles**
```json
{
  "start": "expo start",           // Desarrollo
  "android": "expo start --android", // Android específico
  "ios": "expo start --ios",       // iOS específico
  "web": "expo start --web"        // Web preview
}
```

## 🔌 **Puntos de Integración para Backend**

### **Endpoints Esperados**
```javascript
// Estructura sugerida para APIs
POST /api/auth/login
{
  "username": "string",
  "password": "string"
}
// Response: { token: "jwt", user: {...} }

GET /api/dashboard/data
// Headers: { Authorization: "Bearer jwt" }
// Response: { data: {...} }

POST /api/auth/logout
// Headers: { Authorization: "Bearer jwt" }
// Response: { success: true }
```

### **Modificaciones Necesarias para API Real**

#### **1. Servicio de Autenticación**
```javascript
// Crear: src/services/authService.js
export const authService = {
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      throw new Error('Credenciales inválidas');
    }
    
    return response.json();
  }
};
```

#### **2. Modificar LoginScreen.js**
```javascript
// En handleLogin(), reemplazar:
await new Promise(resolve => setTimeout(resolve, 2000));

// Por:
const result = await authService.login(username, password);
await AsyncStorage.setItem('token', result.token);
await AsyncStorage.setItem('user', JSON.stringify(result.user));
```

#### **3. Context de Autenticación**
```javascript
// Crear: src/context/AuthContext.js
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Métodos: login, logout, checkAuthStatus
  // Persistencia con AsyncStorage
};
```

### **Estructura de Respuesta Sugerida**

#### **Login Exitoso**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "username": "usuario123",
    "email": "user@example.com",
    "role": "user",
    "created_at": "2025-09-26T10:30:00Z"
  },
  "expires_in": 3600
}
```

#### **Login Fallido**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Usuario o contraseña incorrectos",
    "details": null
  }
}
```

## 🚀 **Guía de Extensión**

### **Agregar Nueva Pantalla**
1. Crear archivo en `/src/screens/NuevaPantalla.js`
2. Exportar en `/src/screens/index.js`
3. Agregar route en `AppNavigator.js`
4. Implementar animaciones si es necesario

### **Agregar Nuevo Componente**
1. Crear archivo en `/src/components/NuevoComponente.js`
2. Seguir patrón de props y estilos existente
3. Exportar en `/src/components/index.js`
4. Documentar props y uso

### **Agregar Nueva Validación**
1. Crear función en `/src/utils/validation.js`
2. Seguir patrón de return `{ isValid, errors }`
3. Agregar tests si es necesario

### **Integrar Nueva API**
1. Crear servicio en `/src/services/`
2. Implementar manejo de errores
3. Usar estados de loading existentes
4. Mostrar notificaciones con `useToast()`

## 🔍 **Debugging y Testing**

### **Logs Importantes**
```javascript
console.log('User state:', { username, password });
console.log('Validation result:', validation);
console.log('Navigation params:', navigation.getState());
```

### **Puntos de Debugging**
- `LoginScreen.handleLogin()`: Validación y navegación
- `ToastContext`: Estados de notificaciones
- `CustomInput.onFocus()`: Animaciones de input
- `AppNavigator`: Configuración de rutas

### **Testing Sugerido**
```javascript
// Tests unitarios recomendados
- validation.js: todas las funciones
- CustomButton: interacciones
- LoginScreen: flujo completo
- ToastContext: métodos del contexto
```

---

## 👥 **Para el Equipo de Desarrollo**

### **Convenciones de Código**
- **Componentes**: PascalCase (`CustomButton`)
- **Funciones**: camelCase (`handleLogin`)
- **Constantes**: UPPER_CASE (`COLORS`)
- **Archivos**: camelCase para componentes, kebab-case para utils

### **Estructura de Commits Sugerida**
```
feat: agregar nueva pantalla de perfil
fix: corregir validación en login
style: actualizar colores primarios  
docs: actualizar README con nuevas APIs
```

### **Code Review Checklist**
- [ ] Componente sigue patrones existentes
- [ ] Props están documentados
- [ ] Estilos usan constantes globales
- [ ] Errores se manejan con notificaciones
- [ ] Loading states implementados
- [ ] Animaciones son consistentes

---

# 🤖 Para Agentes de IA - Contexto Completo del Proyecto

## 📋 **Resumen Ejecutivo para IA**

**Tipo de Proyecto**: React Native App con Expo
**Arquitectura**: Component-based con Context API
**Estado**: Base funcional con Login/Dashboard + sistema de notificaciones avanzado
**Listo para**: Integración de backend, autenticación real, nuevas features

## 🎯 **Patrones Clave que Seguir**

### **1. Estructura de Archivos**
```
Nuevos componentes → src/components/NombreComponente.js
Nuevas pantallas → src/screens/NombrePantalla.js  
Nuevos servicios → src/services/nombreServicio.js
Nuevas utilidades → src/utils/nombreUtil.js
```

### **2. Patrón de Componentes**
```javascript
// Plantilla estándar para nuevos componentes
import React, { useState, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { GLOBAL_STYLES } from '../constants/styles';
import { COLORS } from '../constants/colors';

const NuevoComponente = ({ 
  prop1,           // Siempre documentar props
  prop2 = 'default', // Valores por defecto
  onAction,        // Callbacks
  style,           // Estilos personalizados
  ...props 
}) => {
  // Estados locales
  const [estado, setEstado] = useState(initialValue);
  
  // Referencias para animaciones
  const animValue = useRef(new Animated.Value(0)).current;
  
  // Handlers
  const handleAction = () => {
    // Lógica aquí
    if (onAction) onAction();
  };
  
  // Render
  return (
    <View style={[GLOBAL_STYLES.baseStyle, style]}>
      <Text style={GLOBAL_STYLES.text}>Content</Text>
    </View>
  );
};

export default NuevoComponente;
```

### **3. Patrón de Pantallas**
```javascript
// Plantilla para nuevas pantallas
import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { useToast } from '../context/ToastContext';
import { GLOBAL_STYLES } from '../constants/styles';

const NuevaPantalla = ({ navigation, route }) => {
  // Estados
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  
  // Hooks
  const { showSuccess, showError } = useToast();
  
  // Efectos
  useEffect(() => {
    loadInitialData();
  }, []);
  
  // Funciones
  const loadInitialData = async () => {
    try {
      setLoading(true);
      // API call aquí
      showSuccess('Datos cargados correctamente');
    } catch (error) {
      showError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={GLOBAL_STYLES.container}>
      <ScrollView>
        {/* Contenido */}
      </ScrollView>
    </View>
  );
};

export default NuevaPantalla;
```

## 🔧 **APIs Esperadas por el Frontend**

### **Endpoints Requeridos**
```javascript
// Base URL esperada
const API_BASE_URL = "https://api.tuapp.com/v1";

// Endpoints específicos que el frontend necesita:
POST /auth/login
POST /auth/logout  
GET  /user/profile
PUT  /user/profile
GET  /dashboard/stats
GET  /dashboard/notifications
```

### **Estructura de Response Estándar**
```javascript
// Éxito
{
  "success": true,
  "data": { /* datos específicos */ },
  "message": "Operación exitosa",
  "timestamp": "2025-09-26T10:30:00Z"
}

// Error
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensaje para usuario",
    "details": "Detalles técnicos",
    "field": "campo_especifico" // para errores de validación
  },
  "timestamp": "2025-09-26T10:30:00Z"
}
```

## 🧠 **Decisiones de Diseño Explicadas**

### **¿Por qué Context API en lugar de Redux?**
- Proyecto pequeño-mediano
- Solo necesitamos estado para notificaciones
- Context API es más simple y suficiente
- Fácil migrar a Redux después si crece

### **¿Por qué React Navigation Stack?**
- Navegación simple (2 pantallas principales)
- Patrones nativos iOS/Android
- Fácil extender con Tab/Drawer después

### **¿Por qué Animated API + Reanimated?**
- Animated API: animaciones simples y compatibilidad
- Reanimated: animaciones complejas futuras
- Performance nativo (useNativeDriver: true)

### **¿Por qué separar constants/?**
- Centralizar colores y estilos
- Consistencia visual
- Fácil cambiar temas
- Reutilización en componentes

## 🎨 **Sistema de Colores y Estilos**

### **Jerarquía de Colores**
```javascript
Uso por prioridad:
1. COLORS.primary    // Botones principales, headers
2. COLORS.secondary  // Botones secundarios, acentos  
3. COLORS.success    // Estados exitosos, confirmaciones
4. COLORS.error      // Estados de error, eliminaciones
5. COLORS.warning    // Advertencias, confirmaciones
6. COLORS.info       // Información, help tooltips
```

### **Jerarquía de Estilos**
```javascript
1. GLOBAL_STYLES.container     // Layout principal
2. GLOBAL_STYLES.card          // Contenedores de contenido
3. GLOBAL_STYLES.button        // Acciones principales
4. GLOBAL_STYLES.input         // Entrada de datos
5. GLOBAL_STYLES.title         // Títulos principales
6. GLOBAL_STYLES.text          // Texto general
```

## 🚀 **Cómo Extender el Proyecto**

### **Agregar Autenticación Real**
1. Crear `src/services/authService.js`
2. Crear `src/context/AuthContext.js`
3. Instalar `@react-native-async-storage/async-storage`
4. Modificar `LoginScreen.handleLogin()`
5. Agregar `ProtectedRoute` component
6. Actualizar `AppNavigator.js`

### **Agregar Nueva Pantalla**
1. Crear archivo en `src/screens/`
2. Seguir patrón de `DashboardScreen.js`
3. Exportar en `src/screens/index.js`
4. Agregar Screen en `AppNavigator.js`
5. Agregar navegación desde pantalla existente

### **Agregar Base de Datos Local**
1. Instalar `@react-native-async-storage/async-storage`
2. Crear `src/services/storageService.js`
3. Implementar CRUD operations
4. Usar en pantallas según necesidad

## 🤖 **Instrucciones Específicas para IA**

### **Al Generar Código Nuevo**
- SIEMPRE importar estilos desde `constants/`
- SIEMPRE usar `useToast()` para feedback al usuario
- SIEMPRE agregar loading states para operaciones async
- SIEMPRE seguir naming conventions existentes
- SIEMPRE agregar validaciones apropiadas

### **Al Modificar Código Existente**
- Mantener estructura de props consistente
- No romper animaciones existentes
- Preservar sistema de colores
- Mantener patrón de manejo de errores

### **Al Integrar APIs**
- Seguir estructura de response esperada
- Manejar todos los casos de error
- Agregar loading/success/error states
- Usar `try/catch` con notificaciones

### **Comandos de Emergencia**
```bash
# Reset completo del proyecto
rm -rf node_modules
npm install
npx expo start --clear

# Debug de errores comunes  
npx expo doctor          # Verificar configuración
npx expo start --tunnel  # Resolver problemas de red
```

---

**🎯 OBJETIVO**: Este README debe permitir que cualquier desarrollador (humano o IA) entienda completamente el proyecto y pueda contribuir siguiendo los patrones establecidos.**

**📚 Esta documentación debe actualizarse cuando se agreguen nuevas funcionalidades o se modifiquen patrones existentes.**