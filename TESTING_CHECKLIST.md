# ✅ Checklist de Pruebas - Sistema de Privacidad

**Fecha:** 16 de octubre de 2025  
**Estado Backend:** ✅ Corriendo en http://127.0.0.1:8000  
**Estado Frontend:** ✅ Metro Bundler en puerto 8082

---

## 🎯 Instrucciones de Prueba

### Preparación Inicial

1. **Escanea el QR** en Expo Go (tu dispositivo móvil)
2. **Espera** a que la app cargue completamente
3. **Login** con un usuario existente (o crea uno nuevo)

---

## 📱 PRUEBA 1: Navegación al Dashboard

**Objetivo:** Verificar que el botón de Privacidad aparece

### Pasos:
1. [ ] Login exitoso
2. [ ] Dashboard carga correctamente
3. [ ] Verifica que aparecen 3 tarjetas:
   - [ ] 📝 Mi TODO List
   - [ ] 🔐 Seguridad MFA
   - [ ] 🔒 **Privacidad** ← NUEVA

**¿Ves la tarjeta de Privacidad?**
- ✅ SÍ → Continúa a Prueba 2
- ❌ NO → Revisa logs de Metro Bundler

---

## 📱 PRUEBA 2: Acceder a Gestión de Privacidad

**Objetivo:** Navegar a la pantalla de consentimientos

### Pasos:
1. [ ] Click en la tarjeta **🔒 Privacidad**
2. [ ] Espera a que cargue `ConsentManagementScreen`
3. [ ] Verifica que aparece:
   - [ ] Header azul: "🔒 Privacidad y Consentimientos"
   - [ ] Estadística: "X de 7 propósitos activos"
   - [ ] Sección CCPA/CPRA con botón naranja
   - [ ] 7 switches de consentimientos
   - [ ] Sección de historial

**¿Carga la pantalla correctamente?**
- ✅ SÍ → Continúa a Prueba 3
- ❌ NO → Revisa Metro logs, busca errores

---

## 📱 PRUEBA 3: Ver Estado Inicial de Consentimientos

**Objetivo:** Verificar valores por defecto

### Estado Esperado:
- [ ] ✅ **Essential** - ON (switch deshabilitado)
- [ ] ❌ **Analytics** - OFF
- [ ] ❌ **Personalization** - OFF
- [ ] ❌ **Marketing** - OFF
- [ ] ❌ **Third Party Sharing** - OFF
- [ ] ❌ **Location** - OFF
- [ ] ❌ **Profiling** - OFF

### Estadística Esperada:
**"1 de 7 propósitos activos"** (solo Essential)

**¿Estado correcto?**
- ✅ SÍ → Continúa a Prueba 4
- ❌ NO → Puede que ya tengas consentimientos guardados (normal)

---

## 📱 PRUEBA 4: Activar Analytics

**Objetivo:** Cambiar un consentimiento y verificar guardado

### Pasos:
1. [ ] Toca el switch de **📊 Análisis y Mejoras** (Analytics)
2. [ ] Switch cambia a ON (verde)
3. [ ] Espera 2 segundos
4. [ ] Debe aparecer Alert: **"✅ Preferencia Actualizada"**
5. [ ] Mensaje: "Has activado Análisis y Mejoras"
6. [ ] Toca **OK** en el Alert

### Verificaciones:
- [ ] Switch permanece ON
- [ ] Estadística cambia a: **"2 de 7 propósitos activos"**
- [ ] En historial aparece nueva entrada

**¿Funcionó correctamente?**
- ✅ SÍ → Continúa a Prueba 5
- ❌ NO → Revisa:
  - Metro logs para errores
  - Backend logs (Terminal PHP)
  - Conexión a 192.168.1.73:8000

---

## 📱 PRUEBA 5: Activar Múltiples Consentimientos

**Objetivo:** Activar varios switches

### Pasos:
1. [ ] Activa **🎨 Personalización**
2. [ ] Espera confirmación
3. [ ] Activa **📢 Marketing**
4. [ ] Espera confirmación
5. [ ] Activa **📍 Ubicación**
6. [ ] Espera confirmación

