import express from 'express';
import { getDb } from '../db/database.js';
import { buildRecommendations } from '../services/recommendationService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const db = await getDb();
  const items = await db.all('SELECT * FROM wardrobe_items');

  const filters = {
    budget: req.query.budget ? Number(req.query.budget) : undefined,
    category: req.query.category,
    size: req.query.size,
    color: req.query.color
  };

  const recommendations = await buildRecommendations(items, filters);
  const filteredByCategory = filters.category
    ? recommendations.filter((item) => item.category === filters.category)
    : recommendations;

  res.json(filteredByCategory);
});

export default router;
