import React, {useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert} from 'react-native';
import {AuthService} from '../../services/AuthService';

export default function LoginScreen({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setLoading(true);
    try {
      const userCred = await AuthService.signIn(email.trim(), password);
      // Si MFA requerido, navega a MFAVerify
      if (userCred.user.multiFactor && userCred.user.multiFactor.enrolledFactors.length > 0) {
        navigation.navigate('MFAVerify', {uid: userCred.user.uid, mode: 'signin'});
      } else {
        // Obtener token y navegar a la app
        const token = await userCred.user.getIdToken();
        await AuthService.storeAuthToken(token);
        navigation.replace('Main');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>
      <TextInput placeholder="Correo" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
      <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <Button title={loading ? 'Entrando...' : 'Entrar'} onPress={onLogin} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, justifyContent: 'center'},
  title: {fontSize: 24, marginBottom: 12, textAlign: 'center'},
  input: {borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12, borderRadius: 4},
});
