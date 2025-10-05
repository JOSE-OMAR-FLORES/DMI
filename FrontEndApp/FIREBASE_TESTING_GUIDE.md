# 🧪 Guía de Pruebas - Firebase Favoritos

## ✅ Estado Actual
- ✅ Firebase configurado (proyecto: serviciosenlanube)
- ✅ Firestore habilitado (región: northamerica-south1)
- ✅ Credenciales en .env
- ✅ Código implementado (11 archivos nuevos, 6 modificados)
- ✅ Widget de favoritos agregado al Dashboard

## 🚀 Cómo Iniciar la App

### 1. Asegúrate que el Backend Laravel esté corriendo
```powershell
cd c:\Users\gabri\Desktop\ProyectoDMI\DMI\BackEndApp
php artisan serve
```

### 2. Inicia la app React Native
```powershell
cd c:\Users\gabri\Desktop\ProyectoDMI\DMI\FrontEndApp
npm start
```

### 3. Abre en tu dispositivo
- Escanea el QR con Expo Go
- O presiona 'a' para Android Emulator
- O presiona 'i' para iOS Simulator

## 🧪 Flujo de Pruebas Completo

### Prueba 1: Ver Widget en Dashboard
1. Inicia sesión con tu usuario
2. En el Dashboard verás:
   - **Si NO tienes favoritos:** Mensaje "No tienes ciudades favoritas" con botón "+ Agregar"
   - **Si SÍ tienes favoritos:** Lista de hasta 3 ciudades con temperatura y tiempo desde última actualización

### Prueba 2: Agregar Ciudad Favorita (CREATE)
1. En el Dashboard, tap en botón **"+ Agregar"** en el widget de favoritos
2. Escribe nombre de una ciudad (ej: "Mexico City")
3. Tap en **"Buscar Ciudad"**
4. Espera a que cargue el clima
5. Personaliza (opcional):
   - **Nickname:** "CDMX"
   - **Notas:** "Ciudad donde vive mi familia"
   - **Color:** Selecciona un color
6. Tap en **"💾 Guardar Favorito"**
7. Deberías regresar al Dashboard y ver la nueva ciudad en el widget

**Verifica en Firebase Console:**
- Ve a: https://console.firebase.google.com/project/serviciosenlanube/firestore
- Busca la colección `userFavorites`
- Deberías ver un documento con tu `userId` y los datos de la ciudad

### Prueba 3: Ver Detalle y Actualizar Clima (READ + UPDATE)
1. En el Dashboard, tap en una ciudad favorita del widget
2. **IMPORTANTE:** Al abrir el detalle, automáticamente actualiza el clima desde OpenWeather
3. Observa:
   - Temperatura actual
   - Descripción del clima
   - Sensación térmica
   - Humedad
   - Viento
   - Presión
   - Nickname/notas (si los tiene)
4. El tiempo "Última actualización: Ahora" debería aparecer

**Verifica en Firebase Console:**
- Actualiza la vista de Firestore
- El documento de esa ciudad debería tener `lastWeatherUpdate` actualizado a la hora actual
- `weatherSnapshot` debería tener los datos más recientes

### Prueba 4: Ver Todas las Ciudades (READ)
1. En el Dashboard widget, tap en **"Ver todas las ciudades favoritas →"**
2. Verás la pantalla `FavoritesScreen` con todas tus ciudades
3. Pull to refresh (jala hacia abajo) para recargar la lista
4. Observa que cada tarjeta muestra:
   - Color personalizado (barra izquierda)
   - Nickname o nombre de ciudad
   - Temperatura
   - Descripción del clima
   - Tiempo desde última actualización
   - Botones de Editar (✏️) y Eliminar (🗑️)

### Prueba 5: Editar Favorito (UPDATE)
1. En `FavoritesScreen`, tap en el botón **✏️** de una ciudad
2. Modifica:
   - Nickname
   - Notas
   - Color
3. **NOTA:** No puedes cambiar la ciudad ni el clima (son read-only)
4. Tap en **"💾 Guardar Cambios"**
5. Verifica que los cambios se reflejen en la lista

**Verifica en Firebase Console:**
- El documento debería tener actualizado: `nickname`, `notes`, `color`
- `lastUpdated` debería tener timestamp actual

### Prueba 6: Eliminar Favorito (DELETE)
1. En `FavoritesScreen`, tap en el botón **🗑️** de una ciudad
2. Confirma la eliminación en el diálogo
3. La ciudad desaparece de la lista
4. Si eliminas todas, verás mensaje "No tienes ciudades favoritas"

