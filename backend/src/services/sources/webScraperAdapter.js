import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import * as cheerio from 'cheerio';

const execFileAsync = promisify(execFile);

const searchTermsByCategory = {
  top: ['mens oxford shirt', 'mens knit polo', 'mens button up shirt'],
  bottom: ['mens straight jeans', 'mens chinos', 'mens wool trousers'],
  outerwear: ['mens overshirt jacket', 'mens bomber jacket', 'mens chore coat'],
  shoes: ['mens leather sneakers', 'mens loafers', 'mens suede boots']
};

const blockedTitleTokens = [
  'insert',
  'insole',
  'insoles',
  'laces',
  'lace',
  'replacement',
  'repair',
  'accessory',
  'accessories',
  'patch',
  'fabric swatch',
  'sample',
  'lot',
  'bundle',
  'toe cap',
  'shoe tree',
  'cleaner',
  'polish',
  'sole',
  'soles'
];

const preferredTitleTokensByCategory = {
  top: ['shirt', 'polo', 'button', 'oxford', 'tee', 'sweater', 'cardigan', 'knit'],
  bottom: ['jeans', 'chino', 'trouser', 'pants', 'pant', 'slacks', 'denim'],
  outerwear: ['jacket', 'coat', 'overshirt', 'bomber', 'parka', 'blazer'],
  shoes: ['shoe', 'shoes', 'sneaker', 'sneakers', 'loafer', 'loafers', 'boot', 'boots']
};

const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export async function fetchListings({ category, budget, size, color }) {
  const collected = [];

  await streamListings({
    category,
    budget,
    size,
    color,
    onBatch: (batch) => {
      collected.push(...batch);
    }
  });

  return collected;
}

export async function streamListings({ category, budget, size, color, onBatch }) {
  const searchTerms = searchTermsByCategory[category] || ['shirt'];
  const minimumPrice = getMinimumPriceThreshold(budget, category);
  const seenIds = new Set();
  const collected = [];

  await Promise.all(
    searchTerms.map(async (term) => {
      try {
        const listings = await scrapeEbayListings({ term, category, size });
        const filtered = listings.filter((item) =>
          shouldIncludeListing({ item, category, budget, size, color, minimumPrice, seenIds })
        );

        if (filtered.length > 0) {
          collected.push(...filtered);
          onBatch?.(filtered);
        }
      } catch (error) {
        console.warn(`Failed to scrape listings for term "${term}"`, error.message);
      }
    })
  );

  return collected;
}

async function scrapeEbayListings({ term, category, size }) {
  const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(term)}&_sop=15`;
  const { stdout } = await execFileAsync(
    'curl',
    ['-L', '--silent', '--show-error', '--max-time', '15', '-A', USER_AGENT, searchUrl],
    { maxBuffer: 5 * 1024 * 1024 }
  );

  const $ = cheerio.load(stdout);
  const listings = [];

  $('.s-item, .s-card').each((_, element) => {
    const link = $(element).find('.s-item__link, .s-card__link').last().attr('href') || '';
    const title = cleanTitle($(element).find('.s-item__title, .s-card__title').first().text());
    const priceText = $(element).find('.s-item__price, .s-card__price').first().text().trim();

    if (!link || !title || title.toLowerCase().includes('shop on ebay')) {
      return;
    }

    const price = parsePrice(priceText);
    if (!Number.isFinite(price)) {
      return;
    }

    const description = $(element).find('.s-item__subtitle, .s-card__subtitle').first().text().trim();
    if (!isRelevantListing({ title, description }, category)) {
      return;
    }

    const id = `ebay-${hash(`${title}-${link}`)}`;

    listings.push({
      source: 'Web Scraper',
      id,
      title,
      description,
      category,
      color: inferColor(`${title} ${description}`),
      size: inferSize(size, `${title} ${description}`),
      price,
      store: 'eBay',
      link
    });
  });

  return listings.slice(0, 30);
}

function cleanTitle(title) {
  return title.replace(/Opens in a new window or tab$/i, '').trim();
}

function getMinimumPriceThreshold(budget, category) {
  if (!budget) {
    return category === 'shoes' ? 20 : 12;
  }

  const baseline = category === 'shoes' ? 20 : 12;
  return Math.min(budget * 0.8, Math.max(baseline, budget * 0.35));
}

function isRelevantListing(item, category) {
  const text = `${item.title || ''} ${item.description || ''}`.toLowerCase();
  const hasBlockedToken = blockedTitleTokens.some((token) => text.includes(token));

  if (hasBlockedToken) {
    return false;
  }

  const preferredTokens = preferredTitleTokensByCategory[category] || [];
  return preferredTokens.length === 0 || preferredTokens.some((token) => text.includes(token));
}

function shouldIncludeListing({ item, category, budget, size, color, minimumPrice, seenIds }) {
  if (seenIds.has(item.id)) {
    return false;
  }

  const withinBudget = budget ? item.price <= budget : true;
  const aboveMinimumPrice = item.price >= minimumPrice;
  const sizeMatch = size ? item.size.toLowerCase() === size.toLowerCase() : true;
  const colorMatch = color ? item.color.toLowerCase() === color.toLowerCase() : true;
  const relevantTitle = isRelevantListing(item, category);

  if (!withinBudget || !aboveMinimumPrice || !sizeMatch || !colorMatch || !relevantTitle) {
    return false;
  }

  seenIds.add(item.id);
  return true;
}

function parsePrice(priceText) {
  const normalized = priceText.replace(/,/g, '');
  const match = normalized.match(/\$\s*(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : NaN;
}

function inferSize(requestedSize, text) {
  if (requestedSize) {
    return requestedSize;
  }

  const lowered = text.toLowerCase();
  const knownSizes = ['xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl'];
  const found = knownSizes.find((token) => new RegExp(`\\b${token}\\b`, 'i').test(lowered));

  return found ? found.toUpperCase() : 'M';
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

function hash(text) {
  let result = 0;
  for (let i = 0; i < text.length; i += 1) {
    result = (result << 5) - result + text.charCodeAt(i);
    result |= 0;
  }

  return Math.abs(result);
}
