import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import contactRouter from './routes/contact.js';
import authRouter from './routes/auth.js';
import oauthRouter from './routes/oauth.js';

// Builds the Express app without starting it listening — used both by
// src/index.js (real server) and by the tests (ephemeral server on a random
// port, so several test files can run without colliding on :4000).
export function createApp() {
  const app = express();
  const ORIGIN = process.env.CORS_ORIGIN || '*';

  app.set('trust proxy', 1);
  app.use(express.json({ limit: '64kb' }));
  app.use(cookieParser());
  // credentials: true lets the session cookie travel on cross-origin calls
  // (e.g. hitting the Container App FQDN directly in dev). Same-origin calls
  // through the SWA/nginx proxy work regardless.
  app.use(cors({ origin: ORIGIN, credentials: true }));

  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', apiLimiter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'ledens-backend', ts: new Date().toISOString() });
  });

  app.use('/api/contact', contactRouter);
  app.use('/api/auth', authRouter);
  // Mounted at the same prefix as authRouter (Express allows this) — kept in
  // its own file because it's social login, not email/password, and #12/#13
  // will add their own provider files alongside google.js without this one
  // growing indefinitely.
  app.use('/api/auth', oauthRouter);

  app.use((err, _req, res, _next) => {
    console.error('[error]', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
