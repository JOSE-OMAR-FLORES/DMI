import auth from '@react-native-firebase/auth';
import { Alert } from 'react-native';
import * as SecureStore from 'react-native-secure-store';

export class AuthService {
  static async signUp(email, password) {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      await this.enableMFA(userCredential.user);
      return userCredential;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  static async signIn(email, password) {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      
      // Verificar si MFA está habilitado
      const user = userCredential.user;
      if (user.multiFactor.enrolledFactors.length === 0) {
        await this.enableMFA(user);
      }
      
      return userCredential;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  static async enableMFA(user) {
    try {
      // Iniciar proceso MFA
      const multiFactorSession = await user.multiFactor.getSession();
      
      // Enviar código por SMS
      const phoneAuthProvider = auth.PhoneAuthProvider;
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneNumber,
        multiFactorSession
      );
      
      // Guardar verificationId de forma segura
      await SecureStore.setItemAsync('verificationId', verificationId);
      
      return true;
    } catch (error) {
      console.error('Error habilitando MFA:', error);
      throw error;
    }
  }

  static async verifyMFACode(code) {
    try {
      const verificationId = await SecureStore.getItemAsync('verificationId');
      const credential = auth.PhoneAuthProvider.credential(verificationId, code);
      
      const multiFactorAssertion = auth.PhoneMultiFactorGenerator.assertion(credential);
      await auth().currentUser.multiFactor.enroll(multiFactorAssertion, 'Phone Number');
      
      return true;
    } catch (error) {
      console.error('Error verificando MFA:', error);
      throw error;
    }
  }

  static async storeAuthToken(token) {
    try {
      await SecureStore.setItemAsync('authToken', token);
    } catch (error) {
      console.error('Error guardando token:', error);
      throw error;
    }
  }

  static async getAuthToken() {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Error obteniendo token:', error);
      throw error;
    }
  }

  static async signOut() {
    try {
      await auth().signOut();
      await SecureStore.deleteItemAsync('authToken');
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }
}