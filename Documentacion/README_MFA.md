# 🔐 MFA (Multi-Factor Authentication) - Sistema Completo

## 📋 Resumen

Sistema de autenticación multi-factor completamente implementado para la aplicación DMI (Dashboard Meteorológico Interactivo). Incluye backend Laravel con envío de emails vía Mailtrap y frontend React Native con UI completa.

---

## ✨ Características

### Seguridad
- ✅ Códigos de verificación de 6 dígitos aleatorios
- ✅ Expiración automática en 5 minutos
- ✅ Máximo 5 intentos antes de bloqueo temporal
- ✅ 8 códigos de respaldo hasheados con SHA-256
- ✅ Códigos de respaldo de un solo uso
- ✅ Rate limiting por IP
- ✅ Logs detallados de actividad

### Funcionalidad
- ✅ Habilitar/Deshabilitar MFA desde la app
- ✅ Envío de código por email (Mailtrap para testing)
- ✅ Verificación con código de 6 dígitos
- ✅ Verificación alternativa con códigos de respaldo
- ✅ Reenvío de código con countdown de 30 segundos
- ✅ Regeneración de códigos de respaldo
- ✅ Estado MFA visible en tiempo real

### UX/UI
- ✅ Diseño moderno y profesional
- ✅ Auto-focus y auto-verificación
- ✅ Soporte para copiar/pegar códigos
- ✅ Navegación fluida entre pantallas
- ✅ Mensajes de error claros y útiles
- ✅ Loading states en todas las acciones
- ✅ Animaciones suaves

---

## 📂 Estructura de Archivos

```
Proyecto DMI/
│
├── BackEndApp/ (Laravel)
│   ├── app/
│   │   ├── Services/
│   │   │   └── LaravelMFAService.php ⭐ (Lógica MFA)
│   │   ├── Http/Controllers/
│   │   │   └── AuthMFAController.php ⭐ (8 endpoints API)
│   │   └── Mail/
│   │       └── MFACodeMail.php ⭐ (Clase de email)
│   ├── resources/views/emails/
│   │   └── mfa-code.blade.php ⭐ (Template email)
│   ├── database/migrations/
│   │   └── ..._add_mfa_fields_to_users_table.php ⭐
│   └── routes/
│       └── api.php (8 rutas MFA agregadas)
│
├── FrontEndApp/ (React Native)
│   └── src/
│       ├── services/
│       │   └── mfaService.js ⭐ (Cliente API MFA)
│       ├── screens/
│       │   ├── MFAVerificationScreen.js ⭐ (Verificar código)
│       │   ├── MFASettingsScreen.js ⭐ (Configuración)
│       │   ├── LoginScreen.js (actualizado)
│       │   └── DashboardScreen.js (actualizado)
│       └── navigation/
│           └── AppNavigator.js (rutas agregadas)
│
└── Documentación/
    ├── MFA_IMPLEMENTATION_GUIDE.md ⭐
    ├── TESTING_COMMANDS.md ⭐
    ├── MFA_VISUAL_FLOW.md ⭐
    ├── MFA_COMPLETED.md ⭐
    ├── FINAL_CHECKLIST.md ⭐
    └── README_MFA.md (este archivo)
```

---

## 🚀 Inicio Rápido

### 1. Backend (Laravel)

```powershell
# Navegar al backend
cd "C:\Users\oimvf\Desktop\Proyecto DMI\BackEndApp"

# Iniciar servidor
php artisan serve

# (Opcional) Ver logs en tiempo real
Get-Content storage\logs\laravel.log -Wait -Tail 50
```

### 2. Frontend (React Native)

```powershell
# Navegar al frontend
cd "C:\Users\oimvf\Desktop\Proyecto DMI\FrontEndApp"

# Actualizar IP en mfaService.js (línea 9)
# Obtener tu IP:
ipconfig | findstr IPv4

# Editar: src/services/mfaService.js
# const API_BASE_URL = 'http://TU_IP:8000/api/v1';

# Iniciar app
npm start
```