### Resultado Esperado:
- [ ] Estadística: **"5 de 7 propósitos activos"**
- [ ] Todos los switches activados permanecen ON
- [ ] Historial muestra 4 cambios (Analytics + 3 nuevos)

**¿Todos los cambios se guardaron?**
- ✅ SÍ → Continúa a Prueba 6
- ❌ NO → Revisa backend

---

## 📱 PRUEBA 6: Intentar Desactivar Essential

**Objetivo:** Verificar que Essential no se puede desactivar

### Pasos:
1. [ ] Toca el switch de **✅ Funcionalidades Esenciales**
2. [ ] Debe aparecer Alert:
   - Título: **"No se puede desactivar"**
   - Mensaje: "Las funcionalidades esenciales son necesarias..."
3. [ ] Toca **OK**
4. [ ] Switch permanece ON

**¿Alert apareció correctamente?**
- ✅ SÍ → Continúa a Prueba 7
- ❌ NO → Revisa código de ConsentManagementScreen

---

## 📱 PRUEBA 7: CCPA "Do Not Sell"

**Objetivo:** Activar protección CCPA

### Pasos:
1. [ ] Scroll hacia arriba
2. [ ] Localiza sección **🛡️ California Privacy Rights (CCPA/CPRA)**
3. [ ] Botón debe decir: **"Do Not Sell My Personal Information"**
4. [ ] Toca el botón
5. [ ] Aparece Alert de confirmación
6. [ ] Selecciona **"No Vender"**
7. [ ] Botón cambia a: **"✅ No Vender Mis Datos (Activo)"**
8. [ ] Botón ahora es verde

**¿Cambió el estado correctamente?**
- ✅ SÍ → Continúa a Prueba 8
- ❌ NO → Revisa logs

---

## 📱 PRUEBA 8: Ver Historial de Cambios

**Objetivo:** Verificar que se registran los cambios

### Pasos:
1. [ ] Scroll hasta sección **"Historial Reciente"**
2. [ ] Verifica que aparecen entradas como:
   - "Consent granted for analytics"
   - "Consent granted for personalization"
   - "Consent granted for marketing"
   - Con timestamps recientes

**¿Historial visible?**
- ✅ SÍ → Continúa a Prueba 9
- ❌ NO → Puede que aún no se sincronice con backend

---

## 📱 PRUEBA 9: Pull to Refresh

**Objetivo:** Recargar datos desde backend

### Pasos:
1. [ ] Scroll hasta arriba de todo
2. [ ] Arrastra hacia abajo (Pull to Refresh)
3. [ ] Debe aparecer spinner de carga
4. [ ] Datos se recargan
5. [ ] Switches mantienen su estado

**¿Refresh funcionó?**
- ✅ SÍ → Continúa a Prueba 10
- ❌ NO → Normal si backend no está sincronizado aún

---

## 📱 PRUEBA 10: Navegar a Política de Privacidad

**Objetivo:** Ver política completa

### Pasos:
1. [ ] Scroll hasta botones de acción
2. [ ] Toca **"📜 Ver Política de Privacidad"**
3. [ ] Navega a nueva pantalla
4. [ ] Header azul: **"📜 Política de Privacidad"**
5. [ ] Versión 2.0 visible
6. [ ] Última actualización: "15 de octubre de 2025"
7. [ ] Scroll funciona, 14 secciones visibles

### Secciones a verificar:
- [ ] 1. Introducción
- [ ] 2. Responsable del Tratamiento
- [ ] 3. Información que Recopilamos
- [ ] 8. Tus Derechos (GDPR)
- [ ] 9. Tus Derechos (CCPA/CPRA)
- [ ] 14. Contacto

**¿Política completa visible?**
- ✅ SÍ → Continúa a Prueba 11
- ❌ NO → Revisa imports en PrivacyPolicyScreen

---

## 📱 PRUEBA 11: Volver y Verificar Persistencia

**Objetivo:** Confirmar que datos persisten

### Pasos:
1. [ ] Presiona **← Atrás** (header)
2. [ ] Vuelves a ConsentManagementScreen
3. [ ] Verifica que switches mantienen su estado:
   - Essential: ON
   - Analytics: ON
   - Personalization: ON
   - Marketing: ON
   - Location: ON
   - Others: OFF (según lo que activaste)

