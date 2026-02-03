import { NextFunction, Request, Response } from 'express';
import { SpotifyServiceImpl } from '@/services/SpotifyService/SpotifyServiceImpl';
import { createLogger } from '@/lib/logger';
import { z } from 'zod';

const spotifyController = createLogger('SpotifyController');
const spotifyService = new SpotifyServiceImpl();

// Validation schemas
const searchSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
});

const trackIdSchema = z.object({
  id: z.string().min(1, 'Track ID is required'),
});

const validateTracksSchema = z.object({
  trackIds: z
    .array(z.string())
    .min(1, 'At least one track ID is required')
    .max(50, 'Maximum 50 track IDs allowed'),
});

const recommendationsSchema = z.object({
  seedTrackIds: z
    .array(z.string())
    .min(1, 'At least one seed track is required')
    .max(5, 'Maximum 5 seed tracks allowed'),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

/**
 * Search for tracks on Spotify
 * GET /api/spotify/search?query=...&limit=...
 */
export const searchTracks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query, limit } = searchSchema.parse(req.query);

    spotifyController.info({ query, limit }, 'Searching tracks');

    const tracks = await spotifyService.searchTracks({ query, limit });

    res.status(200).json({
      success: true,
      data: tracks,
      count: tracks.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single track by ID
 * GET /api/spotify/tracks/:id
 */
export const getTrack = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = trackIdSchema.parse(req.params);

    spotifyController.info({ trackId: id }, 'Getting track');

    const track = await spotifyService.getTrack(id);

    if (!track) {
      res.status(404).json({
        success: false,
        message: 'Track not found on Spotify',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: track,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validate multiple track IDs
 * POST /api/spotify/validate
 * Body: { trackIds: string[] }
 */
export const validateTracks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { trackIds } = validateTracksSchema.parse(req.body);

    spotifyController.info(
      { trackCount: trackIds.length },
      'Validating tracks'
    );

    const result = await spotifyService.validateTracks({ trackIds });

    res.status(200).json({
      success: true,
      data: {
        valid: result.valid,
        invalidIds: result.invalidIds,
        summary: {
          total: trackIds.length,
          validCount: result.valid.length,
          invalidCount: result.invalidIds.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recommendations based on seed tracks
 * POST /api/spotify/recommendations
 * Body: { seedTrackIds: string[], limit?: number }
 */
export const getRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { seedTrackIds, limit } = recommendationsSchema.parse(req.body);

    spotifyController.info(
      { seedCount: seedTrackIds.length, limit },
      'Getting recommendations'
    );

    const tracks = await spotifyService.getRecommendations({
      seedTrackIds,
      limit,
    });

    res.status(200).json({
      success: true,
      data: tracks,
      count: tracks.length,
      seeds: seedTrackIds,
    });
  } catch (error) {
    next(error);
  }
};
