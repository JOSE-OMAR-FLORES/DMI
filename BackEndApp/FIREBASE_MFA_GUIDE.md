# 🔐 Firebase MFA (Multi-Factor Authentication) - Guía Completa

## 📋 ¿Qué es MFA?

MFA (Autenticación Multifactor) agrega una capa adicional de seguridad requiriendo dos o más factores de verificación:
1. **Algo que sabes** (contraseña)
2. **Algo que tienes** (código de verificación por SMS/email o app)
3. **Algo que eres** (biometría - opcional)

---

## ✅ Configuración Completada

### 1. Variables de Entorno Agregadas

En tu archivo `.env` se agregaron:

```env
# Firebase Admin SDK (Backend)
FIREBASE_CREDENTIALS=storage/app/firebase-credentials.json
FIREBASE_DATABASE_URL=https://dmi-app-88868-default-rtdb.firebaseio.com

# MFA Configuration
MFA_REQUIRED=true
FIREBASE_MFA_ENABLED=true
```

### 2. Archivos Creados

✅ **Servicio MFA**: `app/Services/FirebaseMFAService.php`
✅ **Controlador MFA**: `app/Http/Controllers/FirebaseMFAController.php`
✅ **Rutas API**: Agregadas a `routes/api.php`

---

## 🚀 Endpoints de MFA Disponibles

### Base URL
```
http://tu-servidor/api/v1/firebase/mfa
```

### 1. Habilitar MFA para un Usuario
```http
POST /api/v1/firebase/mfa/enable
Content-Type: application/json

{
  "uid": "user_firebase_uid"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "MFA enabled successfully",
  "data": {
    "user": {
      "uid": "user123",
      "email": "user@example.com",
      "emailVerified": true
    }
  }
}
```

### 2. Verificar Estado de MFA
```http
POST /api/v1/firebase/mfa/check-status
Content-Type: application/json

{
  "uid": "user_firebase_uid"
}
```

### 3. Enviar Código de Verificación
```http
POST /api/v1/firebase/mfa/send-code
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Respuesta (en modo debug):**
```json
{
  "success": true,
  "message": "Verification code sent",
  "code": "123456"
}
```

### 4. Verificar Código MFA
```http
POST /api/v1/firebase/mfa/verify-code
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456",
  "uid": "user_firebase_uid"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Code verified successfully",
  "data": {
    "custom_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "mfa_session_id": "session_id_here"
  }
}
```

### 5. Generar Códigos de Respaldo
```http
POST /api/v1/firebase/mfa/generate-backup-codes
Content-Type: application/json

{
  "uid": "user_firebase_uid"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Backup codes generated successfully",
  "data": {
    "backup_codes": [
      "A1B2C3D4",
      "E5F6G7H8",
      "I9J0K1L2",
      "M3N4O5P6",
      "Q7R8S9T0",
      "U1V2W3X4",
      "Y5Z6A7B8",
      "C9D0E1F2"
    ],
    "warning": "Save these codes in a secure place. They will not be shown again."
  }
}
```

### 6. Verificar Código de Respaldo
```http
POST /api/v1/firebase/mfa/verify-backup-code
Content-Type: application/json

{
  "uid": "user_firebase_uid",
  "code": "A1B2C3D4"
}
```

### 7. Deshabilitar MFA
```http
POST /api/v1/firebase/mfa/disable
Content-Type: application/json

{
  "uid": "user_firebase_uid"
}
```

### 8. Validar Sesión MFA
```http
POST /api/v1/firebase/mfa/validate-session
Content-Type: application/json

{
  "uid": "user_firebase_uid",
  "session_id": "session_id_from_verification"
}
```

---

## 📱 Flujo de Autenticación con MFA

### Flujo Completo:

```
1. Usuario ingresa email y contraseña
   ↓
2. Verificar credenciales con Firebase
   ↓
3. ¿Tiene MFA habilitado?
   ├── NO → Login exitoso
   └── SÍ → Solicitar código MFA
       ↓
4. Enviar código de verificación
   POST /api/v1/firebase/mfa/send-code
   ↓
5. Usuario ingresa código recibido
   ↓
6. Verificar código
   POST /api/v1/firebase/mfa/verify-code
   ↓
7. Recibir custom token con claims de MFA
   ↓
