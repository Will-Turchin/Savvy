import { getDb } from './database.js';

const seedItems = [
  { name: 'White Oxford Shirt', category: 'top', color: 'white', size: 'M', season: 'all', formality: 'smart-casual' },
  { name: 'Black Crew T-Shirt', category: 'top', color: 'black', size: 'M', season: 'all', formality: 'casual' },
  { name: 'Dark Blue Jeans', category: 'bottom', color: 'blue', size: '32', season: 'all', formality: 'casual' },
  { name: 'Grey Chinos', category: 'bottom', color: 'grey', size: '32', season: 'all', formality: 'smart-casual' },
  { name: 'Navy Hoodie', category: 'outerwear', color: 'navy', size: 'M', season: 'winter', formality: 'casual' },
  { name: 'White Sneakers', category: 'shoes', color: 'white', size: '9', season: 'all', formality: 'casual' }
];

async function seed() {
  const db = await getDb();
  const existing = await db.get('SELECT COUNT(*) AS count FROM wardrobe_items');
  const shouldReset = process.argv.includes('--reset');

  if (existing.count > 0 && !shouldReset) {
    console.log('Wardrobe already has saved items. Skipping seed so your changes persist.');
    console.log('Run `npm run seed:reset` if you intentionally want to restore the sample wardrobe.');
    return;
  }

  if (shouldReset) {
    await db.exec('DELETE FROM wardrobe_items;');
  }

  const stmt = await db.prepare(`
    INSERT INTO wardrobe_items (name, category, color, size, season, formality)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const item of seedItems) {
    await stmt.run(item.name, item.category, item.color, item.size, item.season, item.formality);
  }

  await stmt.finalize();
  console.log(shouldReset ? 'Reset wardrobe to sample data.' : 'Seeded wardrobe with sample data.');
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
