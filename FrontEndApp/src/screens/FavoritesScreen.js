// FavoritesScreen.js - Pantalla principal de favoritos
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { FavoriteCard } from '../components';
import { COLORS } from '../constants/colors';
import { GLOBAL_STYLES } from '../constants/styles';
import FirebaseFavoritesService from '../utils/FirebaseFavoritesService';
import { useToast } from '../context/ToastContext';

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const user = useSelector((state) => state.auth.user);
  const userId = user?.id?.toString();
  const { showSuccess, showError, showWarning } = useToast();

  useEffect(() => {
    loadFavorites();
  }, []);

  /**
   * Cargar favoritos desde Firebase
   */
  const loadFavorites = async () => {
    try {
      if (!userId) {
        showWarning('Debes iniciar sesión');
        navigation.navigate('Login');
        return;
      }

      setLoading(true);
      
      console.log('📖 Cargando favoritos del usuario:', userId);
      const userFavorites = await FirebaseFavoritesService.getFavorites(userId);
      
      setFavorites(userFavorites);
      console.log(`✅ ${userFavorites.length} favoritos cargados`);

    } catch (error) {
      console.error('❌ Error cargando favoritos:', error);
      
      if (error.message.includes('Firebase no está configurado')) {
        showError('Firebase no configurado. Revisa el archivo .env');
      } else {
        showError('Error al cargar favoritos');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refrescar favoritos (Pull to refresh)
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, []);

  /**
   * Navegar a detalle del favorito (aquí se actualiza el clima)
   */
  const handleSelectFavorite = (favorite) => {
    navigation.navigate('FavoriteDetail', { favorite });
  };

  /**
   * Navegar a editar favorito
   */
  const handleEditFavorite = (favorite) => {
    navigation.navigate('EditFavorite', { favorite });
  };

  /**
   * Eliminar favorito
   */
  const handleDeleteFavorite = async (favoriteId, cityName) => {
    try {
      await FirebaseFavoritesService.removeFavorite(favoriteId);
      
      // Actualizar lista local
      setFavorites(prev => prev.filter(f => f.favoriteId !== favoriteId));
      
      showSuccess(`${cityName} eliminado de favoritos`);
      
    } catch (error) {
      console.error('Error eliminando favorito:', error);
      showError('No se pudo eliminar el favorito');
    }
  };

  /**
   * Componente vacío cuando no hay favoritos
   */
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIllustration}>
        <Text style={styles.emptyBigEmoji}>🌤️</Text>
        <View style={styles.emptyCircle1} />
        <View style={styles.emptyCircle2} />
      </View>
      
      <Text style={styles.emptyTitle}>Ninguna ciudad todavía</Text>
      <Text style={styles.emptySubtitle}>
        Comienza agregando tus ciudades favoritas{'\n'}
        y consulta su clima al instante
      </Text>
      
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => navigation.navigate('AddFavorite')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.emptyButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.emptyButtonText}>Agregar ciudad</Text>
          <Text style={styles.emptyButtonArrow}>→</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  /**
   * Loading state
   */
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCircle}>
            <ActivityIndicator size="large" color="#667eea" />
          </View>
          <Text style={styles.loadingText}>Cargando tus favoritos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header oscuro elegante */}
      <LinearGradient
        colors={COLORS.gradientDark}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Dashboard')}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerTitles}>
          <Text style={styles.headerGreeting}>Tus ciudades</Text>
          <Text style={styles.headerTitle}>Favoritas ⭐</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddFavorite')}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={COLORS.gradientPrimary}
            style={styles.addButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.addButtonIcon}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {/* Contador de ciudades */}
      {favorites.length > 0 && (
        <View style={styles.counterContainer}>
          <LinearGradient
            colors={COLORS.gradientPrimary}
            style={styles.counterBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.counterNumber}>{favorites.length}</Text>
            <Text style={styles.counterText}>
              {favorites.length === 1 ? 'ciudad guardada' : 'ciudades guardadas'}
            </Text>
          </LinearGradient>
        </View>
      )}

      {/* Lista de favoritos */}
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.favoriteId}
        renderItem={({ item }) => (
          <FavoriteCard
            favorite={item}
            onPress={() => handleSelectFavorite(item)}
            onEdit={() => handleEditFavorite(item)}
            onDelete={() => handleDeleteFavorite(item.favoriteId, item.nickname || item.city)}
          />
        )}
        ListEmptyComponent={<EmptyState />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={
          favorites.length === 0 ? styles.emptyListContent : styles.listContent
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // #121212
  },
  
  // Loading - Tema Oscuro
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingCircle: {
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  
  // Header - Tema Oscuro
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
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
    fontWeight: '600',
  },
  headerTitles: {
    flex: 1,
    marginLeft: 12,
  },
  headerGreeting: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  
  // Add Button - Tema Oscuro
  addButton: {
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButtonGradient: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonIcon: {
    fontSize: 28,
    color: COLORS.textPrimary,
    fontWeight: '300',
    marginTop: -2,
  },
  
  // Counter - Tema Oscuro
  counterContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  counterNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  counterText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
    opacity: 0.9,
  },
  
  // List
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  
  // Empty State - Tema Oscuro
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 40,
  },
  emptyIllustration: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  emptyBigEmoji: {
    fontSize: 88,
    zIndex: 2,
  },
  emptyCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.backgroundElevated,
    top: 20,
    left: 20,
    zIndex: 1,
  },
  emptyCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.backgroundCard,
    bottom: 10,
    right: 10,
    zIndex: 0,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  emptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 36,
  },
  emptyButtonText: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    marginRight: 8,
  },
  emptyButtonArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '400',
  },
});

export default FavoritesScreen;
