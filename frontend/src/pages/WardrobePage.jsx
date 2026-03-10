import { useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPost } from '../api/client';

const emptyForm = {
  name: '',
  category: 'top',
  color: '',
  size: 'M',
  season: 'all',
  formality: 'casual'
};

export default function WardrobePage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    setLoading(true);
    const data = await apiGet('/wardrobe');
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    await apiPost('/wardrobe', form);
    setForm(emptyForm);
    loadItems();
  }

  async function removeItem(id) {
    await apiDelete(`/wardrobe/${id}`);
    loadItems();
  }

  return (
    <section>
      <h2>Wardrobe Manager</h2>
      <form onSubmit={onSubmit} className="card form-grid">
        {Object.entries(form).map(([field, value]) => (
          <label key={field}>
            {field}
            <input
              value={value}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              required
            />
          </label>
        ))}
        <button type="submit">Add Item</button>
      </form>

      <div className="card">
        <h3>Current Items</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <strong>{item.name}</strong> — {item.category} / {item.color} / {item.size}
                <button onClick={() => removeItem(item.id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
