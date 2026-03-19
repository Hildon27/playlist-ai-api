import { createLogger } from '@/lib/logger';
import {
  generateMusicRecommendations,
  MusicSuggestion,
  MusicRecommendationResponse,
} from '@/lib/gemini';
import { GeneratePlaylistDTO, GeneratedPlaylist } from '@/models/ai';
import { TrackDTO } from '@/models/spotify';
import { SpotifyServiceImpl } from '@/services/SpotifyService/SpotifyServiceImpl';
import { AIPlaylistService } from './AIPlaylistService';

const aiLogger = createLogger('AIPlaylistService');

export class AIPlaylistServiceImpl implements AIPlaylistService {
  private readonly spotifyService = new SpotifyServiceImpl();

  /**
   * Generate a playlist using AI and validate tracks with Spotify
   */
  async generatePlaylist(
    data: GeneratePlaylistDTO
  ): Promise<GeneratedPlaylist> {
    const { seedTracks, limit = 20 } = data;

    aiLogger.info(
      { seedCount: seedTracks.length, limit },
      'Starting AI playlist generation'
    );

    // Step 1: Generate recommendations using Gemini AI
    const aiResponse: MusicRecommendationResponse =
      await generateMusicRecommendations(
        seedTracks.map(t => ({ name: t.name, artist: t.artist })),
        limit
      );

    const { message: aiMessage, suggestions: aiSuggestions } = aiResponse;

    aiLogger.info(
      { suggestionsCount: aiSuggestions.length },
      'AI suggestions received, validating with Spotify'
    );

    // Step 2: Search each suggestion on Spotify to validate
    const validatedTracks: TrackDTO[] = [];
    const invalidSuggestions: MusicSuggestion[] = [];

    for (const suggestion of aiSuggestions) {
      try {
        // Search for the track on Spotify
        const searchQuery = `${suggestion.name} ${suggestion.artist}`;
        const searchResults = await this.spotifyService.searchTracks({
          query: searchQuery,
          limit: 1,
        });

        const track = searchResults[0];
        if (track) {
          // Verify it's a reasonable match (avoid duplicates)
          const isDuplicate = validatedTracks.some(
            t => t.spotifyId === track.spotifyId
          );

          if (!isDuplicate) {
            validatedTracks.push(track);
            aiLogger.debug(
              { suggestion, spotifyId: track.spotifyId },
              'Track validated on Spotify'
            );
          }
        } else {
          invalidSuggestions.push(suggestion);
          aiLogger.debug({ suggestion }, 'Track not found on Spotify');
        }
      } catch (error) {
        invalidSuggestions.push(suggestion);
        aiLogger.warn({ suggestion, error }, 'Error validating track');
      }
    }

    aiLogger.info(
      {
        requested: aiSuggestions.length,
        found: validatedTracks.length,
        notFound: invalidSuggestions.length,
      },
      'Playlist generation completed'
    );

    return {
      message: aiMessage,
      seedTracks: seedTracks.map(t => ({ name: t.name, artist: t.artist })),
      generatedTracks: validatedTracks,
      invalidSuggestions,
      stats: {
        requested: aiSuggestions.length,
        found: validatedTracks.length,
        notFound: invalidSuggestions.length,
      },
    };
  }
}
