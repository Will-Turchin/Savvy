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
    <section className="page-layout">
      <div className="section-heading">
        <p className="eyebrow">Wardrobe Manager</p>
        <h2>Capture the pieces you already reach for.</h2>
        <p className="section-copy">
          Keep your wardrobe structured so the analysis and recommendations stay grounded in what you actually own.
        </p>
      </div>

      <div className="split-layout">
        <form onSubmit={onSubmit} className="card surface-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Add Item</p>
              <h3>Wardrobe Details</h3>
            </div>
            <p className="panel-copy">Use the guided fields to keep categories, sizing, and colors consistent.</p>
          </div>

          <div className="form-grid">
            <label className="field field-span-2">
              <span>name</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Navy merino crewneck"
                required
              />
            </label>
            <label className="field">
              <span>category</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>color</span>
              <select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}>
                {colorOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>size</span>
              <select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}>
                {sizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>season</span>
              <select value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })}>
                {seasonOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>formality</span>
              <select value={form.formality} onChange={(e) => setForm({ ...form, formality: e.target.value })}>
                {formalityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button type="submit" className="button-primary">
            Add Item
          </button>
        </form>

        <div className="card surface-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Current Wardrobe</p>
              <h3>{loading ? 'Loading pieces...' : `${items.length} pieces tracked`}</h3>
            </div>
            <p className="panel-copy">A cleaner inventory makes the downstream analysis much more useful.</p>
          </div>

          {loading ? (
            <p className="empty-state">Loading wardrobe...</p>
          ) : items.length === 0 ? (
            <p className="empty-state">No items yet. Add a few core pieces to start building a useful profile.</p>
          ) : (
            <div className="stack-list">
              {items.map((item) => (
                <article key={item.id} className="inventory-card">
                  <div>
                    <h4>{item.name}</h4>
                    <p className="muted-line">
                      {item.category} • {item.color} • {item.size}
                    </p>
                    <div className="chip-row">
                      <span className="chip">{item.season}</span>
                      <span className="chip chip-soft">{item.formality}</span>
                    </div>
                  </div>
                  <button className="button-secondary button-danger" onClick={() => removeItem(item.id)}>
                    Delete
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
