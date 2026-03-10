import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const DB_PATH = new URL('../../data/wardrobe.sqlite', import.meta.url).pathname;

let dbInstance;

export async function getDb() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS wardrobe_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        color TEXT NOT NULL,
        size TEXT NOT NULL,
        season TEXT NOT NULL,
        formality TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  return dbInstance;
}
