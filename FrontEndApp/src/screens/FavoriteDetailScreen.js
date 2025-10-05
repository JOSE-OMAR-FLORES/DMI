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

      console.log(`🌤️ Actualizando clima de ${favorite.city}...`);

      // 1. Consultar clima actual (WeatherService ya es una instancia)
      const result = await WeatherService.getCurrentWeather(favorite.city);

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

      console.log(`✅ Clima de ${favorite.city} actualizado`);

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
    <SafeAreaView style={GLOBAL_STYLES.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.nickname}>
                {favorite.nickname || favorite.city}
              </Text>
              <Text style={styles.city}>
                {favorite.city}, {favorite.country}
              </Text>
            </View>
          </View>

          {/* Clima Principal */}
          <View style={styles.weatherMain}>
            {isUpdating && !weatherData ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.white} />
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
                  {weatherData.temperature}°C
                </Text>
                
                <Text style={styles.condition}>
                  {weatherData.condition || weatherData.description}
                </Text>

                {isUpdating && (
                  <View style={styles.updatingIndicator}>
                    <ActivityIndicator size="small" color={COLORS.white} />
                    <Text style={styles.updatingText}>Actualizando...</Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Detalles del clima */}
          {weatherData && !isUpdating && (
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>📊 Detalles</Text>
              
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>🌡️</Text>
                  <Text style={styles.detailLabel}>Sensación térmica</Text>
                  <Text style={styles.detailValue}>{weatherData.feelsLike}°C</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>💧</Text>
                  <Text style={styles.detailLabel}>Humedad</Text>
                  <Text style={styles.detailValue}>{weatherData.humidity}%</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>💨</Text>
                  <Text style={styles.detailLabel}>Viento</Text>
                  <Text style={styles.detailValue}>{weatherData.windSpeed} km/h</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>👁️</Text>
                  <Text style={styles.detailLabel}>Visibilidad</Text>
                  <Text style={styles.detailValue}>{weatherData.visibility} km</Text>
                </View>
              </View>
            </View>
          )}

          {/* Notas personales */}
          {favorite.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesTitle}>📝 Mis Notas</Text>
              <Text style={styles.notesText}>{favorite.notes}</Text>
            </View>
          )}

          {/* Error de actualización */}
          {updateError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {updateError}</Text>
              <TouchableOpacity onPress={updateWeather}>
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Info de actualización */}
          <View style={styles.updateInfo}>
            <Text style={styles.updateText}>
              {isUpdating ? '🔄 Actualizando...' : `🟢 ${getTimeSinceUpdate()}`}
            </Text>
          </View>

          {/* Botones de acción */}
          <View style={styles.actionsContainer}>
            <CustomButton
              title="✏️ Editar información personal"
              onPress={handleEdit}
              variant="secondary"
              style={styles.actionButton}
            />

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.deleteButtonText}>🗑️ Eliminar favorito</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  nickname: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  city: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
  },
  weatherMain: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.white,
    marginTop: 12,
    fontSize: 16,
  },
  weatherIcon: {
    width: 150,
    height: 150,
  },
  temperature: {
    fontSize: 72,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 10,
  },
  condition: {
    fontSize: 24,
    color: COLORS.white,
    textTransform: 'capitalize',
    marginTop: 8,
  },
  updatingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  updatingText: {
    color: COLORS.white,
    fontSize: 14,
    opacity: 0.8,
  },
  detailsContainer: {
    margin: 20,
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  notesContainer: {
    margin: 20,
    marginTop: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 16,
    color: COLORS.white,
    lineHeight: 24,
  },
  errorContainer: {
    margin: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.white,
    fontSize: 14,
    marginBottom: 8,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  updateInfo: {
    alignItems: 'center',
    padding: 16,
  },
  updateText: {
    color: COLORS.white,
    fontSize: 14,
    opacity: 0.8,
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  actionButton: {
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FavoriteDetailScreen;
