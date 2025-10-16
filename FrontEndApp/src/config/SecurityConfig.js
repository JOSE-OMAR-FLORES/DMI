/**
 * 🔐 Configuración centralizada de seguridad
 * 
 * Este archivo define todas las políticas de seguridad de la aplicación:
 * - TLS/SSL
 * - Certificate Pinning
 * - Cifrado
 * - GDPR
 * - Retención de datos
 */

export const SecurityConfig = {
  // ========================================
  // TLS / SSL Configuration
  // ========================================
  tls: {
    minVersion: 'TLSv1.3',
    maxVersion: 'TLSv1.3',
    enforceHttps: process.env.NODE_ENV === 'production',
    allowInsecureConnections: process.env.NODE_ENV === 'development',
    
    // Ciphers permitidos (solo los más seguros)
    ciphers: [
      'TLS_AES_256_GCM_SHA384',
      'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_AES_128_GCM_SHA256'
    ],
  },

  // ========================================
  // Certificate Pinning
  // ========================================
  certificatePinning: {
    enabled: process.env.NODE_ENV === 'production',
    
    // IMPORTANTE: Reemplaza estos valores con los fingerprints reales de tu servidor
    // Para obtenerlos:
    // 1. openssl s_client -connect tudominio.com:443 < /dev/null | openssl x509 -fingerprint -sha256 -noout
    // 2. Convierte el resultado a base64
    
    certificates: {
      production: [
        {
          domain: 'api.tuapp.com',
          fingerprints: [
            'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', // Certificado principal
            'sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=', // Certificado backup
          ],
          validUntil: '2026-12-31'
        }
      ],
      development: [
        {
          domain: 'localhost',
          fingerprints: ['sha256/DEVDEVDEVDEVDEVDEVDEVDEVDEVDEVDEVDEVDEVDEV='],
          validUntil: '2025-12-31'
        }
      ]
    },

    // Políticas de fallo
    failurePolicy: {
      onPinMismatch: 'reject', // 'reject' | 'warn' | 'allow'
      onCertificateExpired: 'reject',
      onNetworkError: 'retry',
      maxRetries: 3
    }
  },

  // ========================================
  // Encryption (AES-256)
  // ========================================
  encryption: {
    algorithm: 'aes-256-cbc',
    keySize: 256, // bits
    ivSize: 16, // bytes (128 bits)
    
    // PBKDF2 configuración
    pbkdf2: {
      iterations: 10000,
      hashAlgorithm: 'sha256'
    },

    // Datos que deben cifrarse
    encryptedFields: [
      'user_data',
      'personal_info',
      'sensitive_data',
      'payment_info',
      'health_data',
      'location_data'
    ],

    // Rotación automática de claves
    keyRotation: {
      enabled: true,
      intervalDays: 90
    }
  },

  // ========================================
  // GDPR Compliance
  // ========================================
  gdpr: {
    enabled: true,
    
    // Retención de datos
    dataRetention: {
      defaultDays: 365, // 1 año
      minimumDays: 30,
      maximumDays: 2555, // 7 años (requisitos legales)
      
      // Retención por tipo de dato
      byCategory: {
        'user_profile': 730, // 2 años
        'usage_logs': 90, // 3 meses
        'audit_logs': 2555, // 7 años
        'session_data': 30 // 1 mes
      }
    },

    // Minimización de datos
    dataMinimization: {
      enabled: true,
      collectOnlyNecessary: true,
      
      // Campos obligatorios vs opcionales
      requiredFields: ['email', 'name'],
      optionalFields: ['phone', 'address', 'birthdate']
    },

    // Derechos del usuario
    userRights: {
      accessEnabled: true, // Art. 15 - Derecho de acceso
      rectificationEnabled: true, // Art. 16 - Rectificación
      erasureEnabled: true, // Art. 17 - Derecho al olvido
      portabilityEnabled: true, // Art. 20 - Portabilidad
      restrictionEnabled: true, // Art. 18 - Limitación
      
      // Tiempos de respuesta
      responseTimeHours: 720 // 30 días
    },

    // Consentimiento
    consent: {
      required: true,
      explicit: true,
      withdrawable: true,
      granular: true, // Consentimiento separado por propósito
      
      purposes: [
        'authentication',
        'personalization',
        'analytics',
        'marketing',
        'third_party_sharing'
      ]
    },

    // Auditoría
    audit: {
      enabled: true,
      logAllAccess: true,
      logModifications: true,
      logDeletions: true,
      logExports: true,
      retentionDays: 2555 // 7 años
    }
  },

  // ========================================
  // Secrets Management
  // ========================================
  secrets: {
    useEnvironmentVariables: false, // NO usar .env en producción
    useSecureStore: true, // Usar Keychain/Keystore
    
    // Rotación de secretos
    rotation: {
      enabled: true,
      intervalDays: 90,
      notifyBeforeDays: 7
    },

    // Secretos críticos que NUNCA deben estar hardcoded
    criticalSecrets: [
      'API_KEY',
      'API_SECRET',
      'JWT_SECRET',
      'ENCRYPTION_KEY',
      'FIREBASE_API_KEY',
      'OAUTH_CLIENT_SECRET'
    ],

    // Validación
    validation: {
      checkOnStartup: true,
      failIfMissing: process.env.NODE_ENV === 'production'
    }
  },

  // ========================================
  // Network Security
  // ========================================
  network: {
    timeout: 30000, // 30 segundos
    maxRetries: 3,
    retryDelay: 1000, // ms
    
    // Headers de seguridad
    securityHeaders: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'",
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    },

    // Rate limiting
    rateLimiting: {
      enabled: true,
      maxRequestsPerMinute: 60,
      burstSize: 10
    },

    // Detección de MITM
    mitm: {
      detectInsecureConnections: true,
      logSuspiciousActivity: true,
      blockOnDetection: process.env.NODE_ENV === 'production'
    }
  },

  // ========================================
  // Authentication & Authorization
  // ========================================
  auth: {
    // JWT
    jwt: {
      algorithm: 'HS256',
      expiresIn: '1h',
      refreshTokenExpiresIn: '7d',
      
      // Almacenamiento seguro
      secureStorage: true,
      encryptToken: true
    },

    // MFA
    mfa: {
      enabled: true,
      methods: ['email', 'authenticator'],
      codeLength: 6,
      codeExpiry: 300, // 5 minutos
      maxAttempts: 3
    },

    // Sesión
    session: {
      timeout: 3600, // 1 hora
      renewOnActivity: true,
      singleDeviceOnly: false,
      forceLogoutOnSuspicious: true
    },

    // Passwords
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventReuse: 5, // Últimas 5 passwords
      expiryDays: 90
    }
  },

  // ========================================
  // Logging & Monitoring
  // ========================================
  logging: {
    enabled: true,
    level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    
    // Eventos de seguridad que deben registrarse
    securityEvents: [
      'login_attempt',
      'login_success',
      'login_failure',
      'logout',
      'mfa_enabled',
      'mfa_disabled',
      'password_change',
      'data_access',
      'data_modification',
      'data_export',
      'data_deletion',
      'certificate_pinning_failure',
      'mitm_detection',
      'unauthorized_access'
    ],

    // Retención de logs
    retentionDays: 90,
    
    // Nunca loguear información sensible
    redactSensitiveData: true,
    sensitiveFields: [
      'password',
      'token',
      'secret',
      'api_key',
      'credit_card',
      'ssn'
    ]
  },

  // ========================================
  // Security Headers & Policies
  // ========================================
  security: {
    // Content Security Policy
    csp: {
      enabled: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },

    // Protección CSRF
    csrf: {
      enabled: true,
      tokenName: 'X-CSRF-Token',
      cookieName: 'csrf_token'
    },

    // Protección XSS
    xss: {
      enabled: true,
      sanitizeInput: true,
      sanitizeOutput: true
    }
  }
};

export default SecurityConfig;
