import { analyzeWardrobe } from './gapAnalysisService.js';
import { fetchListings as fetchScrapedListings } from './sources/webScraperAdapter.js';

export async function buildRecommendations(wardrobeItems, filters = {}) {
  const analysis = analyzeWardrobe(wardrobeItems);
  const recommendations = [];

  for (const gap of analysis.gaps) {
    const listings = await fetchScrapedListings({
      category: gap.category,
      budget: filters.budget,
      size: filters.size,
      color: filters.color
    });

    for (const listing of listings) {
      const compatibility = estimateCompatibility(wardrobeItems, listing);
      const versatilityBonus = ['black', 'white', 'grey', 'navy', 'beige', 'neutral'].includes(
        listing.color.toLowerCase()
      )
        ? 10
        : 0;
      const priceScore = Math.max(0, 100 - listing.price * 2);
      const gapPriorityScore = gap.priority === 'high' ? 25 : 10;

      const score = Math.round(compatibility * 0.45 + priceScore * 0.3 + versatilityBonus + gapPriorityScore);

      recommendations.push({
        ...listing,
        score,
        compatibility,
        gapFilled: `${gap.category} gap (${gap.missingCount} needed)`,
        explanation: `${listing.title} helps fill your ${gap.category} shortage. ${gap.reason}`
      });
    }
  }

  return recommendations.sort((a, b) => b.score - a.score).slice(0, 25);
}

function estimateCompatibility(wardrobeItems, listing) {
  const palette = wardrobeItems.map((item) => item.color.toLowerCase());

  const neutralColors = ['black', 'white', 'grey', 'navy', 'beige', 'neutral'];
  const isNeutral = neutralColors.includes(listing.color.toLowerCase());

  const matchingCount = palette.filter((tone) => tone === listing.color.toLowerCase()).length;
  const base = isNeutral ? 80 : 55;
  const bump = Math.min(20, matchingCount * 5);

  return Math.min(100, base + bump);
}
