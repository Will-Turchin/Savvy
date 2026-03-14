import { useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPost } from '../api/client';

const categoryOptions = ['top', 'bottom', 'outerwear', 'shoes'];
const colorOptions = ['white', 'black', 'grey', 'navy', 'blue', 'beige', 'brown', 'green', 'olive'];
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '8', '9', '10', '11', '12'];
const seasonOptions = ['all', 'spring', 'summer', 'fall', 'winter'];
const formalityOptions = ['casual', 'smart-casual', 'formal'];

const emptyForm = {
  name: '',
  category: 'top',
  color: 'white',
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
        <label>
          name
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label>
          category
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          color
          <select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}>
            {colorOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          size
          <select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}>
            {sizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          season
          <select value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })}>
            {seasonOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          formality
          <select value={form.formality} onChange={(e) => setForm({ ...form, formality: e.target.value })}>
            {formalityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
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
