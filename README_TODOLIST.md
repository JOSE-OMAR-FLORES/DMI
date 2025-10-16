# 📝 Sistema TODO List con Zero-Trust y RBAC

## 🎯 Descripción del Proyecto

Sistema completo de gestión de tareas (TODO List) con autenticación robusta, MFA (Multi-Factor Authentication), autorización basada en roles (RBAC) y arquitectura Zero-Trust.

---

## 🏗️ Arquitectura del Sistema

### Frontend (React Native + Expo)
- ✅ **Autenticación JWT** con tokens seguros
- ✅ **MFA (Multi-Factor Authentication)** con Firebase
- ✅ **Navegación protegida** con validación de sesión
- ✅ **UI/UX moderna** con gradientes y animaciones
- ✅ **Gestión de estado** con Redux Toolkit

### Backend (Laravel 11)
- ✅ **API RESTful** con autenticación JWT
- ✅ **RBAC (Role-Based Access Control)** con 3 roles
- ✅ **Zero-Trust Architecture** - Nunca confiar, siempre verificar
- ✅ **MFA integrado** con códigos por email y Firebase
- ✅ **Base de datos MySQL** con migraciones

---

## 👥 Roles y Permisos

### 🔴 Admin
- Puede ver **TODOS los TODOs** de todos los usuarios
- Puede crear, editar y eliminar **sus propios TODOs**
- Acceso completo al sistema

### 🟢 User
- Puede ver **solo sus propios TODOs**
- Puede crear, editar y eliminar **sus propios TODOs**
- Acceso estándar al sistema

### 🟡 Guest
- Puede ver **solo sus propios TODOs**
- Puede crear TODOs (con limitaciones)
- Acceso limitado al sistema

---

## 🔐 Zero-Trust Implementation

### Principios Implementados:

1. **Nunca confiar, siempre verificar**
   - Cada request es validado
   - No se asume la autenticidad del usuario
   - Tokens JWT verificados en cada llamada

2. **Mínimo privilegio**
   - Los usuarios solo acceden a sus propios recursos
   - Permisos granulares por rol
   - Validación en backend independiente del frontend

3. **Verificación continua**
   - Middleware CheckRole en cada ruta protegida
   - Validación del user_id en todas las operaciones
   - Logs de seguridad en operaciones críticas

---

## 🚀 Instalación y Configuración

### Backend (Laravel)

```bash
# 1. Ir al directorio del backend
cd BackEndApp

# 2. Instalar dependencias
composer install

# 3. Configurar .env
cp .env.example .env
php artisan key:generate

# 4. Configurar base de datos en .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dmi_db
DB_USERNAME=root
DB_PASSWORD=

# 5. Ejecutar migraciones
php artisan migrate

# 6. Crear usuarios de prueba
php artisan db:seed --class=UserSeeder

# 7. Iniciar servidor
php artisan serve
```

### Frontend (React Native)

```bash
# 1. Ir al directorio del frontend
cd FrontEndApp

# 2. Instalar dependencias
npm install

# 3. Configurar API URL en src/screens/TodoListScreen.js
# Para Android Emulator: http://10.0.2.2:8000/api
# Para iOS Simulator: http://localhost:8000/api
# Para dispositivo físico: http://TU_IP:8000/api

# 4. Iniciar app
npm start
```

---

## 🧪 Usuarios de Prueba

### Admin
- **Email:** admin@test.com
- **Password:** password123
- **Rol:** admin
- **Permisos:** Ver todos los TODOs del sistema

### User Regular
- **Email:** user@test.com
- **Password:** password123
- **Rol:** user
- **Permisos:** Ver solo sus propios TODOs

### Guest
- **Email:** guest@test.com
- **Password:** password123
- **Rol:** guest
- **Permisos:** Acceso limitado

---

## 📡 API Endpoints

### Autenticación

```http
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
GET  /api/v1/auth/user-profile
```

### TODO List (Requiere autenticación JWT)

```http
GET    /api/todos          # Listar TODOs
POST   /api/todos          # Crear TODO
GET    /api/todos/{id}     # Ver TODO específico
PUT    /api/todos/{id}     # Actualizar TODO
PATCH  /api/todos/{id}     # Actualizar parcialmente TODO
DELETE /api/todos/{id}     # Eliminar TODO
```

