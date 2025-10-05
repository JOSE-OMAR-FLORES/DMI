# Tests_Readme

Este archivo documenta cómo ejecutar las pruebas unitarias del proyecto FrontEndApp y describe qué hace cada test en los archivos principales de pruebas (`FirebaseFavoritesService.test.js` y `ApiService.test.js`).

## Cómo ejecutar las pruebas
Desde la raíz del proyecto `FrontEndApp` (Windows cmd.exe):

```bash
cd /d c:\CHAMBAS-DMI\REDISENODMI\DMI\FrontEndApp
npm test
```

Para una salida menos verbosa:
# Tests_Readme

Este archivo documenta cómo ejecutar las pruebas unitarias del proyecto FrontEndApp, qué hace cada test en los archivos principales de pruebas, y además incluye los comandos de instalación, la configuración relevante de `package.json`, cómo crear `jest.setup.js` y la estructura final de carpetas de tests.

## Instalación (dependencias necesarias)
Ejecuta los siguientes comandos desde la carpeta `FrontEndApp` para instalar dependencias de desarrollo necesarias para las pruebas:

```bash
cd /d c:\CHAMBAS-DMI\REDISENODMI\DMI\FrontEndApp
npm install --save-dev jest jest-expo axios-mock-adapter react-native-dotenv
```

Nota: `jest-expo` ya está presente en el `package.json` del proyecto; si no lo está en tu caso, añádelo también.

## Configuración necesaria en `package.json`
Añade o verifica las siguientes secciones en tu `package.json` (ya presentes en el repo original). Esto asegura que Jest use el preset correcto y cargue el setup file:

```json
"scripts": {
  "test": "jest"
},
"jest": {
  "preset": "jest-expo",
  "setupFilesAfterEnv": [
    "<rootDir>/jest.setup.js"
  ],
  "transformIgnorePatterns": [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|react-native-dotenv|firebase)"
  ],
  "moduleNameMapper": {
    "^@env$": "react-native-dotenv"
  }
}
```

Explicación rápida:
- `preset: jest-expo` facilita testear código con dependencias de Expo/React Native.
- `setupFilesAfterEnv` carga `jest.setup.js` después del entorno de pruebas para inicializar mocks globales.
- `transformIgnorePatterns` evita que Jest ignore la transformación de ciertos paquetes react-native/Expo.
- `moduleNameMapper` mapea `@env` para que los imports de variables de entorno funcionen en tests.

## Crear `jest.setup.js`
Crea el archivo `jest.setup.js` en la raíz de `FrontEndApp` con contenido parecido a este (ya existe en el repo, pero si no, aquí está la plantilla):

```javascript
beforeAll(() => {
  // Silenciar logs durante tests
  if (!console.log._isMockFunction) jest.spyOn(console, 'log').mockImplementation(() => {});
  if (!console.error._isMockFunction) jest.spyOn(console, 'error').mockImplementation(() => {});
  if (!console.warn._isMockFunction) jest.spyOn(console, 'warn').mockImplementation(() => {});

  // Mock de AsyncStorage para pruebas
  try {
    jest.doMock('@react-native-async-storage/async-storage', () => ({
      __esModule: true,
      default: {
        getItem: jest.fn(() => Promise.resolve(null)),
        setItem: jest.fn(() => Promise.resolve()),
        removeItem: jest.fn(() => Promise.resolve()),
        clear: jest.fn(() => Promise.resolve()),
      }
    }));
  } catch (e) {}

  // Mock simple para expo-secure-store
  try {
    jest.doMock('expo-secure-store', () => ({
      __esModule: true,
      default: {
        getItemAsync: jest.fn(() => Promise.resolve(null)),
        setItemAsync: jest.fn(() => Promise.resolve()),
        deleteItemAsync: jest.fn(() => Promise.resolve()),
      }
    }));
  } catch (e) {}
});

afterAll(() => {
  if (console.log.mockRestore) console.log.mockRestore();
  if (console.error.mockRestore) console.error.mockRestore();
  if (console.warn.mockRestore) console.warn.mockRestore();
});
```

Este archivo asegura que los módulos nativos no causen errores en el entorno Node/Jest y que la salida de logs no ensucie el reporte de tests.

---

## Cómo ejecutar las pruebas
Desde la raíz del proyecto `FrontEndApp` (Windows cmd.exe):

