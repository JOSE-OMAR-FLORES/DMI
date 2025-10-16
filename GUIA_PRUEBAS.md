# 🧪 GUÍA RÁPIDA DE PRUEBAS - TODO List App

## ✅ Estado del Sistema

### Backend ✅
- **Servidor:** http://127.0.0.1:8000
- **Estado:** ✅ Corriendo
- **Rutas TODO:** ✅ Registradas (5 rutas)
- **Base de datos:** ✅ Migraciones aplicadas
- **Usuarios de prueba:** ✅ Creados

### Frontend ✅
- **Expo:** ✅ Iniciando Metro Bundler
- **Código limpio:** ✅ Sin referencias a Weather/Favorites
- **Pantallas:** Login, Register, Dashboard, TodoList, MFA

---

## 👥 Usuarios de Prueba

### 1. Usuario Admin
```
Email: admin@test.com
Password: password123
Rol: admin
Permisos: Ver TODOS los TODOs del sistema
```

### 2. Usuario Regular
```
Email: user@test.com
Password: password123
Rol: user
Permisos: Ver solo sus propios TODOs
```

### 3. Usuario Guest
```
Email: guest@test.com
Password: password123
Rol: guest
Permisos: Acceso limitado
```

---

## 🎯 Pasos para Probar la App

### Paso 1: Abrir la App en tu dispositivo
1. **Escanea el código QR** que aparece en la terminal
2. **O presiona `a`** para abrir en Android Emulator
3. **O presiona `w`** para abrir en web

### Paso 2: Login
1. En la pantalla de Login ingresa:
   - Email: `user@test.com`
   - Password: `password123`
2. Click en "Iniciar Sesión"
3. Si tienes MFA activo, ingresa el código
4. Deberías llegar al Dashboard

### Paso 3: Explorar Dashboard
1. Verás tu información de usuario
2. Tu rol asignado (USER)
3. Dos tarjetas de acción:
   - 📝 Mi TODO List
   - 🔐 Seguridad MFA

### Paso 4: Crear TODOs
1. Click en "📝 Mi TODO List"
2. Ingresa un título: `Comprar leche`
3. (Opcional) Descripción: `Leche deslactosada`
4. Click en "Agregar Tarea"
5. **Resultado esperado:** El TODO aparece en la lista

### Paso 5: Marcar como Completado
1. Click en el círculo (checkbox) del TODO
2. **Resultado esperado:** 
   - Aparece un ✓ verde
   - El texto se tacha
   - Se marca como completado

### Paso 6: Eliminar TODO
1. Click en el icono de basura 🗑️
2. **Resultado esperado:** El TODO se elimina

### Paso 7: Probar con Admin (Ver TODOs de todos)
1. Logout del usuario actual
2. Login con `admin@test.com` / `password123`
3. Crea algunos TODOs
4. **Resultado esperado:** El admin ve TODOS los TODOs del sistema

---

## 🔍 Casos de Prueba Específicos

### ✅ Test 1: Zero-Trust - Ownership Validation
**Objetivo:** Verificar que un user solo ve sus TODOs

1. Login como `user@test.com`
2. Crea 3 TODOs
3. Logout
4. Login como `guest@test.com`
5. Crea 2 TODOs
6. **Resultado esperado:** Guest solo ve sus 2 TODOs, NO los 3 del user

### ✅ Test 2: RBAC - Admin Privileges
**Objetivo:** Verificar que admin ve todos los TODOs

1. Login como `admin@test.com`
2. Ir a TODO List
3. **Resultado esperado:** Ve TODOs de todos los usuarios

### ✅ Test 3: Create TODO
**Objetivo:** Crear un TODO correctamente

1. Login con cualquier usuario
2. Ir a TODO List
3. Título: "Test TODO"
4. Descripción: "Descripción de prueba"
5. Click "Agregar Tarea"
6. **Resultado esperado:** 
   - Mensaje de éxito
   - TODO aparece en la lista
   - Se asigna automáticamente al usuario logueado

### ✅ Test 4: Update TODO (Complete/Uncomplete)
**Objetivo:** Marcar como completado/pendiente

1. Click en checkbox de un TODO pendiente
2. **Resultado esperado:** Se marca como completado
3. Click nuevamente en el checkbox
4. **Resultado esperado:** Vuelve a pendiente

### ✅ Test 5: Delete TODO
**Objetivo:** Eliminar un TODO

