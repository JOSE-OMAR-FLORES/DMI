import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { CustomButton, LoadingSpinner } from '../components';
import { useToast } from '../context/ToastContext';
import { COLORS } from '../constants/colors';
import { GLOBAL_STYLES } from '../constants/styles';
import mfaService from '../services/mfaService';

const MFAVerificationScreen = ({ route, navigation }) => {
  const { email, userId } = route.params;
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [showBackupInput, setShowBackupInput] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  
  const { showSuccess, showError, showWarning } = useToast();
  const inputRefs = useRef([]);

  // Countdown para reenviar código
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-focus en primer input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleCodeChange = (text, index) => {
    // Solo números
    const cleanText = text.replace(/[^0-9]/g, '');
    
    if (cleanText.length > 1) {
      // Si pega un código completo
      const digits = cleanText.slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (i < 6) newCode[i] = digit;
      });
      setCode(newCode);
      
      // Focus en el último input o verificar si está completo
      const lastIndex = Math.min(digits.length - 1, 5);
      if (inputRefs.current[lastIndex]) {
        inputRefs.current[lastIndex].focus();
      }
      
      // Auto-verificar si está completo
      if (digits.length === 6) {
        handleVerify(newCode.join(''));
      }
    } else {
      // Cambio de un solo dígito
      const newCode = [...code];
      newCode[index] = cleanText;
      setCode(newCode);

      // Auto-focus al siguiente input
      if (cleanText && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-verificar si está completo
      if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
        handleVerify(newCode.join(''));
      }
    }
  };

  const handleKeyPress = (e, index) => {
    // Retroceder al input anterior con backspace
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (codeToVerify = null) => {
    const finalCode = codeToVerify || code.join('');
    
    if (finalCode.length !== 6) {
      showError('Ingresa el código de 6 dígitos');
      return;
    }

    setIsVerifying(true);

    try {
      const result = await mfaService.verifyMFACode(userId, finalCode);

      if (result.success) {
        showSuccess('✅ Verificación exitosa');
        
        // Navegar al Dashboard después de 1 segundo
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Dashboard' }],
          });
        }, 1000);
      } else {
        if (result.blocked) {
          showError('❌ Cuenta bloqueada por seguridad. Usa un código de respaldo o contacta soporte.');
        } else if (result.attemptsRemaining !== undefined) {
          showError(`❌ ${result.error}. Intentos restantes: ${result.attemptsRemaining}`);
        } else {
          showError(result.error);
        }
        
        // Limpiar código
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      showError('Error de conexión. Verifica tu internet.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setIsResending(true);

    try {
      const result = await mfaService.resendCode(email);

      if (result.success) {
        showSuccess('📧 Nuevo código enviado a tu email');
        setCountdown(30);
        setCanResend(false);
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        showError(result.error);
      }
    } catch (error) {
      showError('Error al reenviar código');
    } finally {
      setIsResending(false);
    }
  };

  const handleUseBackupCode = () => {
    setShowBackupInput(!showBackupInput);
    setBackupCode('');
  };

  const handleVerifyBackupCode = async () => {
    if (backupCode.length !== 8) {
      showError('El código de respaldo debe tener 8 caracteres');
      return;
    }

    setIsVerifying(true);

    try {
      const result = await mfaService.verifyBackupCode(userId, backupCode);

      if (result.success) {
        showSuccess('✅ ' + result.message);
        
        if (result.codesRemaining === 0) {
          showWarning('⚠️ No te quedan códigos de respaldo. Genera nuevos desde configuración.');
        }
        
        // Navegar al Dashboard
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Dashboard' }],
          });
        }, 2000);
      } else {
        showError(result.error);
        setBackupCode('');
      }
    } catch (error) {
      showError('Error de conexión');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={GLOBAL_STYLES.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={GLOBAL_STYLES.centerContainer}>
        <View style={[GLOBAL_STYLES.card, styles.card]}>
          <Text style={GLOBAL_STYLES.title}>🔐 Verificación MFA</Text>
          <Text style={styles.subtitle}>
            Hemos enviado un código de 6 dígitos a tu email
          </Text>
          <Text style={styles.email}>{email}</Text>

          {!showBackupInput ? (
            <>
              {/* Inputs para código de 6 dígitos */}
              <View style={styles.codeContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[
                      styles.codeInput,
                      digit !== '' && styles.codeInputFilled
                    ]}
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    editable={!isVerifying}
                  />
                ))}
              </View>

              {/* Botón verificar */}
              <CustomButton
                title={isVerifying ? 'Verificando...' : 'Verificar Código'}
                onPress={() => handleVerify()}
                disabled={isVerifying || code.some(d => d === '')}
                style={{ marginTop: 20 }}
              />

              {/* Reenviar código */}
              <TouchableOpacity 
                onPress={handleResendCode}
                disabled={!canResend || isResending}
                style={styles.resendButton}
              >
                {isResending ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Text style={[
                    styles.resendText,
                    !canResend && styles.resendTextDisabled
                  ]}>
                    {canResend 
                      ? '📧 Reenviar código' 
                      : `Reenviar en ${countdown}s`
                    }
                  </Text>
                )}
              </TouchableOpacity>

              {/* Código de respaldo */}
              <TouchableOpacity 
                onPress={handleUseBackupCode}
                style={styles.backupButton}
              >
                <Text style={styles.backupButtonText}>
                  🔑 Usar código de respaldo
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Input para código de respaldo */}
              <Text style={styles.backupTitle}>Código de Respaldo</Text>
              <Text style={styles.backupSubtitle}>
                Ingresa uno de los códigos de 8 caracteres que guardaste al habilitar MFA
              </Text>
              
              <TextInput
                style={styles.backupInput}
                value={backupCode}
                onChangeText={(text) => setBackupCode(text.toUpperCase())}
                placeholder="Ej: A1B2C3D4"
                placeholderTextColor="#999"
                autoCapitalize="characters"
                maxLength={8}
                editable={!isVerifying}
              />

              <CustomButton
                title={isVerifying ? 'Verificando...' : 'Verificar Código de Respaldo'}
                onPress={handleVerifyBackupCode}
                disabled={isVerifying || backupCode.length !== 8}
                style={{ marginTop: 20 }}
              />

              <TouchableOpacity 
                onPress={handleUseBackupCode}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>
                  ← Volver a código por email
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Cancelar */}
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '90%',
    maxWidth: 400,
    padding: 30,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 30,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  codeInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  codeInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0f9ff',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
  },
  resendText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  resendTextDisabled: {
    color: '#999',
  },
  backupButton: {
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  backupButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  backupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  backupSubtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  backupInput: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
    backgroundColor: '#fff',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 14,
  },
});

// Importar TextInput que faltaba
import { TextInput } from 'react-native';

export default MFAVerificationScreen;
