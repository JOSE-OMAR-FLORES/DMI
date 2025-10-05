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
      <Text style={styles.emptyEmoji}>⭐</Text>
      <Text style={styles.emptyTitle}>No tienes ciudades favoritas</Text>
      <Text style={styles.emptySubtitle}>
        Agrega ciudades para consultar su clima rápidamente
      </Text>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddFavorite')}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.addButtonGradient}
        >
          <Text style={styles.addButtonText}>➕ Agregar primera ciudad</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  /**
   * Loading state
   */
  if (loading) {
    return (
      <SafeAreaView style={[GLOBAL_STYLES.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando favoritos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={GLOBAL_STYLES.container}>
      <LinearGradient
        colors={[COLORS.backgroundStart, COLORS.backgroundEnd]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Mis Ciudades Favoritas</Text>
            <Text style={styles.subtitle}>
              {favorites.length} {favorites.length === 1 ? 'ciudad' : 'ciudades'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('AddFavorite')}
          >
            <Text style={styles.headerButtonIcon}>➕</Text>
          </TouchableOpacity>
        </View>

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
              tintColor={COLORS.white}
              colors={[COLORS.primary]}
            />
          }
          contentContainerStyle={
            favorites.length === 0 ? styles.emptyListContent : styles.listContent
          }
          showsVerticalScrollIndicator={false}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundStart,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.7,
  },
  headerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonIcon: {
    fontSize: 24,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 30,
  },
  addButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FavoritesScreen;
