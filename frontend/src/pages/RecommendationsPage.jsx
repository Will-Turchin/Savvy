import { useEffect, useRef, useState } from 'react';
import { streamApi } from '../api/client';

const categoryOptions = ['', 'top', 'bottom', 'outerwear', 'shoes'];
const sizeOptions = ['', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '8', '9', '10', '11', '12'];
const colorOptions = ['', 'white', 'black', 'grey', 'navy', 'blue', 'beige', 'brown', 'green', 'olive'];

export default function RecommendationsPage() {
  const [filters, setFilters] = useState({ budget: 50, category: '', size: '', color: '' });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const streamRef = useRef(null);

  const load = () => {
    streamRef.current?.();
    setLoading(true);
    setError('');
    setItems([]);

    const params = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined)
    ).toString();

    streamRef.current = streamApi(`/recommendations/stream${params ? `?${params}` : ''}`, {
      onMessage: (batch) => {
        setItems((current) =>
          Array.from(new Map([...current, ...batch].map((item) => [item.id, item])).values()).sort(
            (a, b) => b.score - a.score
          )
        );
      },
      onDone: () => {
        setLoading(false);
      },
      onError: (streamError) => {
        setError(streamError.message || 'Streaming recommendations failed.');
        streamRef.current?.();
        streamRef.current = null;
        setItems((current) => current);
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    load();
    return () => {
      streamRef.current?.();
    };
  }, []);

  return (
    <section className="page-layout">
      <div className="section-heading">
        <p className="eyebrow">Recommendations</p>
        <h2>Find better pieces, faster.</h2>
        <p className="section-copy">Streaming results. Cleaner picks.</p>
      </div>

      <div className="card filter-bar">
        <div className="filter-grid">
          <label className="field">
            <span>budget</span>
            <input
              type="number"
              min="1"
              value={filters.budget}
              onChange={(e) => setFilters({ ...filters, budget: e.target.value })}
            />
          </label>
          <label className="field">
            <span>category</span>
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
              {categoryOptions.map((option) => (
                <option key={option || 'all'} value={option}>
                  {option || 'all'}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>size</span>
            <select value={filters.size} onChange={(e) => setFilters({ ...filters, size: e.target.value })}>
              {sizeOptions.map((option) => (
                <option key={option || 'all'} value={option}>
                  {option || 'all'}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>color</span>
            <select value={filters.color} onChange={(e) => setFilters({ ...filters, color: e.target.value })}>
              {colorOptions.map((option) => (
                <option key={option || 'all'} value={option}>
                  {option || 'all'}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button className="button-primary" onClick={load}>
          Refresh Recommendations
        </button>
      </div>

      <div className="results-header">
        <div>
          <p className="panel-kicker">Ranked Results</p>
          <h3>{items.length} recommendation{items.length === 1 ? '' : 's'}</h3>
        </div>
        <p className="panel-copy">Best matches at the top.</p>
      </div>

      {loading ? <p className="loading-page">Streaming recommendations...</p> : null}
      {error ? <p className="error-banner">Could not load recommendations: {error}</p> : null}
      {!loading && !error && items.length === 0 ? (
        <div className="card empty-card">
          <p>No recommendations were returned. Try broadening filters or adding more wardrobe data.</p>
        </div>
      ) : null}

      <div className="recommendation-grid">
        {items.map((item) => (
          <article key={item.id} className="recommendation-card">
            <div className="recommendation-topline">
              <span className="market-badge">{item.store}</span>
              <span className="price-tag">${item.price}</span>
            </div>

            <div className="recommendation-copy">
              <h3>{item.title}</h3>
              <p>{item.explanation}</p>
            </div>

            <div className="metric-row">
              <div className="metric-pill">
                <span className="metric-label">Compatibility</span>
                <strong>{item.compatibility}%</strong>
              </div>
              <div className="metric-pill">
                <span className="metric-label">Score</span>
                <strong>{item.score}</strong>
              </div>
              <div className="metric-pill">
                <span className="metric-label">Gap</span>
                <strong>{item.gapFilled}</strong>
              </div>
            </div>

            <div className="recommendation-footer">
              <span className="source-line">Source: {item.source}</span>
              <a className="button-secondary listing-link" href={item.link} target="_blank" rel="noreferrer">
                View item
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
