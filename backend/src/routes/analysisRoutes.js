import express from 'express';
import { getDb } from '../db/database.js';
import { analyzeWardrobe } from '../services/gapAnalysisService.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const db = await getDb();
  const items = await db.all('SELECT * FROM wardrobe_items');
  res.json(analyzeWardrobe(items));
});

export default router;
