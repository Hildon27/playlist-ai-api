import { AIPlaylistServiceImpl } from '../AIPlaylistServiceImpl';
import { SpotifyServiceImpl } from '../../SpotifyService/SpotifyServiceImpl';
import * as gemini from '../../../lib/gemini';
import { TrackDTO } from '../../../models/spotify';

// Mock dependencies
jest.mock('../../SpotifyService/SpotifyServiceImpl');
jest.mock('../../../lib/gemini');
jest.mock('../../../lib/logger', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

describe('AIPlaylistService', () => {
  let aiPlaylistService: AIPlaylistServiceImpl;
  let mockSpotifyService: jest.Mocked<SpotifyServiceImpl>;

  const mockTrack: TrackDTO = {
    spotifyId: 'spotify-track-123',
    name: 'Test Song',
    artists: ['Test Artist'],
    album: 'Test Album',
    albumCover: 'https://example.com/cover.jpg',
    duration: 200000,
    previewUrl: 'https://example.com/preview.mp3',
    spotifyUrl: 'https://open.spotify.com/track/123',
  };

  const mockTrack2: TrackDTO = {
    spotifyId: 'spotify-track-456',
    name: 'Another Song',
    artists: ['Another Artist'],
    album: 'Another Album',
    albumCover: 'https://example.com/cover2.jpg',
    duration: 180000,
    previewUrl: 'https://example.com/preview2.mp3',
    spotifyUrl: 'https://open.spotify.com/track/456',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockSpotifyService = {
      searchTracks: jest.fn(),
      getTrack: jest.fn(),
      validateTracks: jest.fn(),
      getRecommendations: jest.fn(),
    } as unknown as jest.Mocked<SpotifyServiceImpl>;

    (SpotifyServiceImpl as jest.Mock).mockImplementation(
      () => mockSpotifyService
    );

    aiPlaylistService = new AIPlaylistServiceImpl();
  });

  describe('generatePlaylist', () => {
    // AI-GEN-01: Gerar playlist com tracks válidas
    it('should generate playlist with valid tracks', async () => {
      const mockAiResponse: gemini.MusicRecommendationResponse = {
        message: 'Here are your recommendations based on your taste!',
        suggestions: [
          { name: 'Test Song', artist: 'Test Artist' },
          { name: 'Another Song', artist: 'Another Artist' },
        ],
      };

      (gemini.generateMusicRecommendations as jest.Mock).mockResolvedValue(
        mockAiResponse
      );
      mockSpotifyService.searchTracks
        .mockResolvedValueOnce([mockTrack])
        .mockResolvedValueOnce([mockTrack2]);

      const result = await aiPlaylistService.generatePlaylist({
        seedTracks: [{ name: 'Seed Song', artist: 'Seed Artist' }],
        limit: 10,
      });

      expect(result.message).toBe(
        'Here are your recommendations based on your taste!'
      );
      expect(result.generatedTracks).toHaveLength(2);
      expect(result.generatedTracks[0]).toEqual(mockTrack);
      expect(result.generatedTracks[1]).toEqual(mockTrack2);
    });

    // AI-GEN-02: Todas sugestões válidas no Spotify
    it('should return all tracks when all suggestions are valid', async () => {
      const mockAiResponse: gemini.MusicRecommendationResponse = {
        message: 'Perfect matches!',
        suggestions: [
          { name: 'Song 1', artist: 'Artist 1' },
          { name: 'Song 2', artist: 'Artist 2' },
        ],
      };

      (gemini.generateMusicRecommendations as jest.Mock).mockResolvedValue(
        mockAiResponse
      );
      mockSpotifyService.searchTracks
        .mockResolvedValueOnce([mockTrack])
        .mockResolvedValueOnce([mockTrack2]);

      const result = await aiPlaylistService.generatePlaylist({
        seedTracks: [{ name: 'Seed', artist: 'Artist' }],
      });

      expect(result.stats.found).toBe(2);
      expect(result.stats.notFound).toBe(0);
      expect(result.invalidSuggestions).toHaveLength(0);
    });

    // AI-GEN-03: Algumas sugestões inválidas
    it('should handle some invalid suggestions', async () => {
      const mockAiResponse: gemini.MusicRecommendationResponse = {
        message: 'Some matches found!',
        suggestions: [
          { name: 'Valid Song', artist: 'Valid Artist' },
          { name: 'Invalid Song', artist: 'Unknown Artist' },
          { name: 'Another Valid', artist: 'Another Artist' },
        ],
      };

      (gemini.generateMusicRecommendations as jest.Mock).mockResolvedValue(
        mockAiResponse
      );
      mockSpotifyService.searchTracks
        .mockResolvedValueOnce([mockTrack])
        .mockResolvedValueOnce([]) // Not found
        .mockResolvedValueOnce([mockTrack2]);

      const result = await aiPlaylistService.generatePlaylist({
        seedTracks: [{ name: 'Seed', artist: 'Artist' }],
      });

      expect(result.stats.found).toBe(2);
      expect(result.stats.notFound).toBe(1);
      expect(result.invalidSuggestions).toHaveLength(1);
      expect(result.invalidSuggestions[0]).toEqual({
        name: 'Invalid Song',
        artist: 'Unknown Artist',
      });
    });

    // AI-GEN-04: Nenhuma sugestão válida
    it('should handle when no suggestions are valid', async () => {
      const mockAiResponse: gemini.MusicRecommendationResponse = {
        message: 'No matches found!',
        suggestions: [
          { name: 'Unknown 1', artist: 'Unknown 1' },
          { name: 'Unknown 2', artist: 'Unknown 2' },
        ],
      };

      (gemini.generateMusicRecommendations as jest.Mock).mockResolvedValue(
        mockAiResponse
      );
      mockSpotifyService.searchTracks.mockResolvedValue([]);

      const result = await aiPlaylistService.generatePlaylist({
        seedTracks: [{ name: 'Seed', artist: 'Artist' }],
      });

      expect(result.generatedTracks).toHaveLength(0);
      expect(result.stats.found).toBe(0);
      expect(result.stats.notFound).toBe(2);
      expect(result.invalidSuggestions).toHaveLength(2);
    });

    // AI-GEN-05: Limite de tracks respeitado
    it('should pass limit to AI generation', async () => {
      const mockAiResponse: gemini.MusicRecommendationResponse = {
        message: 'Limited results!',
        suggestions: [{ name: 'Song', artist: 'Artist' }],
      };

      (gemini.generateMusicRecommendations as jest.Mock).mockResolvedValue(
        mockAiResponse
      );
      mockSpotifyService.searchTracks.mockResolvedValue([mockTrack]);

      await aiPlaylistService.generatePlaylist({
        seedTracks: [{ name: 'Seed', artist: 'Artist' }],
        limit: 5,
      });

      expect(gemini.generateMusicRecommendations).toHaveBeenCalledWith(
        [{ name: 'Seed', artist: 'Artist' }],
        5
      );
    });

    // AI-GEN-06: Evita tracks duplicadas
    it('should avoid duplicate tracks', async () => {
      const mockAiResponse: gemini.MusicRecommendationResponse = {
        message: 'Results with duplicates!',
        suggestions: [
          { name: 'Same Song', artist: 'Same Artist' },
          { name: 'Same Song Again', artist: 'Same Artist' },
        ],
      };

      (gemini.generateMusicRecommendations as jest.Mock).mockResolvedValue(
        mockAiResponse
      );
      // Both searches return the same track (simulating duplicate)
      mockSpotifyService.searchTracks.mockResolvedValue([mockTrack]);

      const result = await aiPlaylistService.generatePlaylist({
        seedTracks: [{ name: 'Seed', artist: 'Artist' }],
      });

      // Should only have 1 track since both resolved to same spotifyId
      expect(result.generatedTracks).toHaveLength(1);
    });

    // AI-GEN-07: Mensagem da AI é retornada
    it('should return AI message', async () => {
      const aiMessage = 'Based on your love for rock music, here are my picks!';
      const mockAiResponse: gemini.MusicRecommendationResponse = {
        message: aiMessage,
        suggestions: [],
      };

      (gemini.generateMusicRecommendations as jest.Mock).mockResolvedValue(
        mockAiResponse
      );

      const result = await aiPlaylistService.generatePlaylist({
        seedTracks: [{ name: 'Seed', artist: 'Artist' }],
      });

      expect(result.message).toBe(aiMessage);
    });

    // AI-GEN-08: Erro na API Gemini
    it('should propagate Gemini API errors', async () => {
      const error = new Error('Gemini API Error');
      (gemini.generateMusicRecommendations as jest.Mock).mockRejectedValue(
        error
      );

      await expect(
        aiPlaylistService.generatePlaylist({
          seedTracks: [{ name: 'Seed', artist: 'Artist' }],
        })
      ).rejects.toThrow('Gemini API Error');
    });

    // AI-GEN-09: Erro parcial no Spotify
    it('should continue with valid tracks when some Spotify searches fail', async () => {
      const mockAiResponse: gemini.MusicRecommendationResponse = {
        message: 'Partial results!',
        suggestions: [
          { name: 'Good Song', artist: 'Good Artist' },
          { name: 'Error Song', artist: 'Error Artist' },
        ],
      };

      (gemini.generateMusicRecommendations as jest.Mock).mockResolvedValue(
        mockAiResponse
      );
      mockSpotifyService.searchTracks
        .mockResolvedValueOnce([mockTrack])
        .mockRejectedValueOnce(new Error('Spotify Error'));

      const result = await aiPlaylistService.generatePlaylist({
        seedTracks: [{ name: 'Seed', artist: 'Artist' }],
      });

      expect(result.generatedTracks).toHaveLength(1);
      expect(result.invalidSuggestions).toHaveLength(1);
      expect(result.stats.found).toBe(1);
      expect(result.stats.notFound).toBe(1);
    });

    // Default limit test
    it('should use default limit of 20 when not specified', async () => {
      const mockAiResponse: gemini.MusicRecommendationResponse = {
        message: 'Default limit!',
        suggestions: [],
      };

      (gemini.generateMusicRecommendations as jest.Mock).mockResolvedValue(
        mockAiResponse
      );

      await aiPlaylistService.generatePlaylist({
        seedTracks: [{ name: 'Seed', artist: 'Artist' }],
      });

      expect(gemini.generateMusicRecommendations).toHaveBeenCalledWith(
        [{ name: 'Seed', artist: 'Artist' }],
        20
      );
    });

    // Seed tracks mapping test
    it('should correctly map seed tracks in response', async () => {
      const mockAiResponse: gemini.MusicRecommendationResponse = {
        message: 'Seed test!',
        suggestions: [],
      };

      (gemini.generateMusicRecommendations as jest.Mock).mockResolvedValue(
        mockAiResponse
      );

      const seedTracks = [
        { name: 'Song 1', artist: 'Artist 1', spotifyId: 'id1' },
        { name: 'Song 2', artist: 'Artist 2' },
      ];

      const result = await aiPlaylistService.generatePlaylist({
        seedTracks,
      });

      expect(result.seedTracks).toEqual([
        { name: 'Song 1', artist: 'Artist 1' },
        { name: 'Song 2', artist: 'Artist 2' },
      ]);
    });
  });
});
