import express from 'express';
import { getDb } from '../db/database.js';
import { buildRecommendations, streamRecommendations } from '../services/recommendationService.js';

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

router.get('/stream', async (req, res) => {
  const db = await getDb();
  const items = await db.all('SELECT * FROM wardrobe_items');

  const filters = {
    budget: req.query.budget ? Number(req.query.budget) : undefined,
    category: req.query.category,
    size: req.query.size,
    color: req.query.color
  };

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let closed = false;
  req.on('close', () => {
    closed = true;
  });

  const sendEvent = (event, payload) => {
    if (closed) {
      return;
    }

    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  sendEvent('status', { state: 'started' });

  try {
    await streamRecommendations(items, filters, (batch) => {
      sendEvent('items', batch);
    });

    sendEvent('done', { ok: true });
  } catch (error) {
    sendEvent('error-message', { message: error.message });
  } finally {
    if (!closed) {
      res.end();
    }
  }
});

export default router;
