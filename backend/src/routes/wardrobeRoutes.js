import express from 'express';
import { getDb } from '../db/database.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const db = await getDb();
  const items = await db.all('SELECT * FROM wardrobe_items ORDER BY created_at DESC');
  res.json(items);
});

router.post('/', async (req, res) => {
  const payload = normalizeWardrobePayload(req.body);
  const { name, category, color, size, season, formality } = payload;
  if (!name || !category || !color || !size || !season || !formality) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const db = await getDb();
  const result = await db.run(
    `INSERT INTO wardrobe_items (name, category, color, size, season, formality)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, category, color, size, season, formality]
  );

  const created = await db.get('SELECT * FROM wardrobe_items WHERE id = ?', [result.lastID]);
  return res.status(201).json(created);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, color, size, season, formality } = normalizeWardrobePayload(req.body);

  const db = await getDb();
  await db.run(
    `UPDATE wardrobe_items
     SET name = ?, category = ?, color = ?, size = ?, season = ?, formality = ?
     WHERE id = ?`,
    [name, category, color, size, season, formality, id]
  );

  const updated = await db.get('SELECT * FROM wardrobe_items WHERE id = ?', [id]);
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const db = await getDb();
  await db.run('DELETE FROM wardrobe_items WHERE id = ?', [req.params.id]);
  res.status(204).send();
});

export default router;

function normalizeWardrobePayload(payload = {}) {
  return {
    name: String(payload.name || '').trim(),
    category: normalizeCategory(payload.category),
    color: normalizeColor(payload.color),
    size: String(payload.size || '')
      .trim()
      .toUpperCase(),
    season: String(payload.season || '')
      .trim()
      .toLowerCase(),
    formality: String(payload.formality || '')
      .trim()
      .toLowerCase()
  };
}

function normalizeCategory(category) {
  const normalized = String(category || '')
    .trim()
    .toLowerCase();

  const aliases = {
    tops: 'top',
    shirts: 'top',
    shirt: 'top',
    bottoms: 'bottom',
    pants: 'bottom',
    trousers: 'bottom',
    jeans: 'bottom',
    jackets: 'outerwear',
    jacket: 'outerwear',
    coats: 'outerwear',
    coat: 'outerwear',
    shoe: 'shoes',
    sneakers: 'shoes',
    boots: 'shoes'
  };

  return aliases[normalized] || normalized;
}

function normalizeColor(color) {
  const normalized = String(color || '')
    .trim()
    .toLowerCase();

  const aliases = {
    gray: 'grey',
    tan: 'beige'
  };

  return aliases[normalized] || normalized;
}