### 3. Probar MFA

1. **Registrar usuario** → Crear cuenta nueva
2. **Dashboard** → Tap "🔐 Configurar MFA"
3. **Habilitar MFA** → Guardar los 8 códigos mostrados
4. **Cerrar sesión** → Hacer login nuevamente
5. **Verificar** → Revisar email en Mailtrap e ingresar código

---

## 📱 Pantallas Implementadas

### 1. MFAVerificationScreen
**Ruta:** `MFAVerification`

**Funcionalidad:**
- 6 inputs para código de verificación
- Auto-focus y auto-verificación
- Botón de reenvío con countdown
- Opción de código de respaldo
- Manejo de errores y bloqueo

**Props recibidos:**
- `email` - Email del usuario para verificación

### 2. MFASettingsScreen
**Ruta:** `MFASettings`

**Funcionalidad:**
- Ver estado actual de MFA
- Habilitar/Deshabilitar MFA
- Ver códigos de respaldo
- Regenerar códigos
- Copiar códigos al portapapeles

---

## 🔌 API Endpoints

Base URL: `http://localhost:8000/api/v1/auth-mfa`

### Públicos (sin autenticación)

#### 1. Login con MFA
```http
POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Respuesta si MFA habilitado:**
```json
{
  "requires_mfa": true,
  "message": "Código de verificación enviado",
  "expires_in": 300
}
```

**Respuesta si MFA deshabilitado:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJh...",
  "user": { ... }
}
```

#### 2. Verificar Código MFA
```http
POST /verify-mfa
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

#### 3. Verificar Código de Respaldo
```http
POST /verify-backup-code
Content-Type: application/json

{
  "email": "user@example.com",
  "backup_code": "A1B2C3D4"
}
```

#### 4. Reenviar Código
```http
POST /resend-code
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Protegidos (requieren Bearer Token)

#### 5. Habilitar MFA
```http
POST /enable-mfa
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "message": "MFA habilitado",
  "backup_codes": ["A1B2C3D4", "E5F6G7H8", ...],
  "user": { ... }
}
```

#### 6. Deshabilitar MFA
```http
POST /disable-mfa
Authorization: Bearer {token}
```

#### 7. Regenerar Códigos de Respaldo
```http
POST /regenerate-backup-codes
Authorization: Bearer {token}
```

#### 8. Estado MFA
```http
GET /mfa-status
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "mfa_enabled": true,
  "mfa_enabled_at": "2025-10-14T10:30:00.000000Z",
  "has_backup_codes": true
}
```

---

## 📧 Configuración de Email

### Mailtrap (Testing)

Configurado en `.env`:
```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=8c44bd0f43776f
MAIL_PASSWORD=***************
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@dmi-app.com"
MAIL_FROM_NAME="${APP_NAME}"
```

**Ver emails:**
https://mailtrap.io/inboxes

**Características:**
- ✅ 100% GRATIS para testing
- ✅ Emails ilimitados
- ✅ No llegan a usuarios reales
- ✅ Vista previa en web
- ✅ Debugging completo

---

## 🗄️ Base de Datos

### Tabla: users

**Campos MFA agregados:**
```sql
mfa_enabled         BOOLEAN      DEFAULT false
mfa_backup_codes    TEXT         NULL (JSON hasheado)
mfa_enabled_at      TIMESTAMP    NULL
```

### Cache

**Estructura:**
```
Key: mfa_code_{user_id}
Value: "123456"
TTL: 5 minutos
```

---

## 🔒 Seguridad Implementada

### Backend
1. **Códigos aleatorios:** `sprintf("%06d", mt_rand(1, 999999))`
2. **Hasheado SHA-256:** Para códigos de respaldo
3. **Rate limiting:** Máximo 5 intentos por sesión
4. **Expiración:** Códigos inválidos después de 5 minutos
5. **Uso único:** Códigos de respaldo eliminados después de uso
6. **Bloqueo temporal:** Después de 5 intentos fallidos

