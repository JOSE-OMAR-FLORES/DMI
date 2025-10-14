# 🔐 Autenticación MFA con Laravel + JWT

## ✅ IMPLEMENTACIÓN COMPLETADA

Has preguntado: **"¿Puedo usar MFA si manejo el registro y autenticación en Laravel?"**

**Respuesta: ¡SÍ! Absolutamente.** He implementado un sistema MFA completo que funciona con tu autenticación Laravel existente.

---

## 🏗️ Arquitectura del Sistema

### **Flujo de Autenticación con MFA:**

```
┌─────────────────┐
│  Usuario        │
│  (React Native) │
└────────┬────────┘
         │
         │ 1. POST /auth-mfa/login
         │    { email, password }
         ▼
┌─────────────────────┐
│  Laravel Backend    │
│  (MySQL Database)   │
└────────┬────────────┘
         │
         │ 2. ¿Credenciales OK?
         ├──── NO ──► Error 401
         └──── SÍ
               │
               │ 3. ¿MFA habilitado?
               ├──── NO ──► Genera JWT Token → Login OK
               └──── SÍ
                     │
                     │ 4. Genera código 6 dígitos
                     │    Guarda en Cache (5 min)
                     │    Envía por email
                     ▼
              ┌──────────────┐
              │ Usuario      │
              │ Ingresa      │
              │ Código MFA   │
              └──────┬───────┘
                     │
                     │ 5. POST /auth-mfa/verify-mfa
                     │    { user_id, code }
                     ▼
              ┌──────────────┐
              │ Verifica     │
              │ Código       │
              └──────┬───────┘
                     │
                     ├──── INVÁLIDO ──► Error 401
                     └──── VÁLIDO
                           │
                           │ 6. Genera JWT Token
                           │    Login completado
                           ▼
                     ┌──────────────┐
                     │ Acceso       │
                     │ Completo     │
                     └──────────────┘
```

---

## 📦 Archivos Creados

### 1. **Base de Datos**
✅ **Migración**: `database/migrations/2025_10_14_151138_add_mfa_fields_to_users_table.php`

Campos agregados a `users`:
- `mfa_enabled` (boolean) - Si MFA está activo
- `mfa_backup_codes` (text) - Códigos de respaldo hasheados
- `mfa_enabled_at` (timestamp) - Cuándo se habilitó

### 2. **Servicios**
✅ **LaravelMFAService**: `app/Services/LaravelMFAService.php`

Funcionalidades:
- ✅ Generar códigos de verificación (6 dígitos)
- ✅ Enviar códigos por email
- ✅ Verificar códigos
- ✅ Generar códigos de respaldo (8 códigos)
- ✅ Verificar códigos de respaldo
- ✅ Gestión de sesiones MFA
- ✅ Bloqueo por intentos fallidos (5 intentos = 15 min bloqueado)

### 3. **Controlador**
✅ **AuthMFAController**: `app/Http/Controllers/AuthMFAController.php`

### 4. **Rutas API**
✅ Agregadas a `routes/api.php`

---

## 📡 Endpoints Disponibles

### **Base URL**: `/api/v1/auth-mfa`

### 🔓 **Rutas Públicas (Sin Autenticación)**

#### 1. Login con MFA
```http
POST /api/v1/auth-mfa/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Respuesta si NO tiene MFA:**
```json
{
  "success": true,
  "mfa_required": false,
  "message": "Login successful",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "mfa_enabled": false
  }
}
```

**Respuesta si SÍ tiene MFA:**
```json
{
  "success": true,
  "mfa_required": true,
  "message": "MFA code sent to your email",
  "user_id": 1,
  "code": "123456"  // Solo en modo debug
}
```

#### 2. Verificar Código MFA
```http
POST /api/v1/auth-mfa/verify-mfa
Content-Type: application/json

{
  "user_id": 1,
  "code": "123456"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "MFA verification successful",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "mfa_enabled": true
  }
}
```

#### 3. Verificar Código de Respaldo
```http
POST /api/v1/auth-mfa/verify-backup-code
Content-Type: application/json

{
  "user_id": 1,
  "code": "A1B2C3D4"
}
```

#### 4. Reenviar Código
```http
POST /api/v1/auth-mfa/resend-code
Content-Type: application/json

