// FirebaseFavoritesService.js - Servicio CRUD para Ciudades Favoritas
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db, COLLECTIONS, isFirebaseConfigured } from './firebaseConfig';

/**
 * Servicio para gestionar ciudades favoritas en Firebase Firestore
 * Operaciones CRUD seguras con autenticación por userId
 */
class FirebaseFavoritesService {
  
  constructor() {
    this.collectionName = COLLECTIONS.USER_FAVORITES;
  }

  /**
   * Verificar que Firebase esté configurado
   */
  checkFirebaseConfig() {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase no está configurado. Revisa el archivo .env');
    }
  }

  /**
   * CREATE - Agregar una ciudad a favoritos
   * @param {Object} favoriteData - Datos del favorito
   * @returns {Promise<Object>} - Resultado con ID del favorito creado
   */
  async addFavorite(favoriteData) {
    try {
      this.checkFirebaseConfig();

      const { userId, city, country, coordinates, nickname, notes, color, weatherSnapshot } = favoriteData;

      // Validaciones
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }
      if (!city) {
        throw new Error('Ciudad es requerida');
      }

      // Validar y sanitizar color
      const sanitizeColor = (colorValue) => {
        if (!colorValue || typeof colorValue !== 'string') {
          return '#007AFF'; // Default color
        }
        // Asegurar que sea formato hex válido
        const hexColor = colorValue.trim();
        if (/^#[0-9A-F]{6}$/i.test(hexColor)) {
          return hexColor;
        }
        return '#007AFF'; // Fallback si no es válido
      };

      // Preparar datos para Firestore
      const favoriteDoc = {
        userId,
        city,
        country: country || '',
        coordinates: coordinates || null,
        nickname: nickname || '',
        notes: notes || '',
        color: sanitizeColor(color),
        weatherSnapshot: {
          temp: weatherSnapshot?.temp || 0,
          condition: weatherSnapshot?.condition || '',
          description: weatherSnapshot?.description || '',
          humidity: weatherSnapshot?.humidity || 0,
          windSpeed: weatherSnapshot?.windSpeed || 0,
          icon: weatherSnapshot?.icon || '',
          feelsLike: weatherSnapshot?.feelsLike || 0,
          visibility: weatherSnapshot?.visibility || 0,
          lastUpdated: Timestamp.now(),
        },
        addedAt: Timestamp.now(),
        lastViewed: Timestamp.now(),
        viewCount: 0,
      };

      console.log('📝 Agregando favorito a Firebase - Ciudad:', city, '- UserId:', userId, 'tipo:', typeof userId);
      
      const docRef = await addDoc(collection(db, this.collectionName), favoriteDoc);

      console.log('✅ Favorito guardado con ID:', docRef.id);      console.log('✅ Favorito agregado exitosamente:', docRef.id);

      return {
        success: true,
        favoriteId: docRef.id,
        message: `${city} agregado a favoritos`,
      };

    } catch (error) {
      console.error('❌ Error agregando favorito:', error);
      throw error;
    }
  }

  /**
   * READ - Obtener todos los favoritos de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} - Array de favoritos
   */
  async getFavorites(userId) {
    try {
      this.checkFirebaseConfig();

      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      console.log('📖 Obteniendo favoritos del usuario:', userId);

      // Query simplificada sin orderBy para evitar necesidad de índice compuesto
      const favoritesQuery = query(
        collection(db, this.collectionName),
        where('userId', '==', userId)
      );

      console.log('🔍 Ejecutando query en Firestore con userId:', userId, 'tipo:', typeof userId);

      const querySnapshot = await getDocs(favoritesQuery);
      
      const favorites = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Validar color antes de agregarlo
        const sanitizeColor = (colorValue) => {
          if (!colorValue || typeof colorValue !== 'string') {
            return '#007AFF';
          }
          const hexColor = colorValue.trim();
          if (/^#[0-9A-F]{6}$/i.test(hexColor)) {
            return hexColor;
          }
          return '#007AFF';
        };
        
        favorites.push({
          favoriteId: doc.id,
          ...data,
          color: sanitizeColor(data.color), // Asegurar color válido
          // Convertir Timestamps a milisegundos
          addedAt: data.addedAt?.toMillis() || Date.now(),
          lastViewed: data.lastViewed?.toMillis() || Date.now(),
          weatherSnapshot: {
            ...data.weatherSnapshot,
            lastUpdated: data.weatherSnapshot?.lastUpdated?.toMillis() || Date.now(),
          },
        });
      });

      // Ordenar en memoria por fecha de agregado (más reciente primero)
      favorites.sort((a, b) => b.addedAt - a.addedAt);

      console.log(`✅ ${favorites.length} favoritos encontrados`);

      return favorites;

    } catch (error) {
      console.error('❌ Error obteniendo favoritos:', error);
      throw error;
    }
  }

  /**
   * UPDATE - Actualizar datos de personalización de un favorito
   * @param {string} favoriteId - ID del favorito
   * @param {Object} updates - Datos a actualizar (nickname, notes, color)
   * @returns {Promise<Object>} - Resultado de la actualización
   */
  async updateFavorite(favoriteId, updates) {
    try {
      this.checkFirebaseConfig();

      if (!favoriteId) {
        throw new Error('ID de favorito requerido');
      }

      console.log('✏️ Actualizando favorito:', favoriteId);

      const favoriteRef = doc(db, this.collectionName, favoriteId);
      
      // Sanitizar color si está presente en las actualizaciones
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Validar color si se está actualizando
      if (updateData.color) {
        const sanitizeColor = (colorValue) => {
          if (!colorValue || typeof colorValue !== 'string') {
            return '#007AFF';
          }
          const hexColor = colorValue.trim();
          if (/^#[0-9A-F]{6}$/i.test(hexColor)) {
            return hexColor;
          }
          return '#007AFF';
        };
        updateData.color = sanitizeColor(updateData.color);
      }

      await updateDoc(favoriteRef, updateData);

      console.log('✅ Favorito actualizado exitosamente');

      return {
        success: true,
        message: 'Favorito actualizado',
      };

    } catch (error) {
      console.error('❌ Error actualizando favorito:', error);
      throw error;
    }
  }

  /**
   * UPDATE - Actualizar solo el weatherSnapshot de un favorito
   * @param {string} favoriteId - ID del favorito
   * @param {Object} newWeatherData - Nuevos datos del clima
   * @returns {Promise<Object>} - Resultado de la actualización
   */
  async updateWeatherSnapshot(favoriteId, newWeatherData) {
    try {
      this.checkFirebaseConfig();

      if (!favoriteId) {
        throw new Error('ID de favorito requerido');
      }

      console.log('🌤️ Actualizando clima de favorito:', favoriteId);

      const favoriteRef = doc(db, this.collectionName, favoriteId);
      
      const updateData = {
        'weatherSnapshot.temp': newWeatherData.temperature || 0,
        'weatherSnapshot.condition': newWeatherData.condition || '',
        'weatherSnapshot.description': newWeatherData.description || '',
        'weatherSnapshot.humidity': newWeatherData.humidity || 0,
        'weatherSnapshot.windSpeed': newWeatherData.windSpeed || 0,
        'weatherSnapshot.icon': newWeatherData.icon || '',
        'weatherSnapshot.feelsLike': newWeatherData.feelsLike || 0,
        'weatherSnapshot.visibility': newWeatherData.visibility || 0,
        'weatherSnapshot.lastUpdated': Timestamp.now(),
        lastViewed: Timestamp.now(),
      };

      await updateDoc(favoriteRef, updateData);

      console.log('✅ Clima actualizado en Firebase');

      return {
        success: true,
        message: 'Clima actualizado',
      };

    } catch (error) {
      console.error('❌ Error actualizando clima:', error);
      throw error;
    }
  }

  /**
   * DELETE - Eliminar un favorito
   * @param {string} favoriteId - ID del favorito a eliminar
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  async removeFavorite(favoriteId) {
    try {
      this.checkFirebaseConfig();

      if (!favoriteId) {
        throw new Error('ID de favorito requerido');
      }

      console.log('🗑️ Eliminando favorito:', favoriteId);

      const favoriteRef = doc(db, this.collectionName, favoriteId);
      await deleteDoc(favoriteRef);

      console.log('✅ Favorito eliminado exitosamente');

      return {
        success: true,
        message: 'Favorito eliminado',
      };

    } catch (error) {
      console.error('❌ Error eliminando favorito:', error);
      throw error;
    }
  }

  /**
   * Incrementar contador de vistas de un favorito
   * @param {string} favoriteId - ID del favorito
   */
  async incrementViewCount(favoriteId) {
    try {
      this.checkFirebaseConfig();

      const favoriteRef = doc(db, this.collectionName, favoriteId);
      const currentData = await getDocs(favoriteRef);
      const currentCount = currentData.data()?.viewCount || 0;

      await updateDoc(favoriteRef, {
        viewCount: currentCount + 1,
        lastViewed: Timestamp.now(),
      });

    } catch (error) {
      console.error('Error incrementando contador:', error);
      // No lanzar error, es una operación secundaria
    }
  }
}

// Exportar instancia única (Singleton)
export default new FirebaseFavoritesService();
