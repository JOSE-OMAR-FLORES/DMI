# BackEnd API - Laravel 12

API REST desarrollada con Laravel 12 para el proyecto DMI. Esta API proporciona servicios para la aplicación móvil React Native.

## 🚀 Tecnologías Utilizadas

- **Laravel 12.31.1** - Framework PHP
- **MySQL 8.0+** - Base de datos
- **PHP 8.2+** - Lenguaje de programación
- **Composer** - Gestión de dependencias

## 📋 Prerrequisitos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- **Laragon** (incluye PHP, Composer, Apache/Nginx)
- **PHP >= 8.2**
- **Composer**
- **Node.js** (para assets)

## 🛠️ Instalación y Configuración

### Opción 1: Usando Laragon (Recomendada)

1. **Clonar el repositorio principal:**
   ```bash
   git clone https://github.com/JOSE-OMAR-FLORES/DMI.git
   cd DMI/BackEndApp
   ```

2. **Configurar Virtual Host en Laragon:**
   - Abre Laragon
   - Click derecho en el icono de Laragon
   - `Apache` > `Sites Directory` > Abrir
   - Crea un enlace simbólico o copia la carpeta `BackEndApp`
   - Reinicia Laragon

3. **Acceder a la aplicación:**
   ```
   http://backendapp.test
   ```

### Opción 2: Servidor PHP Integrado

1. **Navegar al directorio del proyecto:**
   ```bash
   cd BackEndApp
   ```

2. **Instalar dependencias:**
   ```bash
   composer install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   php artisan jwt:secret

   ```

4. **Ejecutar migraciones:**
   ```bash
   php artisan migrate
   ```

5. **Iniciar servidor de desarrollo:**
   ```bash
   php artisan serve
   ```
   o

   php artisan serve --host=0.0.0.0

6. **Acceder a la aplicación:**
   ```
   http://127.0.0.1:8000
   ```

## ⚙️ Configuración Adicional

### Base de Datos
El proyecto está configurado para usar MySQL. Asegúrate de:

1. **Crear la base de datos en MySQL:**
   ```sql
   CREATE DATABASE dmi_backend;
   ```

2. **Configurar las variables de entorno en `.env`:**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=dmi_backend
   DB_USERNAME=root
   DB_PASSWORD=
   ```

3. **Ejecutar las migraciones:**
   ```bash
   php artisan migrate
   ```

### CORS (Para React Native)
Si necesitas configurar CORS para la app móvil, edita el archivo `config/cors.php`:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['*'], // En producción, especifica el dominio
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

## 📁 Estructura del Proyecto

```
BackEndApp/
├── app/
│   ├── Http/Controllers/    # Controladores de la API
│   ├── Models/             # Modelos Eloquent
│   └── Providers/          # Service Providers
├── routes/
│   ├── api.php            # Rutas de la API
│   └── web.php            # Rutas web
├── database/
│   ├── migrations/        # Migraciones de BD
│   └── seeders/          # Seeders de datos
└── config/               # Archivos de configuración
```

## 🧪 Pruebas

Ejecutar las pruebas:
```bash
php artisan test
```

## 📚 Endpoints de la API

### Rutas Base
- `GET /api/` - Estado de la API
- `GET /api/health` - Health check

### Autenticación
- `POST /api/register` - Registro de usuario
- `POST /api/login` - Inicio de sesión
- `POST /api/logout` - Cerrar sesión

## 🔧 Comandos Útiles

```bash
# Generar clave de aplicación
php artisan key:generate

# Limpiar cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Crear controlador
php artisan make:controller ApiController

# Crear modelo con migración
php artisan make:model Usuario -m

# Ejecutar migraciones
php artisan migrate

# Rollback migraciones
php artisan migrate:rollback
```

## 🚀 Despliegue

Para desplegar en producción:

1. Configurar variables de entorno de producción en `.env`
2. Ejecutar `composer install --optimize-autoloader --no-dev`
3. Ejecutar `php artisan config:cache`
4. Ejecutar `php artisan route:cache`
5. Configurar permisos de escritura en `storage/` y `bootstrap/cache/`

## 🤝 Contribución

1. Crear una rama desde `main`: `git checkout -b feature/nueva-funcionalidad`
2. Hacer commit de los cambios: `git commit -m "feat: agregar nueva funcionalidad"`
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Crear Pull Request

## 📄 Licencia

Este proyecto es parte del curso DMI y está bajo la licencia del proyecto principal.

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
