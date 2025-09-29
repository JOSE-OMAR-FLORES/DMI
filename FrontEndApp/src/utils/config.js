// config.js - Configuración de APIs externas y constantes
import { 
  OPENWEATHER_API_KEY, 
  OPENWEATHER_BASE_URL, 
  OPENWEATHER_DEFAULT_CITY, 
  API_TIMEOUT 
} from '@env';

// Variables de entorno cargadas correctamente

export const API_CONFIGS = {
  // OpenWeather API Configuration
  OPENWEATHER: {
    BASE_URL: OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5',
    // API Key obtenida desde variables de entorno (seguro)
    API_KEY: OPENWEATHER_API_KEY || 'API_KEY_NOT_CONFIGURED',
    DEFAULT_CITY: OPENWEATHER_DEFAULT_CITY || 'Tehuacán',
    UNITS: 'metric', // metric, imperial, kelvin
    LANGUAGE: 'es',
    TIMEOUT: parseInt(API_TIMEOUT) || 15000, // 15 segundos
  },
  
  // Configuración general para APIs externas
  GENERAL: {
    RETRY_ATTEMPTS: 3,
    CACHE_DURATION: 10 * 60 * 1000, // 10 minutos en milisegundos
  }
};

// Validación de configuración
export const validateConfig = () => {
  const errors = [];
  
  if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'tu_api_key_aqui') {
    errors.push('❌ OPENWEATHER_API_KEY no está configurada. Verifica tu archivo .env');
  }
  
  if (API_CONFIGS.OPENWEATHER.API_KEY === 'API_KEY_NOT_CONFIGURED') {
    errors.push('❌ API Key de OpenWeather no configurada correctamente');
  }
  
  if (errors.length > 0) {
    console.warn('🔧 Problemas de configuración detectados:');
    errors.forEach(error => console.warn(error));
    console.warn('📖 Revisa el archivo .env.example para más información');
  }
  
  return errors.length === 0;
};

// Instrucciones para obtener API Key de OpenWeather
export const OPENWEATHER_SETUP = {
  instructions: [
    "1. Ve a https://openweathermap.org/api",
    "2. Crea una cuenta gratuita",
    "3. Ve a 'API Keys' en tu dashboard",
    "4. Copia tu API Key",
    "5. Reemplaza 'TU_API_KEY_AQUI' en src/utils/config.js",
    "6. La API Key tarda hasta 2 horas en activarse"
  ],
  limits: {
    free_plan: "1,000 llamadas/día",
    rate_limit: "60 llamadas/minuto"
  }
};