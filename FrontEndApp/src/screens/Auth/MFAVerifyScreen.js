import React, {useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert} from 'react-native';
import {AuthService} from '../../services/AuthService';

export default function MFAVerifyScreen({route, navigation}) {
  const {mode} = route.params || {}; // mode: 'enroll' o 'signin'
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const onVerify = async () => {
    setLoading(true);
    try {
      await AuthService.verifyMFACode(code, mode);
      // Si venimos de enroll, volver al login o a main
      if (mode === 'enroll') {
        Alert.alert('MFA registrado', 'El segundo factor se registró correctamente.');
        navigation.replace('Login');
      } else {
        // Obtener token y navegar
        const token = await (await AuthService.getCurrentUser()).getIdToken();
        await AuthService.storeAuthToken(token);
        navigation.replace('Main');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message || 'Error verificando código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mode === 'enroll' ? 'Registrar segundo factor' : 'Verificación MFA'}</Text>
      <Text style={styles.info}>Introduce el código que recibiste vía SMS o correo</Text>
      <TextInput placeholder="Código" value={code} onChangeText={setCode} style={styles.input} keyboardType="number-pad" />
      <Button title={loading ? 'Verificando...' : 'Verificar'} onPress={onVerify} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, justifyContent: 'center'},
  title: {fontSize: 20, marginBottom: 8, textAlign: 'center'},
  info: {fontSize: 14, marginBottom: 12, textAlign: 'center'},
  input: {borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12, borderRadius: 4},
});
