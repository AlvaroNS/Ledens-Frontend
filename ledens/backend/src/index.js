import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import contactRouter from './routes/contact.js';
import { migrate, dbStatus } from './db/index.js';

const app = express();
const PORT = Number(process.env.PORT || 4000);
const ORIGIN = process.env.CORS_ORIGIN || '*';

app.set('trust proxy', 1);
app.use(express.json({ limit: '64kb' }));
app.use(cors({ origin: ORIGIN }));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.get('/api/health', async (_req, res) => {
  res.json({
    status: 'ok',
    service: 'ledens-backend',
    db: await dbStatus(),
    ts: new Date().toISOString(),
  });
});

app.use('/api/contact', contactRouter);

app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Leads don't depend on the database, so a DB outage must not keep the API down.
migrate().catch((err) => console.error('[db] migration failed', err));

app.listen(PORT, () => {
  console.log(`Ledens backend listening on :${PORT}`);
});
