# 🔧 SOLUCIÓN DE PROBLEMAS - TODO List App

## ❌ Problema: "No hay token de autenticación"

### 🔍 Síntoma
- Login exitoso → Dashboard funciona ✅
- Al ir a TODO List → Error: "No hay token de autenticación" ❌
- La app te redirige al Login

### 🎯 Causa
El token JWT se guarda con la clave `'jwt_token'` pero TodoListScreen estaba buscando con la clave `'userToken'`.

### ✅ Solución Aplicada
Se actualizó `TodoListScreen.js` para usar la clave correcta:

```javascript
// ❌ ANTES (Incorrecto)
const token = await AsyncStorage.getItem('userToken');

// ✅ AHORA (Correcto)
const token = await AsyncStorage.getItem('jwt_token');
```

Se actualizó en todos los métodos:
- ✅ `fetchTodos()` - Obtener TODOs
- ✅ `createTodo()` - Crear TODO
- ✅ `toggleTodoCompleted()` - Marcar completado
- ✅ `deleteTodo()` - Eliminar TODO

---

## 🧪 Cómo Probar que Funciona

### 1. Reinicia la App
- Detén Expo con `Ctrl+C`
- Ejecuta `npm start` de nuevo
- Abre la app en tu dispositivo

### 2. Haz Login
```
Email: user@test.com
Password: password123
```

### 3. Ve al TODO List
- Deberías ver la pantalla de TODO List sin errores
- NO debería redirigir al login
- Deberías poder crear tareas

### 4. Crea un TODO
```
Título: Mi primera tarea
Descripción: Esto es una prueba
```
- Click en "Agregar Tarea"
- Debería aparecer en la lista

---

## 📱 Configuración de URL según Dispositivo

Si aún tienes problemas de conexión, verifica la URL en `TodoListScreen.js`:

```javascript
// Línea ~32
const API_URL = 'http://10.0.2.2:8000/api';
```

### Android Emulator ✅
```javascript
const API_URL = 'http://10.0.2.2:8000/api';
```

### iOS Simulator
```javascript
const API_URL = 'http://localhost:8000/api';
```

### Dispositivo Físico (misma WiFi)
```javascript
const API_URL = 'http://TU_IP_LOCAL:8000/api';
// Ejemplo: http://192.168.1.5:8000/api
```

Para obtener tu IP local:
```powershell
# Windows
ipconfig
# Busca "Dirección IPv4"

# Mac/Linux
ifconfig
# Busca "inet"
```

---

## 🔑 Claves de AsyncStorage Utilizadas

### En el Sistema
- `'jwt_token'` ← Token JWT de autenticación
- `'user_data'` ← Datos del usuario
- `'secure_token_key'` ← Token en almacenamiento seguro

### ⚠️ NO USAR
- `'userToken'` ❌ (Esta clave NO existe)
- `'token'` ❌ (Esta clave NO existe)

---

## 🐛 Otros Problemas Comunes

### Problema: Loading infinito

**Causa posible:**
1. Backend no está corriendo
2. URL de API incorrecta
3. Problema de red

**Solución:**
1. Verifica que el backend esté corriendo:
   ```bash
   cd BackEndApp
   php artisan serve
   ```

2. Verifica la URL en la consola de Expo:
   - Busca: `📡 Intentando conectar a: ...`
   - Debe ser: `http://10.0.2.2:8000/api/todos`

3. Revisa la consola para errores:
   - `❌ Error completo: ...`
   - `❌ Error status: ...`

### Problema: "Sesión expirada"

**Causa:** El token JWT ha expirado (por defecto 60 minutos)

**Solución:**
1. Cierra sesión
2. Vuelve a iniciar sesión
3. El token se renovará

### Problema: "No se puede conectar al servidor"

**Causa:** Backend no está corriendo o URL incorrecta

**Solución:**
1. Verifica que el backend esté corriendo en `http://127.0.0.1:8000`
2. Prueba acceder desde el navegador: `http://127.0.0.1:8000/api/v1/health`
3. Verifica que la URL en TodoListScreen sea correcta

---

## 🔍 Debugging

### Ver logs en la app

Los logs aparecen en la terminal de Expo:

```
✅ Usuario autenticado encontrado: user@test.com
🔑 Token: Existe
📡 Intentando conectar a: http://10.0.2.2:8000/api/todos
✅ TODOs recibidos: {...}
```

### Ver logs en el backend

Los logs aparecen en la terminal donde corre `php artisan serve`:

```
[INFO] GET /api/todos
[INFO] Authentication successful
[INFO] User: user@test.com
```

### Verificar token manualmente

Puedes verificar si el token existe:

1. Agrega este código temporal en DashboardScreen:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// En useEffect
useEffect(() => {
  AsyncStorage.getItem('jwt_token').then(token => {
    console.log('Token actual:', token);
  });
}, []);
```

---

## ✅ Checklist de Solución

- [x] Actualizar clave de token a `'jwt_token'`
- [x] Agregar headers completos en requests
- [x] Agregar timeout a las peticiones
- [x] Agregar mejor manejo de errores
- [x] Agregar logs de debugging
- [x] Verificar URL de API según dispositivo

---

## 📞 Si Aún No Funciona

1. **Limpia cache de Expo:**
   ```bash
   npm start -- --clear
   ```

2. **Reinstala dependencias:**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Verifica que el backend funcione:**
   ```bash
   # Test login
   curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@test.com","password":"password123"}'
   ```

4. **Verifica las rutas de TODO:**
   ```bash
   cd BackEndApp
   php artisan route:list --path=todos
   ```

---

## 🎉 Estado Actual

✅ **PROBLEMA RESUELTO**

El token ahora se busca con la clave correcta `'jwt_token'` en todos los métodos del TodoListScreen.

**Próximos pasos:**
1. Reinicia Expo
2. Haz login
3. Navega a TODO List
4. Debería funcionar correctamente

---

**Última actualización:** 15 de Octubre de 2025, 10:45 PM
**Estado:** ✅ Solución aplicada y lista para probar