1. Click en 🗑️ de un TODO
2. **Resultado esperado:** 
   - Mensaje de éxito
   - TODO desaparece de la lista

### ✅ Test 6: Empty State
**Objetivo:** Ver estado vacío cuando no hay TODOs

1. Login con usuario sin TODOs
2. Ir a TODO List
3. **Resultado esperado:** 
   - Mensaje "No hay tareas aún"
   - "¡Agrega tu primera tarea arriba!"

---

## 🐛 Problemas Comunes y Soluciones

### ❌ Error: "No se pueden cargar los TODOs"
**Solución:**
1. Verifica que el backend esté corriendo
2. Comprueba la URL de la API en `TodoListScreen.js`
3. Para Android Emulator debe ser: `http://10.0.2.2:8000/api`

### ❌ Error: "No autenticado"
**Solución:**
1. Vuelve a hacer login
2. Verifica que el token esté almacenado
3. Revisa que el token no haya expirado

### ❌ La app no se conecta al backend
**Solución:**
1. Verifica que ambos servidores estén corriendo:
   - Backend: `php artisan serve`
   - Frontend: `npm start`
2. Comprueba la IP correcta según dispositivo:
   - Android Emulator: `10.0.2.2:8000`
   - iOS Simulator: `localhost:8000`
   - Dispositivo físico: `TU_IP_LOCAL:8000`

### ❌ "Unable to resolve module"
**Solución:**
1. Limpia cache: `npm start -- --clear`
2. O detén Expo y ejecuta: `npx expo start -c`

---

## 📱 URLs según Dispositivo

### Android Emulator
```javascript
const API_URL = 'http://10.0.2.2:8000/api';
```

### iOS Simulator
```javascript
const API_URL = 'http://localhost:8000/api';
```

### Dispositivo Físico (misma red WiFi)
```javascript
const API_URL = 'http://192.168.1.X:8000/api'; // Tu IP local
```

---

## 🎬 Flujo Completo de Prueba

1. ✅ **Iniciar Backend:** `php artisan serve`
2. ✅ **Iniciar Frontend:** `npm start`
3. ✅ **Abrir app** en dispositivo/emulador
4. ✅ **Login** con usuario de prueba
5. ✅ **Ver Dashboard** con info de usuario
6. ✅ **Navegar a TODO List**
7. ✅ **Crear 3 TODOs**
8. ✅ **Marcar 1 como completado**
9. ✅ **Eliminar 1 TODO**
10. ✅ **Volver al Dashboard**
11. ✅ **Configurar MFA** (opcional)
12. ✅ **Logout**
13. ✅ **Login con Admin**
14. ✅ **Ver TODOs de todos los usuarios**

---

## 📊 Endpoints que Puedes Probar

### Desde la App
- ✅ `POST /api/v1/auth/login` - Login
- ✅ `POST /api/v1/auth/register` - Registro
- ✅ `GET /api/todos` - Listar TODOs
- ✅ `POST /api/todos` - Crear TODO
- ✅ `PATCH /api/todos/{id}` - Actualizar TODO
- ✅ `DELETE /api/todos/{id}` - Eliminar TODO

---

## ✨ Características a Probar

### Dashboard
- ✅ Muestra nombre de usuario
- ✅ Muestra email
- ✅ Muestra rol asignado
- ✅ Animaciones suaves
- ✅ Botón de logout funcional
- ✅ Navegación a TODO List
- ✅ Navegación a MFA Settings

### TODO List
- ✅ Crear TODO con título y descripción
- ✅ Listar TODOs del usuario
- ✅ Marcar como completado
- ✅ Eliminar TODO
- ✅ UI responsive
- ✅ Estados de carga
- ✅ Mensajes de error/éxito
- ✅ Empty state cuando no hay TODOs

### Seguridad
- ✅ Solo ve sus propios TODOs (excepto admin)
- ✅ No puede modificar TODOs de otros
- ✅ Token JWT en headers
- ✅ Logout limpia sesión
- ✅ Redirect a login si no autenticado

---

## 🎉 ¡TODO LISTO PARA PROBAR!

**Presiona `a` en la terminal de Expo para abrir en Android**

O escanea el código QR con Expo Go app.

---

**Documentado el:** 15 de Octubre de 2025
**Estado:** ✅ Sistema funcionando y listo para pruebas
