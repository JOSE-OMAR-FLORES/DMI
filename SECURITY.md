# 🔒 Documentación de Seguridad - Proyecto DMI

## Índice
1. [Principios de Seguridad Aplicados](#principios-de-seguridad-aplicados)
2. [Amenazas Identificadas y Mitigación](#amenazas-identificadas-y-mitigación)
3. [Lineamientos de Seguridad para el Equipo](#lineamientos-de-seguridad-para-el-equipo)
4. [Configuración Segura del Entorno](#configuración-segura-del-entorno)
5. [Monitoreo y Auditoría](#monitoreo-y-auditoría)

---

## 🛡️ Principios de Seguridad Aplicados

### 1. **Autenticación JWT (JSON Web Tokens)**
- **Implementación**: Sistema de autenticación basado en tokens JWT
- **Beneficios**: 
  - Tokens con expiración automática
  - Información del usuario encriptada
  - Sin necesidad de almacenar sesiones en servidor
- **Ubicación**: `BackEndApp/app/Http/Controllers/AuthController.php`

### 2. **Cifrado y Hash de Contraseñas**
- **Implementación**: Uso de bcrypt para hash de contraseñas
- **Configuración**: Laravel automáticamente aplica bcrypt con salt
- **Verificación**: Las contraseñas nunca se almacenan en texto plano
- **Ubicación**: `BackEndApp/app/Models/User.php`

### 3. **Almacenamiento Seguro Local**
- **Implementación**: AsyncStorage para tokens en dispositivos móviles
- **Funcionalidad**: 
  - Almacenamiento encriptado del token JWT
  - Limpieza automática al cerrar sesión
  - Verificación de integridad del token
- **Ubicación**: `FrontEndApp/src/utils/AuthStorage.js`

### 4. **Comunicación Segura**
- **HTTPS**: Configurado para producción (actualmente HTTP en desarrollo)
- **Headers de Seguridad**: 
  - `Content-Type: application/json`
  - `Accept: application/json`
  - `Authorization: Bearer {token}`
- **Ubicación**: `FrontEndApp/src/utils/ApiService.js`

### 5. **Validación de Datos**
- **Frontend**: Validación en tiempo real de formularios
- **Backend**: Validación de Laravel con reglas específicas
- **Sanitización**: Limpieza automática de datos de entrada
- **Ubicaciones**: 
  - Frontend: `FrontEndApp/src/screens/LoginScreen.js`, `FrontEndApp/src/screens/RegisterScreen.js`
  - Backend: `BackEndApp/app/Http/Requests/`

---

## ⚠️ Amenazas Identificadas y Mitigación

### 1. **Riesgo: Fuga de Tokens JWT**
**Amenaza**: Los tokens podrían ser interceptados o extraídos del dispositivo.

**Mitigación Implementada**:
- ✅ Tokens con tiempo de expiración (configurado en backend)
- ✅ Limpieza automática de tokens al cerrar sesión
- ✅ Almacenamiento en AsyncStorage (más seguro que localStorage)
- ✅ No exposición de tokens en logs de producción

**Código de Referencia**:
```javascript
// FrontEndApp/src/utils/AuthStorage.js
export const removeToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
};
```

### 2. **Riesgo: Ataques de Fuerza Bruta**
**Amenaza**: Intentos masivos de login con diferentes credenciales.

**Mitigación Implementada**:
- ✅ Validación de email con formato correcto
- ✅ Contraseñas mínimas de 6 caracteres
- ✅ Hash bcrypt con alta complejidad computacional
- ✅ Mensajes de error genéricos (no específicos)

**Recomendación Futura**: Implementar rate limiting en Laravel.

### 3. **Riesgo: Inyección de Datos Maliciosos**
**Amenaza**: Datos maliciosos enviados a través de formularios.

**Mitigación Implementada**:
- ✅ Validación estricta en frontend (email, longitud de contraseña)
- ✅ Validación de Laravel en backend con reglas específicas
- ✅ Sanitización automática de datos con `trim()` y `toLowerCase()`
- ✅ Uso de Eloquent ORM (previene SQL injection)

**Código de Referencia**:
```javascript
// Validación frontend
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  Alert.alert('Error', 'Por favor ingresa un email válido');
}
```

### 4. **Riesgo: Exposición de Datos Sensibles**
**Amenaza**: Información sensible visible en logs o código.

**Mitigación Implementada**:
- ✅ Contraseñas nunca mostradas en logs
- ✅ Tokens JWT no impresos en consola de producción
- ✅ Variables de entorno para configuraciones sensibles
- ✅ `.env` en `.gitignore` para evitar subida accidental

### 5. **Riesgo: Sesiones No Cerradas**
**Amenaza**: Usuarios que no cierran sesión correctamente.

**Mitigación Implementada**:
- ✅ Botón de logout visible y funcional
- ✅ Limpieza completa del estado de Redux al cerrar sesión
- ✅ Eliminación de tokens del almacenamiento local
- ✅ Navegación automática a pantalla de login

**Código de Referencia**:
```javascript
// FrontEndApp/src/context/authSlice.js
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    await AuthStorage.removeToken();
    await ApiService.logout();
  }
);
```

---

## 📋 Lineamientos de Seguridad para el Equipo

### 🔐 **Manejo de Credenciales y Secretos**

#### ❌ **NUNCA Hacer:**
- Subir archivos `.env` al repositorio
- Hardcodear passwords, API keys o tokens en el código
- Compartir credenciales por chat o email sin cifrar
- Usar contraseñas débiles en desarrollo o producción
- Dejar tokens JWT en comentarios del código

#### ✅ **SIEMPRE Hacer:**
- Usar variables de entorno para datos sensibles
- Rotar tokens y passwords regularmente
- Verificar que `.env` esté en `.gitignore`
- Usar contraseñas únicas y complejas
- Documentar qué variables de entorno se necesitan

### 🛠️ **Desarrollo Seguro**

#### **Validación de Datos**
```javascript
// ✅ CORRECTO: Validar tanto frontend como backend
// Frontend
if (!email || !password) {
  return Alert.alert('Error', 'Todos los campos son requeridos');
}

// Backend (Laravel)
$request->validate([
    'email' => 'required|email',
    'password' => 'required|min:6'
]);
```

#### **Manejo de Errores**
```javascript
// ❌ INCORRECTO: Exponer detalles internos
catch (error) {
  Alert.alert('Error', error.response.data.full_stack_trace);
}

// ✅ CORRECTO: Mensajes genéricos al usuario
catch (error) {
  Alert.alert('Error', 'Ocurrió un problema. Inténtalo de nuevo.');
  console.error('Error interno:', error); // Solo para desarrollo
}
```

### 🔄 **Ciclo de Vida de Tokens**

1. **Generación**: Solo en login/registro exitoso
2. **Almacenamiento**: AsyncStorage con verificación
3. **Uso**: Header Authorization en cada request
4. **Validación**: Verificar expiración antes de usar
5. **Eliminación**: Al cerrar sesión o detectar token inválido

### 🚨 **Respuesta a Incidentes**

#### **Si se detecta una brecha de seguridad**:
1. **Inmediato**: Revocar tokens comprometidos
2. **Corto plazo**: Cambiar claves de API y secretos
3. **Mediano plazo**: Revisar logs y identificar alcance
4. **Largo plazo**: Implementar medidas adicionales

---

## ⚙️ Configuración Segura del Entorno

### **Variables de Entorno Requeridas**

#### **Backend (Laravel)**
```bash
# .env
APP_KEY=base64:tu-clave-generada-por-artisan
DB_PASSWORD=contraseña-segura-mysql
JWT_SECRET=clave-secreta-jwt-256-bits
APP_ENV=production
APP_DEBUG=false
```

#### **Frontend (React Native)**
```bash
# .env
API_BASE_URL=https://tu-dominio.com/api/v1
ENVIRONMENT=production
```

### **Configuración del Servidor**

#### **HTTPS Obligatorio en Producción**
```php
// BackEndApp/app/Http/Middleware/ForceHttps.php
if (!$request->secure() && app()->environment('production')) {
    return redirect()->secure($request->getRequestUri());
}
```

#### **Headers de Seguridad**
```php
// BackEndApp/config/cors.php
'allowed_headers' => ['Content-Type', 'Authorization'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => false,
```

---

## 📊 Monitoreo y Auditoría

### **Logs de Seguridad**
```php
// Ejemplo de logging seguro
Log::info('Usuario autenticado', [
    'user_id' => $user->id,
    'ip' => $request->ip(),
    'user_agent' => $request->userAgent()
]);

// ❌ NUNCA loggear contraseñas o tokens completos
```

### **Métricas a Monitorear**
- Intentos de login fallidos por IP
- Tokens JWT expirados o inválidos
- Requests sin autorización a endpoints protegidos
- Tiempos de respuesta anómalos (posibles ataques)

### **Auditoría Regular**
- [ ] Revisar dependencias con vulnerabilidades conocidas
- [ ] Verificar configuración de CORS
- [ ] Comprobar que `.env` no esté en repositorio
- [ ] Validar que HTTPS esté activo en producción
- [ ] Revisar logs de seguridad semanalmente

---

## 🆘 Contactos de Emergencia

**En caso de detectar una vulnerabilidad de seguridad:**

1. **No crear issues públicos** con detalles de la vulnerabilidad
2. **Contactar directamente** al equipo de desarrollo
3. **Documentar** los pasos para reproducir el problema
4. **Esperar confirmación** antes de hacer disclosure público

---

## 📝 Registro de Cambios de Seguridad

| Fecha | Cambio | Autor | Motivo |
|-------|--------|--------|---------|
| 2025-09-27 | Implementación JWT | Omar Flores | Sistema de autenticación seguro |
| 2025-09-27 | AsyncStorage para tokens | Omar Flores | Almacenamiento seguro móvil |
| 2025-09-27 | Validación dual frontend/backend | Omar Flores | Prevención inyección de datos |

---

## 🔗 Referencias y Recursos

- [OWASP Top 10 Mobile Security Risks](https://owasp.org/www-project-mobile-top-10/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Laravel Security Best Practices](https://laravel.com/docs/security)
- [React Native Security Guide](https://reactnative.dev/docs/security)

---

**Última actualización**: 27 de septiembre de 2025  
**Versión**: 1.0  
**Próxima revisión**: 27 de octubre de 2025