**¿Estado persiste?**
- ✅ SÍ → Continúa a Prueba 12
- ❌ NO → Problema con SecureStore

---

## 📱 PRUEBA 12: Revocar un Consentimiento

**Objetivo:** Desactivar un consentimiento previamente activo

### Pasos:
1. [ ] Desactiva **📢 Marketing** (OFF)
2. [ ] Espera confirmación
3. [ ] Alert: "Has desactivado Marketing"
4. [ ] Switch queda OFF
5. [ ] Estadística disminuye en 1

**¿Revocación exitosa?**
- ✅ SÍ → Continúa a Prueba 13
- ❌ NO → Revisa backend logs

---

## 📱 PRUEBA 13: Descargar Reporte

**Objetivo:** Generar reporte de consentimientos

### Pasos:
1. [ ] Scroll hasta botones
2. [ ] Toca **"📊 Descargar Reporte de Consentimientos"**
3. [ ] Aparece Alert con estadísticas:
   - "Total de consentimientos: X"
   - "Historial de cambios: Y"
4. [ ] Toca **OK**

**¿Reporte generado?**
- ✅ SÍ → Continúa a Prueba 14
- ❌ NO → Revisa ConsentManagementService

---

## 📱 PRUEBA 14: Salir y Volver a Entrar

**Objetivo:** Verificar persistencia tras cerrar app

### Pasos:
1. [ ] Presiona **← Atrás** hasta Dashboard
2. [ ] Toca **"Cerrar Sesión"**
3. [ ] Vuelve a hacer **Login**
4. [ ] Ve a **Privacidad** de nuevo
5. [ ] Verifica que todos los switches mantienen su estado

**¿Datos persisten tras re-login?**
- ✅ SÍ → ¡Perfecto! Sistema funcional
- ❌ NO → Datos solo en memoria, no en backend

---

## 🔧 PRUEBAS DE BACKEND (Opcional - Avanzado)

Si quieres verificar que el backend funciona correctamente, necesitas obtener tu JWT token.

### Obtener Token JWT:

1. Login en la app
2. Revisa Metro logs, busca algo como:
```
Token guardado: eyJ0eXAiOiJKV1QiLCJhbGc...
```
3. Copia ese token

### Test Backend con PowerShell:

```powershell
# Guardar token en variable
$token = "eyJ0eXAiOiJKV1QiLCJhbGc..."

# Test 1: Obtener consentimientos
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/privacy/consent" -Method GET -Headers $headers

# Test 2: Guardar consentimientos
$body = @{
    consents = @(
        @{ purpose = "analytics"; granted = $true }
        @{ purpose = "marketing"; granted = $true }
    )
    method = "explicit_ui"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/privacy/consent" -Method POST -Headers $headers -Body $body

# Test 3: Solicitar datos (GDPR Art. 15)
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/privacy/data" -Method GET -Headers $headers
```

---

## 📊 Resultados Esperados

### ✅ Todo Funcional:
- [x] Navegación fluida
- [x] Switches cambian de estado
- [x] Confirmaciones aparecen
- [x] CCPA button funciona
- [x] Historial visible
- [x] Política de privacidad completa
- [x] Persistencia de datos
- [x] Backend responde correctamente

### ⚠️ Problemas Comunes:

**"Cannot connect to backend"**
→ Verifica que Laravel esté en http://127.0.0.1:8000
→ Verifica IP en código (debe ser tu IP local)

**"Unauthorized (401)"**
→ Token expirado, re-login necesario

**Switches no cambian**
→ Revisa Metro logs para errores de red
→ Verifica que endpoint `/privacy/consent` existe

**Datos no persisten**
→ Backend puede no estar guardando correctamente
→ Revisa tabla `user_consents` en MySQL

---

## 🎉 ¡Pruebas Completadas!

Si todas las pruebas pasaron: **¡SISTEMA FUNCIONAL!**

**Próximos pasos:**
1. Push a GitHub
2. Merge a main
3. Deploy a producción
4. Documentar para usuario final

---

**Tester:** _________________  
**Fecha:** 16/10/2025  
**Estado:** [ ] PASS [ ] FAIL  
**Notas:** _________________
