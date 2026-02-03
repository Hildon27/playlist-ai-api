import { createLogger } from '@/lib/logger';

const spotifyLogger = createLogger('Spotify');

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyToken {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: SpotifyToken | null = null;

/**
 * Check if a direct access token is configured
 */
const getDirectToken = (): string | null => {
  return process.env.SPOTIFY_ACCESS_TOKEN || null;
};

/**
 * Get Spotify API credentials from environment variables
 */
const getCredentials = () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  return { clientId, clientSecret };
};

/**
 * Get a valid access token
 * Priority: 1) Direct token from env, 2) Client Credentials Flow
 */
export const getAccessToken = async (): Promise<string> => {
  // Option 1: Use direct token if configured (for testing/development)
  const directToken = getDirectToken();
  if (directToken) {
    spotifyLogger.debug('Using direct access token from SPOTIFY_ACCESS_TOKEN');
    return directToken;
  }

  // Option 2: Use Client Credentials Flow
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.accessToken;
  }

  const credentials = getCredentials();
  if (!credentials) {
    throw new Error(
      'Missing Spotify credentials. Set SPOTIFY_ACCESS_TOKEN or both SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env'
    );
  }

  spotifyLogger.info('Requesting new Spotify access token');

  const { clientId, clientSecret } = credentials;
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64'
  );

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = await response.text();
    spotifyLogger.error({ error }, 'Failed to get Spotify access token');
    throw new Error(`Failed to get Spotify access token: ${error}`);
  }

  const data: SpotifyTokenResponse = await response.json();

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  spotifyLogger.info('Spotify access token obtained successfully');
  return cachedToken.accessToken;
};

/**
 * Make an authenticated request to Spotify API
 */
export const spotifyFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = await getAccessToken();
  const baseUrl = 'https://api.spotify.com/v1';

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorJson;
    try {
      errorJson = JSON.parse(errorText);
    } catch {
      errorJson = null;
    }

    spotifyLogger.error(
      {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        error: errorJson || errorText,
      },
      'Spotify API request failed'
    );

    const message =
      errorJson?.error?.message || errorText || response.statusText;
    throw new Error(`Spotify API error (${response.status}): ${message}`);
  }

  return response.json();
};
