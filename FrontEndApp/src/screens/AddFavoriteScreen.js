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

// Ciudades populares para autocompletado
const POPULAR_CITIES = [
  'Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Cancún',
  'Tokyo', 'London', 'Paris', 'New York', 'Los Angeles', 'Madrid', 'Barcelona',
  'Berlin', 'Rome', 'Amsterdam', 'Dubai', 'Singapore', 'Sydney', 'Moscow',
  'Toronto', 'Chicago', 'Miami', 'San Francisco', 'Seattle', 'Boston',
  'Buenos Aires', 'São Paulo', 'Rio de Janeiro', 'Lima', 'Bogotá', 'Santiago'
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
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const userId = user?.id?.toString();
  const { showSuccess, showError, showWarning } = useToast();

  /**
   * Filtrar sugerencias de ciudades
   */
  const handleCityInputChange = (text) => {
    setCityName(text);
    
    if (text.trim().length >= 2) {
      const filtered = POPULAR_CITIES.filter(city =>
        city.toLowerCase().includes(text.toLowerCase())
      ).slice(0, 5);
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  /**
   * Seleccionar sugerencia
   */
  const selectSuggestion = (city) => {
    setCityName(city);
    setShowSuggestions(false);
    setSuggestions([]);
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
    <View style={styles.container}>
      {/* Header con gradiente */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.headerGradient}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agregar Favorito</Text>
        <Text style={styles.headerSubtitle}>Busca y personaliza tu ciudad</Text>
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
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepHeaderText}>
                <Text style={styles.stepTitle}>Buscar Ciudad</Text>
                <Text style={styles.stepSubtitle}>Encuentra tu ciudad favorita</Text>
              </View>
            </View>

            <View style={styles.searchWrapper}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Escribe el nombre de la ciudad..."
                  placeholderTextColor="#999"
                  value={cityName}
                  onChangeText={handleCityInputChange}
                  onSubmitEditing={handleSearchCity}
                  returnKeyType="search"
                  autoCapitalize="words"
                />
              </View>

              {/* Sugerencias de Autocompletado */}
              {showSuggestions && suggestions.length > 0 && (
                <View style={styles.suggestionsBox}>
                  {suggestions.map((city, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => selectSuggestion(city)}
                    >
                      <Text style={styles.suggestionIcon}>📍</Text>
                      <Text style={styles.suggestionText}>{city}</Text>
                      <Text style={styles.suggestionArrow}>→</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.searchButton,
                  isSearching && styles.searchButtonDisabled
                ]}
                onPress={handleSearchCity}
                disabled={isSearching}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.searchButtonGradient}
                >
                  {isSearching ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <>
                      <Text style={styles.searchButtonText}>Buscar Ciudad</Text>
                      <Text style={styles.searchButtonIcon}>→</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

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
                <View style={[styles.stepNumber, styles.stepNumberSuccess]}>
                  <Text style={styles.stepNumberText}>✓</Text>
                </View>
                <View style={styles.stepHeaderText}>
                  <Text style={styles.stepTitle}>Ciudad Encontrada</Text>
                  <Text style={styles.stepSubtitle}>Clima actual</Text>
                </View>
              </View>

              <View style={styles.weatherPreview}>
                <LinearGradient
                  colors={['#4facfe', '#00f2fe']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.weatherGradient}
                >
                  <View style={styles.weatherTop}>
                    <View>
                      <Text style={styles.weatherCity}>{weatherData.city}</Text>
                      <Text style={styles.weatherCountry}>{weatherData.country}</Text>
                    </View>
                    <Text style={styles.weatherIcon}>
                      {weatherData.description?.includes('clear') ? '☀️' :
                       weatherData.description?.includes('cloud') ? '☁️' :
                       weatherData.description?.includes('rain') ? '🌧️' : '🌤️'}
                    </Text>
                  </View>
                  
                  <View style={styles.weatherBottom}>
                    <Text style={styles.weatherTemp}>{Math.round(weatherData.temperature)}°</Text>
                    <Text style={styles.weatherDesc}>{weatherData.description}</Text>
                  </View>

                  <View style={styles.weatherStats}>
                    <View style={styles.weatherStat}>
                      <Text style={styles.weatherStatIcon}>💧</Text>
                      <Text style={styles.weatherStatText}>{weatherData.humidity}%</Text>
                    </View>
                    <View style={styles.weatherStat}>
                      <Text style={styles.weatherStatIcon}>💨</Text>
                      <Text style={styles.weatherStatText}>{Math.round(weatherData.windSpeed)} km/h</Text>
                    </View>
                    <View style={styles.weatherStat}>
                      <Text style={styles.weatherStatIcon}>🌡️</Text>
                      <Text style={styles.weatherStatText}>{Math.round(weatherData.feelsLike)}°</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </View>
          )}

          {/* PASO 3: Personalización */}
          {weatherData && (
            <View style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepHeaderText}>
                  <Text style={styles.stepTitle}>Personalizar</Text>
                  <Text style={styles.stepSubtitle}>Opcional - Dale tu toque personal</Text>
                </View>
              </View>

              <View style={styles.personalizationContent}>
                {/* Nickname */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>🏷️ Nombre personalizado</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Casa, Playa, Viaje..."
                    placeholderTextColor="#999"
                    value={nickname}
                    onChangeText={setNickname}
                    maxLength={30}
                  />
                </View>

                {/* Notas */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>📝 Nota personal</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Ej: Ciudad natal, viajo aquí seguido..."
                    placeholderTextColor="#999"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                    maxLength={100}
                  />
                </View>

                {/* Selector de color */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>🎨 Color de identificación</Text>
                  <View style={styles.colorGrid}>
                    {PRESET_COLORS.map((item) => (
                      <TouchableOpacity
                        key={item.color}
                        style={[
                          styles.colorOption,
                          { backgroundColor: item.color },
                          selectedColor === item.color && styles.colorOptionSelected,
                        ]}
                        onPress={() => setSelectedColor(item.color)}
                        activeOpacity={0.7}
                      >
                        {selectedColor === item.color && (
                          <View style={styles.colorCheckContainer}>
                            <Text style={styles.colorCheck}>✓</Text>
                          </View>
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
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSaveFavorite}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#11998e', '#38ef7d']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                {isSaving ? (
                  <>
                    <ActivityIndicator size="small" color={COLORS.white} />
                    <Text style={styles.saveButtonText}>Guardando...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.saveButtonIcon}>💾</Text>
                    <Text style={styles.saveButtonText}>Guardar Favorito</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  
  backButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '400',
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
  
  // Step Cards
  stepCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  stepNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  
  stepNumberSuccess: {
    backgroundColor: '#11998e',
  },
  
  stepNumberText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  
  stepHeaderText: {
    flex: 1,
  },
  
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 3,
  },
  
  stepSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  
  // Search
  searchWrapper: {
    position: 'relative',
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  inputIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  
  // Suggestions
  suggestionsBox: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  
  suggestionIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  
  suggestionArrow: {
    fontSize: 16,
    color: '#999',
  },
  
  // Search Button
  searchButton: {
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  
  searchButtonDisabled: {
    opacity: 0.6,
  },
  
  searchButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  
  searchButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginRight: 8,
  },
  
  searchButtonIcon: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  
  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3F3',
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
    marginTop: 10,
  },
  
  errorIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#D32F2F',
    fontWeight: '500',
  },
  
  // Weather Preview
  weatherPreview: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  
  weatherGradient: {
    padding: 24,
  },
  
  weatherTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  
  weatherCity: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  
  weatherCountry: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  
  weatherIcon: {
    fontSize: 44,
  },
  
  weatherBottom: {
    marginBottom: 20,
  },
  
  weatherTemp: {
    fontSize: 56,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
  },
  
  weatherDesc: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  
  weatherStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  
  weatherStat: {
    alignItems: 'center',
  },
  
  weatherStatIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  
  weatherStatText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
  },
  
  // Personalization
  personalizationContent: {
    gap: 20,
  },
  
  fieldGroup: {
    marginBottom: 5,
  },
  
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1A1A1A',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  
  // Color Picker
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  colorOption: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'transparent',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  colorOptionSelected: {
    borderColor: '#1A1A1A',
    elevation: 6,
    shadowOpacity: 0.3,
    transform: [{ scale: 1.1 }],
  },
  
  colorCheckContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  colorCheck: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  
  // Save Button
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
    elevation: 5,
    shadowColor: '#11998e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  
  saveButtonDisabled: {
    opacity: 0.6,
  },
  
  saveButtonGradient: {
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
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default AddFavoriteScreen;
