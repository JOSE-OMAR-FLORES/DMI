# 📱 MFA Flow - Diagrama Visual

## 🔄 Flujo Completo de Autenticación Multi-Factor

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE AUTENTICACIÓN MFA                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│ LoginScreen  │  Usuario ingresa email y password
└──────┬───────┘
       │
       │ handleLogin()
       ▼
┌──────────────────┐
│ mfaService.login │  POST /api/v1/auth-mfa/login
│  (email, pass)   │
└──────┬───────────┘
       │
       ├────────────► ¿Usuario tiene MFA habilitado?
       │
       ├─[NO]──► { success: true, requiresMFA: false, token: "..." }
       │         │
       │         ▼
       │    ┌──────────────┐
       │    │  Dashboard   │  Login exitoso
       │    └──────────────┘
       │
       └─[SÍ]──► { success: true, requiresMFA: true }
                 │
                 │ Backend genera código 6 dígitos
                 │ Backend guarda en cache por 5 min
                 │ Backend envía email vía Mailtrap
                 │
                 ▼
          ┌──────────────────────┐
          │ MFAVerificationScreen│
          │  (email recibido)    │
          └──────┬───────────────┘
                 │
                 │ Usuario tiene 2 opciones:
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
┌─────────────┐      ┌──────────────────┐
│ OPCIÓN A:   │      │ OPCIÓN B:        │
│ Código Email│      │ Código Respaldo  │
└──────┬──────┘      └────────┬─────────┘
       │                      │
       │ Usuario abre email   │ Usuario busca código
       │ en Mailtrap          │ guardado al habilitar
       │                      │ MFA (8 caracteres hex)
       │                      │
       ▼                      ▼
┌───────────────┐    ┌─────────────────────┐
│ Ingresa 6     │    │ Ingresa 8 caracteres│
│ dígitos       │    │ (ej: A1B2C3D4)      │
└──────┬────────┘    └─────────┬───────────┘
       │                       │
       │ verifyMFACode()       │ verifyBackupCode()
       ▼                       ▼
┌────────────────┐    ┌──────────────────────┐
│ POST /verify-  │    │ POST /verify-backup- │
│     mfa        │    │      code            │
└──────┬─────────┘    └─────────┬────────────┘
       │                        │
       │ Backend verifica       │ Backend verifica hash
       │ cache                  │ en base de datos
       │                        │
       ├─[❌]─► Error, contador++  │
       │       ¿Intentos > 5?   │
       │       [SÍ]─► Bloqueado │
       │                        │
       └─[✅]─────────┬──────────┘
                     │
                     ▼
              ┌──────────────┐
              │ Token JWT    │
              │ guardado en  │
              │ AsyncStorage │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │  Dashboard   │  ✅ Login exitoso
              └──────────────┘

```

---

## ⚙️ Configuración de MFA

```
┌──────────────┐
│  Dashboard   │  Usuario autenticado
└──────┬───────┘
       │
       │ Tap "🔐 Configurar MFA"
       ▼
┌──────────────────┐
│ MFASettingsScreen│
│                  │
│ Estado: ❌ Des-  │
│        habilitado│
└──────┬───────────┘
       │
       │ Tap "🔐 Habilitar MFA"
       │ Confirmación Alert
       ▼
┌──────────────────┐
│ POST /enable-mfa │
└──────┬───────────┘
       │
       │ Backend:
       │ - Marca mfa_enabled = true
       │ - Genera 8 códigos de respaldo
       │ - Hashea códigos (SHA-256)
       │ - Guarda en BD
       │
       ▼
┌───────────────────────────────┐
│ Modal con 8 códigos:          │
│                               │
│ 1. A1B2C3D4                   │
│ 2. E5F6G7H8                   │
│ 3. I9J0K1L2                   │
│ 4. M3N4O5P6                   │
│ 5. Q7R8S9T0                   │
│ 6. U1V2W3X4                   │
│ 7. Y5Z6A7B8                   │
│ 8. C9D0E1F2                   │
│                               │
│ ⚠️ IMPORTANTE:                │
│ Guarda estos códigos en un    │
│ lugar seguro. Cada código     │
│ solo puede usarse UNA VEZ.    │
│                               │
│ [📋 Copiar Todos]             │
│ [He guardado mis códigos]     │
└───────────────────────────────┘

```

---

## 📧 Flujo de Email (Mailtrap)

```
┌─────────────────────┐
│ Usuario hace login  │
│ con MFA habilitado  │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────────┐
│ LaravelMFAService.php            │
│ generateVerificationCode()       │
│ → Genera: "483921"               │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Cache::put('mfa_code_1',         │
│            '483921',              │
│            5 minutos)             │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Mail::send(new MFACodeMail())    │
│                                  │
│ Envía a: test@example.com        │
│ Asunto: "Código de Verificación" │
└──────────┬───────────────────────┘
           │
           │ SMTP a Mailtrap
           ▼
