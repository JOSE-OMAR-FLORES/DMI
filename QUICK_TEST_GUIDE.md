# 🚀 GUÍA RÁPIDA DE PRUEBA - MFA

## ✅ SERVIDORES INICIADOS

```
✅ Backend Laravel:  http://localhost:8000
✅ Frontend Expo:    Escaneando en tu terminal
✅ IP Configurada:   192.168.1.73
```

---

## 📱 PASO 1: CONECTAR TU DISPOSITIVO

### Opción A: Expo Go en tu móvil (RECOMENDADO)
1. Descarga "Expo Go" desde Play Store o App Store
2. Abre Expo Go
3. Escanea el QR que aparece en tu terminal
4. ¡Listo! La app se cargará automáticamente

### Opción B: Emulador Android
1. Abre Android Studio → AVD Manager
2. Inicia un emulador
3. En la terminal de Expo, presiona `a` (para Android)

### Opción C: Simulador iOS (solo Mac)
1. En la terminal de Expo, presiona `i` (para iOS)

---

## 🧪 PASO 2: PRUEBA EL FLUJO BÁSICO

### 2.1 Registro de Usuario
```
1. Tap en "Crear Nueva Cuenta"
2. Llenar formulario:
   - Nombre: Test User
   - Email: test@ejemplo.com
   - Contraseña: password123
3. Tap "Registrar"
4. ✅ Deberías ver el Dashboard
```

### 2.2 Habilitar MFA
```
1. En Dashboard, scroll hacia abajo
2. Tap en "🔐 Configurar Autenticación Multi-Factor"
3. Tap en "🔐 Habilitar MFA"
4. Confirmar en el diálogo
5. ✅ Aparece modal con 8 códigos de respaldo
6. Tap "📋 Copiar Todos"
7. Pega en Notas del móvil y GUARDA
8. Tap "He guardado mis códigos"
```

### 2.3 Probar Login con MFA
```
1. Tap en "Cerrar Sesión" (abajo del Dashboard)
2. Ingresar credenciales:
   - Email: test@ejemplo.com
   - Contraseña: password123
3. Tap "Iniciar Sesión"
4. ✅ Deberías ver pantalla de verificación MFA
```

### 2.4 Ver Email en Mailtrap
```
1. Abre navegador: https://mailtrap.io/inboxes
2. Inicia sesión con tu cuenta Mailtrap
3. Busca el último email
4. ✅ Verás el código de 6 dígitos
```

### 2.5 Ingresar Código
```
1. Vuelve a la app
2. Ingresa los 6 dígitos del email
3. ✅ Auto-verifica y navega a Dashboard
```

---

## 🔑 PASO 3: PROBAR CÓDIGO DE RESPALDO

```
1. Cerrar sesión
2. Login normal (email + password)
3. En pantalla de verificación MFA:
   - Tap "🔑 Usar código de respaldo"
4. Ingresar uno de los 8 códigos guardados
   (ej: A1B2C3D4)
5. Tap "Verificar Código de Respaldo"
6. ✅ Acceso concedido
7. ⚠️ Ese código ya NO funciona más
```

---

## 🔄 PASO 4: PROBAR REENVÍO DE CÓDIGO

```
1. Cerrar sesión
2. Login normal
3. En pantalla de verificación:
   - Esperar 30 segundos
   - Tap "📧 Reenviar código"
4. Revisar Mailtrap → nuevo email
5. Ingresar nuevo código
6. ✅ Funciona correctamente
```

---

## ❌ PASO 5: PROBAR INTENTOS FALLIDOS

```
1. Cerrar sesión
2. Login normal
3. Ingresar código incorrecto: 000000
4. Ver mensaje: "Código inválido. Intentos restantes: 4"
5. Repetir 4 veces más
6. Al 6to intento:
   ✅ Mensaje: "Cuenta bloqueada temporalmente"
7. Usar código de respaldo para desbloquear
```

---

## 🔧 PASO 6: PROBAR REGENERACIÓN DE CÓDIGOS

```
1. Dashboard → "🔐 Configurar MFA"
2. Tap "🔄 Regenerar Códigos de Respaldo"
3. Confirmar
4. ✅ Modal con 8 nuevos códigos
5. Copiar y guardar
6. Cerrar sesión y probar:
   - Código antiguo → ❌ No funciona
   - Código nuevo → ✅ Funciona
```

