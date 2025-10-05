import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, ScrollView, Animated, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomButton, WeatherCard } from '../components';
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
    <SafeAreaView style={[GLOBAL_STYLES.container, { paddingTop: 0 }]} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Elementos flotantes decorativos de fondo */}
      <View style={styles.backgroundEffects}>
        <Animated.View 
          style={[
            styles.floatingElement1,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.1],
              }),
              transform: [
                {
                  translateY: floatingAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20],
                  })
                },
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })
                }
              ],
            }
          ]}
        />
        <Animated.View 
          style={[
            styles.floatingElement2,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.08],
              }),
              transform: [
                {
                  translateY: floatingAnim2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 15],
                  })
                },
                {
                  scale: scaleAnim,
                }
              ],
            }
          ]}
        />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }} // Espacio para el botón + safe area
      >
        {/* Header con gradiente que cubre toda la parte superior */}
        <Animated.View 
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: headerSlideAnim }],
            }
          ]}
        >
          <LinearGradient
            colors={['#2E86AB', '#A23B72', '#F18F01']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientHeader, {
              paddingTop: insets.top + 40, // Status bar + padding para el contenido
            }]}
          >
            {/* Decoraciones del header */}
            <View style={styles.headerDecorations}>
              <Animated.Text 
                style={[
                  styles.decorativeEmoji1,
                  {
                    top: insets.top + 20, // Ajustar según el safe area
                    transform: [
                      {
                        rotate: rotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '15deg'],
                        })
                      }
                    ]
                  }
                ]}
              >
                ☀️
              </Animated.Text>
              <Animated.Text 
                style={[
                  styles.decorativeEmoji2,
                  {
                    top: insets.top + 50, // Ajustar según el safe area
                    opacity: floatingAnim1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    })
                  }
                ]}
              >
                ⛅
              </Animated.Text>
              <Animated.Text 
                style={[
                  styles.decorativeEmoji3,
                  {
                    bottom: 30, // Mantener fijo desde abajo
                    transform: [
                      {
                        translateY: floatingAnim2.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -8],
                        })
                      }
                    ]
                  }
                ]}
              >
                🌤️
              </Animated.Text>
            </View>

            {/* Contenido del header con padding para no ser cubierto */}
            <View style={styles.headerContent}>
              <Text style={styles.welcomeText}>¡Hola!</Text>
              <Animated.Text 
                style={[
                  styles.titleText,
                  {
                    transform: [{ scale: scaleAnim }]
                  }
                ]}
              >
                Dashboard Clima
              </Animated.Text>
              <Text style={styles.subtitleText}>
                ✨ Información meteorológica en tiempo real ✨
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Tarjeta del clima principal con efectos */}
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
              marginTop: 15,
              elevation: 20,
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
            }}
          />
        </Animated.View>

        {/* Widget de Favoritos */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <LinearGradient
            colors={['rgba(46, 134, 171, 0.08)', 'rgba(46, 134, 171, 0.02)']}
            style={[GLOBAL_STYLES.card, { marginTop: 20, padding: 0, overflow: 'hidden' }]}
          >
            {/* Header del Widget */}
            <View style={styles.favoritesHeader}>
              <View style={styles.favoritesHeaderLeft}>
                <View style={styles.starIconContainer}>
                  <Text style={styles.favoritesHeaderIcon}>⭐</Text>
                </View>
                <View>
                  <Text style={styles.favoritesHeaderText}>Mis Favoritas</Text>
                  <Text style={styles.favoritesHeaderSubtext}>Ciudades guardadas</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => navigation.navigate('AddFavorite')}
                style={styles.addButton}
              >
                <Text style={styles.addButtonIcon}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Contenido del Widget */}
            <View style={styles.favoritesContent}>
              {loadingFavorites ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Cargando favoritos...</Text>
                </View>
              ) : favorites.length === 0 ? (
                <View style={styles.emptyFavoritesContainer}>
                  <View style={styles.emptyIconCircle}>
                    <Text style={styles.emptyFavoritesIcon}>🌍</Text>
                  </View>
                  <Text style={styles.emptyFavoritesText}>
                    No tienes ciudades favoritas
                  </Text>
                  <Text style={styles.emptyFavoritesSubtext}>
                    Toca el botón + para agregar tu primera ciudad
                  </Text>
                </View>
              ) : (
                <>
                  {favorites.map((favorite, index) => (
                    <TouchableOpacity
                      key={favorite.favoriteId || `favorite-${index}`}
                      style={styles.favoriteMiniCard}
                      onPress={() => navigation.navigate('FavoriteDetail', { favorite })}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.6)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.miniCardGradient}
                      >
                        {/* Color Indicator */}
                        <View 
                          style={[
                            styles.favoriteColorIndicator,
                            { backgroundColor: getSafeColor(favorite.color) }
                          ]} 
                        />
                        
                        {/* Content */}
                        <View style={styles.favoriteMiniCardContent}>
                          <View style={styles.favoriteMiniCardTop}>
                            <View style={styles.cityNameContainer}>
                              <Text style={styles.favoriteMiniCardCity}>
                                {favorite.nickname || favorite.city}
                              </Text>
                              {favorite.nickname && (
                                <Text style={styles.favoriteMiniCardRealCity}>
                                  📍 {favorite.city}
                                </Text>
                              )}
                            </View>
                            
                            {favorite.weatherSnapshot && (
                              <View style={styles.tempBadge}>
                                <Text style={styles.favoriteMiniCardTemp}>
                                  {Math.round(favorite.weatherSnapshot.temp)}°
                                </Text>
                              </View>
                            )}
                          </View>
                          
                          <View style={styles.favoriteMiniCardBottom}>
                            {favorite.weatherSnapshot && (
                              <View style={styles.weatherInfo}>
                                <Text style={styles.weatherEmoji}>
                                  {favorite.weatherSnapshot.description?.includes('clear') ? '☀️' :
                                   favorite.weatherSnapshot.description?.includes('cloud') ? '☁️' :
                                   favorite.weatherSnapshot.description?.includes('rain') ? '🌧️' : '🌤️'}
                                </Text>
                                <Text style={styles.favoriteMiniCardWeather}>
                                  {favorite.weatherSnapshot.description}
                                </Text>
                              </View>
                            )}
                            <Text style={styles.favoriteMiniCardTime}>
                              {getTimeSinceUpdate(favorite.lastWeatherUpdate)}
                            </Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                  
                  {/* Ver Todas Button */}
                  <TouchableOpacity 
                    style={styles.viewAllButton}
                    onPress={() => navigation.navigate('Favorites')}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.viewAllGradient}
                    >
                      <Text style={styles.viewAllButtonText}>Ver todas las ciudades</Text>
                      <Text style={styles.viewAllButtonIcon}>→</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Tarjeta de información mejorada */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
            style={[GLOBAL_STYLES.card, styles.infoCard]}
          >
            <Animated.View 
              style={[
                styles.infoHeader,
                {
                  transform: [
                    {
                      translateX: floatingAnim1.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 5],
                      })
                    }
                  ]
                }
              ]}
            >
              <Text style={styles.infoTitle}>ℹ️ Información del Sistema</Text>
            </Animated.View>
            
            <View style={styles.infoContent}>
              <Animated.View 
                style={[
                  styles.infoRow,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateX: slideAnim }]
                  }
                ]}
              >
                <Text style={styles.infoEmoji}>🔄</Text>
                <Text style={styles.infoText}>
                  Datos actualizados automáticamente cada carga
                </Text>
              </Animated.View>
              
              <Animated.View 
                style={[
                  styles.infoRow,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateX: slideAnim }]
                  }
                ]}
              >
                <Text style={styles.infoEmoji}>🌐</Text>
                <Text style={styles.infoText}>
                  Información en tiempo real desde OpenWeather API
                </Text>
              </Animated.View>
              
              <Animated.View 
                style={[
                  styles.infoRow,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateX: slideAnim }]
                  }
                ]}
              >
                <Text style={styles.infoEmoji}>🎨</Text>
                <Text style={styles.infoText}>
                  Efectos visuales dinámicos según el clima
                </Text>
              </Animated.View>
              
              <Animated.View 
                style={[
                  styles.infoRow,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateX: slideAnim }]
                  }
                ]}
              >
                <Text style={styles.infoEmoji}>📱</Text>
                <Text style={styles.infoText}>
                  Interfaz optimizada con animaciones fluidas
                </Text>
              </Animated.View>
            </View>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
      
      {/* Botón de cerrar sesión con efectos y safe area */}
      <Animated.View 
        style={[
          styles.logoutContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            paddingBottom: Math.max(insets.bottom, 20), // Mínimo 20px o el safe area del dispositivo
          }
        ]}
      >
        <LinearGradient
          colors={[COLORS.error, '#C0392B']}
          style={styles.logoutGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <CustomButton
            title="✨ Cerrar Sesión"
            onPress={handleLogout}
            style={{ 
              backgroundColor: 'transparent',
              elevation: 0,
              shadowOpacity: 0,
            }}
          />
        </LinearGradient>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = {
  backgroundEffects: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },

  floatingElement1: {
    position: 'absolute',
    top: '20%',
    right: '10%',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.primary,
  },

  floatingElement2: {
    position: 'absolute',
    bottom: '25%',
    left: '5%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.accent,
  },

  gradientHeader: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    marginBottom: 15,
    elevation: 15,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    position: 'relative',
    overflow: 'hidden',
    marginTop: 0, // Eliminar margin para que llegue hasta arriba
  },

  headerContent: {
    zIndex: 2,
    position: 'relative',
  },

  headerDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },

  decorativeEmoji1: {
    position: 'absolute',
    // top dinámico aplicado en el render
    right: 30,
    fontSize: 30,
    opacity: 0.6,
  },

  decorativeEmoji2: {
    position: 'absolute',
    // top dinámico aplicado en el render
    left: 40,
    fontSize: 25,
  },

  decorativeEmoji3: {
    position: 'absolute',
    // bottom fijo desde abajo aplicado en el render
    right: 60,
    fontSize: 35,
    opacity: 0.7,
  },

  welcomeText: {
    fontSize: 18,
    color: COLORS.white,
    opacity: 0.9,
    zIndex: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 8,
    zIndex: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },

  subtitleText: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 10,
    zIndex: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  infoCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 25,
    padding: 0,
    elevation: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    overflow: 'hidden',
  },

  infoHeader: {
    padding: 25,
    paddingBottom: 15,
  },

  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  infoContent: {
    paddingHorizontal: 25,
    paddingBottom: 25,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(46, 134, 171, 0.05)',
    padding: 15,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },

  infoEmoji: {
    fontSize: 20,
    marginRight: 15,
    width: 30,
    textAlign: 'center',
  },

  infoText: {
    fontSize: 15,
    color: COLORS.darkGray,
    lineHeight: 22,
    flex: 1,
    fontWeight: '500',
  },

  logoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'transparent',
  },

  logoutGradient: {
    borderRadius: 15,
    elevation: 10,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },

  // Estilos del widget de favoritos
  favoritesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46, 134, 171, 0.1)',
  },

  favoritesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  starIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  favoritesHeaderIcon: {
    fontSize: 22,
  },

  favoritesHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkGray,
    letterSpacing: 0.3,
  },

  favoritesHeaderSubtext: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },

  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  addButtonIcon: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '600',
    marginTop: -2,
  },

  favoritesContent: {
    padding: 15,
  },

  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: COLORS.gray,
    fontSize: 14,
  },

  emptyFavoritesContainer: {
    padding: 40,
    alignItems: 'center',
  },

  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(46, 134, 171, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  emptyFavoritesIcon: {
    fontSize: 40,
  },

  emptyFavoritesText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyFavoritesSubtext: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
  },

  favoriteMiniCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  miniCardGradient: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
  },

  favoriteColorIndicator: {
    width: 6,
    borderRadius: 3,
    marginRight: 14,
  },

  favoriteMiniCardContent: {
    flex: 1,
  },

  favoriteMiniCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  cityNameContainer: {
    flex: 1,
    marginRight: 12,
  },

  favoriteMiniCardCity: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 3,
  },

  favoriteMiniCardRealCity: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },

  tempBadge: {
    backgroundColor: 'rgba(46, 134, 171, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  favoriteMiniCardTemp: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },

  favoriteMiniCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },

  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  weatherEmoji: {
    fontSize: 16,
    marginRight: 6,
  },

  favoriteMiniCardWeather: {
    fontSize: 13,
    color: COLORS.gray,
    textTransform: 'capitalize',
    flex: 1,
  },

  favoriteMiniCardTime: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: '500',
  },

  viewAllButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  viewAllGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },

  viewAllButtonText: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '600',
    marginRight: 8,
  },

  viewAllButtonIcon: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: 'bold',
  },
};

export default DashboardScreen;