// Spotify Track (simplified)
export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  explicit: boolean;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
    release_date: string;
  };
  artists: Array<{
    id: string;
    name: string;
    external_urls: {
      spotify: string;
    };
  }>;
}

// Spotify Search Response
export interface SpotifySearchResponse {
  tracks: {
    href: string;
    items: SpotifyTrack[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
}

// Spotify Recommendations Response
export interface SpotifyRecommendationsResponse {
  tracks: SpotifyTrack[];
  seeds: Array<{
    id: string;
    type: string;
    href: string;
  }>;
}

// Simplified track for API responses
export interface TrackDTO {
  spotifyId: string;
  name: string;
  artists: string[];
  album: string;
  albumCover: string | null;
  duration: number;
  previewUrl: string | null;
  spotifyUrl: string;
}

// Request DTOs
export interface SearchTracksDTO {
  query: string;
  limit?: number;
}

export interface GetRecommendationsDTO {
  seedTrackIds: string[];
  limit?: number;
}

export interface ValidateTracksDTO {
  trackIds: string[];
}

// Helper function to map Spotify track to DTO
export const mapTrackToDTO = (track: SpotifyTrack): TrackDTO => ({
  spotifyId: track.id,
  name: track.name,
  artists: track.artists.map(a => a.name),
  album: track.album.name,
  albumCover: track.album.images[0]?.url ?? null,
  duration: track.duration_ms,
  previewUrl: track.preview_url,
  spotifyUrl: track.external_urls.spotify,
});