---

## 🛑 PASO 7: DESHABILITAR MFA

```
1. Dashboard → "🔐 Configurar MFA"
2. Tap "⚠️ Deshabilitar MFA"
3. Confirmar advertencia
4. ✅ Estado cambia a "Deshabilitado"
5. Cerrar sesión
6. Login → Acceso directo (sin código)
```

---

## 📋 CHECKLIST RÁPIDO

- [ ] App se carga correctamente
- [ ] Puedo registrar un usuario
- [ ] Puedo hacer login sin MFA
- [ ] Dashboard se muestra bien
- [ ] Puedo habilitar MFA
- [ ] Recibo email en Mailtrap
- [ ] Código de 6 dígitos funciona
- [ ] Código de respaldo funciona
- [ ] Reenvío de código funciona
- [ ] Intentos fallidos bloquean cuenta
- [ ] Regeneración de códigos funciona
- [ ] Puedo deshabilitar MFA

---

## 🐛 SI ALGO NO FUNCIONA

### Error: "Network Error"
**Verificar:**
```powershell
# Backend corriendo?
curl http://localhost:8000/api/v1

# IP correcta?
ipconfig | findstr IPv4
```

### Error: "No llega email"
**Verificar:**
1. Ir a https://mailtrap.io/inboxes
2. Ver logs de Laravel:
```powershell
cd BackEndApp
Get-Content storage\logs\laravel.log -Wait -Tail 50
```

### Error: "App no se conecta"
**Verificar:**
1. Móvil y PC en la misma red WiFi
2. IP correcta en .env (192.168.1.73)
3. Firewall permite puerto 8000

---

## 📊 PANTALLAS QUE VERÁS

### 1. LoginScreen
```
┌─────────────────────────┐
│  Iniciar Sesión         │
│                         │
│  Email: ___________     │
│  Contraseña: _______    │
│                         │
│  [ Iniciar Sesión ]     │
│  [ Crear Nueva Cuenta ] │
└─────────────────────────┘
```

### 2. MFAVerificationScreen
```
┌─────────────────────────┐
│  🔐 Verificación MFA    │
│                         │
│  Código enviado a:      │
│  test@ejemplo.com       │
│                         │
│  [4][8][3][9][2][1]    │
│                         │
│  [ Verificar Código ]   │
│  📧 Reenviar (30s)      │
│  🔑 Código de respaldo  │
└─────────────────────────┘
```

### 3. MFASettingsScreen
```
┌─────────────────────────┐
│  🔐 Autenticación MFA   │
│                         │
│  Estado: ✅ Habilitado  │
│                         │
│  ¿Qué es MFA?          │
│  [Descripción...]       │
│                         │
│  Beneficios:            │
│  🔒 Mayor seguridad     │
│  🛡️ Protección extra   │
│                         │
│  [🔄 Regenerar Códigos] │
│  [⚠️ Deshabilitar MFA]  │
└─────────────────────────┘
```

---

## 🎯 PRÓXIMOS PASOS

1. ✅ **Ahora:** Probar todos los flujos
2. ⏳ **Después:** Tomar screenshots
3. ⏳ **Luego:** Documentar cualquier bug
4. ⏳ **Final:** Deploy a producción

---

## 📞 COMANDOS ÚTILES

```powershell
# Ver logs de Laravel en tiempo real
cd BackEndApp
Get-Content storage\logs\laravel.log -Wait -Tail 50

# Limpiar cache de Laravel
php artisan cache:clear

# Reiniciar Expo
# En terminal de Expo: Ctrl+C
# Luego: npm start

# Ver rutas MFA
php artisan route:list --path=auth-mfa
```

---

## ✨ TIPS

💡 **Tip 1:** Usa Expo Go para testing rápido
💡 **Tip 2:** Guarda los códigos de respaldo en Notas
💡 **Tip 3:** Mailtrap es solo para testing, no producción
💡 **Tip 4:** Si cambias de red WiFi, actualiza IP en .env

---

**Fecha:** 14 de Octubre, 2025  
**Versión:** 1.0.0  
**Estado:** 🚀 ¡LISTO PARA PROBAR!

¡Disfruta probando tu sistema MFA! 🎉
