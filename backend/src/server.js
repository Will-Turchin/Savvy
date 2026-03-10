import app from './app.js';
import { getDb } from './db/database.js';

const PORT = process.env.PORT || 4000;

async function start() {
  await getDb();
  app.listen(PORT, () => {
    console.log(`Savvy backend running at http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
