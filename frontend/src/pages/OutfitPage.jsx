import { useEffect, useState } from 'react';
import { apiGet } from '../api/client';

const pieceOrder = ['top', 'bottom', 'outerwear', 'shoes'];

export default function OutfitPage() {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOutfits() {
      setLoading(true);
      setError('');

      try {
        const data = await apiGet('/outfits');
        setOutfits(data);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadOutfits();
  }, []);

  return (
    <section className="page-layout">
      <div className="section-heading">
        <p className="eyebrow">Outfit Builder</p>
        <h2>Wear what you already have.</h2>
        <p className="section-copy">Built from your saved pieces.</p>
      </div>

      {loading ? <p className="loading-page">Building outfits from your wardrobe...</p> : null}
      {error ? <p className="error-banner">Could not load outfits: {error}</p> : null}
      {!loading && !error && outfits.length === 0 ? (
        <div className="card empty-card">
          <p>Add at least one top and one bottom to start generating outfits from your current wardrobe.</p>
        </div>
      ) : null}

      <div className="outfit-grid">
        {outfits.map((outfit) => (
          <article key={outfit.id} className="outfit-card">
            <div className="recommendation-topline">
              <span className="market-badge">Wardrobe look</span>
              <span className="price-tag">Score {outfit.score}</span>
            </div>

            <div className="recommendation-copy">
              <h3>{outfit.title}</h3>
              <p>{outfit.explanation}</p>
            </div>

            <div className="outfit-piece-grid">
              {pieceOrder.map((role) =>
                outfit.pieces[role] ? (
                  <div key={role} className="outfit-piece">
                    <p className="panel-kicker">{role}</p>
                    <h4>{outfit.pieces[role].name}</h4>
                    <p className="muted-line">
                      {outfit.pieces[role].color} • {outfit.pieces[role].size}
                    </p>
                    <div className="chip-row">
                      <span className="chip">{outfit.pieces[role].season}</span>
                      <span className="chip chip-soft">{outfit.pieces[role].formality}</span>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
