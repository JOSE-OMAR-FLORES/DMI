# Implementación de MFA y Zero-Trust con Firebase Auth

## Introducción

Este documento describe la implementación de autenticación multifactor (MFA) y el modelo Zero-Trust utilizando Firebase Auth como proveedor principal de autenticación. La solución integra un frontend en React Native y un backend en Laravel.

## Arquitectura de Seguridad

### Componentes Principales

1. **Firebase Auth**: Proveedor de autenticación primario
2. **React Native + Expo**: Frontend móvil con SecureStore para almacenamiento seguro
3. **Laravel API**: Backend con validación de tokens JWT y aplicación de principios Zero-Trust
4. **SQLite/MySQL**: Base de datos para almacenamiento de datos de usuario y logs de auditoría

### Flujo de Autenticación

```
┌─────────────┐     (1) Credenciales     ┌────────────┐
│  Usuario    │────────────────────────▶ │  Firebase  │
└─────────────┘                          │    Auth    │
       │                                 └────────────┘
       │                                       │
       │  (2) Token JWT                        │
       ▼                                       │
┌─────────────┐     (3) Verificación MFA       │
│  Frontend   │◀───────────────────────────────┘
│ React Native│                           
└─────────────┘                           
       │                                  
       │  (4) Token JWT + MFA Verificado  
       ▼                                  
┌─────────────┐     (5) Recursos         
│  Backend    │────────────────────────▶ 
│  Laravel    │                          
└─────────────┘                           
```

## Autenticación Multifactor (MFA)

### Métodos Implementados

1. **Contraseña** (Primer factor)
2. **OTP por SMS o Email** (Segundo factor)

### Proceso de Verificación

1. El usuario proporciona email/contraseña
2. Se evalúa el nivel de riesgo basado en:
   - IP conocida vs desconocida
   - Dispositivo registrado vs nuevo
   - Ubicación usual vs inusual
   - Hora de acceso
   - Historial de intentos fallidos
3. Basado en el nivel de riesgo y las preferencias del usuario, se solicita OTP
4. El OTP se verifica antes de conceder acceso completo

## Principios Zero-Trust Implementados

### 1. Nunca Confiar, Siempre Verificar

- Cada solicitud se verifica independientemente
- Los tokens son validados en cada petición
- Se evalúan permisos específicos para cada recurso

### 2. Acceso con Privilegios Mínimos

- Los tokens contienen claims específicos con permisos limitados
- Se verifica la sensibilidad de cada recurso
- El nivel de verificación se adapta al recurso solicitado

### 3. Monitoreo Continuo

- Registro detallado de eventos de autenticación
- Tracking de todos los accesos a recursos
- Análisis de patrones de comportamiento inusuales

## Evaluación de Riesgo Adaptativo

El sistema evalúa factores de riesgo y adapta el nivel de seguridad:

| Factor de Riesgo | Puntuación | Adaptación |
|------------------|------------|------------|
| IP desconocida | +2 | Solicitar OTP |
| Dispositivo nuevo | +2 | Solicitar OTP |
| Ubicación inusual | +3 | Solicitar OTP + Notificación |
| Múltiples intentos fallidos | +2 | Limitar intentos + Aumentar tiempo de espera |
| Hora inusual | +1 | Registro especial |
| Recurso sensible | +2 | Verificación adicional |
| Acceso frecuente | +1 | Monitoreo adicional |

## Almacenamiento Seguro

### Frontend (React Native)
- **Tokens de acceso**: Almacenados en SecureStore (cifrados)
- **Estado de sesión**: Manejado en contexto de autenticación
- **Credenciales**: Nunca almacenadas localmente

### Backend (Laravel)
- **Contraseñas**: Hash con bcrypt
- **Datos de usuario**: Cifrado a nivel de base de datos para campos sensibles
- **Tokens**: Verificados criptográficamente, nunca almacenados en texto plano

## Configuración e Integración

### 1. Firebase
- Crear proyecto en Firebase Console
- Habilitar Authentication con Email/Password
- Configurar SMS para segundo factor
- Obtener credenciales para Web y Admin SDK

### 2. Frontend (React Native)
- Configurar firebase.config.js con credenciales
- Almacenar API keys en variables de entorno seguras
- Implementar AuthContext para gestión de estado de autenticación

### 3. Backend (Laravel)
- Configurar firebase.php con credenciales admin
- Implementar middleware de verificación de JWT
- Configurar logs específicos para auditoría

## Casos de Uso

### Registro de Usuario
```javascript
// Frontend
const register = async (email, password) => {
  // 1. Crear usuario en Firebase Auth
  const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
  
  // 2. Obtener token ID
  const token = await userCredential.user.getIdToken();
  
  // 3. Enviar a backend para crear registro en BD
  const response = await api.post('/auth/register', { token });
  
  // 4. Almacenar token de forma segura
  await SecureStore.setItemAsync('authToken', token);
};
```

### Login con MFA
```javascript
// Frontend
const login = async (email, password) => {
  // 1. Autenticar con Firebase
  const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
  
  // 2. Verificar si se requiere MFA (respuesta del backend)
  const token = await userCredential.user.getIdToken();
  const response = await api.post('/auth/login', { token });
  
  if (response.data.requireMFA) {
    // 3. Solicitar OTP al usuario
    // 4. Verificar OTP con backend
    const verifyResponse = await api.post('/auth/verify-otp', { 
      token, 
      otp: userInputOtp 
    });
    
    // 5. Almacenar token MFA verificado
    await SecureStore.setItemAsync('authToken', verifyResponse.data.token);
  } else {
    // Almacenar token normal
    await SecureStore.setItemAsync('authToken', response.data.token);
  }
};
```

## Buenas Prácticas Implementadas

1. **Tokens de corta duración**: Configurados para expirar tras 1 hora
2. **Renovación automática**: Implementada con tokens de refresco
3. **Revocación inmediata**: Posibilidad de invalidar tokens específicos
4. **Auditoría detallada**: Logging de todas las operaciones de autenticación
5. **Detección de anomalías**: Alertas sobre comportamientos inusuales

## Próximos Pasos y Mejoras

1. Implementar proveedor real de SMS para OTP
2. Añadir opciones adicionales de MFA (app authenticator, biometría)
3. Integrar análisis de comportamiento más avanzado
4. Implementar servicios de geolocalización para verificación adicional
5. Desarrollar panel de administración para visualizar logs de auditoría