{
  "user_id": 1
}
```

---

### 🔒 **Rutas Protegidas (Requieren JWT Token)**

**Header requerido:**
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

#### 5. Habilitar MFA
```http
POST /api/v1/auth-mfa/enable-mfa
Authorization: Bearer {tu_jwt_token}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "MFA enabled successfully",
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
  "warning": "Save these backup codes in a secure place. They will not be shown again."
}
```

#### 6. Deshabilitar MFA
```http
POST /api/v1/auth-mfa/disable-mfa
Authorization: Bearer {tu_jwt_token}
```

#### 7. Regenerar Códigos de Respaldo
```http
POST /api/v1/auth-mfa/regenerate-backup-codes
Authorization: Bearer {tu_jwt_token}
```

#### 8. Verificar Estado de MFA
```http
GET /api/v1/auth-mfa/mfa-status
Authorization: Bearer {tu_jwt_token}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "mfa_enabled": true,
    "mfa_enabled_at": "2025-10-14 15:30:00",
    "has_backup_codes": true
  }
}
```

---

## 🔒 Características de Seguridad

### 1. **Códigos de Verificación**
- ✅ 6 dígitos aleatorios
- ✅ Expiran en 5 minutos
- ✅ Almacenados en cache (no en BD)
- ✅ Un solo uso

### 2. **Códigos de Respaldo**
- ✅ 8 códigos por usuario
- ✅ Hasheados con SHA-256
- ✅ Un solo uso cada uno
- ✅ Regenerables

### 3. **Protección contra Ataques**
- ✅ **Rate Limiting**: 5 intentos fallidos = bloqueo de 15 minutos
- ✅ **Expiración de códigos**: 5 minutos
- ✅ **Códigos hasheados**: No se almacenan en texto plano
- ✅ **Sesiones MFA**: Expiran en 1 hora

### 4. **Integración con JWT**
- ✅ Compatible con tu autenticación JWT existente
- ✅ Tokens generados después de verificación MFA
- ✅ No interfiere con tu sistema actual

---

## 💻 Implementación en React Native

### 1. Pantalla de Login con MFA

```javascript
// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://tu-api.com/api/v1';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [userId, setUserId] = useState(null);

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth-mfa/login`, {
        email,
        password
      });

      if (response.data.mfa_required) {
        // Requiere MFA
        setUserId(response.data.user_id);
        setShowMFA(true);
        Alert.alert('Código Enviado', 'Revisa tu email para el código de verificación');
      } else {
        // Login exitoso sin MFA
        await AsyncStorage.setItem('token', response.data.access_token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        navigation.navigate('Home');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Login failed');
    }
  };

  const handleVerifyMFA = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth-mfa/verify-mfa`, {
        user_id: userId,
        code: mfaCode
      });

      // Login exitoso con MFA
      await AsyncStorage.setItem('token', response.data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', 'Código inválido o expirado');
    }
  };

  const handleResendCode = async () => {
    try {
      await axios.post(`${API_URL}/auth-mfa/resend-code`, {
        user_id: userId
      });
      Alert.alert('Éxito', 'Código reenviado a tu email');
    } catch (error) {
      Alert.alert('Error', 'No se pudo reenviar el código');
    }
  };

  if (showMFA) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, marginBottom: 20 }}>
          Verificación MFA
        </Text>
        <TextInput
          placeholder="Código de 6 dígitos"
          value={mfaCode}
          onChangeText={setMfaCode}
          keyboardType="number-pad"
          maxLength={6}
          style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        />
        <Button title="Verificar Código" onPress={handleVerifyMFA} />
        <Button title="Reenviar Código" onPress={handleResendCode} color="gray" />
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <Button title="Iniciar Sesión" onPress={handleLogin} />
    </View>
  );
};

export default LoginScreen;
```

### 2. Pantalla de Configuración de MFA

```javascript
// src/screens/MFASettingsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://tu-api.com/api/v1';

