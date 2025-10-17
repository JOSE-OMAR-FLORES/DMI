# 🧪 Guía de Testing - Sistema de Privacidad y Cumplimiento

**Fecha:** 15 de octubre de 2025  
**Versión:** 1.0

---

## 📋 Índice

1. [Preparación del Entorno](#1-preparación-del-entorno)
2. [Testing de Frontend](#2-testing-de-frontend)
3. [Testing de Backend](#3-testing-de-backend)
4. [Testing de Flujos Completos](#4-testing-de-flujos-completos)
5. [Casos de Prueba](#5-casos-de-prueba)

---

## 1. Preparación del Entorno

### Backend (Laravel)

```bash
# Verificar migraciones ejecutadas
cd BackEndApp
php artisan migrate:status

# Las siguientes tablas deben estar presentes:
# ✅ user_consents
# ✅ consent_history
# ✅ privacy_rights_requests
# ✅ processing_activities

# Iniciar servidor Laravel
php artisan serve
# Debe estar corriendo en http://127.0.0.1:8000
```

### Frontend (React Native)

```bash
# Instalar dependencias (si es necesario)
cd FrontEndApp
npm install

# Verificar que las nuevas pantallas estén importadas
# - ConsentDialogScreen.js
# - PrivacyPolicyScreen.js
# - ConsentManagementScreen.js

# Iniciar Metro Bundler
npx expo start

# Escanear QR con Expo Go (Android/iOS)
```

### Verificar API URL

Asegúrate de que `API_URL` en el frontend apunte a tu IP local:

```javascript
// FrontEndApp/src/screens/TodoListScreen.js (y otros)
const API_URL = 'http://192.168.1.73:8000/api/v1'; // Tu IP local
```

---

## 2. Testing de Frontend

### Test 1: Navegación a Pantallas

1. **Login** con un usuario existente
2. **Dashboard** → Debe aparecer tarjeta "🔒 Privacidad"
3. Click en **Privacidad** → Debe navegar a `ConsentManagementScreen`
4. Verificar que se cargan los switches de consentimientos

**Resultado Esperado:**
- ✅ Navegación fluida sin errores
- ✅ Pantalla de gestión de consentimientos cargada
- ✅ Switches visibles (7 propósitos)

---

### Test 2: Guardar Consentimientos Iniciales

1. Desde `ConsentManagementScreen`, modificar switches:
   - **Analytics:** OFF → ON
   - **Marketing:** OFF → ON
   - **Location:** OFF → ON

2. Verificar que aparece confirmación

**Logs Esperados en Consola:**
```
📝 Actividad de tratamiento registrada: consent_granted
✅ Preferencia Actualizada
```

**Resultado Esperado:**
- ✅ Switches cambian de estado
- ✅ Alert de confirmación aparece
- ✅ Datos guardados en SecureStore

---

### Test 3: CCPA "Do Not Sell"

1. En `ConsentManagementScreen`
2. Sección **CCPA/CPRA**
3. Click en botón **"Do Not Sell My Personal Information"**
4. Confirmar en el Alert

**Resultado Esperado:**
- ✅ Alert de confirmación aparece
- ✅ Botón cambia a "✅ No Vender Mis Datos (Activo)"
- ✅ Estado guardado

---

### Test 4: Ver Política de Privacidad

1. Desde `ConsentManagementScreen`
2. Click en **"📜 Ver Política de Privacidad"**
3. Navega a `PrivacyPolicyScreen`

**Resultado Esperado:**
- ✅ Navegación exitosa
- ✅ Scroll funciona
- ✅ 14 secciones visibles
- ✅ Versión 2.0 mostrada

---

### Test 5: Historial de Cambios

1. En `ConsentManagementScreen`
2. Sección **Historial Reciente**
3. Verificar últimos 5 cambios

**Resultado Esperado:**
- ✅ Cambios listados con timestamps
- ✅ Acciones descriptivas ("Consent granted for analytics")

---

## 3. Testing de Backend

### Test 1: Guardar Consentimientos (API)

**Endpoint:** `POST /api/privacy/consent`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "consents": [
    {"purpose": "analytics", "granted": true},
    {"purpose": "marketing", "granted": true},
    {"purpose": "location", "granted": false}
  ],
  "method": "explicit_ui",
  "version": "2.0"
}
```

**Comando curl:**
```bash
curl -X POST http://127.0.0.1:8000/api/privacy/consent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "consents": [
      {"purpose": "analytics", "granted": true},
      {"purpose": "marketing", "granted": true}
    ],
    "method": "explicit_ui"
  }'
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Consentimientos guardados correctamente"
}
```

**Verificar en Base de Datos:**
```sql
SELECT * FROM user_consents WHERE user_id = 1;
SELECT * FROM consent_history WHERE user_id = 1;
SELECT * FROM processing_activities WHERE user_id = 1;
```

---

### Test 2: Obtener Consentimientos

**Endpoint:** `GET /api/privacy/consent`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Comando curl:**
```bash
curl -X GET http://127.0.0.1:8000/api/privacy/consent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "consents": {
    "essential": true,
    "analytics": true,
    "personalization": false,
    "marketing": true,
    "third_party_sharing": false,
    "location": false,
    "profiling": false
  }
}
```

---

### Test 3: Solicitar Datos (GDPR Art. 15)

**Endpoint:** `GET /api/privacy/data`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Comando curl:**
```bash
curl -X GET http://127.0.0.1:8000/api/privacy/data \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Test User",
      "email": "test@example.com",
      "role": "user"
    },
    "todos": [...],
    "consents": [...],
    "consent_history": [...],
    "processing_activities": [...]
  },
  "generated_at": "2025-10-15T12:00:00Z"
}
```

**Verificar en Base de Datos:**
```sql
SELECT * FROM privacy_rights_requests 
WHERE user_id = 1 AND request_type = 'right_of_access';
```

---

### Test 4: CCPA Do Not Sell

**Endpoint:** `POST /api/privacy/do-not-sell`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Comando curl:**
```bash
curl -X POST http://127.0.0.1:8000/api/privacy/do-not-sell \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Preferencia \"Do Not Sell\" guardada"
}
```

**Verificar en Base de Datos:**
```sql
SELECT * FROM user_consents 
WHERE user_id = 1 AND purpose = 'third_party_sharing';
-- Debe tener granted = 0 (false)

