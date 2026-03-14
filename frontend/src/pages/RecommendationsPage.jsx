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
    <section>
      <h2>Recommendations</h2>
      <div className="card form-grid">
        <label>
          budget
          <input
            type="number"
            min="1"
            value={filters.budget}
            onChange={(e) => setFilters({ ...filters, budget: e.target.value })}
          />
        </label>
        <label>
          category
          <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
            {categoryOptions.map((option) => (
              <option key={option || 'all'} value={option}>
                {option || 'all'}
              </option>
            ))}
          </select>
        </label>
        <label>
          size
          <select value={filters.size} onChange={(e) => setFilters({ ...filters, size: e.target.value })}>
            {sizeOptions.map((option) => (
              <option key={option || 'all'} value={option}>
                {option || 'all'}
              </option>
            ))}
          </select>
        </label>
        <label>
          color
          <select value={filters.color} onChange={(e) => setFilters({ ...filters, color: e.target.value })}>
            {colorOptions.map((option) => (
              <option key={option || 'all'} value={option}>
                {option || 'all'}
              </option>
            ))}
          </select>
        </label>
        <button onClick={load}>Refresh Recommendations</button>
      </div>

      <div className="card">
        <h3>Ranked Items</h3>
        {loading ? (
          <p>Loading recommendations...</p>
        ) : error ? (
          <p>Could not load recommendations: {error}</p>
        ) : items.length === 0 ? (
          <p>No recommendations were returned. This can happen if there are no detected wardrobe gaps or no listings matched the current filters.</p>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong> (${item.price}) — {item.store}
                <br />
                Gap filled: {item.gapFilled}
                <br />
                Compatibility: {item.compatibility}% | Score: {item.score}
                <br />
                Why: {item.explanation}
                <br />
                Link: <a href={item.link}>{item.link}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
