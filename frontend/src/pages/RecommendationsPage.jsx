import { useEffect, useState } from 'react';
import { apiGet } from '../api/client';

export default function RecommendationsPage() {
  const [filters, setFilters] = useState({ budget: 50, category: '', size: '', color: '' });
  const [items, setItems] = useState([]);

  const load = async () => {
    const params = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined)
    ).toString();
    const data = await apiGet(`/recommendations${params ? `?${params}` : ''}`);
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section>
      <h2>Recommendations</h2>
      <div className="card form-grid">
        {Object.entries(filters).map(([key, value]) => (
          <label key={key}>
            {key}
            <input value={value} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })} />
          </label>
        ))}
        <button onClick={load}>Refresh Recommendations</button>
      </div>

      <div className="card">
        <h3>Ranked Items</h3>
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
      </div>
    </section>
  );
}