8. Login completo con MFA verificado
```

---

## 💻 Implementación en React Native

### 1. Componente de Login con MFA

```javascript
// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import axios from 'axios';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [userUid, setUserUid] = useState('');

  const handleLogin = async () => {
    try {
      // 1. Login con Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 2. Verificar si tiene MFA habilitado
      const mfaStatus = await axios.post('http://tu-api/api/v1/firebase/mfa/check-status', {
        uid: user.uid
      });

      if (mfaStatus.data.data.mfa_enabled) {
        // 3. MFA está habilitado, solicitar código
        setUserUid(user.uid);
        await requestMFACode(user.email);
        setShowMFA(true);
      } else {
        // Login exitoso sin MFA
        navigateToHome();
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const requestMFACode = async (email) => {
    try {
      const response = await axios.post('http://tu-api/api/v1/firebase/mfa/send-code', {
        email: email
      });
      Alert.alert('Código Enviado', 'Revisa tu email para el código de verificación');
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el código');
    }
  };

  const verifyMFACode = async () => {
    try {
      const response = await axios.post('http://tu-api/api/v1/firebase/mfa/verify-code', {
        email: email,
        code: mfaCode,
        uid: userUid
      });

      if (response.data.success) {
        // MFA verificado, obtener custom token
        const customToken = response.data.data.custom_token;
        
        // Usar el custom token para autenticarse en Firebase
        await auth.signInWithCustomToken(customToken);
        
        Alert.alert('Éxito', 'Login con MFA completado');
        navigateToHome();
      }
    } catch (error) {
      Alert.alert('Error', 'Código inválido');
    }
  };

  if (showMFA) {
    return (
      <View>
        <TextInput
          placeholder="Código de verificación (6 dígitos)"
          value={mfaCode}
          onChangeText={setMfaCode}
          keyboardType="number-pad"
          maxLength={6}
        />
        <Button title="Verificar Código" onPress={verifyMFACode} />
      </View>
    );
  }

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Iniciar Sesión" onPress={handleLogin} />
    </View>
  );
};

export default LoginScreen;
```

### 2. Pantalla de Configuración de MFA

```javascript
// src/screens/MFASetupScreen.js
import React, { useState } from 'react';
import { View, Button, Alert, Text, ScrollView } from 'react-native';
import { auth } from '../config/firebase';
import axios from 'axios';

const MFASetupScreen = () => {
  const [backupCodes, setBackupCodes] = useState([]);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  const enableMFA = async () => {
    try {
      const user = auth.currentUser;
      
      // 1. Habilitar MFA
      const response = await axios.post('http://tu-api/api/v1/firebase/mfa/enable', {
        uid: user.uid
      });

      // 2. Establecer claim de MFA
      await axios.post('http://tu-api/api/v1/firebase/mfa/set-claim', {
        uid: user.uid,
        enabled: true
      });

      // 3. Generar códigos de respaldo
      const codesResponse = await axios.post('http://tu-api/api/v1/firebase/mfa/generate-backup-codes', {
        uid: user.uid
      });

      setBackupCodes(codesResponse.data.data.backup_codes);
      setMfaEnabled(true);
      
      Alert.alert('MFA Habilitado', 'Guarda los códigos de respaldo en un lugar seguro');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const disableMFA = async () => {
    try {
      const user = auth.currentUser;
      
      await axios.post('http://tu-api/api/v1/firebase/mfa/disable', {
        uid: user.uid
      });

      setMfaEnabled(false);
      setBackupCodes([]);
      
      Alert.alert('MFA Deshabilitado', 'La autenticación multifactor ha sido deshabilitada');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        Configuración de MFA
      </Text>

      {!mfaEnabled ? (
        <Button title="Habilitar MFA" onPress={enableMFA} />
      ) : (
        <>
          <Button title="Deshabilitar MFA" onPress={disableMFA} color="red" />
          
          {backupCodes.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                Códigos de Respaldo:
              </Text>
              {backupCodes.map((code, index) => (
                <Text key={index} style={{ fontFamily: 'monospace', padding: 5 }}>
                  {code}
                </Text>
              ))}
              <Text style={{ color: 'red', marginTop: 10 }}>
                ⚠️ Guarda estos códigos en un lugar seguro. No se mostrarán de nuevo.
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

export default MFASetupScreen;
```

---

## 🔧 Habilitar MFA en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto **dmi-app-88868**
3. Ve a **Authentication** → **Sign-in method**
4. Haz clic en la pestaña **Advanced**
5. Activa **Multi-factor authentication**
6. Elige los métodos (SMS, TOTP, etc.)

---

## ⚠️ Importante

1. **Códigos de Respaldo**: Los usuarios deben guardarlos de forma segura
2. **Email Verificado**: El usuario debe tener su email verificado antes de habilitar MFA
3. **Sesiones**: Las sesiones MFA expiran después de 1 hora
4. **Testing**: En modo `APP_DEBUG=true`, el código se devuelve en la respuesta

---

## 🔍 Prueba los Endpoints

Usa Postman o Thunder Client en VS Code para probar los endpoints:

1. Habilitar MFA para un usuario
2. Enviar código de verificación
3. Verificar el código
4. Generar códigos de respaldo

---

## 📝 Próximos Pasos

1. ✅ Descargar credenciales de Firebase
2. ✅ Colocarlas en `storage/app/firebase-credentials.json`
3. ✅ Implementar UI en React Native
4. ✅ Probar flujo completo de MFA
5. ✅ Configurar envío de emails (opcional)

---

¿Necesitas ayuda con alguna parte específica de la implementación?
