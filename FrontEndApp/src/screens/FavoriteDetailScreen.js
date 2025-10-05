// FavoriteDetailScreen.js - Pantalla de detalle con actualización automática
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomButton } from '../components';
import { COLORS } from '../constants/colors';
import { GLOBAL_STYLES } from '../constants/styles';
import WeatherService from '../utils/WeatherService';
import FirebaseFavoritesService from '../utils/FirebaseFavoritesService';
import { useToast } from '../context/ToastContext';

const FavoriteDetailScreen = ({ route, navigation }) => {
  const { favorite } = route.params;
  
  const [weatherData, setWeatherData] = useState(favorite.weatherSnapshot);
  const [isUpdating, setIsUpdating] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(favorite.weatherSnapshot?.lastUpdated);
  const [updateError, setUpdateError] = useState('');

  const { showSuccess, showError } = useToast();

  // Helper para validar color
  const getSafeColor = () => {
    const color = favorite?.color;
    if (color && typeof color === 'string' && /^#[0-9A-F]{6}$/i.test(color)) {
      return color;
    }
    return COLORS.primary;
  };

  useEffect(() => {
    // Actualizar clima automáticamente al abrir
    updateWeather();
    
    // Configurar título de la pantalla
    navigation.setOptions({
      title: favorite.nickname || favorite.city,
    });
  }, []);

  /**
   * Actualizar clima desde OpenWeather y guardar en Firebase
   */
  const updateWeather = async () => {
    try {
      setIsUpdating(true);
      setUpdateError('');

      const displayName = favorite.nickname || favorite.city;
      console.log(`🌤️ Actualizando clima de ${displayName}...`);

      // 1. Consultar clima actual usando coordenadas si están disponibles
      let result;
      if (favorite.coordinates?.lat && favorite.coordinates?.lon) {
        console.log(`📍 Usando coordenadas: ${favorite.coordinates.lat}, ${favorite.coordinates.lon}`);
        result = await WeatherService.getCurrentWeatherByCoords(
          favorite.coordinates.lat,
          favorite.coordinates.lon,
          favorite.city
        );
      } else {
        console.log(`📍 Usando nombre de ciudad: ${favorite.city}`);
        result = await WeatherService.getCurrentWeather(favorite.city);
      }

      if (!result.success) {
        throw new Error(result.error?.message || 'Error obteniendo clima');
      }

      const freshWeather = result.data;

      // 2. Actualizar estado local (UI se actualiza inmediatamente)
      setWeatherData(freshWeather);
      setLastUpdated(Date.now());

      // 3. Guardar en Firebase para próxima vez
      await FirebaseFavoritesService.updateWeatherSnapshot(
        favorite.favoriteId,
        {
          temperature: freshWeather.temperature,
          condition: freshWeather.description,
          description: freshWeather.description,
          humidity: freshWeather.humidity,
          windSpeed: freshWeather.windSpeed,
          icon: freshWeather.icon,
          feelsLike: freshWeather.feelsLike,
          visibility: freshWeather.visibility,
        }
      );

      console.log(`✅ Clima de ${displayName} actualizado`);

    } catch (error) {
      console.error('❌ Error actualizando clima:', error);
      setUpdateError(error.message || 'No se pudo actualizar el clima');
      showError('No se pudo actualizar el clima');
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Calcular tiempo desde última actualización
   */
  const getTimeSinceUpdate = () => {
    if (!lastUpdated) return 'Sin actualizar';

    const minutes = Math.floor((Date.now() - lastUpdated) / 60000);

    if (minutes < 1) return 'Actualizado ahora';
    if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;

    const days = Math.floor(hours / 24);
    return `Hace ${days} día${days > 1 ? 's' : ''}`;
  };

  /**
   * Navegar a editar
   */
  const handleEdit = () => {
    navigation.navigate('EditFavorite', { favorite });
  };

  /**
   * Eliminar favorito
   */
  const handleDelete = async () => {
    try {
      await FirebaseFavoritesService.removeFavorite(favorite.favoriteId);
      showSuccess(`${favorite.city} eliminado`);
      navigation.goBack();
    } catch (error) {
      showError('No se pudo eliminar');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header con botón de regresar */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerCity}>{favorite.nickname || favorite.city}</Text>
          <Text style={styles.headerCountry}>{favorite.country}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEdit}
          activeOpacity={0.7}
        >
          <Text style={styles.editIcon}>✎</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Clima principal con gradiente */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.mainWeatherCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {isUpdating && !weatherData ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>Actualizando clima...</Text>
            </View>
          ) : (
            <>
              {weatherData.icon && (
                <Image
                  source={{
                    uri: `https://openweathermap.org/img/wn/${weatherData.icon}@4x.png`,
                  }}
                  style={styles.weatherIcon}
                />
              )}

              <Text style={styles.temperature}>
                {Math.round(weatherData.temperature)}°
              </Text>
              
              <Text style={styles.condition}>
                {weatherData.condition || weatherData.description}
              </Text>

              <View style={styles.tempRange}>
                <Text style={styles.feelsLike}>
                  Sensación {Math.round(weatherData.feelsLike)}°
                </Text>
              </View>

              {isUpdating && (
                <View style={styles.updatingBadge}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.updatingText}>Actualizando...</Text>
                </View>
              )}
            </>
          )}
        </LinearGradient>

        {/* Detalles en cards */}
        {weatherData && !isUpdating && (
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <View style={styles.detailCard}>
                <Text style={styles.detailIcon}>💧</Text>
                <Text style={styles.detailValue}>{weatherData.humidity}%</Text>
                <Text style={styles.detailLabel}>Humedad</Text>
              </View>

              <View style={styles.detailCard}>
                <Text style={styles.detailIcon}>�</Text>
                <Text style={styles.detailValue}>{Math.round(weatherData.windSpeed)}</Text>
                <Text style={styles.detailLabel}>km/h</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailCard}>
                <Text style={styles.detailIcon}>�️</Text>
                <Text style={styles.detailValue}>{Math.round(weatherData.visibility / 1000)}</Text>
                <Text style={styles.detailLabel}>km visibilidad</Text>
              </View>

              <View style={styles.detailCard}>
                <Text style={styles.detailIcon}>🌡️</Text>
                <Text style={styles.detailValue}>{Math.round(weatherData.feelsLike)}°</Text>
                <Text style={styles.detailLabel}>Se siente</Text>
              </View>
            </View>
          </View>
        )}

        {/* Notas personales */}
        {favorite.notes && (
          <View style={styles.notesCard}>
            <Text style={styles.notesTitle}>📝 Mis notas</Text>
            <Text style={styles.notesText}>{favorite.notes}</Text>
          </View>
        )}

        {/* Error de actualización */}
        {updateError && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>⚠️ {updateError}</Text>
            <TouchableOpacity onPress={updateWeather} style={styles.retryButton}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info de actualización */}
        <View style={styles.updateInfo}>
          <Text style={styles.updateText}>
            {isUpdating ? '🔄 Actualizando...' : `Actualizado ${getTimeSinceUpdate()}`}
          </Text>
        </View>

        {/* Botón eliminar */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
          <Text style={styles.deleteText}>Eliminar de favoritos</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Header - Tema Oscuro
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerCity: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerCountry: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  
  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  
  // Main Weather Card - Tema Oscuro
  mainWeatherCard: {
    borderRadius: 30,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textPrimary,
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  weatherIcon: {
    width: 140,
    height: 140,
    marginBottom: 10,
  },
  temperature: {
    fontSize: 80,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -2,
  },
  condition: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
    marginTop: 8,
    opacity: 0.95,
  },
  tempRange: {
    marginTop: 12,
  },
  feelsLike: {
    fontSize: 16,
    color: COLORS.textSecondary,
    opacity: 0.9,
  },
  updatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 191, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  updatingText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  
  // Details Container - Tema Oscuro
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  
  // Notes Card - Tema Oscuro
  notesCard: {
    backgroundColor: 'rgba(255, 165, 0, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  
  // Error Card - Tema Oscuro
  errorCard: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  retryText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Update Info - Tema Oscuro
  updateInfo: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  updateText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Delete Button - Tema Oscuro
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  deleteIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  deleteText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FavoriteDetailScreen;
