// FavoriteCard.js - Componente para mostrar una ciudad favorita
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';

const FavoriteCard = ({ favorite, onPress, onEdit, onDelete }) => {
  
  /**
   * Validar y obtener color seguro
   */
  const getSafeColor = () => {
    const color = favorite?.color;
    // Validar que sea un string válido de color hex
    if (color && typeof color === 'string' && /^#[0-9A-F]{6}$/i.test(color)) {
      return color;
    }
    return COLORS.primary; // Fallback seguro
  };

  const safeColor = getSafeColor();
  
  /**
   * Calcular tiempo desde la última actualización
   */
  const getTimeSinceUpdate = () => {
    if (!favorite.weatherSnapshot?.lastUpdated) {
      return 'Sin actualizar';
    }
    
    const minutes = Math.floor((Date.now() - favorite.weatherSnapshot.lastUpdated) / 60000);
    
    if (minutes < 1) return '🟢 Actualizado ahora';
    if (minutes < 30) return `🟢 Hace ${minutes} min`;
    if (minutes < 60) return `🟡 Hace ${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `🟡 Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    
    const days = Math.floor(hours / 24);
    return `🔴 Hace ${days} día${days > 1 ? 's' : ''}`;
  };

  /**
   * Obtener emoji del clima
   */
  const getWeatherEmoji = (condition) => {
    const conditionLower = (condition || '').toLowerCase();
    
    if (conditionLower.includes('sun') || conditionLower.includes('clear') || conditionLower.includes('despejado')) return '☀️';
    if (conditionLower.includes('cloud') || conditionLower.includes('nublado')) return '☁️';
    if (conditionLower.includes('rain') || conditionLower.includes('lluvia')) return '🌧️';
    if (conditionLower.includes('storm') || conditionLower.includes('tormenta')) return '⛈️';
    if (conditionLower.includes('snow') || conditionLower.includes('nieve')) return '❄️';
    if (conditionLower.includes('fog') || conditionLower.includes('niebla')) return '🌫️';
    
    return '🌤️';
  };

  /**
   * Manejar eliminación con confirmación
   */
  const handleDelete = () => {
    Alert.alert(
      'Eliminar Favorito',
      `¿Estás seguro de eliminar "${favorite.nickname || favorite.city}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: onDelete
        }
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Indicador de color personalizado */}
        <View 
          style={[styles.colorIndicator, { backgroundColor: safeColor }]} 
        />

        {/* Contenido principal */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.cityInfo}>
              <Text style={styles.nickname}>
                {favorite.nickname || favorite.city}
              </Text>
              <Text style={styles.cityName}>
                {favorite.city}{favorite.country ? `, ${favorite.country}` : ''}
              </Text>
            </View>

            {/* Botones de acción */}
            <View style={styles.actions}>
              <TouchableOpacity 
                onPress={onEdit}
                style={styles.actionButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.actionIcon}>✏️</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleDelete}
                style={styles.actionButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.actionIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Clima */}
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherEmoji}>
              {getWeatherEmoji(favorite.weatherSnapshot?.condition)}
            </Text>
            <Text style={styles.temperature}>
              {favorite.weatherSnapshot?.temperature || '--'}°C
            </Text>
            <Text style={styles.condition}>
              {favorite.weatherSnapshot?.condition || 'Sin datos'}
            </Text>
          </View>

          {/* Notas personales */}
          {favorite.notes && (
            <Text style={styles.notes} numberOfLines={1}>
              📝 {favorite.notes}
            </Text>
          )}

          {/* Última actualización */}
          <View style={styles.footer}>
            <Text style={styles.lastUpdate}>
              {getTimeSinceUpdate()}
            </Text>
            <Text style={styles.tapHint}>
              👆 Toca para actualizar
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  colorIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  content: {
    padding: 20,
    paddingLeft: 26,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  cityInfo: {
    flex: 1,
  },
  nickname: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  cityName: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 18,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  weatherEmoji: {
    fontSize: 40,
  },
  temperature: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  condition: {
    fontSize: 18,
    color: COLORS.white,
    opacity: 0.9,
    textTransform: 'capitalize',
  },
  notes: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 12,
  },
  lastUpdate: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
  },
  tapHint: {
    fontSize: 11,
    color: COLORS.white,
    opacity: 0.6,
  },
});

export default FavoriteCard;
