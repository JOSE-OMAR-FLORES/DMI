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
    <SafeAreaView style={GLOBAL_STYLES.container}>
      <LinearGradient
        colors={[COLORS.backgroundStart, COLORS.backgroundEnd]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Editar Favorito</Text>
              <Text style={styles.subtitle}>
                Personaliza tu ciudad favorita
              </Text>
            </View>

            {/* Información de la ciudad (no editable) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍 Ciudad</Text>
              <View style={styles.cityInfo}>
                <Text style={styles.cityName}>
                  {favorite.city}, {favorite.country}
                </Text>
                <Text style={styles.cityNote}>
                  (La ciudad no se puede cambiar)
                </Text>
              </View>
            </View>

            {/* Clima actual (solo lectura) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌤️ Clima Actual (solo lectura)</Text>
              <View style={styles.weatherCard}>
                <View style={styles.weatherRow}>
                  <Text style={styles.weatherLabel}>Temperatura:</Text>
                  <Text style={styles.weatherValue}>
                    {favorite.weatherSnapshot?.temperature || '--'}°C
                  </Text>
                </View>
                <View style={styles.weatherRow}>
                  <Text style={styles.weatherLabel}>Condición:</Text>
                  <Text style={styles.weatherValue}>
                    {favorite.weatherSnapshot?.condition || 'Sin datos'}
                  </Text>
                </View>
                <Text style={styles.weatherNote}>
                  El clima se actualiza automáticamente al ver el favorito
                </Text>
              </View>
            </View>

            {/* Editar personalización */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✨ Personalización</Text>

              {/* Nickname */}
              <Text style={styles.label}>Nombre personalizado</Text>
              <TextInput
                style={styles.input}
                placeholder={favorite.city}
                placeholderTextColor={COLORS.textSecondary}
                value={nickname}
                onChangeText={setNickname}
                maxLength={30}
              />

              {/* Notas */}
              <Text style={styles.label}>Nota personal</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Agrega notas sobre esta ciudad..."
                placeholderTextColor={COLORS.textSecondary}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                maxLength={100}
              />

              {/* Selector de color */}
              <Text style={styles.label}>Color de identificación</Text>
              <View style={styles.colorPicker}>
                {PRESET_COLORS.map((item) => (
                  <TouchableOpacity
                    key={item.color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: item.color },
                      selectedColor === item.color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setSelectedColor(item.color)}
                  >
                    {selectedColor === item.color && (
                      <Text style={styles.colorCheckmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Botones de acción */}
            <View style={styles.actionsContainer}>
              <CustomButton
                title={isSaving ? 'Guardando...' : '💾 Guardar Cambios'}
                onPress={handleSave}
                disabled={isSaving}
                style={styles.saveButton}
              />

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                disabled={isSaving}
              >
                <Text style={styles.deleteButtonText}>
                  🗑️ Eliminar Favorito
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.7,
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 16,
  },
  cityInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
  },
  cityName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  cityNote: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  weatherCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weatherLabel: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  weatherValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  weatherNote: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.6,
    fontStyle: 'italic',
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    color: COLORS.white,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: COLORS.white,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  colorCheckmark: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  actionsContainer: {
    padding: 20,
  },
  saveButton: {
    marginBottom: 16,
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

export default EditFavoriteScreen;
