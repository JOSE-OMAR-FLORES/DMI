// WeatherCard.js - Componente de tarjeta del clima con animaciones espectaculares
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { GLOBAL_STYLES } from '../constants/styles';
import WeatherService from '../utils/WeatherService';
import { useToast } from '../context/ToastContext';

const { width, height } = Dimensions.get('window');

const WeatherCard = ({ cityName = 'Tehuacán', style }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  // Animaciones principales
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Animaciones de clima específicas
  const rainDrops = useRef(Array.from({ length: 20 }, () => new Animated.Value(0))).current;
  const lightningFlash = useRef(new Animated.Value(0)).current;
  const sunRays = useRef(Array.from({ length: 8 }, () => new Animated.Value(0))).current;
  const cloudMove = useRef(new Animated.Value(0)).current;
  const snowFlakes = useRef(Array.from({ length: 15 }, () => new Animated.Value(0))).current;
  const windSway = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadWeatherData();
  }, [cityName]);

  // Funciones de animaciones climáticas
  const startWeatherAnimations = (weatherCondition) => {
    // Detener animaciones previas
    stopAllWeatherAnimations();
    
    switch (weatherCondition) {
      case 'rain':
      case 'drizzle':
        startRainAnimation();
        break;
      case 'thunderstorm':
        startThunderstormAnimation();
        break;
      case 'clear':
        startSunnyAnimation();
        break;
      case 'clouds':
        startCloudyAnimation();
        break;
      case 'snow':
        startSnowAnimation();
        break;
      case 'mist':
      case 'fog':
        startMistAnimation();
        break;
      default:
        startDefaultAnimation();
    }
  };

  const stopAllWeatherAnimations = () => {
    rainDrops.forEach(drop => drop.stopAnimation());
    lightningFlash.stopAnimation();
    sunRays.forEach(ray => ray.stopAnimation());
    cloudMove.stopAnimation();
    snowFlakes.forEach(flake => flake.stopAnimation());
    windSway.stopAnimation();
  };

  const startRainAnimation = () => {
    const animateRainDrops = () => {
      rainDrops.forEach((drop, index) => {
        drop.setValue(0);
        Animated.timing(drop, {
          toValue: 1,
          duration: 1000 + Math.random() * 500,
          delay: index * 100,
          useNativeDriver: true,
        }).start(() => {
          if (weatherData?.weather?.[0]?.main === 'Rain') {
            animateRainDrops();
          }
        });
      });
    };
    animateRainDrops();
  };

  const startThunderstormAnimation = () => {
    startRainAnimation();
    
    const animateLightning = () => {
      Animated.sequence([
        Animated.timing(lightningFlash, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(lightningFlash, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(lightningFlash, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(lightningFlash, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (weatherData?.weather?.[0]?.main === 'Thunderstorm') {
          setTimeout(() => animateLightning(), 2000 + Math.random() * 3000);
        }
      });
    };
    
    setTimeout(() => animateLightning(), 1000);
  };

  const startSunnyAnimation = () => {
    sunRays.forEach((ray, index) => {
      Animated.loop(
        Animated.timing(ray, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        })
      ).start();
    });
  };

  const startCloudyAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cloudMove, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(cloudMove, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startSnowAnimation = () => {
    const animateSnowFlakes = () => {
      snowFlakes.forEach((flake, index) => {
        flake.setValue(0);
        Animated.timing(flake, {
          toValue: 1,
          duration: 2000 + Math.random() * 1000,
          delay: index * 200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          if (weatherData?.weather?.[0]?.main === 'Snow') {
            animateSnowFlakes();
          }
        });
      });
    };
    animateSnowFlakes();
  };

  const startMistAnimation = () => {
    Animated.loop(
      Animated.timing(windSway, {
        toValue: 1,
        duration: 2000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      })
    ).start();
  };

  const startDefaultAnimation = () => {
    Animated.loop(
      Animated.timing(windSway, {
        toValue: 1,
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  };

  const loadWeatherData = async () => {
    setIsLoading(true);
    setError(null);
    
    // Animación de carga espectacular
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    try {
      const result = await WeatherService.getCurrentWeather(cityName);
      
      if (result.success) {
        setWeatherData(result.data);
        showSuccess(`🌤️ Clima actualizado para ${result.data.city}`, 2500);
        
        // Animación de entrada espectacular
        Animated.sequence([
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              useNativeDriver: true,
              tension: 100,
              friction: 8,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 800,
              easing: Easing.out(Easing.back(1.2)),
              useNativeDriver: true,
            }),
          ]),
          // Iniciar animaciones específicas del clima
          Animated.timing(new Animated.Value(0), {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Determinar el tipo de clima y iniciar animaciones
          const weatherCondition = result.data.weather?.[0]?.main.toLowerCase();
          startWeatherAnimations(weatherCondition);
        });

      } else {
        setError(result.error);
        showError(`🌧️ ${result.error.message}`, 4000);
        
        // Animación de error más dramática
        Animated.sequence([
          Animated.timing(scaleAnim, { 
            toValue: 1.1, 
            duration: 200, 
            easing: Easing.out(Easing.ease),
            useNativeDriver: true 
          }),
          Animated.spring(scaleAnim, { 
            toValue: 1, 
            useNativeDriver: true,
            tension: 300,
            friction: 10,
          }),
        ]).start();
      }
    } catch (error) {
      setError({ message: 'Error inesperado', type: 'unknown' });
      showError('❌ Error inesperado al obtener el clima', 3000);
    } finally {
      setIsLoading(false);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  };

  const handleRefresh = () => {
    // Animación de rotación espectacular para el botón de recarga
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      rotateAnim.setValue(0);
    });
    
    showInfo('🔄 Actualizando clima...', 1500);
    stopAllWeatherAnimations();
    loadWeatherData();
  };

  // Componentes de efectos visuales
  const RainEffect = () => (
    <View style={styles.weatherEffect}>
      {rainDrops.map((drop, index) => {
        const translateY = drop.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, 200],
        });
        
        return (
          <Animated.View
            key={`rain-${index}`}
            style={[
              styles.rainDrop,
              {
                left: `${(index * 7) % 90}%`,
                transform: [{ translateY }],
                opacity: drop,
              },
            ]}
          />
        );
      })}
    </View>
  );

  const LightningEffect = () => (
    <Animated.View 
      style={[
        styles.lightningFlash,
        {
          opacity: lightningFlash,
        }
      ]}
    />
  );

  const SunRaysEffect = () => (
    <View style={styles.sunContainer}>
      {sunRays.map((ray, index) => {
        const rotation = ray.interpolate({
          inputRange: [0, 1],
          outputRange: [`${index * 45}deg`, `${index * 45 + 360}deg`],
        });
        
        return (
          <Animated.View
            key={`ray-${index}`}
            style={[
              styles.sunRay,
              {
                transform: [{ rotate: rotation }],
              },
            ]}
          />
        );
      })}
    </View>
  );

  const CloudsEffect = () => {
    const translateX = cloudMove.interpolate({
      inputRange: [0, 1],
      outputRange: [-20, 20],
    });
    
    return (
      <Animated.View 
        style={[
          styles.cloudContainer,
          {
            transform: [{ translateX }],
          }
        ]}
      >
        <Text style={styles.cloudEmoji}>☁️</Text>
        <Text style={styles.cloudEmoji2}>⛅</Text>
      </Animated.View>
    );
  };

  const SnowEffect = () => (
    <View style={styles.weatherEffect}>
      {snowFlakes.map((flake, index) => {
        const translateY = flake.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, 180],
        });
        
        const translateX = flake.interpolate({
          inputRange: [0, 1],
          outputRange: [0, (index % 2 ? 10 : -10)],
        });
        
        return (
          <Animated.View
            key={`snow-${index}`}
            style={[
              styles.snowFlake,
              {
                left: `${(index * 8) % 85}%`,
                transform: [{ translateY }, { translateX }],
                opacity: flake,
              },
            ]}
          >
            <Text style={styles.snowEmoji}>❄️</Text>
          </Animated.View>
        );
      })}
    </View>
  );

  const MistEffect = () => {
    const opacity = windSway.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    });
    
    return (
      <Animated.View 
        style={[
          styles.mistContainer,
          { opacity }
        ]}
      >
        <Text style={styles.mistEmoji}>🌫️</Text>
      </Animated.View>
    );
  };

  // Función para obtener gradiente según el clima
  const getWeatherGradient = () => {
    if (!weatherData) return [COLORS.skyBlue, COLORS.white];
    
    const condition = weatherData.weather?.[0]?.main.toLowerCase();
    const isDay = new Date().getHours() >= 6 && new Date().getHours() < 18;
    
    switch (condition) {
      case 'clear':
        return isDay 
          ? [COLORS.sunYellow, '#FFE135', COLORS.skyBlue] 
          : ['#1e3c72', '#2a5298', '#000428'];
      case 'rain':
      case 'drizzle':
        return ['#4b79a1', '#283e51', '#0f0f23'];
      case 'thunderstorm':
        return ['#2c1810', '#8B4513', '#000000'];
      case 'snow':
        return ['#E0E0E0', '#F5F5F5', '#87CEEB'];
      case 'clouds':
        return ['#bdc3c7', '#2c3e50', '#4b79a1'];
      case 'mist':
      case 'fog':
        return ['#f7f8f8', '#acbb78', '#bdc3c7'];
      default:
        return [COLORS.skyBlue, COLORS.white];
    }
  };

  // Función para obtener colores de texto según el clima
  const getTextColors = () => {
    if (!weatherData) return {
      primary: COLORS.darkGray,
      secondary: COLORS.gray,
      accent: COLORS.white
    };
    
    const condition = weatherData.weather?.[0]?.main.toLowerCase();
    const isDay = new Date().getHours() >= 6 && new Date().getHours() < 18;
    
    switch (condition) {
      case 'clear':
        if (isDay) {
          // Fondo amarillo/azul claro - texto oscuro
          return {
            primary: '#2c3e50',      // Azul oscuro para títulos
            secondary: '#34495e',    // Gris oscuro para subtítulos  
            accent: '#2c3e50',       // Azul oscuro para detalles
            shadow: 'rgba(255, 255, 255, 0.8)'
          };
        } else {
          // Fondo nocturno oscuro - texto claro
          return {
            primary: COLORS.white,
            secondary: 'rgba(255, 255, 255, 0.9)',
            accent: COLORS.white,
            shadow: 'rgba(0, 0, 0, 0.5)'
          };
        }
      case 'rain':
      case 'drizzle':
      case 'thunderstorm':
        // Fondos oscuros - texto claro
        return {
          primary: COLORS.white,
          secondary: 'rgba(255, 255, 255, 0.9)',
          accent: COLORS.white,
          shadow: 'rgba(0, 0, 0, 0.7)'
        };
      case 'snow':
        // Fondo claro - texto oscuro
        return {
          primary: '#2c3e50',
          secondary: '#34495e', 
          accent: '#2c3e50',
          shadow: 'rgba(255, 255, 255, 0.8)'
        };
      case 'clouds':
        // Fondo gris - texto oscuro
        return {
          primary: '#2c3e50',
          secondary: '#34495e',
          accent: '#2c3e50', 
          shadow: 'rgba(255, 255, 255, 0.6)'
        };
      case 'mist':
      case 'fog':
        // Fondo claro - texto oscuro
        return {
          primary: '#2c3e50',
          secondary: '#34495e',
          accent: '#2c3e50',
          shadow: 'rgba(255, 255, 255, 0.8)'
        };
      default:
        return {
          primary: '#2c3e50',
          secondary: '#34495e',
          accent: '#2c3e50',
          shadow: 'rgba(255, 255, 255, 0.6)'
        };
    }
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderLoadingState = () => (
    <Animated.View style={[
      styles.weatherCard,
      style,
      {
        transform: [{ scale: pulseAnim }],
        opacity: 0.8,
      }
    ]}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Obteniendo clima...</Text>
        <Text style={styles.cityName}>{cityName}</Text>
      </View>
    </Animated.View>
  );

  const renderErrorState = () => (
    <Animated.View style={[
      styles.weatherCard,
      styles.errorCard,
      style,
      {
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }
    ]}>
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>🌧️</Text>
        <Text style={styles.errorTitle}>Error al obtener el clima</Text>
        <Text style={styles.errorMessage}>{error?.message}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={handleRefresh}
          activeOpacity={0.8}
        >
          <Animated.Text style={[
            styles.retryButtonText,
            { transform: [{ rotate: rotateInterpolate }] }
          ]}>
            🔄
          </Animated.Text>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderWeatherContent = () => {
    const weatherCondition = weatherData.weather?.[0]?.main.toLowerCase();
    const textColors = getTextColors();
    
    return (
      <Animated.View style={[
        styles.weatherCard,
        style,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim }
          ],
        }
      ]}>
        <LinearGradient
          colors={getWeatherGradient()}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Efectos climáticos de fondo */}
          <View style={styles.weatherEffectsContainer}>
            {weatherCondition === 'rain' && <RainEffect />}
            {weatherCondition === 'drizzle' && <RainEffect />}
            {weatherCondition === 'thunderstorm' && (
              <>
                <RainEffect />
                <LightningEffect />
              </>
            )}
            {weatherCondition === 'clear' && <SunRaysEffect />}
            {weatherCondition === 'clouds' && <CloudsEffect />}
            {weatherCondition === 'snow' && <SnowEffect />}
            {(weatherCondition === 'mist' || weatherCondition === 'fog') && <MistEffect />}
          </View>

          {/* Contenido principal */}
          <View style={styles.contentContainer}>
            {/* Header con ciudad y botón de recarga */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.cityName, { 
                  color: textColors.primary,
                  textShadowColor: textColors.shadow 
                }]}>
                  {weatherData.city}
                </Text>
                <Text style={[styles.country, { 
                  color: textColors.secondary,
                  textShadowColor: textColors.shadow 
                }]}>
                  {weatherData.country}
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.refreshButton, {
                  backgroundColor: weatherCondition === 'clear' && new Date().getHours() >= 6 && new Date().getHours() < 18
                    ? 'rgba(44, 62, 80, 0.2)'  // Fondo oscuro para clima soleado
                    : 'rgba(255, 255, 255, 0.2)' // Fondo claro para otros climas
                }]} 
                onPress={handleRefresh}
                activeOpacity={0.7}
              >
                <Animated.Text style={[
                  styles.refreshIcon,
                  { transform: [{ rotate: rotateInterpolate }] }
                ]}>
                  🔄
                </Animated.Text>
              </TouchableOpacity>
            </View>

            {/* Temperatura principal con efectos */}
            <View style={styles.mainTemperature}>
              <Animated.Text 
                style={[
                  styles.weatherEmoji,
                  {
                    transform: [{ 
                      scale: pulseAnim.interpolate({
                        inputRange: [1, 1.2],
                        outputRange: [1, 1.1],
                      })
                    }]
                  }
                ]}
              >
                {WeatherService.getWeatherEmoji(weatherData.icon)}
              </Animated.Text>
              <Text style={[styles.temperature, { 
                color: textColors.primary,
                textShadowColor: textColors.shadow 
              }]}>
                {weatherData.temperature}°
              </Text>
              <Text style={[styles.feelsLike, { 
                color: textColors.secondary,
                textShadowColor: textColors.shadow 
              }]}>
                Sensación {weatherData.feelsLike}°
              </Text>
            </View>

            {/* Descripción con efectos */}
            <Animated.Text 
              style={[
                styles.description,
                {
                  color: textColors.primary,
                  textShadowColor: textColors.shadow,
                  transform: [{
                    translateY: windSway.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -2],
                    })
                  }]
                }
              ]}
            >
              {weatherData.description.charAt(0).toUpperCase() + weatherData.description.slice(1)}
            </Animated.Text>

            {/* Detalles adicionales con animaciones escalonadas */}
            <View style={[styles.detailsContainer, {
              backgroundColor: weatherCondition === 'clear' && new Date().getHours() >= 6 && new Date().getHours() < 18
                ? 'rgba(44, 62, 80, 0.1)'    // Fondo semi-oscuro para clima soleado
                : 'rgba(255, 255, 255, 0.15)', // Fondo semi-claro para otros climas
              borderColor: weatherCondition === 'clear' && new Date().getHours() >= 6 && new Date().getHours() < 18
                ? 'rgba(44, 62, 80, 0.2)'
                : 'rgba(255, 255, 255, 0.2)'
            }]}>
              <Animated.View 
                style={[
                  styles.detailItem,
                  { 
                    opacity: fadeAnim,
                    transform: [{ 
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 20],
                        outputRange: [0, 10],
                      })
                    }]
                  }
                ]}
              >
                <Text style={styles.detailIcon}>💧</Text>
                <Text style={[styles.detailText, { 
                  color: textColors.primary,
                  textShadowColor: textColors.shadow 
                }]}>
                  {weatherData.humidity}%
                </Text>
                <Text style={[styles.detailLabel, { 
                  color: textColors.secondary,
                  textShadowColor: textColors.shadow 
                }]}>
                  Humedad
                </Text>
              </Animated.View>
              
              <Animated.View 
                style={[
                  styles.detailItem,
                  { 
                    opacity: fadeAnim,
                    transform: [{ 
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 20],
                        outputRange: [0, 5],
                      })
                    }]
                  }
                ]}
              >
                <Animated.Text 
                  style={[
                    styles.detailIcon,
                    {
                      transform: [{
                        rotate: windSway.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['-5deg', '5deg'],
                        })
                      }]
                    }
                  ]}
                >
                  🌪️
                </Animated.Text>
                <Text style={[styles.detailText, { 
                  color: textColors.primary,
                  textShadowColor: textColors.shadow 
                }]}>
                  {weatherData.windSpeed} m/s
                </Text>
                <Text style={[styles.detailLabel, { 
                  color: textColors.secondary,
                  textShadowColor: textColors.shadow 
                }]}>
                  Viento
                </Text>
              </Animated.View>
              
              <Animated.View 
                style={[
                  styles.detailItem,
                  { 
                    opacity: fadeAnim,
                  }
                ]}
              >
                <Text style={styles.detailIcon}>👁️</Text>
                <Text style={[styles.detailText, { 
                  color: textColors.primary,
                  textShadowColor: textColors.shadow 
                }]}>
                  {weatherData.visibility} km
                </Text>
                <Text style={[styles.detailLabel, { 
                  color: textColors.secondary,
                  textShadowColor: textColors.shadow 
                }]}>
                  Visibilidad
                </Text>
              </Animated.View>
            </View>

            {/* Timestamp con pulso sutil */}
            <Animated.Text 
              style={[
                styles.timestamp,
                {
                  color: textColors.secondary,
                  textShadowColor: textColors.shadow,
                  opacity: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.8],
                  })
                }
              ]}
            >
              Actualizado: {new Date(weatherData.timestamp).toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Animated.Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  if (isLoading) return renderLoadingState();
  if (error && !weatherData) return renderErrorState();
  if (weatherData) return renderWeatherContent();

  return null;
};

