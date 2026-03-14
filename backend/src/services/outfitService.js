const neutralColors = ['white', 'black', 'grey', 'navy', 'beige', 'brown', 'olive'];

export function buildOutfits(wardrobeItems) {
  const items = wardrobeItems.map(normalizeWardrobeItem);
  const byCategory = items.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const tops = byCategory.top || [];
  const bottoms = byCategory.bottom || [];
  const outerwear = byCategory.outerwear || [];
  const shoes = byCategory.shoes || [];

  if (tops.length === 0 || bottoms.length === 0) {
    return [];
  }

  const outfits = [];
  const seen = new Set();

  for (const top of tops) {
    for (const bottom of bottoms) {
      const shoeChoices = shoes.length > 0 ? [null, ...shoes] : [null];
      const outerwearChoices = outerwear.length > 0 ? [null, ...outerwear] : [null];

      for (const shoe of shoeChoices) {
        for (const layer of outerwearChoices) {
          const outfit = scoreOutfit({ top, bottom, shoes: shoe, outerwear: layer });
          const signature = [top.id, bottom.id, shoe?.id || 'none', layer?.id || 'none'].join(':');

          if (seen.has(signature)) {
            continue;
          }

          seen.add(signature);
          outfits.push(outfit);
        }
      }
    }
  }

  return outfits.sort((a, b) => b.score - a.score).slice(0, 8);
}

function scoreOutfit(pieces) {
  const outfitPieces = Object.entries(pieces)
    .filter(([, item]) => Boolean(item))
    .map(([role, item]) => ({ role, ...item }));

  const colors = outfitPieces.map((piece) => piece.color);
  const neutralCount = colors.filter((color) => neutralColors.includes(color)).length;
  const uniqueFormalities = new Set(outfitPieces.map((piece) => piece.formality));
  const allSeasons = outfitPieces.map((piece) => piece.season);
  const versatilePalette = uniqueFormalities.size === 1;
  const seasonMatch = scoreSeasonConsistency(allSeasons);
  const textureScore = outfitPieces.some((piece) => piece.formality === 'smart-casual') ? 8 : 0;
  const completeLookBonus = pieces.shoes ? 12 : 0;
  const layeringBonus = pieces.outerwear ? 10 : 0;
  const neutralBonus = neutralCount >= 2 ? 18 : neutralCount * 6;
  const formalityBonus = versatilePalette ? 14 : 4;

  const score = Math.round(52 + neutralBonus + formalityBonus + seasonMatch + textureScore + completeLookBonus + layeringBonus);

  return {
    id: `outfit-${outfitPieces.map((piece) => piece.id).join('-')}`,
    score,
    title: buildOutfitTitle(pieces),
    explanation: buildOutfitExplanation({ pieces, neutralCount, versatilePalette, seasonMatch }),
    pieces: {
      top: pickDisplayFields(pieces.top),
      bottom: pickDisplayFields(pieces.bottom),
      outerwear: pickDisplayFields(pieces.outerwear),
      shoes: pickDisplayFields(pieces.shoes)
    }
  };
}

function buildOutfitTitle({ top, bottom, outerwear, shoes }) {
  const outfitType = outerwear ? 'Layered daily outfit' : 'Core everyday outfit';
  const footing = shoes ? ` with ${shoes.name}` : '';
  return `${outfitType}: ${top.name} + ${bottom.name}${footing}`;
}

function buildOutfitExplanation({ pieces, neutralCount, versatilePalette, seasonMatch }) {
  const reasons = [];

  if (neutralCount >= 2) {
    reasons.push('The palette stays grounded with versatile neutral tones.');
  } else {
    reasons.push('The colors still work because one piece anchors the outfit while the other adds contrast.');
  }

  if (versatilePalette) {
    reasons.push('All pieces sit in the same formality lane, so the outfit feels intentional.');
  } else {
    reasons.push('The mix of formality still works because the silhouette stays simple and balanced.');
  }

  if (seasonMatch >= 10) {
    reasons.push('These pieces share a strong seasonal overlap, so the outfit makes sense to wear together.');
  }

  if (pieces.outerwear) {
    reasons.push(`${pieces.outerwear.name} adds structure and makes the outfit feel finished.`);
  }

  if (pieces.shoes) {
    reasons.push(`${pieces.shoes.name} grounds the outfit and completes the look.`);
  }

  return reasons.join(' ');
}

function scoreSeasonConsistency(seasons) {
  const unique = new Set(seasons.filter((season) => season !== 'all'));
  if (unique.size === 0 || unique.size === 1) {
    return 14;
  }

  if (unique.size === 2) {
    return 8;
  }

  return 2;
}

function pickDisplayFields(item) {
  if (!item) {
    return null;
  }

  return {
    id: item.id,
    name: item.name,
    color: item.color,
    size: item.size,
    season: item.season,
    formality: item.formality
  };
}

function normalizeWardrobeItem(item) {
  return {
    ...item,
    category: normalizeCategory(item.category),
    color: normalizeColor(item.color),
    season: String(item.season || 'all').trim().toLowerCase(),
    formality: String(item.formality || 'casual').trim().toLowerCase()
  };
}

function normalizeCategory(category) {
  const normalized = String(category || '')
    .trim()
    .toLowerCase();

  const aliases = {
    shirt: 'top',
    shirts: 'top',
    tops: 'top',
    tee: 'top',
    tees: 'top',
    pants: 'bottom',
    trousers: 'bottom',
    jeans: 'bottom',
    jacket: 'outerwear',
    jackets: 'outerwear',
    coat: 'outerwear',
    coats: 'outerwear',
    shoe: 'shoes',
    sneakers: 'shoes',
    boots: 'shoes'
  };

  return aliases[normalized] || normalized;
}

function normalizeColor(color) {
  const normalized = String(color || '')
    .trim()
    .toLowerCase();

  if (normalized === 'gray') {
    return 'grey';
  }

  if (normalized === 'tan') {
    return 'beige';
  }

  return normalized || 'neutral';
}
