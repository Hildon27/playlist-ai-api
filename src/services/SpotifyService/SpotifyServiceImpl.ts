import { spotifyFetch } from '@/lib/spotify';
import { createLogger } from '@/lib/logger';
import {
  GetRecommendationsDTO,
  mapTrackToDTO,
  SearchTracksDTO,
  SpotifyRecommendationsResponse,
  SpotifySearchResponse,
  SpotifyTrack,
  TrackDTO,
  ValidateTracksDTO,
} from '@/models/spotify';
import { SpotifyService } from './SpotifyService';

const spotifyLogger = createLogger('SpotifyService');

export class SpotifyServiceImpl implements SpotifyService {
  /**
   * Search for tracks on Spotify
   */
  async searchTracks(data: SearchTracksDTO): Promise<TrackDTO[]> {
    const { query, limit = 10 } = data;

    spotifyLogger.info({ query, limit }, 'Searching tracks on Spotify');

    const params = new URLSearchParams({
      q: query,
      type: 'track',
      limit: limit.toString(),
    });

    const response = await spotifyFetch<SpotifySearchResponse>(
      `/search?${params.toString()}`
    );

    const tracks = response.tracks.items.map(mapTrackToDTO);

    spotifyLogger.info(
      { query, resultsCount: tracks.length },
      'Track search completed'
    );

    return tracks;
  }

  /**
   * Get a single track by ID
   */
  async getTrack(trackId: string): Promise<TrackDTO | null> {
    spotifyLogger.info({ trackId }, 'Fetching track from Spotify');

    try {
      const track = await spotifyFetch<SpotifyTrack>(`/tracks/${trackId}`);
      return mapTrackToDTO(track);
    } catch {
      spotifyLogger.warn({ trackId }, 'Track not found on Spotify');
      return null;
    }
  }

  /**
   * Validate multiple track IDs
   */
  async validateTracks(
    data: ValidateTracksDTO
  ): Promise<{ valid: TrackDTO[]; invalidIds: string[] }> {
    const { trackIds } = data;

    spotifyLogger.info(
      { trackCount: trackIds.length },
      'Validating tracks on Spotify'
    );

    // Spotify API allows up to 50 IDs per request
    const ids = trackIds.slice(0, 50).join(',');

    const response = await spotifyFetch<{ tracks: (SpotifyTrack | null)[] }>(
      `/tracks?ids=${ids}`
    );

    const valid: TrackDTO[] = [];
    const invalidIds: string[] = [];

    trackIds.forEach((id, index) => {
      const track = response.tracks[index];
      if (track) {
        valid.push(mapTrackToDTO(track));
      } else {
        invalidIds.push(id);
      }
    });

    spotifyLogger.info(
      { validCount: valid.length, invalidCount: invalidIds.length },
      'Track validation completed'
    );

    return { valid, invalidIds };
  }

  /**
   * Get recommendations based on seed tracks
   * Spotify allows up to 5 seed tracks
   */
  async getRecommendations(data: GetRecommendationsDTO): Promise<TrackDTO[]> {
    const { seedTrackIds, limit = 20 } = data;

    // Spotify limits to 5 seed tracks
    const seeds = seedTrackIds.slice(0, 5);

    spotifyLogger.info(
      { seedCount: seeds.length, limit },
      'Fetching recommendations from Spotify'
    );

    const params = new URLSearchParams({
      seed_tracks: seeds.join(','),
      limit: limit.toString(),
    });

    const response = await spotifyFetch<SpotifyRecommendationsResponse>(
      `/recommendations?${params.toString()}`
    );

    const tracks = response.tracks.map(mapTrackToDTO);

    spotifyLogger.info(
      { recommendationsCount: tracks.length },
      'Recommendations fetched successfully'
    );

    return tracks;
  }
}
