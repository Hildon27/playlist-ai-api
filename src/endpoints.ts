export const endpoints = {
  health: '/api/health',
  users: {
    root: '/api/users',
    byId: '/api/users/:userId',
    all: '/api/users',
    delete: '/api/users/:userId',
    update: '/api/users/:userId',
  },
  playlists: {
    root: '/api/playlists',
    byId: '/api/playlists/:playlistId',
    update: '/api/playlists/:playlistId',
    delete: '/api/playlists/:playlistId',
    byUser: '/api/playlists/user/:userId',
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
    byUser: '/api/comments/user/:userId',
  },
  follows: {
    followers: '/api/follows/:userId/followers',
    unfollow: '/api/follows/:id/unfollow',
    removeFollower: '/api/follows/:id/remove',
  },
  followRequests: {
    register: '/api/follow-requests/register',
    byFollower: '/api/follow-requests/by-follower/:id',
    byFollowed: '/api/follow-requests/by-followed/:id',
    cancel: '/api/follow-requests/:id',
    process: '/api/follow-requests/:id/process',
  },
};
