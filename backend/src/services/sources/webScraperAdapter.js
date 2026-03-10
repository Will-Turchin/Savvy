import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import * as cheerio from 'cheerio';

const execFileAsync = promisify(execFile);

const searchTermsByCategory = {
  top: ['shirt', 't-shirt', 'polo'],
  bottom: ['jeans', 'chino', 'trouser'],
  outerwear: ['hoodie', 'jacket'],
  shoes: ['shoe', 'sneaker', 'boot']
};

const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export async function fetchListings({ category, budget, size, color }) {
  const searchTerms = searchTermsByCategory[category] || ['shirt'];
  const results = [];

  for (const term of searchTerms) {
    try {
      const listings = await scrapeEbayListings({ term, category, size });
      results.push(...listings);
    } catch (error) {
      console.warn(`Failed to scrape listings for term "${term}"`, error.message);
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

async function scrapeEbayListings({ term, category, size }) {
  const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(term)}&_sop=15`;
  const { stdout } = await execFileAsync(
    'curl',
    ['-L', '--silent', '--show-error', '--max-time', '15', '-A', USER_AGENT, searchUrl],
    { maxBuffer: 5 * 1024 * 1024 }
  );

  const $ = cheerio.load(stdout);
  const listings = [];

  $('.s-item').each((_, element) => {
    const link = $(element).find('.s-item__link').attr('href') || '';
    const title = $(element).find('.s-item__title').first().text().trim();
    const priceText = $(element).find('.s-item__price').first().text().trim();

    if (!link || !title || title.toLowerCase().includes('shop on ebay')) {
      return;
    }

    const price = parsePrice(priceText);
    if (!Number.isFinite(price)) {
      return;
    }

    const description = $(element).find('.s-item__subtitle').first().text().trim();
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
