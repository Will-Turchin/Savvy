import express from 'express';
import cors from 'cors';
import wardrobeRoutes from './routes/wardrobeRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import { getDb } from './db/database.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api', (_req, res) => {
  res.json({
    message: 'Savvy Wardrobe API',
    endpoints: {
      wardrobe: 'GET/POST /api/wardrobe, PUT/DELETE /api/wardrobe/:id',
      analysis: 'GET /api/analysis',
      recommendations: 'GET /api/recommendations?budget=&category=&size=&color='
    }
  });
});

app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/recommendations', recommendationRoutes);

app.listen(PORT, async () => {
  await getDb();
  console.log(`Savvy backend running at http://localhost:${PORT}`);
});
