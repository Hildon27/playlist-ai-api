import { SpotifyServiceImpl } from '../SpotifyServiceImpl';
import * as spotifyLib from '../../../lib/spotify';
import {
  SpotifySearchResponse,
  SpotifyTrack,
  SpotifyRecommendationsResponse,
} from '../../../models/spotify';

// Mock dependencies
jest.mock('../../../lib/spotify');
jest.mock('../../../lib/logger', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

describe('SpotifyService', () => {
  let spotifyService: SpotifyServiceImpl;

  const mockSpotifyTrack: SpotifyTrack = {
    id: 'spotify-id-123',
    name: 'Bohemian Rhapsody',
    uri: 'spotify:track:123',
    duration_ms: 354000,
    explicit: false,
    preview_url: 'https://preview.spotify.com/track/123',
    external_urls: {
      spotify: 'https://open.spotify.com/track/123',
    },
    album: {
      id: 'album-123',
      name: 'A Night at the Opera',
      images: [
        { url: 'https://cover.jpg', height: 640, width: 640 },
        { url: 'https://cover-small.jpg', height: 300, width: 300 },
      ],
      release_date: '1975-11-21',
    },
    artists: [
      {
        id: 'artist-123',
        name: 'Queen',
        external_urls: { spotify: 'https://open.spotify.com/artist/123' },
      },
    ],
  };

  const mockSpotifyTrack2: SpotifyTrack = {
    id: 'spotify-id-456',
    name: 'We Will Rock You',
    uri: 'spotify:track:456',
    duration_ms: 122000,
    explicit: false,
    preview_url: null,
    external_urls: {
      spotify: 'https://open.spotify.com/track/456',
    },
    album: {
      id: 'album-456',
      name: 'News of the World',
      images: [],
      release_date: '1977-10-28',
    },
    artists: [
      {
        id: 'artist-123',
        name: 'Queen',
        external_urls: { spotify: 'https://open.spotify.com/artist/123' },
      },
      {
        id: 'artist-456',
        name: 'Brian May',
        external_urls: { spotify: 'https://open.spotify.com/artist/456' },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    spotifyService = new SpotifyServiceImpl();
  });

  describe('searchTracks', () => {
    // SPOTIFY-SEARCH-01: Busca com resultados
    it('should return tracks when search has results', async () => {
      const mockResponse: SpotifySearchResponse = {
        tracks: {
          href: 'https://api.spotify.com/v1/search',
          items: [mockSpotifyTrack, mockSpotifyTrack2],
          limit: 5,
          next: null,
          offset: 0,
          previous: null,
          total: 2,
        },
      };

      (spotifyLib.spotifyFetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await spotifyService.searchTracks({
        query: 'Bohemian Rhapsody',
        limit: 5,
      });

      expect(result).toHaveLength(2);
      expect(result[0]!.spotifyId).toBe('spotify-id-123');
      expect(result[0]!.name).toBe('Bohemian Rhapsody');
      expect(result[0]!.artists).toEqual(['Queen']);
      expect(result[1]!.artists).toEqual(['Queen', 'Brian May']);
    });

    // SPOTIFY-SEARCH-02: Busca sem resultados
    it('should return empty array when no results found', async () => {
      const mockResponse: SpotifySearchResponse = {
        tracks: {
          href: 'https://api.spotify.com/v1/search',
          items: [],
          limit: 10,
          next: null,
          offset: 0,
          previous: null,
          total: 0,
        },
      };

      (spotifyLib.spotifyFetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await spotifyService.searchTracks({
        query: 'xyzabc123nonexistent',
      });

      expect(result).toEqual([]);
    });

    // SPOTIFY-SEARCH-03: Limite padrão aplicado
    it('should use default limit of 10 when not specified', async () => {
      const mockResponse: SpotifySearchResponse = {
        tracks: {
          href: '',
          items: [],
          limit: 10,
          next: null,
          offset: 0,
          previous: null,
          total: 0,
        },
      };

      (spotifyLib.spotifyFetch as jest.Mock).mockResolvedValue(mockResponse);

      await spotifyService.searchTracks({ query: 'Queen' });

      expect(spotifyLib.spotifyFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10')
      );
    });

    // SPOTIFY-SEARCH-04: Limite customizado
    it('should use custom limit when specified', async () => {
      const mockResponse: SpotifySearchResponse = {
        tracks: {
          href: '',
          items: [mockSpotifyTrack, mockSpotifyTrack2, mockSpotifyTrack],
          limit: 3,
          next: null,
          offset: 0,
          previous: null,
          total: 3,
        },
      };

      (spotifyLib.spotifyFetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await spotifyService.searchTracks({
        query: 'Queen',
        limit: 3,
      });

      expect(spotifyLib.spotifyFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=3')
      );
      expect(result).toHaveLength(3);
    });

    // Additional test: Correct URL format
    it('should call Spotify API with correct URL format', async () => {
      const mockResponse: SpotifySearchResponse = {
        tracks: {
          href: '',
          items: [],
          limit: 10,
          next: null,
          offset: 0,
          previous: null,
          total: 0,
        },
      };

      (spotifyLib.spotifyFetch as jest.Mock).mockResolvedValue(mockResponse);

      await spotifyService.searchTracks({ query: 'test query', limit: 5 });

      expect(spotifyLib.spotifyFetch).toHaveBeenCalledWith(
        expect.stringContaining('/search?')
      );
      expect(spotifyLib.spotifyFetch).toHaveBeenCalledWith(
        expect.stringContaining('type=track')
      );
    });
  });

  describe('getTrack', () => {
    // SPOTIFY-GET-01: Track existente
    it('should return track when it exists', async () => {
      (spotifyLib.spotifyFetch as jest.Mock).mockResolvedValue(
        mockSpotifyTrack
      );

      const result = await spotifyService.getTrack('spotify-id-123');

      expect(result).not.toBeNull();
      expect(result!.spotifyId).toBe('spotify-id-123');
      expect(result!.name).toBe('Bohemian Rhapsody');
      expect(result!.album).toBe('A Night at the Opera');
      expect(result!.albumCover).toBe('https://cover.jpg');
      expect(spotifyLib.spotifyFetch).toHaveBeenCalledWith(
        '/tracks/spotify-id-123'
      );
    });

    // SPOTIFY-GET-02: Track inexistente
    it('should return null when track does not exist', async () => {
      (spotifyLib.spotifyFetch as jest.Mock).mockRejectedValue(
        new Error('Not Found')
      );

      const result = await spotifyService.getTrack('invalid-id');

      expect(result).toBeNull();
    });

    // SPOTIFY-GET-03: ID vazio
    it('should return null for empty ID', async () => {
      (spotifyLib.spotifyFetch as jest.Mock).mockRejectedValue(
        new Error('Bad Request')
      );

      const result = await spotifyService.getTrack('');

      expect(result).toBeNull();
    });

    // Additional test: Album cover null when no images
    it('should return null album cover when track has no images', async () => {
      const trackWithoutImages: SpotifyTrack = {
        ...mockSpotifyTrack,
        album: {
          ...mockSpotifyTrack.album,
          images: [],
        },
      };

      (spotifyLib.spotifyFetch as jest.Mock).mockResolvedValue(
        trackWithoutImages
      );

      const result = await spotifyService.getTrack('track-id');

      expect(result!.albumCover).toBeNull();
    });
  });

  describe('validateTracks', () => {
    // SPOTIFY-VAL-01: Todas tracks válidas
    it('should return all tracks as valid when they exist', async () => {
      const mockResponse = {
        tracks: [mockSpotifyTrack, mockSpotifyTrack2],
      };

      (spotifyLib.spotifyFetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await spotifyService.validateTracks({
        trackIds: ['spotify-id-123', 'spotify-id-456'],
      });

      expect(result.valid).toHaveLength(2);
      expect(result.invalidIds).toHaveLength(0);
    });

    // SPOTIFY-VAL-02: Algumas tracks inválidas
    it('should separate valid and invalid tracks', async () => {
      const mockResponse = {
        tracks: [mockSpotifyTrack, null],
      };

      (spotifyLib.spotifyFetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await spotifyService.validateTracks({
        trackIds: ['spotify-id-123', 'invalid-id'],
      });

      expect(result.valid).toHaveLength(1);
      expect(result.valid[0]!.spotifyId).toBe('spotify-id-123');
      expect(result.invalidIds).toEqual(['invalid-id']);
    });

    // SPOTIFY-VAL-03: Todas tracks inválidas
    it('should return all as invalid when none exist', async () => {
      const mockResponse = {
        tracks: [null, null],
      };

      (spotifyLib.spotifyFetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await spotifyService.validateTracks({
        trackIds: ['invalid1', 'invalid2'],
      });

      expect(result.valid).toHaveLength(0);
      expect(result.invalidIds).toEqual(['invalid1', 'invalid2']);
    });

    // SPOTIFY-VAL-04: Limite de 50 tracks
    it('should only validate first 50 tracks', async () => {
      const fiftyOneIds = Array.from({ length: 51 }, (_, i) => `id-${i}`);
      const fiftyTracks = Array.from({ length: 50 }, () => mockSpotifyTrack);
      const mockResponse = { tracks: fiftyTracks };

      (spotifyLib.spotifyFetch as jest.Mock).mockResolvedValue(mockResponse);

      await spotifyService.validateTracks({ trackIds: fiftyOneIds });

      // Should only join first 50 IDs
      expect(spotifyLib.spotifyFetch).toHaveBeenCalledWith(
        expect.stringContaining('ids=')
      );
      const callArg = (spotifyLib.spotifyFetch as jest.Mock).mock.calls[0][0];
      const idsInCall = callArg.split('ids=')[1].split(',');
      expect(idsInCall).toHaveLength(50);
    });
  });

  describe('getRecommendations', () => {
    // SPOTIFY-REC-01: Recomendações com seeds válidos
    it('should return recommendations for valid seeds', async () => {
      const mockResponse: SpotifyRecommendationsResponse = {
        tracks: [mockSpotifyTrack, mockSpotifyTrack2],
        seeds: [{ id: 'seed1', type: 'track', href: '' }],
      };

      (spotifyLib.spotifyFetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await spotifyService.getRecommendations({
        seedTrackIds: ['id1', 'id2'],
        limit: 10,
      });

      expect(result).toHaveLength(2);
      expect(result[0]!.spotifyId).toBe('spotify-id-123');
    });

    // SPOTIFY-REC-02: Limite de 5 seeds
    it('should limit seeds to 5', async () => {
      const mockResponse: SpotifyRecommendationsResponse = {
        tracks: [],
        seeds: [],
      };

      (spotifyLib.spotifyFetch as jest.Mock).mockResolvedValue(mockResponse);

      await spotifyService.getRecommendations({
        seedTrackIds: ['id1', 'id2', 'id3', 'id4', 'id5', 'id6', 'id7'],
      });

      const callArg = (spotifyLib.spotifyFetch as jest.Mock).mock.calls[0][0];
      const seedTracks = callArg.match(/seed_tracks=([^&]*)/)?.[1];
      // URLSearchParams encodes commas as %2C
      const decodedSeeds = decodeURIComponent(seedTracks ?? '');
      const seedCount = decodedSeeds.split(',').length;
      expect(seedCount).toBe(5);
    });

    // SPOTIFY-REC-03: Limite padrão de resultados
    it('should use default limit of 20 when not specified', async () => {
      const mockResponse: SpotifyRecommendationsResponse = {
        tracks: [],
        seeds: [],
      };

      (spotifyLib.spotifyFetch as jest.Mock).mockResolvedValue(mockResponse);

      await spotifyService.getRecommendations({
        seedTrackIds: ['id1'],
      });

      expect(spotifyLib.spotifyFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=20')
      );
    });

    // SPOTIFY-REC-04: Limite customizado
    it('should use custom limit when specified', async () => {
      const mockResponse: SpotifyRecommendationsResponse = {
        tracks: [mockSpotifyTrack],
        seeds: [],
      };

      (spotifyLib.spotifyFetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await spotifyService.getRecommendations({
        seedTrackIds: ['id1'],
        limit: 5,
      });

      expect(spotifyLib.spotifyFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=5')
      );
      expect(result.length).toBeLessThanOrEqual(5);
    });

    // Additional test: Correct URL format
    it('should call recommendations endpoint with correct format', async () => {
      const mockResponse: SpotifyRecommendationsResponse = {
        tracks: [],
        seeds: [],
      };

      (spotifyLib.spotifyFetch as jest.Mock).mockResolvedValue(mockResponse);

      await spotifyService.getRecommendations({
        seedTrackIds: ['track1', 'track2'],
        limit: 10,
      });

      expect(spotifyLib.spotifyFetch).toHaveBeenCalledWith(
        expect.stringContaining('/recommendations?')
      );
      // URLSearchParams encodes commas as %2C
      expect(spotifyLib.spotifyFetch).toHaveBeenCalledWith(
        expect.stringContaining('seed_tracks=track1%2Ctrack2')
      );
    });
  });
});
