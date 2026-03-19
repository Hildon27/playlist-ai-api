import { NextFunction, Request, Response } from 'express';
import { AIPlaylistServiceImpl } from '@/services/AIPlaylistService/AIPlaylistServiceImpl';
import { UserPlaylistServiceImpl } from '@/services/UserPlaylistService/UserPlaylistServiceImpl';
import { UserPlaylistRepository } from '@/repositories/UserPlaylistRepository';
import { createLogger } from '@/lib/logger';
import { AuthContext } from 'contexts/auth-context';
import { Privacity } from '@/models/Enums';
import { z } from 'zod';

const aiController = createLogger('AIController');
const aiPlaylistService = new AIPlaylistServiceImpl();
const userPlaylistService = new UserPlaylistServiceImpl(
  new UserPlaylistRepository()
);

// Validation schema
const generatePlaylistSchema = z.object({
  name: z.string().min(1, 'Playlist name is required').max(100),
  seedTracks: z
    .array(
      z.object({
        name: z.string().min(1, 'Track name is required'),
        artist: z.string().min(1, 'Artist name is required'),
        spotifyId: z.string().optional(),
      })
    )
    .min(1, 'At least 1 seed track is required')
    .max(10, 'Maximum 10 seed tracks allowed'),
  limit: z.coerce.number().min(5).max(50).optional().default(20),
  privacity: z.enum(['public', 'private']).optional().default('private'),
});

/**
 * Generate a playlist using AI based on seed tracks
 * POST /api/ai/generate-playlist
 */
export const generatePlaylist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, seedTracks, limit, privacity } = generatePlaylistSchema.parse(
      req.body
    );
    const user = AuthContext.getLoggedUser();

    aiController.info(
      { userId: user.id, seedCount: seedTracks.length, limit },
      'Generating AI playlist'
    );

    // Step 1: Generate playlist using AI
    const generatedPlaylist = await aiPlaylistService.generatePlaylist({
      seedTracks,
      limit,
    });

    // Step 2: Save playlist to database with AI message
    const savedPlaylist = await userPlaylistService.createPlaylist(user.id, {
      name,
      privacity: privacity as Privacity,
      aiMessage: generatedPlaylist.message,
    });

    aiController.info(
      { playlistId: savedPlaylist.id },
      'Playlist created, adding tracks'
    );

    // Step 3: Add all generated tracks to the playlist
    const addedTracks: string[] = [];
    const failedTracks: string[] = [];

    for (const track of generatedPlaylist.generatedTracks) {
      try {
        const added = await userPlaylistService.addMusicToPlaylist(
          user.id,
          savedPlaylist.id,
          { externalId: track.spotifyId, albumCover: track.albumCover }
        );
        if (added) {
          addedTracks.push(track.spotifyId);
        }
      } catch {
        failedTracks.push(track.spotifyId);
      }
    }

    aiController.info(
      {
        playlistId: savedPlaylist.id,
        tracksAdded: addedTracks.length,
        tracksFailed: failedTracks.length,
      },
      'AI playlist saved to database'
    );

    res.status(201).json({
      success: true,
      message: `Playlist "${name}" criada com ${addedTracks.length} músicas`,
      data: {
        playlist: savedPlaylist,
        aiMessage: generatedPlaylist.message,
        generatedTracks: generatedPlaylist.generatedTracks,
        invalidSuggestions: generatedPlaylist.invalidSuggestions,
        stats: {
          ...generatedPlaylist.stats,
          saved: addedTracks.length,
          failedToSave: failedTracks.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
