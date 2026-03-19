import {
  GetRecommendationsDTO,
  SearchTracksDTO,
  TrackDTO,
  ValidateTracksDTO,
} from '@/models/spotify';

export interface SpotifyService {
  /**
   * Search for tracks on Spotify
   * @param data - Search query and optional limit
   * @returns Array of tracks matching the query
   */
  searchTracks(data: SearchTracksDTO): Promise<TrackDTO[]>;

  /**
   * Get a single track by its Spotify ID
   * @param trackId - Spotify track ID
   * @returns Track details or null if not found
   */
  getTrack(trackId: string): Promise<TrackDTO | null>;

  /**
   * Validate if track IDs exist on Spotify
   * @param data - Array of track IDs to validate
   * @returns Object with valid and invalid track IDs
   */
  validateTracks(
    data: ValidateTracksDTO
  ): Promise<{ valid: TrackDTO[]; invalidIds: string[] }>;

  /**
   * Get recommendations based on seed tracks
   * Uses Spotify's recommendation engine
   * @param data - Seed track IDs and optional limit
   * @returns Array of recommended tracks
   */
  getRecommendations(data: GetRecommendationsDTO): Promise<TrackDTO[]>;
}
