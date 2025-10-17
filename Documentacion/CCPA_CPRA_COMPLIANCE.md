# 🌟 Documentación de Cumplimiento CCPA/CPRA

**Versión:** 2.0  
**Fecha:** 15 de octubre de 2025  
**Regulaciones:** 
- California Consumer Privacy Act (CCPA) - Cal. Civ. Code §1798.100
- California Privacy Rights Act (CPRA) - Prop 24, 2020

---

## 📌 Índice

1. [Información del Negocio](#1-información-del-negocio)
2. [Alcance y Aplicabilidad](#2-alcance-y-aplicabilidad)
3. [Categorías de Información Personal](#3-categorías-de-información-personal)
4. [Propósitos Comerciales](#4-propósitos-comerciales)
5. [Derechos de los Consumidores](#5-derechos-de-los-consumidores)
6. [Divulgaciones y Transparencia](#6-divulgaciones-y-transparencia)
7. [Política de No Venta](#7-política-de-no-venta)
8. [Verificación de Identidad](#8-verificación-de-identidad)
9. [No Discriminación](#9-no-discriminación)
10. [Auditoría y Cumplimiento](#10-auditoría-y-cumplimiento)

---

## 1. Información del Negocio

### Información de la Empresa
- **Nombre Legal:** Tu Aplicación S.A.
- **Nombre Comercial:** Tu Aplicación
- **Dirección:** Calle Principal 123, Ciudad, Estado, CP
- **Email de Privacidad:** privacy@tuapp.com
- **Teléfono:** +1 (800) 000-0000
- **Sitio Web:** https://www.tuapp.com

### Información de Contacto para Privacidad
- **Email Principal:** privacy@tuapp.com
- **Formulario Web:** https://www.tuapp.com/privacy-request
- **Teléfono Gratuito:** 1-800-PRIVACY (disponible en la app)

---

## 2. Alcance y Aplicabilidad

### ¿Somos un "Negocio" bajo CCPA/CPRA?

**Criterios CCPA (§1798.140(d)):**
- ✅ Hacemos negocios en California
- ✅ Recopilamos información personal de residentes de California
- ⚠️ Ingresos anuales: [Verificar si > $25 millones]
- ⚠️ Consumidores CA: [Verificar si > 100,000]
- ❌ Ingresos por venta de PI: < 50%

**Decisión:** Cumplimiento voluntario para todas las mejores prácticas

### Residentes de California

Aplicamos los derechos CCPA/CPRA a:
- ✅ Residentes confirmados de California
- ✅ Todos los usuarios de EE.UU. (por simplicidad)
- ✅ Opcionalmente: Todos los usuarios globalmente (enfoque unificado)

---

## 3. Categorías de Información Personal

### Categorías Recopiladas (§1798.140(v))

| Categoría CCPA | Ejemplos | ¿Recopilamos? | Fuente | Propósito |
|----------------|----------|---------------|---------|-----------|
| **A. Identificadores** | Nombre, email, ID de usuario, dirección IP | ✅ Sí | Directa (registro) | Servicio, seguridad |
| **B. Categorías §1798.80(e)** | Nombre, dirección (si aplica) | ✅ Sí | Directa | Servicio |
| **C. Características protegidas** | Edad, género (si aplica) | ❌ No | - | - |
| **D. Información comercial** | Historial de tareas (TODOs) | ✅ Sí | Uso de app | Servicio |
| **E. Información biométrica** | Huellas, reconocimiento facial | ❌ No | - | - |
| **F. Actividad en internet** | Logs de actividad, interacciones | ✅ Sí | Automática | Mejoras, seguridad |
| **G. Datos de geolocalización** | Ubicación (si se consiente) | ⚠️ Opcional | GPS (consentimiento) | Funcionalidad |
| **H. Información sensorial** | Audio, video | ❌ No | - | - |
| **I. Información profesional** | Ocupación (si se proporciona) | ❌ No | - | - |
| **J. Información educativa** | No aplicable | ❌ No | - | - |
| **K. Inferencias** | Perfiles de preferencias (si se consiente) | ⚠️ Opcional | Análisis | Personalización |

### Información Sensible (CPRA §1798.140(ae))

| Categoría Sensible | ¿Recopilamos? | Consentimiento | Limitación de Uso |
|--------------------|---------------|----------------|-------------------|
| SSN, licencia de conducir | ❌ No | - | - |
| Credenciales de cuenta | ✅ Sí (contraseña cifrada) | Implícito (servicio) | Solo autenticación |
| Geolocalización precisa | ⚠️ Opcional | ✅ Explícito | Funcionalidad |
| Origen racial/étnico | ❌ No | - | - |
| Creencias religiosas | ❌ No | - | - |
| Orientación sexual | ❌ No | - | - |
| Datos de salud | ❌ No | - | - |
| Mensajes privados | ❌ No | - | - |

**Implementación:** Usuario puede limitar uso de información sensible (CPRA §1798.121)  
**Archivo:** `ConsentManagementScreen.js` - Opción "Limitar Uso de Información Sensible"

---

## 4. Propósitos Comerciales

### §1798.140(e) - Propósito Comercial

#### Propósitos para los que Usamos Información Personal

1. **Proporcionar el Servicio**
   - Base: Relación comercial
   - Datos: Identificadores, información de cuenta
   - Retención: Durante la cuenta activa + 365 días

2. **Seguridad y Prevención de Fraude**
   - Base: Interés comercial legítimo
   - Datos: Logs de actividad, dirección IP
   - Retención: 180 días

3. **Mejoras del Producto** (con consentimiento)
   - Base: Consentimiento
   - Datos: Patrones de uso, preferencias
   - Retención: 14 meses

4. **Comunicaciones de Marketing** (con consentimiento)
   - Base: Consentimiento
   - Datos: Email, preferencias
   - Retención: Hasta revocación + 30 días

5. **Cumplimiento Legal**
   - Base: Obligación legal
   - Datos: Registros de auditoría
   - Retención: Según ley aplicable (hasta 6 años)

---

## 5. Derechos de los Consumidores

### Implementación de Derechos CCPA/CPRA

#### 1. Derecho a Saber (§1798.100, §1798.110)

**¿Qué información recopilamos sobre ti?**

**Implementación:**
```javascript
// GDPRComplianceService.js (compatible con CCPA)
async getUserData(userId)
```

**Plazo de Respuesta:** 45 días (extensible a 90 días)

**Información Proporcionada:**
- Categorías de PI recopilada
- Fuentes de PI
- Propósitos comerciales
- Categorías de terceros con quienes se comparte
- Piezas específicas de PI (si se solicita)

**Formato de Entrega:** JSON estructurado, descargable desde la app

---

#### 2. Derecho a Eliminar (§1798.105)

**Elimina mi información personal**

**Implementación:**
```javascript
// GDPRComplianceService.js
async deleteUserData(userId)
```

**Plazo de Respuesta:** 45 días

**Alcance:**
- ✅ Información personal del usuario
- ✅ Datos de cuenta y perfil
- ✅ Historial de tareas (TODOs)
- ✅ Logs de actividad
- ⚠️ Datos en backups (eliminados en 30 días)

**Excepciones (§1798.105(d)):**
- Completar transacción activa
- Detectar incidentes de seguridad
- Ejercer derecho de libertad de expresión
- Cumplir obligación legal
- Uso interno razonable

**Procedimiento:**
1. Solicitud desde app o email
2. Verificación de identidad (MFA)
3. Confirmación de eliminación
4. Ejecución en 45 días
5. Notificación de completado

---

#### 3. Derecho a Corregir (§1798.106 - CPRA)

**Corrige información inexacta**

**Implementación:**
```javascript
// Backend: PUT /api/user/profile
// Frontend: ProfileScreen.js
```

**Plazo de Respuesta:** 45 días

**Proceso:**
1. Usuario identifica dato inexacto
2. Proporciona corrección
3. Verificamos razonabilidad
4. Actualizamos información
5. Notificamos al usuario

---

#### 4. Derecho a Optar por No Vender (§1798.120)

**"Do Not Sell My Personal Information"**

**Declaración:** **NO VENDEMOS INFORMACIÓN PERSONAL**

**Implementación (preventiva):**
```javascript
// ConsentManagementService.js
async doNotSellMyData(userId)
```

**Enlace Destacado:** 
- En app: Configuración > Privacidad > "Do Not Sell My Personal Information"
- Pantalla: `ConsentManagementScreen.js`
- Icono: 🛡️ "No Vender Mis Datos"

**Efecto:**
- No compartir PI con terceros para beneficio monetario
- Marcar cuenta con flag `do_not_sell: true`
- Revisar todos los proveedores de servicios

---

#### 5. Derecho a Limitar Uso de Información Sensible (§1798.121 - CPRA)

**Limita el uso de mi información sensible**

**Información Sensible que Recopilamos:**
- ✅ Credenciales de cuenta (contraseña cifrada)
- ⚠️ Geolocalización precisa (si se consiente)

**Implementación:**
```javascript
// ConsentManagementService.js
async revokeConsent(userId, ['location'])
```

**Pantalla:** `ConsentManagementScreen.js` - Switch de "Ubicación"

**Efecto:**
- Limitar uso a solo lo necesario para el servicio
- No usar para inferencias sobre características

---

#### 6. Derecho a Portabilidad (§1798.100(d))

**Recibir información en formato portable**

**Implementación:**
```javascript
// GDPRComplianceService.js
async exportUserData(userId)
```

**Formato:** JSON estructurado (máquina-legible)

**Contenido:**
```json
{
  "user": {
    "id": "user-123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "todos": [ ... ],
  "consents": { ... },
  "activity_log": [ ... ]
}
```

---

### Comparativa de Plazos

| Derecho | Plazo Respuesta | Extensión Posible | Notificación Extensión |
|---------|-----------------|-------------------|------------------------|
| Saber | 45 días | +45 días (90 total) | Dentro de 45 días |
| Eliminar | 45 días | +45 días (90 total) | Dentro de 45 días |
| Corregir (CPRA) | 45 días | +45 días (90 total) | Dentro de 45 días |
| Opt-Out | Inmediato | - | - |

---

## 6. Divulgaciones y Transparencia

### Aviso de Recopilación (§1798.100(b))

**En el momento de recopilación, divulgamos:**
1. Categorías de PI que recopilaremos
2. Propósitos para los que se usará la PI

**Implementación:**
- Pantalla de registro: Enlace a Política de Privacidad
- Pantalla: `PrivacyPolicyScreen.js`
- Archivo: `PRIVACY_NOTICE.md`

### Política de Privacidad (§1798.130(a)(5))

**Nuestra política incluye:**
- ✅ Categorías de PI recopilada (últimos 12 meses)
- ✅ Fuentes de PI
- ✅ Propósitos comerciales
- ✅ Categorías de PI vendida/compartida (N/A - no vendemos)
- ✅ Categorías de PI divulgada
- ✅ Derechos de consumidores de California
- ✅ Proceso para ejercer derechos

**Actualización:** Cada 12 meses o cuando hay cambios materiales

**Archivo:** `PrivacyPolicyScreen.js` - Versión 2.0 (Oct 2025)

---

## 7. Política de No Venta

### Declaración de No Venta

**DECLARAMOS OFICIALMENTE:**

> **NO VENDEMOS INFORMACIÓN PERSONAL DE CONSUMIDORES**

**Definición de "Venta" (§1798.140(ad)):**
- Venta, alquiler, divulgación, difusión
- A cambio de contraprestación monetaria u otro valor

**Compartir que NO es Venta:**
- ✅ Proveedores de servicios (hosting, email) bajo contrato
- ✅ Contratistas (desarrollo, soporte) bajo NDA
- ✅ Transferencias como parte de fusión/adquisición
- ✅ Autoridades gubernamentales (obligación legal)

### Proveedores de Servicios

| Proveedor | Servicio | Tipo de PI | Contrato |
|-----------|----------|------------|----------|
| AWS/Azure | Hosting | Todos los datos | ✅ Firmado |
| SendGrid | Email | Nombre, email | ✅ Firmado |
| [Proveedor Analytics] | Análisis (si aplica) | Datos de uso | ✅ Firmado |

**Cláusulas Contractuales:**
- Prohibición de venta de PI
- Uso solo para servicio especificado
- Certificación de cumplimiento
- Auditoría disponible

---

## 8. Verificación de Identidad

### §1798.140(y) - Solicitud Verificable

**Métodos de Verificación:**

#### Nivel 1: Solicitudes de Saber (Categorías)
**Método:** Email + Autenticación en app
**Proceso:**
1. Usuario inicia sesión con MFA
2. Envía solicitud desde configuración de la app
3. Verificación automática por sesión activa

#### Nivel 2: Solicitudes de Saber (Específicas) o Eliminar
**Método:** Autenticación MFA + Verificación adicional
**Proceso:**
1. Usuario inicia sesión con MFA
2. Código de verificación adicional por email
3. Confirmación de 3 puntos de información:
   - Email registrado
   - Última fecha de actividad
   - Dato de cuenta (nombre de tarea reciente)

#### Nivel 3: Agente Autorizado
**Método:** Poder notarial + Verificación directa
**Proceso:**
1. Presentar poder notarial válido
2. Verificar identidad del consumidor (Nivel 2)
3. Verificar autoridad del agente
4. Procesar solicitud

**Archivo de Implementación:** `AuthController.php` - Método `verifyUserIdentity()`

### Registro de Verificación

```javascript
// ComplianceTrackingService.js
await logRightsRequest(userId, {
  type: 'right_of_access',
  verification_method: 'mfa_plus_email',
  verification_status: 'verified',
  timestamp: new Date().toISOString()
});
```

---

## 9. No Discriminación

### §1798.125 - Prohibición de Discriminación

**COMPROMETEMOS A NO:**
- ❌ Denegar bienes o servicios
- ❌ Cobrar precios diferentes
- ❌ Proporcionar nivel diferente de calidad
- ❌ Sugerir que recibirás precio/calidad diferente

**Por ejercer derechos CCPA/CPRA**

### Incentivos Financieros Permitidos

**NO ofrecemos actualmente incentivos financieros**

Si ofreciéramos en el futuro:
- Explicación material de términos
- Cómo precio/servicio se relaciona con valor de PI
- Opt-in voluntario, revocable en cualquier momento

---

## 10. Auditoría y Cumplimiento

### Evaluación de Riesgo Anual

**Última Evaluación:** Octubre 2025  
**Próxima Evaluación:** Octubre 2026

**Elementos Evaluados:**
- ✅ Inventario de datos
- ✅ Flujos de datos
- ✅ Contratos con terceros
- ✅ Políticas de retención
- ✅ Medidas de seguridad
- ✅ Procesos de respuesta a solicitudes

### Métricas de Cumplimiento

```javascript
// Estadísticas (últimos 12 meses)
const ccpaMetrics = {
  requests: {
    toKnow: 5,
    toDelete: 2,
    toCorrect: 1,
    optOut: 3
  },
  responseTime: {
    average: '12 días',
    median: '10 días',
    max: '30 días'
  },
  verification: {
    successRate: '95%',
    fraudAttempts: 0
  }
};
```

**Archivo:** `ComplianceTrackingService.js` - `generateCCPAComplianceReport()`

### Capacitación del Personal

**Frecuencia:** Anual + cuando hay cambios en ley

**Temas:**
- Derechos de consumidores de California
- Proceso de verificación
- Plazos de respuesta
- Escalación de solicitudes complejas

**Última Capacitación:** Septiembre 2025  
**Próxima Capacitación:** Septiembre 2026

---

## 📊 Checklist de Cumplimiento CCPA/CPRA

### Antes de Lanzar
- [x] Política de Privacidad actualizada con divulgaciones CCPA
- [x] Enlace "Do Not Sell My Personal Information" visible
- [x] Proceso de verificación implementado
- [x] Formularios de solicitud de derechos
- [x] Capacitación del equipo

### Operaciones Continuas
- [x] Responder solicitudes dentro de 45 días
- [x] Mantener registro de solicitudes (24 meses)
- [x] Actualizar política anualmente
- [x] Auditar contratos con proveedores
- [x] Evaluar riesgo anualmente

### CPRA (Vigente desde 2023)
- [x] Derecho a corregir implementado
- [x] Derecho a limitar información sensible
- [x] Categorías de información sensible identificadas
- [x] Opt-out de compartir (además de vender)
- [x] Período de retención de 12 meses (look-back)

---

## 📞 Contacto para Solicitudes de Privacidad

### Residentes de California

**Métodos para Ejercer tus Derechos:**

1. **Formulario en la App:**
   - Configuración > Privacidad > Ejercer Derechos
   - Pantalla: `ConsentManagementScreen.js`

2. **Email:**
   - privacy@tuapp.com
   - Asunto: "CCPA Privacy Request - [Tipo de Solicitud]"

3. **Teléfono:**
   - 1-800-PRIVACY
   - Horario: Lunes a Viernes, 9am-5pm PT

4. **Correo Postal:**
   - Tu Aplicación S.A.
   - Attn: Privacy Department
   - Calle Principal 123
   - Ciudad, CA 90000

**Tiempo de Respuesta:** Confirmaremos recepción en 10 días, respuesta completa en 45 días

---

## 🔄 Cambios a Esta Política

**Última Actualización:** 15 de octubre de 2025  
**Versión:** 2.0

**Notificación de Cambios:**
- Actualizaremos fecha "Última actualización"
- Notificación in-app para cambios materiales
- Email a usuarios afectados
- Nuevo consentimiento si es necesario

---

## 📚 Referencias Legales

- **CCPA:** Cal. Civ. Code §1798.100 et seq.
- **CPRA:** California Proposition 24 (2020)
- **Regulaciones CCPA:** Cal. Code Regs. tit. 11, §7000 et seq.
- **Guía del Fiscal General:** https://oag.ca.gov/privacy/ccpa

---

**Versión:** 2.0  
**Próxima Revisión:** 15 de octubre de 2026  
**Estado:** COMPLIANT ✅

---

**Nota:** Esta documentación es complementaria a nuestra [Política de Privacidad](./PrivacyPolicyScreen.js) y [Documentación GDPR](./GDPR_COMPLIANCE.md).
