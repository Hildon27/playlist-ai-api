export const endpoints = {
  info: '/api',
  health: '/api/health',
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
  },
  users: {
    all: '/api/users',
    current: '/api/users/me',
    update: '/api/users/me',
    delete: '/api/users/me',
  },
  playlists: {
    root: '/api/playlists',
    byId: '/api/playlists/:playlistId',
    update: '/api/playlists/:playlistId',
    delete: '/api/playlists/:playlistId',
    currentUser: '/api/playlists/user',
    publicAll: '/api/playlists/public/all',
    musics: {
      add: '/api/playlists/:playlistId/musics',
      remove: '/api/playlists/:playlistId/musics',
      get: '/api/playlists/:playlistId/musics',
    },
  },
  comments: {
    root: '/api/comments',
    byId: '/api/comments/:commentId',
    update: '/api/comments/:commentId',
    delete: '/api/comments/:commentId',
    byPlaylist: '/api/comments/playlist/:playlistId',
    byCurrentUser: '/api/comments/user',
  },
  follows: {
    followers: '/api/follows/followers',
    unfollow: '/api/follows/:followedId/unfollow',
    removeFollower: '/api/follows/:followerId/remove',
  },
  followRequests: {
    register: '/api/follow-requests/register',
    byFollower: '/api/follow-requests/sent',
    byFollowed: '/api/follow-requests/received',
    cancel: '/api/follow-requests/:id',
    process: '/api/follow-requests/:id/process',
  },
  spotify: {
    searchTracks: '/api/spotify/search',
    searchTracksById: '/api/spotify/tracks/:trackId',
    validateTracks: '/api/spotify/validate',
    recommendations: '/api/spotify/recommendations',
  },
  aiPlaylist: {
    generate: '/api/ai/generate-playlist',
  },
};
