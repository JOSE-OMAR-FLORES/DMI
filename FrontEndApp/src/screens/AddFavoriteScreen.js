// AddFavoriteScreen.js - Pantalla para agregar ciudad favorita
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomButton } from '../components';
import { COLORS } from '../constants/colors';
import { GLOBAL_STYLES } from '../constants/styles';
import WeatherService from '../utils/WeatherService';
import FirebaseFavoritesService from '../utils/FirebaseFavoritesService';
import { useToast } from '../context/ToastContext';

// Colores predefinidos para elegir
const PRESET_COLORS = [
  { name: 'Rojo', color: '#FF6B6B' },
  { name: 'Naranja', color: '#FFA500' },
  { name: 'Amarillo', color: '#FFD93D' },
  { name: 'Verde', color: '#6BCB77' },
  { name: 'Azul', color: '#4D96FF' },
  { name: 'Morado', color: '#9D4EDD' },
  { name: 'Rosa', color: '#FF6FB5' },
  { name: 'Turquesa', color: '#06D6A0' },
];

const AddFavoriteScreen = ({ navigation }) => {
  const [cityName, setCityName] = useState('');
  const [nickname, setNickname] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[4].color);
  
  const [weatherData, setWeatherData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]); // Sugerencias del API
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [cityMismatchWarning, setCityMismatchWarning] = useState(''); // Aviso cuando la ciudad es diferente

  const user = useSelector((state) => state.auth.user);
  const userId = user?.id?.toString();
  const { showSuccess, showError, showWarning } = useToast();

  /**
   * Buscar ciudades mientras el usuario escribe (debounced)
   */
  const handleCityInputChange = async (text) => {
    setCityName(text);
    
    // Limpiar weather data si cambia el texto
    if (weatherData && text.trim() !== weatherData.city) {
      setWeatherData(null);
      setCityMismatchWarning(''); // Limpiar aviso también
    }
    
    if (text.trim().length >= 3) {
      try {
        setIsLoadingSuggestions(true);
        
        // Buscar ciudades con el API de Geocoding
        const result = await WeatherService.searchCities(text.trim(), 5);
        
        if (result.success) {
          setCitySuggestions(result.data);
          setShowSuggestions(result.data.length > 0);
        } else {
          setCitySuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Error buscando sugerencias:', error);
        setCitySuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoadingSuggestions(false);
      }
    } else {
      setCitySuggestions([]);
      setShowSuggestions(false);
    }
  };

  /**
   * Seleccionar una ciudad de las sugerencias
   */
  const selectSuggestion = async (city) => {
    setCityName(city.label);
    setShowSuggestions(false);
    setCitySuggestions([]);
    
    // Buscar automáticamente el clima usando coordenadas (más preciso)
    try {
      setIsSearching(true);
      setSearchError('');
      
      console.log('🔍 Buscando clima para:', city.label, 'con coordenadas:', city.lat, city.lon);
      
      // Usar coordenadas en lugar del nombre para mayor precisión
      const result = await WeatherService.getCurrentWeatherByCoords(city.lat, city.lon, city.name);

      if (result.success) {
        setWeatherData(result.data);
        
        // Si el nombre seleccionado es diferente al que devuelve el API,
        // sugerirlo como nickname automáticamente y mostrar aviso
        if (city.name !== result.data.city) {
          if (!nickname.trim()) {
            setNickname(city.name);
          }
          setCityMismatchWarning(
            `"${city.name}" no está disponible en OpenWeather. Se mostrará el clima de "${result.data.city}" (ciudad más cercana).`
          );
          showSuccess(`📍 Mostrando clima de ${result.data.city}`);
        } else {
          setCityMismatchWarning(''); // Limpiar aviso si coincide
          showSuccess(`Ciudad encontrada: ${result.data.city}, ${result.data.country}`);
        }
      } else {
        setSearchError(result.error.message || 'Ciudad no encontrada');
        setWeatherData(null);
        setCityMismatchWarning('');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      setSearchError('Error al buscar la ciudad');
      setWeatherData(null);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Buscar ciudad en OpenWeather API
   */
  const handleSearchCity = async () => {
    if (!cityName.trim()) {
      setSearchError('Ingresa el nombre de una ciudad');
      return;
    }

    try {
      setIsSearching(true);
      setSearchError('');
      setCityMismatchWarning(''); // Limpiar aviso al buscar manualmente
      
      console.log('🔍 Buscando ciudad:', cityName);
      
      // WeatherService ya es una instancia, no necesita 'new'
      const result = await WeatherService.getCurrentWeather(cityName.trim());

      if (result.success) {
        setWeatherData(result.data);
        console.log('✅ Ciudad encontrada:', result.data.city);
        showSuccess(`Ciudad encontrada: ${result.data.city}`);
      } else {
        setSearchError(result.error.message || 'Ciudad no encontrada');
        setWeatherData(null);
      }

    } catch (error) {
      console.error('❌ Error buscando ciudad:', error);
      setSearchError('Error al buscar la ciudad. Intenta de nuevo.');
      setWeatherData(null);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Guardar favorito en Firebase
   */
  const handleSaveFavorite = async () => {
    if (!weatherData) {
      showWarning('Primero busca una ciudad');
      return;
    }

    if (!userId) {
      showError('Usuario no autenticado');
      navigation.navigate('Login');
      return;
    }

    try {
      setIsSaving(true);

      const favoriteData = {
        userId,
        city: weatherData.city,
        country: weatherData.country,
        coordinates: {
          lat: weatherData.coordinates?.lat || 0,
          lon: weatherData.coordinates?.lon || 0,
        },
        nickname: nickname.trim() || weatherData.city,
        notes: notes.trim(),
        color: selectedColor,
        weatherSnapshot: {
          temp: weatherData.temperature,
          condition: weatherData.description,
          description: weatherData.description,
          humidity: weatherData.humidity,
          windSpeed: weatherData.windSpeed,
          icon: weatherData.icon,
          feelsLike: weatherData.feelsLike,
          visibility: weatherData.visibility,
        },
      };

      console.log('💾 Guardando favorito con userId:', userId, '- Ciudad:', favoriteData.city);

      const result = await FirebaseFavoritesService.addFavorite(favoriteData);

      if (result.success) {
        showSuccess(`${weatherData.city} agregado a favoritos`);
        navigation.goBack();
      }

    } catch (error) {
      console.error('❌ Error guardando favorito:', error);
      
      if (error.message.includes('Firebase no está configurado')) {
        showError('Firebase no configurado. Revisa el archivo .env');
      } else {
        showError('No se pudo guardar el favorito');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header oscuro elegante */}
      <LinearGradient
        colors={COLORS.gradientDark}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Agregar ciudad</Text>
        
        <View style={{ width: 44 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* PASO 1: Buscar Ciudad */}
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>PASO 1</Text>
              </View>
              <Text style={styles.stepTitle}>Buscar ciudad</Text>
              <Text style={styles.stepSubtitle}>Encuentra la ciudad que quieres agregar</Text>
            </View>

            <View style={styles.searchSection}>
              <Text style={styles.inputLabel}>Nombre de la ciudad</Text>
              <View style={styles.searchInputContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Ej: Ciudad de México, París..."
                  placeholderTextColor="#8E8E93"
                  value={cityName}
                  onChangeText={handleCityInputChange}
                  onSubmitEditing={handleSearchCity}
                  returnKeyType="search"
                  autoCapitalize="words"
                />
              </View>

              {/* Sugerencias de Autocompletado */}
              {showSuggestions && citySuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {isLoadingSuggestions ? (
                    <View style={styles.loadingBox}>
                      <ActivityIndicator size="small" color="#667eea" />
                      <Text style={styles.loadingText}>Buscando...</Text>
                    </View>
                  ) : (
                    citySuggestions.map((city, index) => (
                      <TouchableOpacity
                        key={`${city.name}-${city.lat}-${index}`}
                        style={styles.suggestionItem}
                        onPress={() => selectSuggestion(city)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.suggestionIcon}>📍</Text>
                        <View style={styles.suggestionText}>
                          <Text style={styles.suggestionName}>{city.name}</Text>
                          <Text style={styles.suggestionDetails}>
                            {[city.state, city.country].filter(Boolean).join(', ')}
                          </Text>
                        </View>
                        <Text style={styles.suggestionArrow}>→</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}

              {searchError && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>{searchError}</Text>
                </View>
              )}
            </View>
          </View>

          {/* PASO 2: Resultado del Clima */}
          {weatherData && (
            <View style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepBadge, styles.stepBadgeSuccess]}>
                  <Text style={styles.stepBadgeText}>✓ ENCONTRADA</Text>
                </View>
                <Text style={styles.stepTitle}>Clima actual</Text>
                <Text style={styles.stepSubtitle}>Información meteorológica</Text>
              </View>

              {/* Aviso cuando la ciudad no está disponible */}
              {cityMismatchWarning && (
                <View style={styles.warningBox}>
                  <Text style={styles.warningIcon}>ℹ️</Text>
                  <Text style={styles.warningText}>{cityMismatchWarning}</Text>
                </View>
              )}

              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.weatherCard}
              >
                <View style={styles.weatherHeader}>
                  <View style={styles.weatherLocation}>
                    <Text style={styles.weatherCity}>{weatherData.city}</Text>
                    <Text style={styles.weatherCountry}>{weatherData.country}</Text>
                  </View>
                  <Text style={styles.weatherEmoji}>
                    {weatherData.description?.includes('clear') ? '☀️' :
                     weatherData.description?.includes('cloud') ? '☁️' :
                     weatherData.description?.includes('rain') ? '🌧️' : '🌤️'}
                  </Text>
                </View>
                
                <View style={styles.weatherMain}>
                  <Text style={styles.weatherTemp}>{Math.round(weatherData.temperature)}°</Text>
                  <Text style={styles.weatherDescription}>{weatherData.description}</Text>
                </View>

                <View style={styles.weatherDetails}>
                  <View style={styles.weatherDetail}>
                    <Text style={styles.weatherDetailIcon}>💧</Text>
                    <Text style={styles.weatherDetailValue}>{weatherData.humidity}%</Text>
                    <Text style={styles.weatherDetailLabel}>Humedad</Text>
                  </View>
                  <View style={styles.weatherDetailDivider} />
                  <View style={styles.weatherDetail}>
                    <Text style={styles.weatherDetailIcon}>💨</Text>
                    <Text style={styles.weatherDetailValue}>{Math.round(weatherData.windSpeed)}</Text>
                    <Text style={styles.weatherDetailLabel}>km/h</Text>
                  </View>
                  <View style={styles.weatherDetailDivider} />
                  <View style={styles.weatherDetail}>
                    <Text style={styles.weatherDetailIcon}>🌡️</Text>
                    <Text style={styles.weatherDetailValue}>{Math.round(weatherData.feelsLike)}°</Text>
                    <Text style={styles.weatherDetailLabel}>Sensación</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* PASO 3: Personalización */}
          {weatherData && (
            <View style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>PASO 2</Text>
                </View>
                <Text style={styles.stepTitle}>Personaliza (opcional)</Text>
                <Text style={styles.stepSubtitle}>Dale tu toque personal a esta ciudad</Text>
              </View>

              <View style={styles.personalizationSection}>
                {/* Nickname */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>🏷️ Nombre personalizado</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Mi casa, Trabajo, Vacaciones..."
                    placeholderTextColor="#8E8E93"
                    value={nickname}
                    onChangeText={setNickname}
                    maxLength={30}
                  />
                </View>

                {/* Notas */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>📝 Notas</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Ej: Ciudad natal, viajo aquí seguido..."
                    placeholderTextColor="#8E8E93"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                    maxLength={100}
                    textAlignVertical="top"
                  />
                </View>

                {/* Selector de color */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>🎨 Color</Text>
                  <View style={styles.colorGrid}>
                    {PRESET_COLORS.map((item) => (
                      <TouchableOpacity
                        key={item.color}
                        style={[
                          styles.colorCircle,
                          { backgroundColor: item.color },
                          selectedColor === item.color && styles.colorCircleSelected,
                        ]}
                        onPress={() => setSelectedColor(item.color)}
                        activeOpacity={0.7}
                      >
                        {selectedColor === item.color && (
                          <Text style={styles.colorCheck}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Botón Guardar */}
          {weatherData && (
            <TouchableOpacity
              style={styles.saveButtonContainer}
              onPress={handleSaveFavorite}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButton}
              >
                {isSaving ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Guardando...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.saveButtonIcon}>💾</Text>
                    <Text style={styles.saveButtonText}>Guardar favorito</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // #121212
  },
  
  // Header - Tema Oscuro
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  
  // Main Content
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  
  // Step Cards - Tema Oscuro
  stepCard: {
    backgroundColor: COLORS.backgroundCard, // #1E1E1E
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border, // #333333
  },
  stepHeader: {
    marginBottom: 20,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary, // #00BFFF
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  stepBadgeSuccess: {
    backgroundColor: COLORS.success,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  
  // Search Section - Tema Oscuro
  searchSection: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundElevated, // #2C2C2C
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  
  // Suggestions - Tema Oscuro
  suggestionsContainer: {
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    maxHeight: 280,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suggestionIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  suggestionDetails: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  suggestionArrow: {
    fontSize: 18,
    color: COLORS.textTertiary,
    marginLeft: 8,
  },
  
  // Error & Warning - Tema Oscuro
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    marginTop: 12,
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '500',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 165, 0, 0.15)',
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent, // #FFA500
    marginBottom: 16,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '500',
    lineHeight: 20,
  },
  
  // Weather Card - Tema Oscuro
  weatherCard: {
    borderRadius: 16,
    padding: 24,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  weatherLocation: {
    flex: 1,
  },
  weatherCity: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  weatherCountry: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  weatherEmoji: {
    fontSize: 44,
  },
  weatherMain: {
    marginBottom: 24,
  },
  weatherTemp: {
    fontSize: 64,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  weatherDescription: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  weatherDetail: {
    alignItems: 'center',
  },
  weatherDetailIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  weatherDetailValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  weatherDetailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  weatherDetailDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  
  // Personalization - Tema Oscuro
  personalizationSection: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  input: {
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  
  // Color Picker - Tema Oscuro
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorCircleSelected: {
    borderColor: COLORS.primary,
    transform: [{ scale: 1.1 }],
  },
  colorCheck: {
    fontSize: 20,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  // Save Button - Tema Oscuro
  saveButtonContainer: {
    marginTop: 10,
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  saveButtonIcon: {
    fontSize: 22,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});

export default AddFavoriteScreen;
