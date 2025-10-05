import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, ScrollView, Animated, StatusBar, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomButton, WeatherCard } from '../components';
import CustomText from '../components/CustomText';
import { useToast } from '../context/ToastContext';
import { GLOBAL_STYLES } from '../constants/styles';
import { COLORS } from '../constants/colors';
import { logoutUser, checkAuthStatus } from '../context/authSlice';
import FirebaseFavoritesService from '../utils/FirebaseFavoritesService';

const DashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const { showWarning, showError, showSuccess } = useToast();
  
  // Hook para obtener las safe areas del dispositivo
  const insets = useSafeAreaInsets();

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerSlideAnim = useRef(new Animated.Value(-30)).current;
  
  // Animaciones adicionales para efectos visuales
  const floatingAnim1 = useRef(new Animated.Value(0)).current;
  const floatingAnim2 = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Estado para favoritos
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const userId = user?.id?.toString();

  // Helper para validar color
  const getSafeColor = (color) => {
    if (color && typeof color === 'string' && /^#[0-9A-F]{6}$/i.test(color)) {
      return color;
    }
    return COLORS.primary;
  };

  useEffect(() => {
    // La verificación de auth ya se hace en SecurityInitializer
    // dispatch(checkAuthStatus()); // COMENTADO - evita conflictos

    // Animaciones de entrada espectaculares
    Animated.sequence([
      // Primera fase: entrada principal
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 7,
        }),
      ]),
      // Segunda fase: header animado
      Animated.spring(headerSlideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
        delay: 300,
      }),
    ]).start();

    // Animaciones continuas de fondo
    startBackgroundAnimations();

    // Cargar favoritos
    loadFavorites();

    // Mensaje de bienvenida personalizado con emoji dinámico
    setTimeout(() => {
      const userName = user?.name || 'Usuario';
      const currentHour = new Date().getHours();
      let greeting = '🌅 Buenos días';
      let emoji = '🌤️';
      
      if (currentHour >= 12 && currentHour < 18) {
        greeting = '☀️ Buenas tardes';
        emoji = '☀️';
      } else if (currentHour >= 18) {
        greeting = '🌙 Buenas noches';
        emoji = '🌙';
      }
      
      showSuccess(`${greeting} ${userName}! ${emoji}`, 3500);
    }, 1200);
  }, [dispatch]);

  // Recargar favoritos cada vez que la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        console.log('🔄 Dashboard recibió foco, recargando favoritos...');
        loadFavorites();
      }
    }, [userId])
  );

  const startBackgroundAnimations = () => {
    // Animación flotante continua 1
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim1, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim1, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animación flotante continua 2 (desfasada)
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatingAnim2, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(floatingAnim2, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 1500);

    // Rotación sutil continua
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  };

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigation.navigate('Login');
    }
  }, [isAuthenticated, isLoading, navigation]);

  // Cargar favoritos desde Firebase
  const loadFavorites = async () => {
    if (!userId) {
      console.log('⚠️ No hay userId, no se pueden cargar favoritos');
      return;
    }
    
    console.log('📖 Cargando favoritos para userId:', userId);
    setLoadingFavorites(true);
    try {
      const userFavorites = await FirebaseFavoritesService.getFavorites(userId);
      console.log('✅ Favoritos cargados:', userFavorites.length, 'encontrados');
      setFavorites(userFavorites.slice(0, 3)); // Mostrar solo los primeros 3
    } catch (error) {
      console.error('❌ Error al cargar favoritos:', error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Helper para mostrar tiempo desde última actualización
  const getTimeSinceUpdate = (timestamp) => {
    if (!timestamp) return 'Sin actualizar';
    
    const now = new Date();
    const updated = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInMinutes = Math.floor((now - updated) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    const hours = Math.floor(diffInMinutes / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
  };

  const handleLogout = async () => {
    showWarning('Cerrando sesión...', 2000);
    
    try {
      await dispatch(logoutUser());
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    } catch (error) {
      showError('Error al cerrar sesión, pero se limpiará localmente');
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Header oscuro elegante */}
        <LinearGradient
          colors={['#1a1a1a', '#121212']}
          style={styles.header}
        >
          <Animated.View 
            style={[
              styles.headerContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: headerSlideAnim }],
              }
            ]}
          >
            <View style={styles.greetingSection}>
              <CustomText style={styles.greeting}>
                {(() => {
                  const hour = new Date().getHours();
                  if (hour < 12) return '☀️ Buenos días';
                  if (hour < 18) return '🌤️ Buenas tardes';
                  return '🌙 Buenas noches';
                })()}
              </CustomText>
              <CustomText style={styles.userName}>{user?.name || 'Usuario'}</CustomText>
            </View>
            
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <CustomText style={styles.logoutIcon}>🚪</CustomText>
            </TouchableOpacity>
          </Animated.View>
        </LinearGradient>

        {/* Tarjeta del clima principal */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
          }}
        >
          <WeatherCard 
            cityName="Tehuacán"
            style={{ 
              marginTop: 20,
              marginHorizontal: 20,
            }}
          />
        </Animated.View>

        {/* Widget de Favoritos - Tema Oscuro */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            marginTop: 24,
            marginHorizontal: 20,
          }}
        >
          <LinearGradient
            colors={['#2C2C2C', '#1E1E1E']}
            style={styles.favoritesCard}
          >
            {/* Header del Widget */}
            <View style={styles.favoritesHeader}>
              <View style={styles.favoritesHeaderLeft}>
                <LinearGradient
                  colors={['#00BFFF', '#1E90FF']}
                  style={styles.starBadge}
                >
                  <CustomText style={styles.starEmoji}>⭐</CustomText>
                </LinearGradient>
                <View style={styles.favoritesTitle}>
                  <CustomText style={styles.favoritesTitleText}>Mis favoritas</CustomText>
                  <CustomText style={styles.favoritesSubtitle}>
                    {favorites.length} {favorites.length === 1 ? 'ciudad' : 'ciudades'}
                  </CustomText>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => navigation.navigate('AddFavorite')}
                style={styles.addFavoriteButton}
                activeOpacity={0.7}
              >
                <CustomText style={styles.addFavoriteIcon}>+</CustomText>
              </TouchableOpacity>
            </View>

            {/* Contenido del Widget */}
            {loadingFavorites ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#667eea" />
                <CustomText style={styles.loadingText}>Cargando...</CustomText>
              </View>
            ) : favorites.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <CustomText style={styles.emptyIcon}>🌍</CustomText>
                </View>
                <CustomText style={styles.emptyTitle}>No tienes favoritas</CustomText>
                <CustomText style={styles.emptySubtitle}>
                  Toca el botón + para agregar tu primera ciudad
                </CustomText>
              </View>
            ) : (
              <View style={styles.favoritesGrid}>
                {favorites.map((favorite, index) => (
                  <TouchableOpacity
                    key={favorite.favoriteId || `favorite-${index}`}
                    style={styles.favoriteItem}
                    onPress={() => navigation.navigate('FavoriteDetail', { favorite })}
                    activeOpacity={0.7}
                  >
                    <View 
                      style={[
                        styles.favoriteColorBar,
                        { backgroundColor: getSafeColor(favorite.color) }
                      ]} 
                    />
                    
                    <View style={styles.favoriteContent}>
                          <View style={styles.favoriteInfo}>
                            <CustomText style={styles.favoriteName} numberOfLines={1}>
                              {favorite.nickname || favorite.cityName}
                            </CustomText>
                            <CustomText style={styles.favoriteLocation} numberOfLines={1}>
                              {favorite.cityName}
                            </CustomText>
                          </View>
                          {favorite.weatherSnapshot?.temp && (
                            <View style={styles.favoriteWeather}>
                              <CustomText style={styles.favoriteTemp}>
                                {Math.round(favorite.weatherSnapshot.temp)}°
                              </CustomText>
                              <CustomText style={styles.favoriteEmoji}>
                                {favorite.weatherSnapshot.description?.includes('clear') ? '☀️' :
                                 favorite.weatherSnapshot.description?.includes('cloud') ? '☁️' :
                                 favorite.weatherSnapshot.description?.includes('rain') ? '🌧️' : '🌤️'}
                              </CustomText>
                            </View>
                          )}
                        </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Ver todas button */}
            {favorites.length > 0 && (
              <TouchableOpacity 
                style={styles.viewAllContainer}
                onPress={() => navigation.navigate('Favorites')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.viewAllButton}
                >
                  <CustomText style={styles.viewAllText}>Ver todas</CustomText>
                  <CustomText style={styles.viewAllIcon}>→</CustomText>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // #121212
  },

  // Header oscuro elegante
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary, // #B3B3B3
    marginBottom: 4,
  },
  userName: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary, // #FFFFFF
    letterSpacing: -0.5,
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundElevated, // #2C2C2C
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border, // #333333
  },
  logoutIcon: {
    fontSize: 24,
  },

  // Favoritos Card - Tema Oscuro
  favoritesCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  favoritesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  favoritesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  starBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  starEmoji: {
    fontSize: 22,
  },
  favoritesTitle: {
    flex: 1,
  },
  favoritesTitleText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  favoritesSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  addFavoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFavoriteIcon: {
    color: COLORS.textPrimary,
    fontSize: 26,
    fontWeight: '700',
    marginTop: -2,
  },

  // Loading & Empty States
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Favorites Grid - Tema Oscuro
  favoritesGrid: {
    padding: 20,
    paddingTop: 12,
    gap: 12,
  },
  favoriteItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundElevated, // #2C2C2C
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  favoriteColorBar: {
    width: 4,
  },
  favoriteContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  favoriteInfo: {
    flex: 1,
    marginRight: 12,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary, // #FFFFFF
    marginBottom: 4,
  },
  favoriteLocation: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary, // #B3B3B3
  },
  favoriteWeather: {
    alignItems: 'center',
  },
  favoriteTemp: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary, // #00BFFF
    marginBottom: 2,
  },
  favoriteEmoji: {
    fontSize: 20,
  },

  // View All Button - Tema Oscuro
  viewAllContainer: {
    marginTop: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  viewAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  viewAllIcon: {
    fontSize: 18,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;