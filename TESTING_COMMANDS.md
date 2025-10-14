# 🚀 Comandos Rápidos - Testing MFA

## Backend Laravel

### Iniciar Servidor
```powershell
cd "C:\Users\oimvf\Desktop\Proyecto DMI\BackEndApp"
php artisan serve
```

### Ver Logs en Tiempo Real
```powershell
cd "C:\Users\oimvf\Desktop\Proyecto DMI\BackEndApp"
Get-Content storage\logs\laravel.log -Wait -Tail 50
```

### Limpiar Cache
```powershell
cd "C:\Users\oimvf\Desktop\Proyecto DMI\BackEndApp"
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### Ver Rutas MFA
```powershell
cd "C:\Users\oimvf\Desktop\Proyecto DMI\BackEndApp"
php artisan route:list --path=auth-mfa
```

### Verificar Estado de Usuario (En Tinker)
```powershell
cd "C:\Users\oimvf\Desktop\Proyecto DMI\BackEndApp"
php artisan tinker
```
```php
// Dentro de tinker:
$user = User::where('email', 'test@example.com')->first();
$user->mfa_enabled;  // Ver si MFA está habilitado
$user->mfa_enabled_at;  // Ver cuándo se habilitó
$user->mfa_backup_codes;  // Ver códigos (hasheados)
Cache::get('mfa_code_' . $user->id);  // Ver código actual en cache
exit
```

---

## Frontend React Native

### Iniciar App
```powershell
cd "C:\Users\oimvf\Desktop\Proyecto DMI\FrontEndApp"
npm start
```

### Limpiar Cache
```powershell
cd "C:\Users\oimvf\Desktop\Proyecto DMI\FrontEndApp"
Remove-Item -Recurse -Force .\.expo\*
npm start -- --clear
```

### Ver IP del PC (para actualizar en mfaService.js)
```powershell
ipconfig | findstr IPv4
```

---

## Testing con Postman/cURL

### 1. Registrar Usuario
```powershell
curl -X POST http://localhost:8000/api/v1/jwt/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\",\"password_confirmation\":\"password123\"}'
```

### 2. Login (obtener token)
```powershell
curl -X POST http://localhost:8000/api/v1/auth-mfa/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'
```

### 3. Habilitar MFA (usar token del paso 2)
```powershell
$token = "TU_TOKEN_AQUI"
curl -X POST http://localhost:8000/api/v1/auth-mfa/enable-mfa `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json"
```

### 4. Login con MFA (debe enviar código)
```powershell
curl -X POST http://localhost:8000/api/v1/auth-mfa/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'
```

### 5. Verificar Código MFA
```powershell
curl -X POST http://localhost:8000/api/v1/auth-mfa/verify-mfa `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"code\":\"123456\"}'
```

### 6. Ver Estado MFA
```powershell
$token = "TU_TOKEN_AQUI"
curl -X GET http://localhost:8000/api/v1/auth-mfa/mfa-status `
  -H "Authorization: Bearer $token"
```

### 7. Deshabilitar MFA
```powershell
$token = "TU_TOKEN_AQUI"
curl -X POST http://localhost:8000/api/v1/auth-mfa/disable-mfa `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json"
```

---

## Verificar Emails en Mailtrap

### Opción 1: Web Browser
1. Ir a: https://mailtrap.io/inboxes
2. Iniciar sesión
3. Seleccionar inbox "DMI App"
4. Ver emails con códigos MFA

### Opción 2: API de Mailtrap (Opcional)
```powershell
# Obtener lista de mensajes
curl -X GET https://mailtrap.io/api/v1/inboxes/YOUR_INBOX_ID/messages `
  -H "Api-Token: YOUR_API_TOKEN"
```

---

## Debugging Tips

### Ver caché de Laravel
```php
php artisan tinker
Cache::get('mfa_code_1');  // Ver código del usuario ID 1
Cache::has('mfa_code_1');  // Ver si existe
exit
```

### Ver usuarios con MFA habilitado
```php
php artisan tinker
User::where('mfa_enabled', true)->get(['id', 'name', 'email', 'mfa_enabled_at']);
exit
```

### Simular código en cache (para testing)
```php
php artisan tinker
Cache::put('mfa_code_1', '123456', now()->addMinutes(5));
Cache::get('mfa_code_1');  // Debe retornar: 123456
exit
```

---

## Flujo de Testing Completo

### Paso 1: Preparación
```powershell
# Terminal 1: Backend
cd "C:\Users\oimvf\Desktop\Proyecto DMI\BackEndApp"
php artisan serve

