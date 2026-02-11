import rateLimit from 'express-rate-limit';

/**
 * General rate limiter for standard navigation routes such as Users, Playlists, and Comments.
 *
 * Limits each IP to 200 requests per 15 minutes.
 * Provides standard headers for rate limiting.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per IP per window
  message: { success: false, message: 'Too many requests. Slow down a bit.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Heavy operation limiter for routes that call expensive or slow services (e.g., AI, Spotify APIs).
 *
 * Limits each IP to 30 requests per 15 minutes.
 * Provides standard headers for rate limiting.
 */
export const heavyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per IP per window
  message: {
    success: false,
    message: 'AI/Spotify limit reached. Try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Authentication rate limiter for login and registration routes.
 *
 * Protects against brute-force attacks by limiting each IP to 10 attempts per 15 minutes.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login/registration attempts per IP per window
  message: {
    success: false,
    message: 'Too many login attempts. Try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
