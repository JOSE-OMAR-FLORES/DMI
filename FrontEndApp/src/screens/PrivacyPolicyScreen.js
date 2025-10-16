/**
 * 📜 PrivacyPolicyScreen
 * 
 * Pantalla de Política de Privacidad completa
 * Cumple con requisitos de transparencia GDPR y CCPA/CPRA
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import ConsentManagementService from '../services/ConsentManagementService';
import AuthStorage from '../utils/AuthStorage';

export default function PrivacyPolicyScreen({ navigation, route }) {
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const requireAcceptance = route.params?.requireAcceptance || false;

  useEffect(() => {
    checkAcceptance();
  }, []);

  const checkAcceptance = async () => {
    try {
      const user = await AuthStorage.getUser();
      if (user && user.id) {
        const hasAccepted = await ConsentManagementService.hasAcceptedPrivacyPolicy(user.id);
        setAccepted(hasAccepted);
      }
    } catch (error) {
      console.error('Error verificando aceptación:', error);
    }
  };

  const handleAcceptPolicy = async () => {
    try {
      setLoading(true);

      const user = await AuthStorage.getUser();
      if (!user || !user.id) {
        Alert.alert('Error', 'Usuario no autenticado');
        return;
      }

      await ConsentManagementService.acceptPrivacyPolicy(user.id);

      Alert.alert(
        '✅ Política Aceptada',
        'Has aceptado nuestra Política de Privacidad.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (route.params?.onAccept) {
                route.params.onAccept();
              }
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error aceptando política:', error);
      Alert.alert('Error', 'No se pudo registrar la aceptación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📜 Política de Privacidad</Text>
          <Text style={styles.lastUpdated}>Última actualización: 15 de octubre de 2025</Text>
          <Text style={styles.version}>Versión 2.0</Text>
        </View>

        {/* Contenido */}
        <View style={styles.content}>
          {/* Sección 1: Introducción */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Introducción</Text>
            <Text style={styles.paragraph}>
              Bienvenido a nuestra aplicación. Valoramos tu privacidad y nos comprometemos a proteger tus datos personales. 
              Esta Política de Privacidad explica cómo recopilamos, usamos, compartimos y protegemos tu información.
            </Text>
            <Text style={styles.paragraph}>
              Cumplimos con el Reglamento General de Protección de Datos (GDPR), la Ley de Privacidad del Consumidor de California (CCPA) 
              y la Ley de Derechos de Privacidad de California (CPRA).
            </Text>
          </View>

          {/* Sección 2: Responsable del Tratamiento */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Responsable del Tratamiento</Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Nombre:</Text> Tu Aplicación S.A.{'\n'}
              <Text style={styles.bold}>Dirección:</Text> Calle Principal 123, Ciudad{'\n'}
              <Text style={styles.bold}>Email:</Text> privacy@tuapp.com{'\n'}
              <Text style={styles.bold}>DPO:</Text> dpo@tuapp.com (Delegado de Protección de Datos)
            </Text>
          </View>

          {/* Sección 3: Información que Recopilamos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Información que Recopilamos</Text>
            
            <Text style={styles.subsectionTitle}>3.1 Información Personal</Text>
            <Text style={styles.paragraph}>
              • <Text style={styles.bold}>Identificadores:</Text> Nombre, email, ID de usuario{'\n'}
              • <Text style={styles.bold}>Credenciales:</Text> Contraseña cifrada, tokens de autenticación{'\n'}
              • <Text style={styles.bold}>MFA:</Text> Códigos de verificación (temporales)
            </Text>

            <Text style={styles.subsectionTitle}>3.2 Información de Uso</Text>
            <Text style={styles.paragraph}>
              • Actividad en la aplicación{'\n'}
              • Preferencias del usuario{'\n'}
              • Registro de tareas (TODOs)
            </Text>

            <Text style={styles.subsectionTitle}>3.3 Información Técnica</Text>
            <Text style={styles.paragraph}>
              • Tipo de dispositivo y sistema operativo{'\n'}
              • Dirección IP{'\n'}
              • Información de la sesión
            </Text>
          </View>

          {/* Sección 4: Cómo Usamos tu Información */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Cómo Usamos tu Información</Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Base Legal (GDPR Art. 6):</Text>{'\n\n'}
              
              • <Text style={styles.bold}>Consentimiento (Art. 6.1.a):</Text> Marketing, personalización{'\n'}
              • <Text style={styles.bold}>Contrato (Art. 6.1.b):</Text> Proveer servicios de la app{'\n'}
              • <Text style={styles.bold}>Obligación Legal (Art. 6.1.c):</Text> Cumplimiento normativo{'\n'}
              • <Text style={styles.bold}>Intereses Legítimos (Art. 6.1.f):</Text> Seguridad, prevención de fraude
            </Text>
          </View>

          {/* Sección 5: Compartir Información */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Compartir Información</Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>NO VENDEMOS TU INFORMACIÓN PERSONAL</Text>
            </Text>
            <Text style={styles.paragraph}>
              Podemos compartir información con:{'\n\n'}
              • <Text style={styles.bold}>Proveedores de Servicios:</Text> Hosting, email (bajo acuerdos de confidencialidad){'\n'}
              • <Text style={styles.bold}>Autoridades:</Text> Cuando sea requerido por ley
            </Text>
          </View>

          {/* Sección 6: Seguridad */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Medidas de Seguridad</Text>
            <Text style={styles.paragraph}>
              Implementamos medidas técnicas y organizativas robustas:{'\n\n'}
              • <Text style={styles.bold}>Cifrado:</Text> AES-256 para datos en reposo, TLS 1.3 en tránsito{'\n'}
              • <Text style={styles.bold}>Autenticación:</Text> MFA obligatorio{'\n'}
              • <Text style={styles.bold}>Control de Acceso:</Text> RBAC (Role-Based Access Control){'\n'}
              • <Text style={styles.bold}>Certificate Pinning:</Text> Protección contra MITM{'\n'}
              • <Text style={styles.bold}>Gestión de Secretos:</Text> Sin claves hardcodeadas
            </Text>
          </View>

          {/* Sección 7: Retención de Datos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Retención de Datos</Text>
            <Text style={styles.paragraph}>
              Conservamos tus datos personales durante:{'\n\n'}
              • <Text style={styles.bold}>Cuenta activa:</Text> Mientras uses la aplicación{'\n'}
              • <Text style={styles.bold}>Cuenta inactiva:</Text> 365 días, luego eliminación automática{'\n'}
              • <Text style={styles.bold}>Registros de auditoría:</Text> Según requerimientos legales (máximo 6 años)
            </Text>
          </View>

          {/* Sección 8: Tus Derechos GDPR */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Tus Derechos (GDPR)</Text>
            <Text style={styles.paragraph}>
              Tienes derecho a:{'\n\n'}
              • <Text style={styles.bold}>Acceso (Art. 15):</Text> Solicitar copia de tus datos{'\n'}
              • <Text style={styles.bold}>Rectificación (Art. 16):</Text> Corregir datos inexactos{'\n'}
              • <Text style={styles.bold}>Supresión (Art. 17):</Text> "Derecho al olvido"{'\n'}
              • <Text style={styles.bold}>Restricción (Art. 18):</Text> Limitar el procesamiento{'\n'}
              • <Text style={styles.bold}>Portabilidad (Art. 20):</Text> Recibir datos en formato estructurado{'\n'}
              • <Text style={styles.bold}>Oposición (Art. 21):</Text> Oponerte al procesamiento{'\n'}
              • <Text style={styles.bold}>Revocar Consentimiento:</Text> En cualquier momento
            </Text>
            <Text style={styles.paragraph}>
              Para ejercer tus derechos, contacta: <Text style={styles.link}>privacy@tuapp.com</Text>
            </Text>
          </View>

          {/* Sección 9: Derechos CCPA/CPRA */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Tus Derechos (CCPA/CPRA)</Text>
            <Text style={styles.paragraph}>
              Si resides en California, tienes derecho a:{'\n\n'}
              • <Text style={styles.bold}>Saber:</Text> Qué información personal recopilamos{'\n'}
              • <Text style={styles.bold}>Eliminar:</Text> Solicitar eliminación de tu información{'\n'}
              • <Text style={styles.bold}>Optar por no vender:</Text> No vendemos, pero puedes ejercer este derecho{'\n'}
              • <Text style={styles.bold}>Corrección:</Text> Corregir información inexacta (CPRA){'\n'}
              • <Text style={styles.bold}>Limitar uso:</Text> De información sensible (CPRA)
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>No discriminación:</Text> No te discriminaremos por ejercer tus derechos.
            </Text>
            <Text style={styles.paragraph}>
              Enlace "Do Not Sell": <Text style={styles.link}>app://privacy/do-not-sell</Text>
            </Text>
          </View>

          {/* Sección 10: Transferencias Internacionales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Transferencias Internacionales</Text>
            <Text style={styles.paragraph}>
              Tus datos pueden ser transferidos a servidores fuera de tu país. Garantizamos protección adecuada mediante:{'\n\n'}
              • Cláusulas contractuales estándar de la UE{'\n'}
              • Certificaciones de privacidad reconocidas{'\n'}
              • Cifrado de extremo a extremo
            </Text>
          </View>

          {/* Sección 11: Cookies */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Cookies y Tecnologías Similares</Text>
            <Text style={styles.paragraph}>
              Usamos almacenamiento local para:{'\n\n'}
              • Mantener tu sesión activa{'\n'}
              • Recordar preferencias{'\n'}
              • Mejorar rendimiento de la app
            </Text>
            <Text style={styles.paragraph}>
              Puedes gestionar estas preferencias en la configuración de la app.
            </Text>
          </View>

          {/* Sección 12: Menores */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Privacidad de Menores</Text>
            <Text style={styles.paragraph}>
              Nuestra aplicación no está dirigida a menores de 16 años. No recopilamos conscientemente información de menores. 
              Si descubrimos que hemos recopilado datos de un menor, los eliminaremos inmediatamente.
            </Text>
          </View>

          {/* Sección 13: Cambios */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>13. Cambios a esta Política</Text>
            <Text style={styles.paragraph}>
              Podemos actualizar esta política periódicamente. Te notificaremos cambios significativos mediante:{'\n\n'}
              • Notificación en la app{'\n'}
              • Email a tu dirección registrada{'\n'}
              • Solicitud de nuevo consentimiento si es necesario
            </Text>
          </View>

          {/* Sección 14: Contacto */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>14. Contacto</Text>
            <Text style={styles.paragraph}>
              Para cualquier pregunta sobre esta política o tus derechos:{'\n\n'}
              <Text style={styles.bold}>Email:</Text> privacy@tuapp.com{'\n'}
              <Text style={styles.bold}>DPO:</Text> dpo@tuapp.com{'\n'}
              <Text style={styles.bold}>Autoridad de Control:</Text> Puedes presentar una queja ante tu autoridad de protección de datos local
            </Text>
          </View>

          {/* Footer Legal */}
          <View style={styles.legalFooter}>
            <Text style={styles.legalFooterText}>
              Esta política cumple con:{'\n'}
              • GDPR (EU) 2016/679{'\n'}
              • CCPA (Cal. Civ. Code §1798.100){'\n'}
              • CPRA (Prop 24, 2020)
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Botón de Aceptar (si es requerido) */}
      {requireAcceptance && !accepted && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={handleAcceptPolicy}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.acceptButtonText}>Acepto la Política de Privacidad</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {accepted && (
        <View style={styles.acceptedBadge}>
          <Text style={styles.acceptedText}>✅ Ya has aceptado esta política</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  version: {
    fontSize: 12,
    color: '#E3F2FD',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '600',
    color: '#333',
  },
  link: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  legalFooter: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  legalFooterText: {
    fontSize: 12,
    color: '#1976D2',
    lineHeight: 18,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptedBadge: {
    backgroundColor: '#4CAF50',
    padding: 12,
    alignItems: 'center',
  },
  acceptedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
