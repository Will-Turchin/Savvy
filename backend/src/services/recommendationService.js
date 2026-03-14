import { analyzeWardrobe } from './gapAnalysisService.js';
import { fetchListings as fetchScrapedListings, streamListings as streamScrapedListings } from './sources/webScraperAdapter.js';

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
      recommendations.push(scoreRecommendation(wardrobeItems, listing, gap, filters.budget));
    }
  }

  return recommendations.sort((a, b) => b.score - a.score).slice(0, 25);
}

export async function streamRecommendations(wardrobeItems, filters = {}, onBatch) {
  const analysis = analyzeWardrobe(wardrobeItems);
  const recommendations = [];
  const gaps = filters.category
    ? analysis.gaps.filter((gap) => gap.category === filters.category)
    : analysis.gaps;

  async function onBatchWrapper(gap, listings) {
    const scoredBatch = listings.map((listing) => scoreRecommendation(wardrobeItems, listing, gap, filters.budget));
    recommendations.push(...scoredBatch);
    onBatch?.(scoredBatch.sort((a, b) => b.score - a.score));
  }

  await Promise.all(
    gaps.map((gap) =>
      streamScrapedListings({
        category: gap.category,
        budget: filters.budget,
        size: filters.size,
        color: filters.color,
        onBatch: (listings) => onBatchWrapper(gap, listings)
      })
    )
  );

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

function scoreRecommendation(wardrobeItems, listing, gap, budget) {
  const compatibility = estimateCompatibility(wardrobeItems, listing);
  const versatilityBonus = ['black', 'white', 'grey', 'navy', 'beige', 'neutral'].includes(
    listing.color.toLowerCase()
  )
    ? 10
    : 0;
  const priceScore = estimatePriceScore(listing.price, budget);
  const qualityScore = estimateQualityScore(listing);
  const gapPriorityScore = gap.priority === 'high' ? 25 : 10;

  const score = Math.round(
    compatibility * 0.35 + priceScore * 0.25 + qualityScore * 0.2 + versatilityBonus + gapPriorityScore
  );

  return {
    ...listing,
    score,
    compatibility,
    qualityScore,
    gapFilled: `${gap.category} gap (${gap.missingCount} needed)`,
    explanation: buildRecommendationExplanation(listing, gap, budget)
  };
}

function estimatePriceScore(price, budget) {
  if (!budget) {
    if (price < 12) {
      return 20;
    }

    if (price <= 60) {
      return 80;
    }

    return Math.max(35, 85 - (price - 60));
  }

  const target = budget * 0.8;
  const distance = Math.abs(price - target);
  const normalizedPenalty = Math.min(70, (distance / Math.max(budget, 1)) * 100);
  const lowPricePenalty = price < budget * 0.35 ? 20 : 0;

  return Math.max(10, Math.round(100 - normalizedPenalty - lowPricePenalty));
}

function estimateQualityScore(listing) {
  const text = `${listing.title} ${listing.description}`.toLowerCase();
  let score = 55;

  const positiveSignals = ['wool', 'leather', 'suede', 'oxford', 'merino', 'linen', 'cashmere', 'made in'];
  const negativeSignals = ['damaged', 'distressed', 'parts', 'repair', 'replacement', 'insert', 'insole'];

  for (const token of positiveSignals) {
    if (text.includes(token)) {
      score += 8;
    }
  }

  for (const token of negativeSignals) {
    if (text.includes(token)) {
      score -= 18;
    }
  }

  if (text.includes('new') || text.includes('nwt')) {
    score += 6;
  }

  if (listing.price < 10) {
    score -= 20;
  }

  return Math.max(10, Math.min(95, score));
}

function buildRecommendationExplanation(listing, gap, budget) {
  const budgetNote = budget
    ? `${listing.price <= budget ? 'It stays within' : 'It stretches'} your $${budget} budget and lands closer to a considered purchase than a throwaway pick.`
    : 'It looks more like a deliberate wardrobe piece than a rock-bottom filler item.';

  return `${listing.title} helps fill your ${gap.category} shortage. ${gap.reason} ${budgetNote}`;
}
