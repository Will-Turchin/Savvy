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
  const normalizedItems = wardrobeItems.map(normalizeWardrobeItem);

  const byCategory = normalizedItems.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const gaps = coreNeeds
    .map((need) => {
      const categoryItems = byCategory[need.category] || [];
      const totalCount = categoryItems.length;
      const preferredColorCount = categoryItems.filter((item) =>
        need.preferredColors.includes(item.color.toLowerCase())
      ).length;

      const missingCount = Math.max(need.minCount - totalCount, 0);
      const missingPreferredColors = Math.max(need.minCount - preferredColorCount, 0);

      if (!missingCount) {
        if (!missingPreferredColors) {
          return null;
        }

        return {
          gapId: need.id,
          category: need.category,
          missingCount: 0,
          missingPreferredColors,
          preferredColors: need.preferredColors,
          reason: `${need.reason} You have enough ${need.category} pieces, but ${missingPreferredColors} more in versatile colors would improve outfit flexibility.`,
          priority: 'medium'
        };
      }

      return {
        gapId: need.id,
        category: need.category,
        missingCount,
        missingPreferredColors,
        preferredColors: need.preferredColors,
        reason:
          missingPreferredColors > missingCount
            ? `${need.reason} Neutral colors will make these additions easier to pair.`
            : need.reason,
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

function normalizeWardrobeItem(item) {
  return {
    ...item,
    category: normalizeCategory(item.category),
    color: normalizeColor(item.color)
  };
}

function normalizeCategory(category) {
  const normalized = String(category || '')
    .trim()
    .toLowerCase();

  const aliases = {
    tops: 'top',
    shirts: 'top',
    shirt: 'top',
    tees: 'top',
    tee: 'top',
    bottoms: 'bottom',
    pants: 'bottom',
    trousers: 'bottom',
    jeans: 'bottom',
    outerwears: 'outerwear',
    jackets: 'outerwear',
    jacket: 'outerwear',
    coats: 'outerwear',
    coat: 'outerwear',
    shoe: 'shoes',
    footwear: 'shoes',
    sneakers: 'shoes',
    boots: 'shoes'
  };

  return aliases[normalized] || normalized;
}

function normalizeColor(color) {
  const normalized = String(color || '')
    .trim()
    .toLowerCase();

  const aliases = {
    gray: 'grey',
    tan: 'beige'
  };

  return aliases[normalized] || normalized;
}
