import { NextFunction, Request, Response } from 'express';
import { AIPlaylistServiceImpl } from '@/services/AIPlaylistService/AIPlaylistServiceImpl';
import { createLogger } from '@/lib/logger';
import { z } from 'zod';

const aiController = createLogger('AIController');
const aiPlaylistService = new AIPlaylistServiceImpl();

// Validation schema
const generatePlaylistSchema = z.object({
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
    const { seedTracks, limit } = generatePlaylistSchema.parse(req.body);

    aiController.info(
      { seedCount: seedTracks.length, limit },
      'Generating AI playlist'
    );

    const playlist = await aiPlaylistService.generatePlaylist({
      seedTracks,
      limit,
    });

    res.status(200).json({
      success: true,
      message: `Generated ${playlist.generatedTracks.length} tracks based on ${seedTracks.length} seed tracks`,
      data: playlist,
    });
  } catch (error) {
    next(error);
  }
};
