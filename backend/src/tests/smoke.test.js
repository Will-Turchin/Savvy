import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const testDbPath = path.resolve('backend/data/test-wardrobe.sqlite');
process.env.SAVVY_DB_PATH = testDbPath;
process.env.PORT = '4100';

const { default: app } = await import('../app.js');
const { getDb, closeDb } = await import('../db/database.js');

let server;

test.before(async () => {
  await fs.mkdir(path.dirname(testDbPath), { recursive: true });
  await fs.rm(testDbPath, { force: true });

  await getDb();
  server = app.listen(4100);
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await closeDb();
  await fs.rm(testDbPath, { force: true });
});

test('wardrobe CRUD + analysis + recommendations', async () => {
  const createRes = await fetch('http://localhost:4100/api/wardrobe', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Test White Tee',
      category: 'top',
      color: 'white',
      size: 'M',
      season: 'all',
      formality: 'casual'
    })
  });

  assert.equal(createRes.status, 201);
  const created = await createRes.json();
  assert.equal(created.name, 'Test White Tee');

  const wardrobeRes = await fetch('http://localhost:4100/api/wardrobe');
  assert.equal(wardrobeRes.status, 200);
  const wardrobe = await wardrobeRes.json();
  assert.equal(wardrobe.length, 1);

  const analysisRes = await fetch('http://localhost:4100/api/analysis');
  assert.equal(analysisRes.status, 200);
  const analysis = await analysisRes.json();
  assert.equal(analysis.totalItems, 1);
  assert.ok(Array.isArray(analysis.gaps));

  const recommendationsRes = await fetch('http://localhost:4100/api/recommendations?budget=50&category=top');
  assert.equal(recommendationsRes.status, 200);
  const recommendations = await recommendationsRes.json();
  assert.ok(Array.isArray(recommendations));

  if (recommendations.length > 0) {
    const first = recommendations[0];
    assert.ok(first.explanation);
    assert.ok(first.gapFilled);
    assert.equal(typeof first.compatibility, 'number');
  }
});