┌──────────────────────────────────┐
│ Mailtrap Intercepta Email        │
│ (NO llega a test@example.com)    │
│                                  │
│ ✅ Visible en:                   │
│ https://mailtrap.io/inboxes      │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Email renderizado:               │
│ ┌──────────────────────────────┐ │
│ │ Código de Verificación MFA   │ │
│ │                              │ │
│ │ Hola Test User,              │ │
│ │                              │ │
│ │ Tu código de verificación:   │ │
│ │                              │ │
│ │   ╔════════════════════╗     │ │
│ │   ║   4  8  3  9  2  1 ║     │ │
│ │   ╚════════════════════╝     │ │
│ │                              │ │
│ │ Expira en 5 minutos          │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘

```

---

## 🔒 Seguridad - Códigos de Respaldo

```
┌─────────────────────────────────────┐
│ Generación (al habilitar MFA)       │
└─────────────────────────────────────┘

Texto Plano         Hasheado (BD)
───────────         ─────────────
A1B2C3D4     →     e4d909c290d0fb1ca068ffaddf22cbd0
E5F6G7H8     →     5f4dcc3b5aa765d61d8327deb882cf99
I9J0K1L2     →     098f6bcd4621d373cade4e832627b4f6
...              ...

Usuario guarda      Backend guarda
los 8 códigos      solo los hashes


┌─────────────────────────────────────┐
│ Verificación (al usar código)       │
└─────────────────────────────────────┘

1. Usuario ingresa: "A1B2C3D4"
2. Backend hashea:  hash('sha256', 'A1B2C3D4')
3. Backend compara con BD:
   ¿hash existe en mfa_backup_codes?
   
   [SÍ] → ✅ Código válido
        → Eliminar ese hash de BD
        → Generar JWT token
        → Login exitoso
        
   [NO] → ❌ Código inválido
        → Mostrar error
        → Código ya fue usado o no existe

```

---

## 🎯 Componentes de UI

```
┌─────────────────────────────────────────────────────┐
│          MFAVerificationScreen.js                   │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  🔐 Verificación MFA                          │ │
│  │                                               │ │
│  │  Código enviado a: test@example.com           │ │
│  │                                               │ │
│  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐        │ │
│  │  │ 4 │ │ 8 │ │ 3 │ │ 9 │ │ 2 │ │ 1 │        │ │
│  │  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘        │ │
│  │                                               │ │
│  │  [  Verificar Código  ]                      │ │
│  │                                               │ │
│  │  📧 Reenviar código (disponible en 30s)      │ │
│  │  🔑 Usar código de respaldo                  │ │
│  │  Cancelar                                    │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│          MFASettingsScreen.js                       │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  🔐 Autenticación Multi-Factor                │ │
│  │                                               │ │
│  │  Estado: ✅ Habilitado                        │ │
│  │  Habilitado el: 14/10/2025                   │ │
│  │                                               │ │
│  │  ¿Qué es MFA?                                │ │
│  │  La autenticación multi-factor añade una     │ │
│  │  capa extra de seguridad...                  │ │
│  │                                               │ │
│  │  ✨ Beneficios:                               │ │
│  │  🔒 Mayor seguridad                          │ │
│  │  🛡️ Protección contra accesos no autorizados│ │
│  │  📧 Notificación de intentos de acceso       │ │
│  │                                               │ │
│  │  [ 🔄 Regenerar Códigos de Respaldo ]        │ │
│  │  [ ⚠️ Deshabilitar MFA ]                     │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘

```

---

## 📊 Estados y Transiciones

```
Usuario sin MFA
  │
  │ enableMFA()
  ▼
Usuario con MFA (login normal)
  │
  │ login()
  ▼
Código enviado por email
  │
  ├─ verifyMFACode() ──► ✅ Dashboard
  │
  ├─ verifyBackupCode() ──► ✅ Dashboard
  │                          │
  │                          ▼
  │                     codesRemaining--
  │
  └─ 5 intentos fallidos ──► ❌ Bloqueado
                              │
                              └─ verifyBackupCode() ──► ✅ Desbloqueado

```

---

## 🔑 Endpoints API Usados

```
Backend: http://localhost:8000/api/v1/auth-mfa/

POST   /login                  → Login con MFA
POST   /verify-mfa             → Verificar código 6 dígitos
POST   /verify-backup-code     → Verificar código respaldo
POST   /enable-mfa             → Habilitar MFA (requiere auth)
POST   /disable-mfa            → Deshabilitar MFA (requiere auth)
POST   /regenerate-backup-codes→ Nuevos códigos (requiere auth)
GET    /mfa-status             → Estado MFA (requiere auth)
POST   /resend-code            → Reenviar código
```

---

**Última actualización:** 14 de Octubre, 2025