### Headers requeridos:
```
Authorization: Bearer {tu_token_jwt}
Content-Type: application/json
Accept: application/json
```

---

## 🔒 Seguridad Implementada

### Backend
- ✅ JWT Authentication
- ✅ Middleware CheckRole (RBAC)
- ✅ Validación de entrada con Validator
- ✅ Protección CSRF
- ✅ CORS configurado
- ✅ Sanitización de datos
- ✅ Logs de seguridad

### Frontend
- ✅ AsyncStorage para tokens
- ✅ Verificación de sesión al iniciar
- ✅ Redirección automática si no está autenticado
- ✅ Timeout de sesión
- ✅ Limpieza de tokens al logout

---

## 📊 Estructura de la Base de Datos

### Tabla: users
```sql
- id (PK)
- name
- email (unique)
- password (hashed)
- role (enum: admin, user, guest)
- created_at
- updated_at
```

### Tabla: todos
```sql
- id (PK)
- user_id (FK -> users.id)
- title
- description (nullable)
- completed (boolean, default: false)
- created_at
- updated_at
```

---

## 🎨 Características de la UI

### Dashboard
- Información del usuario
- Rol asignado
- Acceso rápido a TODO List
- Configuración de MFA

### TODO List Screen
- Crear nuevas tareas
- Marcar como completadas
- Eliminar tareas
- Filtrado visual de completadas
- Interfaz responsive

---

## 🐛 Troubleshooting

### Error: "No autenticado"
- Verifica que el token JWT esté almacenado
- Revisa que el backend esté corriendo
- Comprueba la URL de la API

### Error: "No tienes permisos"
- Verifica tu rol de usuario
- Confirma que la ruta requiere tu rol
- Revisa los logs del backend

### No se cargan los TODOs
- Verifica la conexión con el backend
- Revisa la consola para errores
- Comprueba que la URL de la API sea correcta

---

## 📚 Tecnologías Utilizadas

### Frontend
- React Native 0.81
- Expo ~54.0
- Redux Toolkit
- React Navigation
- Axios
- AsyncStorage
- Expo Linear Gradient

### Backend
- Laravel 11
- PHP 8.2+
- MySQL
- JWT Auth (tymon/jwt-auth)
- Firebase Admin SDK

---

## ✅ Checklist de Implementación

- [x] Frontend limpio (eliminado código de clima)
- [x] Sistema de autenticación JWT
- [x] MFA con Firebase
- [x] Migración de roles en users
- [x] Tabla todos con relaciones
- [x] Modelo Todo con scopes
- [x] Middleware CheckRole (RBAC)
- [x] TodoController con Zero-Trust
- [x] Rutas API protegidas
- [x] Screen TodoList en Frontend
- [x] Seeder de usuarios de prueba
- [x] Documentación completa

---

## 👨‍💻 Desarrollo

### Comandos útiles

```bash
# Backend
php artisan route:list           # Ver todas las rutas
php artisan tinker               # Consola interactiva
php artisan migrate:fresh --seed # Reset DB con seeders

# Frontend
npm run android                  # Correr en Android
npm run ios                      # Correr en iOS
npm test                         # Ejecutar tests
```

---

## 📝 Notas Importantes

1. **Firebase MFA** sigue activo en el backend
2. **OpenWeather API** fue removida del frontend
3. **Screens de favoritos** fueron eliminadas
4. **Autenticación** es por usuario (email/password)
5. **Roles** son asignados en el registro o manualmente en DB

---

## 🎯 Próximos Pasos Sugeridos

- [ ] Agregar paginación a la lista de TODOs
- [ ] Implementar filtros por estado (completado/pendiente)
- [ ] Agregar búsqueda de TODOs
- [ ] Sistema de notificaciones push
- [ ] Panel de administración web
- [ ] Tests unitarios y de integración
- [ ] Documentación de API con Swagger

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisa la documentación
2. Consulta los logs del backend
3. Verifica la consola del frontend

---

**¡Sistema TODO List con Zero-Trust y RBAC listo para producción! 🚀**