```bash
cd /d c:\CHAMBAS-DMI\REDISENODMI\DMI\FrontEndApp
npm test
```

Para una salida menos verbosa:

```bash
npm test --silent
```

> Nota: Las pruebas usan `jest-expo` como preset y algunos mocks para módulos nativos (`@react-native-async-storage/async-storage`, `expo-secure-store`). Si agregas nuevos módulos nativos, puede que necesites mockearlos en `jest.setup.js`.

---

## Resumen de archivos de prueba

- `src/utils/test/FirebaseFavoritesService.test.js` (7 tests)
- `src/utils/test/ApiService.test.js` (6 tests)

A continuación se explica cada test y por qué pasa en el estado actual del repositorio.


## FirebaseFavoritesService.test.js

Este archivo prueba la funcionalidad del servicio `FirebaseFavoritesService` que gestiona favoritos en Firestore. Se usan mocks del módulo `firebase/firestore` y de `firebaseConfig`.

Tests:

1. addFavorite - "debe agregar un favorito correctamente"
   - Qué hace: Mockea `addDoc` para que resuelva con un objeto `{ id: 'abc123' }`. Llama a `addFavorite` con datos válidos.
   - Verificación: Comprueba que `addDoc` fue llamado y que la respuesta tiene `success: true` y `favoriteId: 'abc123'`.
   - Por qué pasa: `addDoc` está mockeado y devuelve el id esperado; la función `addFavorite` arma correctamente la respuesta basada en el resultado.

2. addFavorite - "debe fallar si userId no está presente"
   - Qué hace: Llama a `addFavorite` sin `userId`.
   - Verificación: Se espera que la promesa sea rechazada con 'Usuario no autenticado'.
   - Por qué pasa: La función valida la presencia del `userId` y lanza el error cuando falta.

3. getFavorites - "debe retornar favoritos correctamente"
   - Qué hace: Mockea `getDocs` para devolver un iterable con un documento que contiene los datos del favorito.
   - Verificación: Comprueba que `getDocs` fue llamado, que la lista de favoritos tiene longitud 1 y que el objeto contiene `favoriteId: 'fav1'`.
   - Por qué pasa: El mock de `getDocs` imita la estructura esperada por `getFavorites`, por lo que el servicio transforma correctamente los datos en la forma esperada.

4. updateFavorite - "debe actualizar un favorito correctamente"
   - Qué hace: Mockea `updateDoc` y `doc`. Llama a `updateFavorite` con id y cambios.
   - Verificación: Asegura que `updateDoc` fue llamado con la referencia de documento y que el resultado indica `success: true`.
   - Por qué pasa: `doc` devuelve una referencia mock (`'docRef'`) y `updateDoc` resuelve; la función devuelve `success: true`.

5. updateWeatherSnapshot - "debe actualizar weatherSnapshot correctamente"
   - Qué hace: Mockea `updateDoc` y `doc`. Llama a `updateWeatherSnapshot` con un snapshot nuevo.
   - Verificación: Comprueba que `updateDoc` se llamó con los campos anidados (`weatherSnapshot.temp`, etc.) y devuelve `success: true`.
   - Por qué pasa: La función transforma los campos del snapshot en la estructura esperada para `updateDoc`.

6. removeFavorite - "debe eliminar un favorito correctamente"
   - Qué hace: Mockea `deleteDoc` y `doc`. Llama a `removeFavorite` con un id.
   - Verificación: Asegura que `deleteDoc` fue llamado con la referencia y que el resultado tiene `success: true`.
   - Por qué pasa: El mock de `deleteDoc` resuelve sin errores y la función devuelve `success: true`.

7. incrementViewCount - "debe incrementar viewCount sin lanzar error"
   - Qué hace: Mockea `getDocs`, `updateDoc` y `doc`. `getDocs` devuelve un objeto con data incluido `viewCount`.
   - Verificación: Se espera que la llamada no lance y que `updateDoc` haya sido llamado.
   - Por qué pasa: `incrementViewCount` maneja el flow de lectura y escritura; con los mocks, completa correctamente las operaciones.

---

## ApiService.test.js

Este archivo prueba el servicio `ApiService` (singleton) que envuelve una instancia de `axios` para comunicación con un backend JWT. Se usan mocks para `AuthStorage`, `SecureAuthStorage`, `@env` y `axios-mock-adapter`.

Tests:

