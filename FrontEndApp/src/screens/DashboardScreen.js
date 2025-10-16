import React, { useEffect, useRef } from 'react';
import { View, ScrollView, Animated, StatusBar, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomButton } from '../components';
import CustomText from '../components/CustomText';
import { useToast } from '../context/ToastContext';
import { COLORS } from '../constants/colors';
import { logoutUser } from '../context/authSlice';

const DashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { showSuccess } = useToast();
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }),
    ]).start();
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      showSuccess('Sesión cerrada correctamente');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleNavigateToTodos = () => {
    navigation.navigate('TodoList');
  };

  const handleNavigateToMFASettings = () => {
    navigation.navigate('MfaSettings');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary, COLORS.accent]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <CustomText style={styles.greeting}>
              ¡Hola, {user?.name || user?.email || 'Usuario'}! 👋
            </CustomText>
            <CustomText style={styles.subtitle}>
              Bienvenido a tu panel de control
            </CustomText>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.cardHeader}>
              <CustomText style={styles.cardTitle}>Información de Usuario</CustomText>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <CustomText style={styles.infoLabel}>Email:</CustomText>
                <CustomText style={styles.infoValue}>{user?.email || 'No disponible'}</CustomText>
              </View>
              <View style={styles.infoRow}>
                <CustomText style={styles.infoLabel}>Nombre:</CustomText>
                <CustomText style={styles.infoValue}>{user?.name || 'No disponible'}</CustomText>
              </View>
              <View style={styles.infoRow}>
                <CustomText style={styles.infoLabel}>Rol:</CustomText>
                <CustomText style={styles.infoValue}>
                  {user?.role ? user.role.toUpperCase() : 'USER'}
                </CustomText>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.actionsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleNavigateToTodos}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainer}>
                <CustomText style={styles.actionIcon}>📝</CustomText>
              </View>
              <CustomText style={styles.actionTitle}>Mi TODO List</CustomText>
              <CustomText style={styles.actionDescription}>
                Gestiona tus tareas y pendientes
              </CustomText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleNavigateToMFASettings}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainer}>
                <CustomText style={styles.actionIcon}>🔐</CustomText>
              </View>
              <CustomText style={styles.actionTitle}>Seguridad MFA</CustomText>
              <CustomText style={styles.actionDescription}>
                Configura autenticación de dos factores
              </CustomText>
            </TouchableOpacity>
          </Animated.View>

          {/* Botón GDPR Settings */}
          <Animated.View
            style={[
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('GDPRSettings')}
              activeOpacity={0.7}
            >
              <View style={styles.actionIcon}>
                <CustomText style={styles.actionEmoji}>⚖️</CustomText>
              </View>
              <CustomText style={styles.actionTitle}>
                Protección de Datos (GDPR)
              </CustomText>
              <CustomText style={styles.actionDescription}>
                Gestiona tus derechos sobre datos personales
              </CustomText>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[
              styles.logoutContainer,
              {
                opacity: fadeAnim,
              }
            ]}
          >
            <CustomButton
              title="Cerrar Sesión"
              onPress={handleLogout}
              variant="secondary"
              style={styles.logoutButton}
            />
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  cardContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  actionsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  actionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionIconContainer: {
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 40,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  actionDescription: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  logoutContainer: {
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
  },
});

export default DashboardScreen;
