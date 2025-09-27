// Función para validar email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Función para validar contraseña (mínimo 6 caracteres)
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Función para validar formulario de login (sin validación estricta de email)
export const validateLoginForm = (username, password) => {
  const errors = {};
  
  if (!username || username.trim() === '') {
    errors.username = 'El nombre de usuario es requerido';
  }
  
  if (!password) {
    errors.password = 'La contraseña es requerida';
  } else if (!validatePassword(password)) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};