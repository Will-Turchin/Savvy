# Savvy Wardrobe Improvement MVP

Local MVP that stores a wardrobe in SQLite, analyzes gaps, fetches cheap online listings, and ranks recommendations.

## Stack
- Backend: Express + SQLite
- Frontend: React (Vite)
- External source adapter: DummyJSON product search API

## Features
- Wardrobe CRUD backed by SQLite
- Rule-based wardrobe gap analysis
- Recommendation ranking (price, gap priority, compatibility, versatility)
- Listing source adapter with explicit failure handling
- Filter recommendations by budget, category, size, and color
- Seeded wardrobe example

## Folder layout
- `backend/src/routes` API route modules
- `backend/src/services` analysis/ranking/source adapters
- `backend/src/db` database and seed scripts
- `frontend/src/pages` required pages
- `frontend/src/api` frontend API client

## Setup
1. Install dependencies:
   ```bash
   npm run install:all
   ```
2. Seed sample wardrobe:
   ```bash
   npm run seed
   ```
3. Run backend on localhost:4000:
   ```bash
   npm run dev:backend
   ```
4. In another terminal, run frontend on localhost:5173:
   ```bash
   npm run dev:frontend
   ```

## API Endpoints
- `GET /api/wardrobe`
- `POST /api/wardrobe`
- `PUT /api/wardrobe/:id`
- `DELETE /api/wardrobe/:id`
- `GET /api/analysis`
- `GET /api/recommendations?budget=&category=&size=&color=`

## Notes on source adapters
- The adapter in `backend/src/services/sources/dummyJsonAdapter.js` is modular and isolated for future source expansion.
- If source fetches fail, errors are logged and recommendation generation continues with any successful source responses.