const styles = {
  weatherCard: {
    ...GLOBAL_STYLES.card,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 25,
    padding: 0,
    overflow: 'hidden',
    elevation: 15,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  
  gradientBackground: {
    borderRadius: 25,
    padding: 20,
    minHeight: 350,
  },

  weatherEffectsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },

  contentContainer: {
    zIndex: 2,
    position: 'relative',
  },

  // Efectos de lluvia
  weatherEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  rainDrop: {
    position: 'absolute',
    width: 2,
    height: 15,
    backgroundColor: 'rgba(173, 216, 230, 0.7)',
    borderRadius: 1,
    top: -20,
  },

  // Efecto de rayo
  lightningFlash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 10,
  },

  // Rayos del sol
  sunContainer: {
    position: 'absolute',
    top: '20%',
    left: '50%',
    width: 100,
    height: 100,
    marginLeft: -50,
    marginTop: -50,
  },

  sunRay: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.4)',
    borderRadius: 1,
    top: '50%',
    left: '50%',
    marginLeft: -1,
    marginTop: -10,
  },

  // Nubes
  cloudContainer: {
    position: 'absolute',
    top: '15%',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  cloudEmoji: {
    fontSize: 40,
    opacity: 0.6,
  },

  cloudEmoji2: {
    fontSize: 30,
    opacity: 0.4,
  },

  // Nieve
  snowFlake: {
    position: 'absolute',
    top: -20,
  },

  snowEmoji: {
    fontSize: 16,
    opacity: 0.8,
  },

  // Niebla
  mistContainer: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  mistEmoji: {
    fontSize: 60,
    opacity: 0.3,
  },
  
  errorCard: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
  },

  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },

  errorContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
  },

  errorEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.error,
    marginBottom: 10,
  },

  errorMessage: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 20,
  },

  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
  },

  retryButtonText: {
    fontSize: 18,
    marginRight: 10,
  },

  retryText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },

  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    // color dinámico aplicado en el render
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  country: {
    fontSize: 16,
    // color dinámico aplicado en el render
    marginTop: 4,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  refreshButton: {
    padding: 12,
    borderRadius: 25,
    // backgroundColor dinámico aplicado en el render
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  refreshIcon: {
    fontSize: 24,
  },

  mainTemperature: {
    alignItems: 'center',
    marginVertical: 30,
  },

  weatherEmoji: {
    fontSize: 80,
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },

  temperature: {
    fontSize: 64,
    fontWeight: 'bold',
    // color dinámico aplicado en el render
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },

  feelsLike: {
    fontSize: 16,
    // color dinámico aplicado en el render
    marginTop: 8,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  description: {
    fontSize: 20,
    // color dinámico aplicado en el render
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '600',
    textTransform: 'capitalize',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
    // backgroundColor dinámico aplicado en el render
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    // borderColor dinámico aplicado en el render
  },

  detailItem: {
    alignItems: 'center',
    flex: 1,
  },

  detailIcon: {
    fontSize: 28,
    marginBottom: 10,
  },

  detailText: {
    fontSize: 18,
    fontWeight: 'bold',
    // color dinámico aplicado en el render
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  detailLabel: {
    fontSize: 13,
    // color dinámico aplicado en el render
    marginTop: 4,
    fontWeight: '500',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  timestamp: {
    fontSize: 13,
    // color dinámico aplicado en el render
    textAlign: 'center',
    fontStyle: 'italic',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
};

export default WeatherCard;