### Frontend
1. **Validación de input:** Solo números en código
2. **Token seguro:** Guardado en AsyncStorage cifrado
3. **Navegación protegida:** Requiere token válido
4. **Timeouts:** Prevención de requests infinitos

---

## 🧪 Testing

### Casos de Prueba Principales

1. ✅ **Flujo Normal**
   - Habilitar MFA → Recibir códigos → Login → Verificar

2. ✅ **Código de Respaldo**
   - Login → Usar código de respaldo → Verificar uso único

3. ✅ **Reenvío de Código**
   - Login → Reenviar código → Verificar nuevo código

4. ✅ **Expiración**
   - Login → Esperar 6 min → Error de expiración

5. ✅ **Bloqueo**
   - Login → 5 códigos incorrectos → Bloqueo

6. ✅ **Regeneración**
   - Regenerar códigos → Códigos antiguos inválidos

### Ver Checklist Completo
`FINAL_CHECKLIST.md`

---

## 📚 Documentación Adicional

| Archivo | Descripción |
|---------|-------------|
| `MFA_IMPLEMENTATION_GUIDE.md` | Guía técnica completa |
| `TESTING_COMMANDS.md` | Comandos PowerShell y cURL |
| `MFA_VISUAL_FLOW.md` | Diagramas de flujo visual |
| `MFA_COMPLETED.md` | Resumen de implementación |
| `FINAL_CHECKLIST.md` | Checklist de testing |

---

## 🐛 Troubleshooting

### Error: "Network Error"
**Causa:** Backend no accesible  
**Solución:**
1. Verificar que Laravel esté corriendo: `php artisan serve`
2. Actualizar IP en `mfaService.js`
3. Verificar firewall

### Error: "No llega el email"
**Causa:** Configuración SMTP incorrecta  
**Solución:**
1. Verificar credenciales en `.env`
2. Ver logs: `storage/logs/laravel.log`
3. Verificar inbox en Mailtrap

### Error: "Código siempre inválido"
**Causa:** Desfase de tiempo o cache  
**Solución:**
```powershell
php artisan cache:clear
```

### Error: "Cannot find module clipboard"
**Causa:** Dependencia no instalada  
**Solución:**
```powershell
cd FrontEndApp
npm install @react-native-clipboard/clipboard
```

---

## 🎯 Próximas Mejoras (Opcional)

- [ ] MFA con SMS (Twilio)
- [ ] MFA con Google Authenticator (TOTP)
- [ ] Biometría como segundo factor
- [ ] Dispositivos confiables (remember device)
- [ ] Historial de accesos
- [ ] Geolocalización de intentos
- [ ] Notificaciones push

---

## 📞 Soporte

**Logs Backend:**
```powershell
cd BackEndApp
Get-Content storage\logs\laravel.log -Wait -Tail 50
```

**Debugging Laravel:**
```powershell
php artisan tinker
Cache::get('mfa_code_1');
User::where('mfa_enabled', true)->get();
exit
```

**Ver Rutas:**
```powershell
php artisan route:list --path=auth-mfa
```

---

## 📊 Estado del Proyecto

```
✅ Backend:   100% Completo
✅ Frontend:  100% Completo
✅ Docs:      100% Completo
⏳ Testing:   Pendiente
⏳ Deploy:    Pendiente
```

---

## 🏆 Créditos

**Desarrollado para:** Proyecto DMI  
**Fecha:** 14 de Octubre, 2025  
**Versión:** 1.0.0  
**Tecnologías:**
- Laravel 12
- React Native + Expo
- JWT Authentication
- Mailtrap SMTP

---

## 📄 Licencia

Este código es parte del proyecto DMI y está sujeto a sus términos de uso.

---

**¿Listo para probar?** 🚀

1. Actualiza la IP en `mfaService.js`
2. Inicia backend: `php artisan serve`
3. Inicia frontend: `npm start`
4. ¡Sigue el checklist en `FINAL_CHECKLIST.md`!

**¡Buena suerte! 🎉**