**Verifica en Firebase Console:**
- El documento de esa ciudad ya NO debería existir en la colección

### Prueba 7: Múltiples Ciudades
1. Agrega 4-5 ciudades diferentes (ej: London, Tokyo, New York, Paris)
2. Dale nickname y color diferente a cada una
3. Verifica que en el Dashboard widget solo se muestren las primeras 3
4. Entra a "Ver todas" para ver las demás

## 🔍 Puntos Clave a Verificar

### Comportamiento del Clima
- ❌ **NO** actualiza automáticamente en la lista de favoritos
- ✅ **SÍ** actualiza cuando abres el detalle (`FavoriteDetailScreen`)
- ✅ Muestra "Hace X min/h/d" para indicar última actualización
- ✅ Muestra "Sin actualizar" si nunca se ha abierto el detalle

### Firestore Structure
Cada documento en `userFavorites` debe tener:
```javascript
{
  userId: "123",
  city: "Mexico City",
  country: "MX",
  nickname: "CDMX",
  notes: "Ciudad donde vive mi familia",
  color: "#FF5733",
  weatherSnapshot: {
    temp: 22.5,
    description: "cielo claro",
    feelsLike: 21.8,
    humidity: 45,
    pressure: 1013,
    windSpeed: 3.5
  },
  lastWeatherUpdate: Timestamp,
  lastUpdated: Timestamp,
  createdAt: Timestamp
}
```

### Navegación
- Dashboard → AddFavorite (botón "+ Agregar")
- Dashboard → FavoriteDetail (tap en ciudad del widget)
- Dashboard → Favorites (botón "Ver todas")
- Favorites → AddFavorite (botón "+ Agregar Nueva Ciudad")
- Favorites → FavoriteDetail (tap en tarjeta)
- Favorites → EditFavorite (botón ✏️)
- FavoriteDetail → EditFavorite (botón Editar)

## 🐛 Problemas Comunes y Soluciones

### Error: "Firebase no configurado"
**Solución:** Verifica que `.env` tenga todas las variables:
```env
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=serviciosenlanube
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
```

### Error: "No se pueden cargar favoritos"
**Solución:**
1. Verifica que Firestore esté en modo de prueba (test mode)
2. Revisa las reglas en Firebase Console:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Error: "Ciudad no encontrada"
**Solución:** 
- Asegúrate de escribir correctamente el nombre
- Intenta con nombres en inglés (ej: "Mexico City" en lugar de "Ciudad de México")
- Verifica que `OPENWEATHER_API_KEY` esté en `.env`

### La temperatura no actualiza
**Solución:**
- Recuerda que solo actualiza al abrir el detalle (`FavoriteDetailScreen`)
- Verifica que tengas internet
- Revisa que la API de OpenWeather esté respondiendo

## 📊 Criterios de Aceptación del Proyecto

### ✅ Requisitos Cumplidos
1. **Servicio en la nube:** Firebase Firestore ✅
2. **Al menos 2 operaciones CRUD:**
   - CREATE: `addFavorite()` ✅
   - READ: `getFavorites()` ✅
   - UPDATE: `updateFavorite()` + `updateWeatherSnapshot()` ✅
   - DELETE: `removeFavorite()` ✅
3. **Autenticación de usuario:** Laravel JWT (userId para queries) ✅
4. **Integración en app móvil:** React Native con Expo ✅

### ⏳ Pendiente (Opcional)
- Tests unitarios con Jest (usuario dijo ignorar por ahora)

## 📸 Capturas Sugeridas para Documentación
1. Dashboard con widget vacío
2. Formulario "Agregar Favorito"
3. Dashboard con 3 favoritos
4. Pantalla "Mis Ciudades Favoritas" (lista completa)
5. Detalle de favorito con clima actualizado
6. Formulario "Editar Favorito"
7. Firebase Console mostrando colección `userFavorites`

## 🎯 Próximos Pasos
1. ✅ Código implementado
2. ✅ Firebase configurado
3. **→ Probar todas las funcionalidades (usa esta guía)**
4. Tomar capturas de pantalla
5. (Opcional) Crear tests unitarios
6. Documentar en README

---

**¿Listo para probar?** Inicia la app con `npm start` y sigue las pruebas en orden. ¡Éxito! 🚀
