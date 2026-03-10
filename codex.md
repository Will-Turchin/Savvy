Build a working localhost MVP for a wardrobe improvement web app.

The app must:

- let me store my current wardrobe in SQLite
- analyze wardrobe gaps using rule-based logic
- fetch or scrape cheap clothing listings from one or more online sources
- rank items based on how well they fill gaps in my wardrobe
- display recommendations with explanation, price, store, link, and compatibility with my existing clothes

Constraints:
- run locally on localhost
- use React for frontend and FastAPI or Express for backend
- use SQLite for storage
- no fake features or placeholder logic presented as real
- scraping code must be modular and honest about failures
- include a seeded example wardrobe
- include setup instructions
- prioritize MVP functionality over polish

Required pages:
- wardrobe manager
- analysis dashboard
- recommendations page
- Required backend capabilities:
- wardrobe CRUD
- gap analysis engine
- recommendation ranking engine
- source adapters for listings
- filtering by budget, category, size, and color

Required recommendation behavior:
- every suggested item must explain exactly what wardrobe gap it fills
- every item should include a compatibility estimate with current wardrobe
- prioritize cheap, versatile, neutral, practical items over flashy junk

Code quality requirements:
- modular structure
- clear folder layout
- documented endpoints
- no giant monolithic files
- add comments for future source expansion

Deliver a real first-pass project scaffold with runnable code, not just pseudocode.