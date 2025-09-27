import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Animated } from 'react-native';
import { CustomButton } from '../components';
import { useToast } from '../context/ToastContext';
import { GLOBAL_STYLES } from '../constants/styles';
import { COLORS } from '../constants/colors';

const DashboardScreen = ({ navigation }) => {
  const { showSuccess, showInfo, showWarning } = useToast();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animación de entrada de la pantalla
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

    // Mensaje de bienvenida
    setTimeout(() => {
      showSuccess('¡Bienvenido al Dashboard!', 3000);
    }, 500);
  }, []);

  const handleLogout = () => {
    showWarning('Cerrando sesión...', 2000);
    setTimeout(() => {
      navigation.navigate('Login');
    }, 1500);
  };

  const DashboardCard = ({ title, subtitle, onPress, delay = 0 }) => {
    const cardFade = useRef(new Animated.Value(0)).current;
    const cardSlide = useRef(new Animated.Value(30)).current;

    useEffect(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(cardFade, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(cardSlide, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 8,
          }),
        ]).start();
      }, delay);
    }, []);

    return (
      <Animated.View
        style={[
          GLOBAL_STYLES.card,
          { 
            marginHorizontal: 20,
            opacity: cardFade,
            transform: [{ translateY: cardSlide }],
          }
        ]}
      >
        <Text style={GLOBAL_STYLES.subtitle}>{title}</Text>
        <Text style={GLOBAL_STYLES.text}>{subtitle}</Text>
        {onPress && (
          <CustomButton
            title="Ver más"
            onPress={onPress}
            style={{ marginTop: 15, backgroundColor: COLORS.secondary }}
          />
        )}
      </Animated.View>
    );
  };

  return (
    <Animated.View 
      style={[
        GLOBAL_STYLES.container,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingVertical: 20 }}>
          <Text style={[GLOBAL_STYLES.title, { marginHorizontal: 20 }]}>
            Dashboard
          </Text>
          
          <DashboardCard
            title="Bienvenido"
            subtitle="Has iniciado sesión correctamente. Aquí podrás ver toda la información importante de tu aplicación."
            delay={100}
          />
          
          <DashboardCard
            title="Estadísticas"
            subtitle="Visualiza tus métricas y datos importantes en tiempo real."
            onPress={() => showInfo('Próximamente: Sección de estadísticas')}
            delay={200}
          />
          
          <DashboardCard
            title="Configuración"
            subtitle="Personaliza tu experiencia y ajusta las preferencias de la aplicación."
            onPress={() => showInfo('Próximamente: Sección de configuración')}
            delay={300}
          />
          
          <DashboardCard
            title="Notificaciones"
            subtitle="Mantente al día con las últimas actualizaciones y mensajes importantes."
            onPress={() => showInfo('Próximamente: Centro de notificaciones')}
            delay={400}
          />
        </View>
      </ScrollView>
      
      <Animated.View 
        style={[
          { 
            padding: 20, 
            backgroundColor: COLORS.white,
            opacity: fadeAnim,
          }
        ]}
      >
        <CustomButton
          title="Cerrar Sesión"
          onPress={handleLogout}
          style={{ backgroundColor: COLORS.error }}
        />
      </Animated.View>
    </Animated.View>
  );
};

export default DashboardScreen;