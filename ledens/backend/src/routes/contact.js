import { Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';

const router = Router();
const DATA_DIR = process.env.DATA_DIR || '/data';
const LEADS_FILE = path.join(DATA_DIR, 'leads.jsonl');

const isString = (v, max = 500) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
const isEmail = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 200;

router.post('/', async (req, res) => {
  const { name, phone, email, message } = req.body || {};

  if (!isString(name, 120))  return res.status(400).json({ error: 'Nombre requerido' });
  if (!isString(phone, 40))  return res.status(400).json({ error: 'Teléfono requerido' });
  if (email && !isEmail(email)) return res.status(400).json({ error: 'Email no válido' });
  if (message && (typeof message !== 'string' || message.length > 2000)) {
    return res.status(400).json({ error: 'Mensaje demasiado largo' });
  }

  const lead = {
    name: name.trim(),
    phone: phone.trim(),
    email: email ? email.trim() : null,
    message: message ? message.trim() : null,
    ip: req.ip,
    ua: req.get('user-agent') || null,
    receivedAt: new Date().toISOString(),
  };

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(LEADS_FILE, JSON.stringify(lead) + '\n', 'utf8');
  } catch (err) {
    console.error('[contact] failed to persist lead', err);
    return res.status(500).json({ error: 'No se pudo guardar la solicitud' });
  }

  console.log(`[contact] new lead from ${lead.name} (${lead.phone})`);
  res.status(201).json({ ok: true });
});

export default router;
