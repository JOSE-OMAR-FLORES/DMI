# 🔥 Guía de Integración de Firebase en Laravel

## 📋 Pasos Completados

✅ **1. Instalación del SDK de Firebase PHP**
```bash
composer require kreait/firebase-php
```

✅ **2. Archivos Creados**

### Configuración
- `config/firebase.php` - Configuración de Firebase
- `.env.firebase` - Variables de entorno de ejemplo

### Servicios
- `app/Services/FirebaseService.php` - Servicio principal de Firebase

### Controladores
- `app/Http/Controllers/FirebaseAuthController.php` - Controlador de autenticación

### Middleware
- `app/Http/Middleware/VerifyFirebaseToken.php` - Middleware para verificar tokens

### Rutas
- Rutas de API agregadas en `routes/api.php`

---

## 🚀 Configuración Necesaria

### 1. Descargar Credenciales de Firebase

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **dmi-app-88868**
3. Ve a **Configuración del Proyecto** (⚙️ icono)
4. Ve a la pestaña **Cuentas de servicio**
5. Haz clic en **Generar nueva clave privada**
6. Descarga el archivo JSON

### 2. Colocar el Archivo de Credenciales

Guarda el archivo JSON descargado en:
```
BackEndApp/storage/app/firebase-credentials.json
```

### 3. Agregar Variables de Entorno

Agrega estas líneas al archivo `.env`:

```env
FIREBASE_CREDENTIALS=storage/app/firebase-credentials.json
FIREBASE_DATABASE_URL=https://dmi-app-88868-default-rtdb.firebaseio.com
FIREBASE_PROJECT_ID=dmi-app-88868
FIREBASE_STORAGE_BUCKET=dmi-app-88868.firebasestorage.app
```

---

## 📡 Endpoints Disponibles

### Base URL
```
http://tu-servidor/api/v1/firebase
```

### 1. Verificar Token de Firebase
```http
POST /api/v1/firebase/verify-token
Content-Type: application/json

{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Token verified successfully",
  "data": {
    "uid": "abc123...",
    "email": "user@example.com",
    "claims": {...}
  }
}
```

### 2. Obtener Usuario por UID
```http
POST /api/v1/firebase/get-user
Content-Type: application/json

{
  "uid": "abc123..."
}
```

### 3. Crear Token Personalizado
```http
POST /api/v1/firebase/create-custom-token
Content-Type: application/json

{
  "uid": "user123",
  "claims": {
    "role": "admin"
  }
}
```

### 4. Enviar Notificación Push
```http
POST /api/v1/firebase/send-notification
Content-Type: application/json

{
  "device_token": "device_token_here",
  "title": "Título de la notificación",
  "body": "Mensaje de la notificación",
  "data": {
    "key1": "value1"
  }
}
```

---

## 🔐 Usar Middleware de Autenticación

Para proteger rutas con autenticación de Firebase:

### 1. Registrar Middleware

En `bootstrap/app.php` o `app/Http/Kernel.php`, agrega:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'firebase.auth' => \App\Http\Middleware\VerifyFirebaseToken::class,
    ]);
})
```

### 2. Aplicar en Rutas

```php
Route::middleware('firebase.auth')->group(function () {
    Route::get('/protected-route', function (Request $request) {
        // Acceder a información del usuario de Firebase
        $uid = $request->firebase_uid;
        $user = $request->firebase_user;
        
        return response()->json([
            'message' => 'Acceso autorizado',
            'uid' => $uid,
            'user' => $user
        ]);
    });
});
```

---

## 💻 Uso del Servicio Firebase

### En Controladores

```php
use App\Services\FirebaseService;

class MyController extends Controller
{
    protected $firebase;

    public function __construct(FirebaseService $firebase)
    {
        $this->firebase = $firebase;
    }

    public function myMethod()
    {
        // Autenticación
        $user = $this->firebase->getUser('uid123');
        
        // Base de datos
        $data = $this->firebase->database()
            ->getReference('users/uid123')
            ->getValue();
        
        // Storage
        $bucket = $this->firebase->storage()->getBucket();
        
        // Messaging
        $this->firebase->sendNotification(
            'device_token',
            'Hello',
            'World'
        );
    }
}
```

---

## 🔍 Verificación

Para verificar que todo funciona:

```bash
# En la terminal de BackEndApp
php artisan route:list --path=firebase
```

Deberías ver todas las rutas de Firebase listadas.

---

## ⚠️ Importante

1. **Nunca** subas el archivo `firebase-credentials.json` a tu repositorio
2. Agrega a `.gitignore`:
   ```
   storage/app/firebase-credentials.json
   ```

3. Asegúrate de que la extensión `sodium` esté habilitada en PHP

---

## 🎯 Próximos Pasos

1. Descargar y colocar el archivo de credenciales
2. Configurar las variables de entorno
3. Probar los endpoints con Postman o similar
4. Integrar con tu aplicación React Native

---

¿Necesitas ayuda con algún paso específico?
