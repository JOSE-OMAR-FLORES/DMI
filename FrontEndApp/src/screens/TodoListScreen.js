import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import CustomText from '../components/CustomText';
import { CustomButton } from '../components';
import { useToast } from '../context/ToastContext';
import { COLORS } from '../constants/colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TodoListScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const { showSuccess, showError } = useToast();
  const insets = useSafeAreaInsets();

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDescription, setNewTodoDescription] = useState('');

  // Cambia esta URL según tu configuración:
  // Android Emulator: http://10.0.2.2:8000/api
  // iOS Simulator: http://localhost:8000/api
  // Dispositivo físico con Expo Go: usa tu IP local
  const API_URL = 'http://192.168.1.73:8000/api';

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      // Usar la misma clave que AuthStorage: 'jwt_token'
      const token = await AsyncStorage.getItem('jwt_token');
      
      console.log('🔑 Token:', token ? 'Existe' : 'NO EXISTE');
      console.log('📡 Intentando conectar a:', `${API_URL}/todos`);
      
      if (!token) {
        showError('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
        navigation.replace('Login');
        return;
      }

      const response = await axios.get(`${API_URL}/todos`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 segundos timeout
      });

      console.log('✅ TODOs recibidos:', response.data);
      setTodos(response.data.data || response.data);
    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      if (error.code === 'ECONNABORTED') {
        showError('Timeout: No se pudo conectar al servidor. Verifica que el backend esté corriendo.');
      } else if (error.response?.status === 401) {
        showError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        navigation.replace('Login');
      } else if (!error.response) {
        showError('No se puede conectar al servidor. Verifica la URL de la API y que el backend esté corriendo.');
      } else {
        showError(error.response?.data?.message || 'Error al cargar las tareas');
      }
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async () => {
    if (!newTodoTitle.trim()) {
      showError('El título es requerido');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('jwt_token');

      await axios.post(
        `${API_URL}/todos`,
        {
          title: newTodoTitle,
          description: newTodoDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      showSuccess('Tarea creada exitosamente');
      setNewTodoTitle('');
      setNewTodoDescription('');
      fetchTodos();
    } catch (error) {
      console.error('Error creating todo:', error);
      showError(error.response?.data?.message || 'Error al crear la tarea');
    } finally {
      setLoading(false);
    }
  };

  const toggleTodoCompleted = async (todoId, currentStatus) => {
    try {
      const token = await AsyncStorage.getItem('jwt_token');

      await axios.patch(
        `${API_URL}/todos/${todoId}`,
        {
          completed: !currentStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      fetchTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
      showError(error.response?.data?.message || 'Error al actualizar la tarea');
    }
  };

  const deleteTodo = async (todoId) => {
    try {
      const token = await AsyncStorage.getItem('jwt_token');

      await axios.delete(`${API_URL}/todos/${todoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      showSuccess('Tarea eliminada');
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
      showError(error.response?.data?.message || 'Error al eliminar la tarea');
    }
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
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <CustomText style={styles.backButtonText}>← Volver</CustomText>
            </TouchableOpacity>
            <CustomText style={styles.title}>Mi TODO List</CustomText>
            <CustomText style={styles.userRole}>
              Rol: {user?.role ? user.role.toUpperCase() : 'USER'}
            </CustomText>
          </View>

          {/* Add New Todo Form */}
          <View style={styles.formCard}>
            <CustomText style={styles.formTitle}>Nueva Tarea</CustomText>
            <TextInput
              style={styles.input}
              placeholder="Título de la tarea"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={newTodoTitle}
              onChangeText={setNewTodoTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción (opcional)"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={newTodoDescription}
              onChangeText={setNewTodoDescription}
              multiline
              numberOfLines={3}
            />
            <CustomButton
              title="Agregar Tarea"
              onPress={createTodo}
              disabled={loading}
              style={styles.addButton}
            />
          </View>

          {/* Todo List */}
          <ScrollView
            style={styles.todoList}
            contentContainerStyle={[
              styles.todoListContent,
              { paddingBottom: insets.bottom + 20 }
            ]}
            showsVerticalScrollIndicator={false}
          >
            {loading && todos.length === 0 ? (
              <ActivityIndicator size="large" color={COLORS.white} />
            ) : todos.length === 0 ? (
              <View style={styles.emptyState}>
                <CustomText style={styles.emptyStateText}>
                  No hay tareas aún
                </CustomText>
                <CustomText style={styles.emptyStateSubtext}>
                  ¡Agrega tu primera tarea arriba!
                </CustomText>
              </View>
            ) : (
              todos.map((todo) => (
                <View key={todo.id} style={styles.todoCard}>
                  <TouchableOpacity
                    onPress={() => toggleTodoCompleted(todo.id, todo.completed)}
                    style={styles.todoCheckbox}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        todo.completed && styles.checkboxCompleted,
                      ]}
                    >
                      {todo.completed && (
                        <CustomText style={styles.checkmark}>✓</CustomText>
                      )}
                    </View>
                  </TouchableOpacity>

                  <View style={styles.todoContent}>
                    <CustomText
                      style={[
                        styles.todoTitle,
                        todo.completed && styles.todoTitleCompleted,
                      ]}
                    >
                      {todo.title}
                    </CustomText>
                    {todo.description && (
                      <CustomText style={styles.todoDescription}>
                        {todo.description}
                      </CustomText>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => deleteTodo(todo.id)}
                    style={styles.deleteButton}
                  >
                    <CustomText style={styles.deleteButtonText}>🗑️</CustomText>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        </View>
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
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    color: COLORS.white,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    marginTop: 8,
  },
  todoList: {
    flex: 1,
  },
  todoListContent: {
    gap: 12,
  },
  todoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  todoCheckbox: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  todoTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  todoDescription: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.7,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.7,
  },
});

export default TodoListScreen;
