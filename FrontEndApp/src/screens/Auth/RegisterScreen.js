import React, {useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert} from 'react-native';
import {AuthService} from '../../services/AuthService';

export default function RegisterScreen({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    setLoading(true);
    try {
      const userCred = await AuthService.signUp(email.trim(), password);
      // Después del registro pedimos segundo factor (si aplica)
      // Guardamos el uid temporal y navegamos a la pantalla de verificación MFA
      navigation.navigate('MFAVerify', {uid: userCred.user.uid, mode: 'enroll'});
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <TextInput placeholder="Correo" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
      <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <Button title={loading ? 'Registrando...' : 'Registrar'} onPress={onRegister} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, justifyContent: 'center'},
  title: {fontSize: 24, marginBottom: 12, textAlign: 'center'},
  input: {borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12, borderRadius: 4},
});