SELECT * FROM privacy_rights_requests 
WHERE user_id = 1 AND request_type = 'ccpa_do_not_sell';
```

---

### Test 5: Exportar Datos (GDPR Art. 20)

**Endpoint:** `GET /api/privacy/export`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Comando curl:**
```bash
curl -X GET http://127.0.0.1:8000/api/privacy/export \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o user_data_export.json
```

**Resultado Esperado:**
- ✅ Archivo JSON descargado
- ✅ Formato legible por máquina
- ✅ Solicitud registrada en `privacy_rights_requests`

---

### Test 6: Eliminar Datos (GDPR Art. 17)

⚠️ **PRECAUCIÓN:** Este test ELIMINA datos permanentemente

**Endpoint:** `DELETE /api/privacy/data`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Comando curl:**
```bash
curl -X DELETE http://127.0.0.1:8000/api/privacy/data \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Datos eliminados correctamente"
}
```

**Verificar en Base de Datos:**
```sql
-- Usuario debe estar soft-deleted
SELECT * FROM users WHERE id = 1;
-- email debe ser: deleted_1@deleted.local

-- Datos del usuario eliminados
SELECT COUNT(*) FROM todos WHERE user_id = 1; -- 0
SELECT COUNT(*) FROM user_consents WHERE user_id = 1; -- 0
```

---

## 4. Testing de Flujos Completos

### Flujo 1: Primera Vez en la App (Onboarding)

**Objetivo:** Verificar que el usuario ve el diálogo de consentimiento

1. **Registro** de nuevo usuario
2. **Login** exitoso
3. **MFA Verificación** (si aplica)
4. **Dashboard** aparece
5. Click en **Privacidad**
6. `ConsentDialogScreen` debe aparecer (si es primera vez)
7. Usuario selecciona preferencias
8. Click **"Confirmar Selección"**
9. Navega a Dashboard

**Resultado Esperado:**
- ✅ Flujo completo sin errores
- ✅ Consentimientos guardados
- ✅ Usuario puede usar la app

---

### Flujo 2: Modificar Preferencias

1. **Dashboard** → **Privacidad**
2. `ConsentManagementScreen` carga
3. Modificar switches:
   - Analytics: ON
   - Marketing: OFF
4. Verificar Alert de confirmación
5. Pull-to-refresh para recargar
6. Verificar que cambios persisten

**Resultado Esperado:**
- ✅ Cambios guardados correctamente
- ✅ Historial actualizado
- ✅ Switches reflejan estado actual

---

### Flujo 3: Ejercer Derecho de Acceso (GDPR)

1. **ConsentManagementScreen**
2. Click **"📊 Descargar Reporte de Consentimientos"**
3. Verificar Alert con estadísticas
4. Backend registra solicitud
5. Usuario puede exportar JSON

**Resultado Esperado:**
- ✅ Reporte generado
- ✅ Solicitud registrada (30 días deadline)
- ✅ Datos completos en respuesta

---

### Flujo 4: CCPA Opt-Out Completo

1. **ConsentManagementScreen**
2. Sección **CCPA/CPRA**
3. Click **"Do Not Sell My Personal Information"**
4. Confirmar Alert
5. Botón cambia a estado activo
6. Backend actualiza `third_party_sharing` = false
7. Refresh para verificar persistencia

**Resultado Esperado:**
- ✅ Estado guardado
- ✅ UI actualizada
- ✅ Backend sincronizado

---

## 5. Casos de Prueba

### Caso 1: Usuario Sin Consentimientos Previos

**Precondición:** Usuario nuevo, nunca dio consentimientos

**Pasos:**
1. Login
2. Navegar a Privacidad
3. Verificar estado inicial

**Resultado Esperado:**
- Essential: ✅ ON (no desactivable)
- Todos los demás: ❌ OFF

---

### Caso 2: Usuario Revoca Todos los Consentimientos

**Precondición:** Usuario con todos los consentimientos activos

**Pasos:**
1. Privacidad
2. Desactivar todos los switches (excepto Essential)
3. Verificar confirmaciones

**Resultado Esperado:**
- Solo Essential queda activo
- Historial registra todas las revocaciones
- Backend actualiza timestamps `revoked_at`

---

### Caso 3: Múltiples Cambios en Sesión Corta

**Precondición:** Usuario activo

**Pasos:**
1. Activar Analytics
2. Esperar 2 segundos
3. Desactivar Analytics
4. Esperar 2 segundos
5. Activar Analytics nuevamente
6. Ver historial

**Resultado Esperado:**
- 3 entradas en historial
- Timestamps diferentes
- Estado final: Analytics ON

---

### Caso 4: Offline → Online Sync

**Precondición:** Usuario con conexión intermitente

**Pasos:**
1. Desactivar WiFi/datos
2. Intentar cambiar consentimiento
3. Debe fallar con error
4. Reactivar conexión
5. Reintentar cambio

**Resultado Esperado:**
- Error manejado gracefully
- Retry exitoso cuando hay conexión
- Datos sincronizados

---

### Caso 5: Token Expirado Durante Operación

**Precondición:** Token JWT próximo a expirar

**Pasos:**
1. Esperar a que token expire (o forzar expiración)
2. Intentar guardar consentimiento
3. Debe fallar con 401 Unauthorized
4. Usuario debe re-login

**Resultado Esperado:**
- Error 401 capturado
- Usuario redirigido a Login
- Mensaje claro: "Sesión expirada"

---

## 📊 Checklist de Testing

### Frontend
- [ ] Navegación a ConsentManagementScreen
- [ ] Switches cambian de estado
- [ ] Confirmaciones aparecen
- [ ] CCPA button funcional
- [ ] Historial se muestra
- [ ] Pull-to-refresh funciona
- [ ] Navegación a PrivacyPolicy
- [ ] Scroll en PrivacyPolicy

### Backend
- [ ] POST /privacy/consent guarda correctamente
- [ ] GET /privacy/consent retorna datos
- [ ] GET /privacy/data retorna todo
- [ ] DELETE /privacy/data elimina (soft delete)
- [ ] POST /privacy/do-not-sell funciona
- [ ] GET /privacy/export genera JSON
- [ ] Migraciones ejecutadas sin errores
- [ ] Tablas creadas correctamente

### Base de Datos
- [ ] user_consents: Registros insertados
- [ ] consent_history: Cambios loggeados
- [ ] privacy_rights_requests: Solicitudes registradas
- [ ] processing_activities: Actividades loggeadas
- [ ] Índices creados correctamente

### Integración
- [ ] Frontend → Backend: Consentimientos
- [ ] Frontend → Backend: Solicitudes de derechos
- [ ] Errores manejados gracefully
- [ ] Tokens JWT funcionan
- [ ] RBAC no interfiere (todos los roles pueden acceder)

---

## 🐛 Troubleshooting

### Error: "Cannot connect to backend"

**Solución:**
```bash
# Verificar que Laravel esté corriendo
cd BackEndApp
php artisan serve

# Verificar IP en frontend
# Debe ser 192.168.1.73:8000 (tu IP local)
```

---

### Error: "Unauthorized" (401)

**Solución:**
```bash
# Re-login para obtener nuevo token
# Verificar que token esté en headers:
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

---

### Error: Migraciones fallan

**Solución:**
```bash
# Rollback y volver a migrar
php artisan migrate:rollback
php artisan migrate
```

---

### Error: Switches no cambian de estado

**Solución:**
1. Verificar logs en Metro Bundler
2. Verificar respuesta de API (Network tab)
3. Verificar que ConsentManagementService esté importado correctamente

---

## 📞 Contacto

**Para reportar bugs:**
- GitHub Issues: [repositorio]/issues
- Email: dev@tuapp.com

---

**Versión:** 1.0  
**Última Actualización:** 15 de octubre de 2025  
**Estado:** ✅ LISTO PARA TESTING
