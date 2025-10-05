// src/utils/__tests__/FirebaseFavoritesService.test.js
import FirebaseFavoritesService from '../FirebaseFavoritesService';

// Mock de firebaseConfig
jest.mock('../firebaseConfig', () => ({
  db: {},
  COLLECTIONS: { USER_FAVORITES: 'user_favorites' },
  isFirebaseConfigured: jest.fn(() => true),
}));

// Mock de Firestore completo
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  Timestamp: {
    now: jest.fn(() => 1234567890),
  },
}));

describe('FirebaseFavoritesService', () => {
  const service = FirebaseFavoritesService;

  let logSpy;
  let errorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    // Opción 1: silenciar console.log y console.error solo durante los tests
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restaurar implementaciones originales
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  describe('addFavorite', () => {
    it('debe agregar un favorito correctamente', async () => {
      const { addDoc } = require('firebase/firestore');
      addDoc.mockResolvedValue({ id: 'abc123' });

      const favoriteData = { userId: 'user1', city: 'Paris' };
      const result = await service.addFavorite(favoriteData);

      expect(addDoc).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        favoriteId: 'abc123',
        message: 'Paris agregado a favoritos',
      });
    });

    it('debe fallar si userId no está presente', async () => {
      await expect(service.addFavorite({ city: 'Paris' }))
        .rejects
        .toThrow('Usuario no autenticado');
    });
  });

  describe('getFavorites', () => {
    it('debe retornar favoritos correctamente', async () => {
      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue({
        forEach: (cb) => cb({
          id: 'fav1',
          data: () => ({
            userId: 'user1',
            city: 'Paris',
            addedAt: { toMillis: () => 1000 },
            lastViewed: { toMillis: () => 2000 },
            weatherSnapshot: { lastUpdated: { toMillis: () => 3000 } },
            color: '#FF0000',
          }),
        }),
      });

      const favorites = await service.getFavorites('user1');
      expect(getDocs).toHaveBeenCalled();
      expect(favorites.length).toBe(1);
      expect(favorites[0]).toHaveProperty('favoriteId', 'fav1');
    });
  });

  describe('updateFavorite', () => {
    it('debe actualizar un favorito correctamente', async () => {
      const { updateDoc, doc } = require('firebase/firestore');
      updateDoc.mockResolvedValue(true);
      doc.mockReturnValue('docRef');

      const result = await service.updateFavorite('fav1', { nickname: 'Mi ciudad' });
      expect(updateDoc).toHaveBeenCalledWith('docRef', expect.objectContaining({ nickname: 'Mi ciudad' }));
      expect(result.success).toBe(true);
    });
  });

  describe('updateWeatherSnapshot', () => {
    it('debe actualizar weatherSnapshot correctamente', async () => {
      const { updateDoc, doc } = require('firebase/firestore');
      updateDoc.mockResolvedValue(true);
      doc.mockReturnValue('docRef');

      const result = await service.updateWeatherSnapshot('fav1', { temperature: 25, condition: 'Sunny' });
      expect(updateDoc).toHaveBeenCalledWith('docRef', expect.objectContaining({
        'weatherSnapshot.temp': 25,
        'weatherSnapshot.condition': 'Sunny',
      }));
      expect(result.success).toBe(true);
    });
  });

  describe('removeFavorite', () => {
    it('debe eliminar un favorito correctamente', async () => {
      const { deleteDoc, doc } = require('firebase/firestore');
      deleteDoc.mockResolvedValue(true);
      doc.mockReturnValue('docRef');

      const result = await service.removeFavorite('fav1');
      expect(deleteDoc).toHaveBeenCalledWith('docRef');
      expect(result.success).toBe(true);
    });
  });

  describe('incrementViewCount', () => {
    it('debe incrementar viewCount sin lanzar error', async () => {
      const { updateDoc, getDocs, doc } = require('firebase/firestore');
      getDocs.mockResolvedValue({ data: () => ({ viewCount: 5 }) });
      updateDoc.mockResolvedValue(true);
      doc.mockReturnValue('docRef');

      await expect(service.incrementViewCount('fav1')).resolves.not.toThrow();
      expect(updateDoc).toHaveBeenCalled();
    });
  });
});