1. Request Interceptor - "debe agregar el header \"Authorization\" si se encuentra un token"
   - Qué hace: Mockea `SecureAuthStorage.getToken` para que resuelva con un token. Usa `axios-mock-adapter` apuntando a la instancia `apiService.api` y responde OK en `/jwt/profile`.
   - Verificación: Llama a `apiService.getProfile()` y comprueba que la petición HTTP enviada contiene el header `Authorization: Bearer <token>`.
   - Por qué pasa: El interceptor de request busca primero en `SecureAuthStorage` y, al encontrar el token mockeado, lo añade al header.

2. Request Interceptor - "NO debe agregar el header \"Authorization\" si no hay token"
   - Qué hace: Mockea tanto `SecureAuthStorage.getToken` como `AuthStorage.getToken` para resolver `null`. Mocks la respuesta a `/jwt/profile`.
   - Verificación: Ejecuta `getProfile()` y comprueba que no existe el header `Authorization` en la petición.
   - Por qué pasa: Ningún storage devuelve token; el interceptor no añade el header.

3. Response Interceptor - "debe limpiar la sesión y los datos seguros al recibir un error 401"
   - Qué hace: Mocks que la respuesta de `/jwt/profile` sea 401. Llama a `getProfile()` y captura la excepción.
   - Verificación: Asegura que `SecureAuthStorage.removeAllSecureData` y `AuthStorage.clearSession` hayan sido invocados.
   - Por qué pasa: El interceptor de respuestas detecta status 401 y ejecuta la limpieza de ambos almacenamientos.

4. login() - "debe iniciar sesión y guardar el token y usuario de forma segura"
   - Qué hace: Mocks la respuesta POST `/jwt/login` con `access_token` y `user`. Mockea `SecureAuthStorage.saveToken` y `saveUser` para resolver true.
   - Verificación: Comprueba que `apiService.login()` retorna `success: true` y que `SecureAuthStorage.saveToken` y `saveUser` fueron llamados con los valores correctos.
   - Por qué pasa: `login()` guarda el token y el usuario en `SecureAuthStorage` (o hace fallback a `AuthStorage` si falla), y devuelve `success: true` cuando la llamada al API es exitosa.

5. login() - "debe manejar un fallo en el inicio de sesión"
   - Qué hace: Mocks POST `/jwt/login` con un 401 y cuerpo `{ message: 'Credenciales inválidas' }`.
   - Verificación: Comprueba que `login()` retorna `success: false`, `message` con el mensaje de error y que no se llamó a `SecureAuthStorage.saveToken`.
   - Por qué pasa: `login()` captura el error y devuelve la estructura con `success: false` y `message` proveniente de la respuesta.

6. logout() - "debe limpiar todos los almacenamientos incluso si la llamada a la API falla"
   - Qué hace: Mocks POST `/jwt/logout` para producir un error de red. Llama a `apiService.logout()`.
   - Verificación: Comprueba que el resultado sea `success: true` con mensaje 'Sesión cerrada localmente' y que `SecureAuthStorage.removeAllSecureData` y `AuthStorage.clearSession` fueron llamados.
   - Por qué pasa: `logout()` intenta llamar al servidor pero, si falla, igualmente limpia ambos almacenamientos y retorna éxito local.

---

## Notas adicionales

- Los tests prefieren usar `axios-mock-adapter` apuntando a la instancia `apiService.api` en lugar de mockear todo `axios`. Esto permite probar los interceptores y la configuración que se aplica a la instancia real.
- El `ApiService` exporta un singleton; al importar `ApiService` en los tests, su constructor se ejecuta inmediatamente. Esto es útil para probar interceptores, pero ten en cuenta que los logs del constructor pueden aparecer en la salida de Jest.
- `jest.setup.js` contiene mocks y spies globales (silencia `console.log/error/warn` y mockea AsyncStorage/SecureStore) para evitar errores de módulos nativos en el entorno de Node/Jest.

---

## Estructura de carpetas de tests (al final)

Por conveniencia, esta es la estructura de carpetas relacionada con las pruebas en el proyecto (mostrando los archivos más relevantes):

```
FrontEndApp/
├─ src/
│  └─ utils/
│     ├─ ApiService.js
│     ├─ AuthStorage.js
│     ├─ SecureAuthStorage.js
│     └─ test/
│        ├─ ApiService.test.js
│        └─ FirebaseFavoritesService.test.js
├─ jest.setup.js
├─ package.json
└─ Tests_Readme.md
```



