const coreNeeds = [
  {
    id: 'neutral-top-basic',
    category: 'top',
    preferredColors: ['white', 'black', 'grey', 'navy'],
    minCount: 4,
    reason: 'Neutral tops multiply outfit combinations and reduce repeat fatigue.'
  },
  {
    id: 'neutral-bottom-basic',
    category: 'bottom',
    preferredColors: ['black', 'grey', 'navy', 'beige'],
    minCount: 3,
    reason: 'Versatile bottoms anchor most daily outfits.'
  },
  {
    id: 'layering-piece',
    category: 'outerwear',
    preferredColors: ['black', 'grey', 'navy', 'olive'],
    minCount: 2,
    reason: 'Layering pieces increase weather and style flexibility.'
  },
  {
    id: 'everyday-shoes',
    category: 'shoes',
    preferredColors: ['white', 'black', 'brown'],
    minCount: 2,
    reason: 'Multiple practical shoe options improve comfort and outfit matching.'
  }
];

export function analyzeWardrobe(wardrobeItems) {
  const byCategory = wardrobeItems.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const gaps = coreNeeds
    .map((need) => {
      const categoryItems = byCategory[need.category] || [];
      const neutralCount = categoryItems.filter((item) =>
        need.preferredColors.includes(item.color.toLowerCase())
      ).length;

      const missingCount = Math.max(need.minCount - neutralCount, 0);
      if (!missingCount) {
        return null;
      }

      return {
        gapId: need.id,
        category: need.category,
        missingCount,
        preferredColors: need.preferredColors,
        reason: need.reason,
        priority: missingCount >= 2 ? 'high' : 'medium'
      };
    })
    .filter(Boolean);

  return {
    totalItems: wardrobeItems.length,
    categoryBreakdown: Object.fromEntries(
      Object.entries(byCategory).map(([category, items]) => [category, items.length])
    ),
    gaps
  };
}
