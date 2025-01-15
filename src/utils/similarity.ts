export function calculateSimilarity(
  profile1: Record<string, number>,
  profile2: Record<string, number>
): number {
  const features = new Set([
    ...Object.keys(profile1),
    ...Object.keys(profile2),
  ]);

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (const feature of features) {
    const value1 = profile1[feature] || 0;
    const value2 = profile2[feature] || 0;

    dotProduct += value1 * value2;
    norm1 += value1 * value1;
    norm2 += value2 * value2;
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}