// WeatherService.js - Servicio para la API de OpenWeather
import axios from 'axios';
import { API_CONFIGS, validateConfig } from './config';

class WeatherService {
  constructor() {
    // Validar configuración al inicializar
    validateConfig();
    
    this.api = axios.create({
      baseURL: API_CONFIGS.OPENWEATHER.BASE_URL,
      timeout: API_CONFIGS.OPENWEATHER.TIMEOUT,
    });
  }

  /**
   * Obtener clima actual por nombre de ciudad
   * @param {string} cityName - Nombre de la ciudad
   * @returns {Promise<Object>} Datos del clima
   */
  async getCurrentWeather(cityName = API_CONFIGS.OPENWEATHER.DEFAULT_CITY) {
    try {
      console.log(`🌤️ Obteniendo clima para: ${cityName}`);
      
      // Verificar si hay API Key configurada
      if (!API_CONFIGS.OPENWEATHER.API_KEY || 
          API_CONFIGS.OPENWEATHER.API_KEY === 'API_KEY_NOT_CONFIGURED' ||
          API_CONFIGS.OPENWEATHER.API_KEY === 'tu_api_key_aqui') {
        return {
          success: false,
          error: {
            message: 'API Key no configurada. Revisa tu archivo .env',
            type: 'config',
            originalError: 'Missing API Key',
          },
        };
      }
      
      const response = await this.api.get('/weather', {
        params: {
          q: cityName,
          appid: API_CONFIGS.OPENWEATHER.API_KEY,
          units: API_CONFIGS.OPENWEATHER.UNITS,
          lang: API_CONFIGS.OPENWEATHER.LANGUAGE,
        },
      });

      const data = response.data;
      
      // Formatear los datos para nuestra aplicación
      const formattedData = {
        city: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind?.speed || 0,
        visibility: data.visibility ? (data.visibility / 1000).toFixed(1) : 'N/A',
        timestamp: new Date().toISOString(),
        sunrise: new Date(data.sys.sunrise * 1000),
        sunset: new Date(data.sys.sunset * 1000),
      };

      console.log('✅ Datos del clima obtenidos exitosamente');
      return {
        success: true,
        data: formattedData,
      };

    } catch (error) {
      console.error('❌ Error obteniendo datos del clima:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error desconocido';
      let errorType = 'unknown';

      if (error.code === 'ENOTFOUND' || error.code === 'NETWORK_ERROR') {
        errorMessage = 'Sin conexión a internet';
        errorType = 'network';
      } else if (error.response) {
        const status = error.response.status;
        switch (status) {
          case 401:
            errorMessage = 'API Key inválida';
            errorType = 'auth';
            break;
          case 404:
            errorMessage = `Ciudad "${cityName}" no encontrada`;
            errorType = 'notFound';
            break;
          case 429:
            errorMessage = 'Límite de consultas excedido';
            errorType = 'rateLimit';
            break;
          case 500:
          case 502:
          case 503:
            errorMessage = 'Servicio temporal no disponible';
            errorType = 'server';
            break;
          default:
            errorMessage = `Error del servidor (${status})`;
            errorType = 'server';
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Tiempo de espera agotado';
        errorType = 'timeout';
      }

      return {
        success: false,
        error: {
          message: errorMessage,
          type: errorType,
          originalError: error.message,
        },
      };
    }
  }

  /**
   * Obtener clima actual por coordenadas (más preciso)
   * @param {number} lat - Latitud
   * @param {number} lon - Longitud
   * @param {string} cityName - Nombre de la ciudad (opcional, para logging)
   * @returns {Promise<Object>} Datos del clima
   */
  async getCurrentWeatherByCoords(lat, lon, cityName = '') {
    try {
      console.log(`🌤️ Obteniendo clima por coordenadas: ${lat}, ${lon} ${cityName ? `(${cityName})` : ''}`);
      
      // Verificar si hay API Key configurada
      if (!API_CONFIGS.OPENWEATHER.API_KEY || 
          API_CONFIGS.OPENWEATHER.API_KEY === 'API_KEY_NOT_CONFIGURED' ||
          API_CONFIGS.OPENWEATHER.API_KEY === 'tu_api_key_aqui') {
        return {
          success: false,
          error: {
            message: 'API Key no configurada. Revisa tu archivo .env',
            type: 'config',
            originalError: 'Missing API Key',
          },
        };
      }
      
      const response = await this.api.get('/weather', {
        params: {
          lat: lat,
          lon: lon,
          appid: API_CONFIGS.OPENWEATHER.API_KEY,
          units: API_CONFIGS.OPENWEATHER.UNITS,
          lang: API_CONFIGS.OPENWEATHER.LANGUAGE,
        },
      });

      const data = response.data;
      
      // Formatear los datos para nuestra aplicación
      const formattedData = {
        city: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        tempMin: Math.round(data.main.temp_min),
        tempMax: Math.round(data.main.temp_max),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        clouds: data.clouds.all,
        visibility: data.visibility,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        coordinates: {
          lat: data.coord.lat,
          lon: data.coord.lon,
        },
        timestamp: data.dt,
      };

      console.log(`✅ Clima obtenido: ${formattedData.city}, ${formattedData.temperature}°C`);

      return {
        success: true,
        data: formattedData,
      };

    } catch (error) {
      console.error('❌ Error obteniendo datos del clima por coordenadas:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error desconocido';
      let errorType = 'unknown';

      if (error.code === 'ENOTFOUND' || error.code === 'NETWORK_ERROR') {
        errorMessage = 'Sin conexión a internet';
        errorType = 'network';
      } else if (error.response) {
        const status = error.response.status;
        switch (status) {
          case 401:
            errorMessage = 'API Key inválida';
            errorType = 'auth';
            break;
          case 404:
            errorMessage = 'Ubicación no encontrada';
            errorType = 'notFound';
            break;
          case 429:
            errorMessage = 'Límite de consultas excedido';
            errorType = 'rateLimit';
            break;
          case 500:
          case 502:
          case 503:
            errorMessage = `Error del servidor (${status})`;
            errorType = 'server';
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Tiempo de espera agotado';
        errorType = 'timeout';
      }

      return {
        success: false,
        error: {
          message: errorMessage,
          type: errorType,
          originalError: error.message,
        },
      };
    }
  }

  /**
   * Obtener el icono del clima desde OpenWeather
   * @param {string} iconCode - Código del icono
   * @param {string} size - Tamaño del icono (@1x, @2x, @4x)
   * @returns {string} URL del icono
   */
  getWeatherIconUrl(iconCode, size = '@2x') {
    return `https://openweathermap.org/img/wn/${iconCode}${size}.png`;
  }

  /**
   * Convertir dirección del viento de grados a texto
   * @param {number} degrees - Grados del viento
   * @returns {string} Dirección del viento
   */
  getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  }

  /**
   * Buscar ciudades con Geocoding API (múltiples resultados)
   * @param {string} cityName - Nombre de la ciudad a buscar
   * @param {number} limit - Límite de resultados (máx 5)
   * @returns {Promise<Object>} Lista de ciudades encontradas
   */
  async searchCities(cityName, limit = 5) {
    try {
      console.log(`🔍 Buscando ciudades: ${cityName}`);
      
      if (!cityName || cityName.trim().length < 2) {
        return {
          success: false,
          error: { message: 'Ingresa al menos 2 caracteres' },
        };
      }

      // Verificar API Key
      if (!API_CONFIGS.OPENWEATHER.API_KEY || 
          API_CONFIGS.OPENWEATHER.API_KEY === 'API_KEY_NOT_CONFIGURED' ||
          API_CONFIGS.OPENWEATHER.API_KEY === 'tu_api_key_aqui') {
        return {
          success: false,
          error: { message: 'API Key no configurada' },
        };
      }

      // Usar Geocoding API de OpenWeather
      const response = await axios.get('http://api.openweathermap.org/geo/1.0/direct', {
        params: {
          q: cityName.trim(),
          limit: Math.min(limit, 5),
          appid: API_CONFIGS.OPENWEATHER.API_KEY,
        },
      });

      if (!response.data || response.data.length === 0) {
        return {
          success: false,
          error: { message: 'No se encontraron ciudades' },
        };
      }

      // Formatear resultados
      const cities = response.data.map((city) => ({
        name: city.name,
        state: city.state || '',
        country: city.country,
        lat: city.lat,
        lon: city.lon,
        // Crear un label descriptivo
        label: [city.name, city.state, city.country]
          .filter(Boolean)
          .join(', '),
      }));

      console.log(`✅ ${cities.length} ciudades encontradas`);
      
      return {
        success: true,
        data: cities,
      };

    } catch (error) {
      console.error('❌ Error buscando ciudades:', error);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || 'Error al buscar ciudades',
          type: 'network',
          originalError: error.message,
        },
      };
    }
  }

  /**
   * Obtener emoji del clima basado en el código del icono
   * @param {string} iconCode - Código del icono de OpenWeather
   * @returns {string} Emoji representativo
   */
  getWeatherEmoji(iconCode) {
    const iconMap = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️',
    };
    return iconMap[iconCode] || '🌤️';
  }
}

export default new WeatherService();