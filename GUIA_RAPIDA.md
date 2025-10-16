# 🚀 GUÍA RÁPIDA - Sistema TODO List

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Backend

```bash
cd BackEndApp
php artisan serve
```

**Backend corriendo en:** `http://localhost:8000`

### 2️⃣ Frontend

```bash
cd FrontEndApp
npm start
```

Presiona **`a`** para Android o **`i`** para iOS

---

## 🔑 Usuarios de Prueba

### 👨‍💼 Admin
```
Email: admin@test.com
Password: password123
```
**Puede ver todos los TODOs del sistema**

### 👤 Usuario Normal
```
Email: user@test.com
Password: password123
```
**Solo ve sus propios TODOs**

### 👻 Invitado
```
Email: guest@test.com
Password: password123
```
**Acceso limitado, solo sus TODOs**

---

## 📱 Flujo de Uso

### Paso 1: Login
1. Abre la app
2. Ingresa email y password
3. (Opcional) Completa MFA si está activado
4. Accede al Dashboard

### Paso 2: Dashboard
- Ver información del usuario
- Ver rol asignado
- Click en "📝 Mi TODO List"

### Paso 3: TODO List
- **Crear:** Escribe título y descripción, click en "Agregar Tarea"
- **Completar:** Click en el checkbox
- **Eliminar:** Click en 🗑️

---

## 🧪 Probar RBAC

### Como Admin
1. Login con `admin@test.com`
2. Crea algunos TODOs
3. **Verás todos los TODOs** de todos los usuarios

### Como User
1. Login con `user@test.com`
2. Crea algunos TODOs
3. **Solo verás tus TODOs**

---

## 🔧 Solución de Problemas

### ❌ Error: "No autenticado"
**Solución:** Cierra sesión y vuelve a loguearte

### ❌ No carga los TODOs
**Solución:** 
1. Verifica que el backend esté corriendo
2. Revisa la URL en `TodoListScreen.js`:
   - Android Emulator: `http://10.0.2.2:8000/api`
   - iOS Simulator: `http://localhost:8000/api`

### ❌ Error de permisos
**Solución:** Verifica tu rol en el Dashboard

---

## 📊 API Endpoints

### Autenticación
```http
POST http://localhost:8000/api/v1/auth/login
POST http://localhost:8000/api/v1/auth/register
```

### TODOs (requiere token JWT)
```http
GET    http://localhost:8000/api/todos
POST   http://localhost:8000/api/todos
GET    http://localhost:8000/api/todos/{id}
PUT    http://localhost:8000/api/todos/{id}
DELETE http://localhost:8000/api/todos/{id}
```

---

## 🎯 Testing Rápido con Postman/Thunder Client

### 1. Login
```json
POST http://localhost:8000/api/v1/auth/login

Body:
{
  "email": "user@test.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {...}
}
```

### 2. Crear TODO
```json
POST http://localhost:8000/api/todos
Headers:
  Authorization: Bearer {tu_token}
  Content-Type: application/json

Body:
{
  "title": "Mi primera tarea",
  "description": "Esta es una prueba"
}
```

### 3. Listar TODOs
```json
GET http://localhost:8000/api/todos
Headers:
  Authorization: Bearer {tu_token}
```

---

## ✅ Checklist de Verificación

- [ ] Backend corriendo en http://localhost:8000
- [ ] Frontend iniciado con `npm start`
- [ ] Login exitoso con usuario de prueba
- [ ] Dashboard muestra información del usuario
- [ ] Puedes acceder a TODO List
- [ ] Puedes crear un TODO
- [ ] Puedes marcar como completado
- [ ] Puedes eliminar un TODO

---

## 🎨 Características Visuales

### Dashboard
- ✨ Gradiente animado
- 📊 Card de información de usuario
- 🎯 2 acciones principales (TODO List y MFA)
- 🚪 Botón de logout

### TODO List
- ✨ Interfaz moderna con gradientes
- ✅ Checkbox interactivo
- 📝 Formulario inline
- 🗑️ Eliminación rápida
- 📱 Responsive design

---

## 🔐 Seguridad

- ✅ Zero-Trust: Cada request es validado
- ✅ JWT: Tokens seguros
- ✅ RBAC: Control por roles
- ✅ MFA: Autenticación de dos factores (opcional)
- ✅ Validación: En frontend y backend

---

## 📚 Archivos Importantes

### Frontend
- `src/screens/DashboardScreen.js` - Dashboard principal
- `src/screens/TodoListScreen.js` - Lista de TODOs
- `src/navigation/AppNavigator.js` - Navegación

### Backend
- `app/Http/Controllers/TodoController.php` - Lógica CRUD
- `app/Http/Middleware/CheckRole.php` - Middleware RBAC
- `app/Models/Todo.php` - Modelo Todo
- `routes/api.php` - Rutas API

---

## 🎉 ¡Listo!

Tu sistema TODO List con Zero-Trust y RBAC está completamente funcional.

**Próximos pasos sugeridos:**
- Agrega más TODOs
- Prueba con diferentes roles
- Personaliza la UI
- Agrega más funcionalidades

---

**¿Necesitas ayuda?** Consulta `README_TODOLIST.md` para más detalles.
