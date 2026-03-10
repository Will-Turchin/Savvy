import axios from 'axios';

const searchTermsByCategory = {
  top: ['shirt', 't-shirt', 'polo'],
  bottom: ['jeans', 'chino', 'trouser'],
  outerwear: ['hoodie', 'jacket'],
  shoes: ['shoe', 'sneaker', 'boot']
};

// This adapter is intentionally simple and ready for expansion to additional stores.
export async function fetchListings({ category, budget, size, color }) {
  const searchTerms = searchTermsByCategory[category] || ['shirt'];
  const results = [];

  for (const term of searchTerms) {
    try {
      const url = `https://dummyjson.com/products/search?q=${encodeURIComponent(term)}`;
      const { data } = await axios.get(url, { timeout: 8000 });
      const products = (data.products || []).map((product) => ({
        source: 'DummyJSON',
        id: `dummy-${product.id}`,
        title: product.title,
        description: product.description,
        category,
        color: inferColor(product.title + ' ' + product.description),
        size: inferSize(size),
        price: Number(product.price),
        store: 'DummyJSON Store',
        link: `https://dummyjson.com/products/${product.id}`
      }));
      results.push(...products);
    } catch (error) {
      // Honest failure handling: log and continue, so one bad source does not kill recommendations.
      console.warn(`Failed to fetch search term ${term} from DummyJSON`, error.message);
    }
  }

  const unique = Array.from(new Map(results.map((item) => [item.id, item])).values());

  return unique.filter((item) => {
    const withinBudget = budget ? item.price <= budget : true;
    const sizeMatch = size ? item.size.toLowerCase() === size.toLowerCase() : true;
    const colorMatch = color ? item.color.toLowerCase() === color.toLowerCase() : true;
    return withinBudget && sizeMatch && colorMatch;
  });
}

function inferSize(requestedSize) {
  return requestedSize || 'M';
}

function inferColor(text) {
  const lowered = text.toLowerCase();
  const knownColors = ['black', 'white', 'grey', 'gray', 'blue', 'navy', 'brown', 'beige', 'green', 'olive'];
  const found = knownColors.find((tone) => lowered.includes(tone));
  if (!found) {
    return 'neutral';
  }
  return found === 'gray' ? 'grey' : found;
}