# Terminal 2: Logs
cd "C:\Users\oimvf\Desktop\Proyecto DMI\BackEndApp"
Get-Content storage\logs\laravel.log -Wait -Tail 50

# Terminal 3: Frontend
cd "C:\Users\oimvf\Desktop\Proyecto DMI\FrontEndApp"
npm start
```

### Paso 2: Registro
```
1. Abrir app en móvil/emulador
2. Tap "Crear Nueva Cuenta"
3. Llenar: Nombre, Email, Password
4. Tap "Registrar"
5. ✅ Debe aparecer Dashboard
```

### Paso 3: Habilitar MFA
```
1. En Dashboard → Tap "🔐 Configurar Autenticación Multi-Factor"
2. Tap "🔐 Habilitar MFA"
3. Confirmar en diálogo
4. ✅ Debe aparecer modal con 8 códigos
5. Tap "📋 Copiar Todos"
6. Pegar en notas y GUARDAR
7. Tap "He guardado mis códigos"
```

### Paso 4: Probar Login con MFA
```
1. Tap "Cerrar Sesión"
2. Ingresar Email y Password
3. Tap "Iniciar Sesión"
4. ✅ Debe aparecer pantalla "Verificación MFA"
5. Abrir https://mailtrap.io/inboxes
6. Ver último email → Copiar código de 6 dígitos
7. Ingresar código en app
8. ✅ Debe navegar a Dashboard automáticamente
```

### Paso 5: Probar Código de Respaldo
```
1. Tap "Cerrar Sesión"
2. Ingresar Email y Password
3. Tap "Iniciar Sesión"
4. En pantalla MFA → Tap "🔑 Usar código de respaldo"
5. Ingresar uno de los 8 códigos guardados
6. Tap "Verificar Código de Respaldo"
7. ✅ Debe navegar a Dashboard
8. ⚠️ Ese código ya NO funciona más
```

### Paso 6: Regenerar Códigos
```
1. En Dashboard → Tap "🔐 Configurar Autenticación Multi-Factor"
2. Tap "🔄 Regenerar Códigos de Respaldo"
3. Confirmar
4. ✅ Aparece modal con 8 nuevos códigos
5. Copiar y guardar
6. ⚠️ Los códigos anteriores ya NO funcionan
```

---

## Casos de Error a Probar

### Código Expirado
```
1. Login con MFA
2. Esperar 6 minutos (más de 5 minutos)
3. Intentar ingresar código
4. ✅ Debe mostrar: "Código inválido o expirado"
5. Tap "Reenviar código"
6. Nuevo código debe funcionar
```

### Intentos Fallidos
```
1. Login con MFA
2. Ingresar código incorrecto (ej: 000000)
3. Repetir 5 veces
4. ✅ Al 6to intento debe mostrar: "Cuenta bloqueada"
5. Usar código de respaldo para desbloquear
```

### Sin Conexión
```
1. Desactivar WiFi/Datos
2. Intentar login
3. ✅ Debe mostrar: "Error de conexión"
```

---

## Métricas de Éxito

✅ **Funcional:**
- [ ] Usuario puede habilitar MFA
- [ ] Email llega en < 10 segundos
- [ ] Código de 6 dígitos funciona
- [ ] Código expira en 5 minutos
- [ ] Códigos de respaldo funcionan
- [ ] Códigos de respaldo son de un solo uso
- [ ] Cuenta se bloquea después de 5 intentos

✅ **UX:**
- [ ] Navegación fluida
- [ ] Mensajes claros de error
- [ ] Loading states apropiados
- [ ] Auto-focus en inputs
- [ ] Auto-verificación al completar código

✅ **Seguridad:**
- [ ] Códigos hasheados en BD
- [ ] Token solo se guarda después de verificación
- [ ] Códigos aleatorios
- [ ] Rate limiting funciona

---

**Última actualización:** 14 de Octubre, 2025
