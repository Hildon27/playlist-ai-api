import { TrackDTO } from '@/models/spotify';

export interface GeneratePlaylistDTO {
  seedTracks: {
    name: string;
    artist: string;
    spotifyId?: string | undefined;
  }[];
  limit?: number;
}

export interface GeneratedPlaylist {
  message: string;
  seedTracks: {
    name: string;
    artist: string;
  }[];
  generatedTracks: TrackDTO[];
  invalidSuggestions: {
    name: string;
    artist: string;
  }[];
  stats: {
    requested: number;
    found: number;
    notFound: number;
  };
}
