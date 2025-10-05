beforeAll(() => {
  // Solo mockea si no han sido mockeados aún
  if (!console.log._isMockFunction) {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  }
  if (!console.error._isMockFunction) {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  }
  if (!console.warn._isMockFunction) {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  }
  // Mock de AsyncStorage para pruebas (evita error de NativeModule null)
  try {
    jest.doMock('@react-native-async-storage/async-storage', () => ({
      __esModule: true,
      default: {
        getItem: jest.fn(() => Promise.resolve(null)),
        setItem: jest.fn(() => Promise.resolve()),
        removeItem: jest.fn(() => Promise.resolve()),
        clear: jest.fn(() => Promise.resolve()),
      }
    }));
  } catch (e) {
    // En algunos contextos jest.doMock puede lanzar, ignoramos
  }
  // Mock simple para expo-secure-store si fuera necesario
  try {
    jest.doMock('expo-secure-store', () => ({
      __esModule: true,
      default: {
        getItemAsync: jest.fn(() => Promise.resolve(null)),
        setItemAsync: jest.fn(() => Promise.resolve()),
        deleteItemAsync: jest.fn(() => Promise.resolve()),
      }
    }));
  } catch (e) {}
});

afterAll(() => {
  // Solo restaura si existe mockRestore
  if (console.log.mockRestore) console.log.mockRestore();
  if (console.error.mockRestore) console.error.mockRestore();
  if (console.warn.mockRestore) console.warn.mockRestore();
});
