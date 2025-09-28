// Función para validar email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Función para validar contraseña (mínimo 6 caracteres)
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Función para validar formulario de login (adaptada para email)
export const validateLoginForm = (emailOrUsername, password) => {
  const errors = {};
  
  if (!emailOrUsername || emailOrUsername.trim() === '') {
    errors.username = 'El email es requerido';
  } else if (emailOrUsername.includes('@') && !validateEmail(emailOrUsername)) {
    errors.username = 'El formato del email no es válido';
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