const MFASettingsScreen = () => {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [token, setToken] = useState('');

  useEffect(() => {
    loadMFAStatus();
  }, []);

  const loadMFAStatus = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      setToken(savedToken);

      const response = await axios.get(`${API_URL}/auth-mfa/mfa-status`, {
        headers: { Authorization: `Bearer ${savedToken}` }
      });

      setMfaEnabled(response.data.data.mfa_enabled);
    } catch (error) {
      console.error('Error loading MFA status:', error);
    }
  };

  const handleEnableMFA = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/auth-mfa/enable-mfa`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMfaEnabled(true);
      setBackupCodes(response.data.backup_codes);
      
      Alert.alert(
        'MFA Habilitado',
        'Guarda tus códigos de respaldo en un lugar seguro',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo habilitar MFA');
    }
  };

  const handleDisableMFA = async () => {
    Alert.alert(
      'Deshabilitar MFA',
      '¿Estás seguro que deseas deshabilitar la autenticación multifactor?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deshabilitar',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.post(
                `${API_URL}/auth-mfa/disable-mfa`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
              );

              setMfaEnabled(false);
              setBackupCodes([]);
              Alert.alert('MFA Deshabilitado', 'La autenticación multifactor ha sido deshabilitada');
            } catch (error) {
              Alert.alert('Error', 'No se pudo deshabilitar MFA');
            }
          }
        }
      ]
    );
  };

  const handleRegenerateBackupCodes = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/auth-mfa/regenerate-backup-codes`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBackupCodes(response.data.backup_codes);
      Alert.alert('Códigos Regenerados', 'Los códigos anteriores han sido invalidados');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron regenerar los códigos');
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20, fontWeight: 'bold' }}>
        Configuración MFA
      </Text>

      <Text style={{ marginBottom: 10 }}>
        Estado: {mfaEnabled ? '✅ Habilitado' : '❌ Deshabilitado'}
      </Text>

      {!mfaEnabled ? (
        <Button title="Habilitar MFA" onPress={handleEnableMFA} />
      ) : (
        <>
          <Button title="Deshabilitar MFA" onPress={handleDisableMFA} color="red" />
          <View style={{ marginTop: 10 }}>
            <Button 
              title="Regenerar Códigos de Respaldo" 
              onPress={handleRegenerateBackupCodes} 
              color="orange" 
            />
          </View>
        </>
      )}

      {backupCodes.length > 0 && (
        <View style={{ marginTop: 20, padding: 15, backgroundColor: '#f0f0f0' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Códigos de Respaldo:
          </Text>
          {backupCodes.map((code, index) => (
            <Text key={index} style={{ fontFamily: 'monospace', padding: 5 }}>
              {index + 1}. {code}
            </Text>
          ))}
          <Text style={{ color: 'red', marginTop: 10, fontWeight: 'bold' }}>
            ⚠️ Guarda estos códigos en un lugar seguro.
            {'\n'}No se mostrarán de nuevo.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default MFASettingsScreen;
```

---

## 🧪 Testing con Postman

### Test 1: Login Sin MFA
```http
POST http://localhost:8000/api/v1/auth-mfa/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### Test 2: Habilitar MFA (requiere JWT)
```http
POST http://localhost:8000/api/v1/auth-mfa/enable-mfa
Authorization: Bearer {tu_token_jwt}
```

### Test 3: Login Con MFA Habilitado
```http
POST http://localhost:8000/api/v1/auth-mfa/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### Test 4: Verificar Código MFA
```http
POST http://localhost:8000/api/v1/auth-mfa/verify-mfa
Content-Type: application/json

{
  "user_id": 1,
  "code": "123456"
}
```

---

## 📝 Diferencias entre las Dos Implementaciones

### **Laravel MFA** (`/auth-mfa/*`)
✅ Usa tu base de datos MySQL
✅ Usa tu sistema de usuarios existente
✅ Compatible con JWT
✅ Códigos en cache de Laravel
✅ **Recomendado para tu caso**

### **Firebase MFA** (`/firebase/mfa/*`)
✅ Usa Firebase como backend
✅ Requiere Firebase Auth
✅ Gestión de usuarios en Firebase
✅ Más complejo de integrar con sistema existente

---

## ✅ Resumen

**¿Puedes usar MFA con tu autenticación Laravel?**
### ¡SÍ! ✅

He implementado:
1. ✅ Migración de base de datos
2. ✅ Servicio MFA completo
3. ✅ Controlador con todos los endpoints
4. ✅ Rutas API configuradas
5. ✅ Ejemplos de React Native
6. ✅ Sistema de seguridad robusto

**¡Tu sistema de autenticación Laravel ahora tiene MFA completo!** 🎉

¿Quieres que te ayude a probar los endpoints o a implementar algo específico?
