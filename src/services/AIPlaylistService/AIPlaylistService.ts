import { GeneratePlaylistDTO, GeneratedPlaylist } from '@/models/ai';

export interface AIPlaylistService {
  /**
   * Generate a playlist using AI based on seed tracks
   * AI generates suggestions, then validates them against Spotify
   * @param data - Seed tracks and optional limit
   * @returns Generated playlist with validated tracks
   */
  generatePlaylist(data: GeneratePlaylistDTO): Promise<GeneratedPlaylist>;
}
