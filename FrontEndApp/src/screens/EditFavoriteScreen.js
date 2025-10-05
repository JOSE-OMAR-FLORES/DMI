// EditFavoriteScreen.js - Editar personalización de favorito
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomButton } from '../components';
import { COLORS } from '../constants/colors';
import { GLOBAL_STYLES } from '../constants/styles';
import FirebaseFavoritesService from '../utils/FirebaseFavoritesService';
import { useToast } from '../context/ToastContext';

// Colores predefinidos
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

const EditFavoriteScreen = ({ route, navigation }) => {
  const { favorite } = route.params;

  const [nickname, setNickname] = useState(favorite.nickname || '');
  const [notes, setNotes] = useState(favorite.notes || '');
  const [selectedColor, setSelectedColor] = useState(favorite.color || PRESET_COLORS[4].color);
  const [isSaving, setIsSaving] = useState(false);

  const { showSuccess, showError } = useToast();

  /**
   * Guardar cambios en Firebase
   */
  const handleSave = async () => {
    try {
      setIsSaving(true);

      const updates = {
        nickname: nickname.trim() || favorite.city,
        notes: notes.trim(),
        color: selectedColor,
      };

      await FirebaseFavoritesService.updateFavorite(favorite.favoriteId, updates);

      showSuccess('Favorito actualizado');
      
      // Regresar y actualizar la pantalla anterior
      navigation.navigate('Favorites');

    } catch (error) {
      console.error('Error actualizando favorito:', error);
      showError('No se pudo actualizar');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Eliminar favorito
   */
  const handleDelete = () => {
    Alert.alert(
      'Eliminar Favorito',
      `¿Estás seguro de eliminar "${favorite.nickname || favorite.city}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await FirebaseFavoritesService.removeFavorite(favorite.favoriteId);
              showSuccess('Favorito eliminado');
              navigation.navigate('Favorites');
            } catch (error) {
              showError('No se pudo eliminar');
            }
          },
        },
      ]
    );
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
        
        <Text style={styles.headerTitle}>Editar favorito</Text>
        
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Información de la ciudad */}
          <View style={styles.cityCard}>
            <Text style={styles.cityCardTitle}>📍 {favorite.city}</Text>
            <Text style={styles.cityCardSubtitle}>{favorite.country}</Text>
            {favorite.weatherSnapshot && (
              <View style={styles.weatherBadge}>
                <Text style={styles.weatherBadgeText}>
                  {Math.round(favorite.weatherSnapshot.temp)}° · {favorite.weatherSnapshot.description}
                </Text>
              </View>
            )}
          </View>

          {/* Sección de personalización */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ Personalización</Text>

            {/* Nickname */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre personalizado</Text>
              <TextInput
                style={styles.input}
                placeholder={favorite.city}
                placeholderTextColor="#8E8E93"
                value={nickname}
                onChangeText={setNickname}
                maxLength={30}
              />
            </View>

            {/* Notas */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nota personal</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Agrega una nota sobre esta ciudad..."
                placeholderTextColor="#8E8E93"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                maxLength={150}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{notes.length}/150</Text>
            </View>

            {/* Selector de color */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Color de identificación</Text>
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
                    activeOpacity={0.8}
                  >
                    {selectedColor === item.color && (
                      <Text style={styles.colorCheckmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Botones de acción */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
            <Text style={styles.deleteText}>Eliminar de favoritos</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  
  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  
  // City Card - Tema Oscuro
  cityCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cityCardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cityCardSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  weatherBadge: {
    backgroundColor: COLORS.backgroundElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  weatherBadgeText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  
  // Section - Tema Oscuro
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  
  // Input - Tema Oscuro
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  charCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 6,
  },
  
  // Color Picker - Tema Oscuro
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
    borderWidth: 3,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  colorOptionSelected: {
    borderColor: COLORS.primary,
    elevation: 6,
    shadowOpacity: 0.3,
    transform: [{ scale: 1.1 }],
  },
  colorCheckmark: {
    fontSize: 22,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  
  // Save Button - Tema Oscuro
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '600',
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

export default EditFavoriteScreen;
