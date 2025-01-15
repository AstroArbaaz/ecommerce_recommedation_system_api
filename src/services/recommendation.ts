import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import { calculateSimilarity } from "../utils/similarity";

const prisma = new PrismaClient();
const redis = new Redis({
  port: 6379,
  host: "localhost",
  // password: process.env.REDIS_PASSWORD,
});

const CACHE_TTL = 3600; // 1 hour
const CACHE_PREFIXES = {
  USER_RECOMMENDATIONS: "user:rec:",
  PRODUCT_FEATURES: "prod:feat:",
  SIMILARITY_MATRIX: "sim:matrix:",
  USER_PROFILE: "user:prof:",
};

export const getFromCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Cache read error:", error);
    return null;
  }
};

export const setCache = async (key: string, value: any, ttl: number = CACHE_TTL): Promise<void> => {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error("Cache write error:", error);
  }
};

export const invalidateCache = async (pattern: string): Promise<void> => {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};

export const getRecommendations = async (userId: string, limit: number = 10): Promise<any[]> => {
  const cacheKey = `recommendations:${userId}`;

  // Try to get from cache first
  const cachedRecommendations = await redis.get(cacheKey);
  if (cachedRecommendations) {
    return JSON.parse(cachedRecommendations);
  }

  // If not in cache, compute recommendations
  const recommendations = await computeRecommendations(userId, limit);

  // Cache the results
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(recommendations));

  return recommendations;
};

export const computeRecommendations = async (userId: string, limit: number): Promise<any[]> => {
  // Get user's interaction history
  const userInteractions = await prisma.interaction.findMany({
    where: { userId },
    include: { product: true },
  });

  // Get all products
  const allProducts = await prisma.product.findMany();

  // Compute collaborative filtering scores
  const cfScores = await computeCollaborativeFilteringScores(userId, allProducts);

  // Compute content-based filtering scores
  const cbfScores = await computeContentBasedFilteringScores(userInteractions, allProducts);

  // Combine scores with weighted average
  const recommendations = allProducts.map((product) => ({
    product,
    score: 0.7 * (cfScores[product.id] || 0) + 0.3 * (cbfScores[product.id] || 0),
  }));

  // Sort by score and return top N
  return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
};

export const computeCollaborativeFilteringScores = async (userId: string, products: any[]): Promise<Record<string, number>> => {
  // Get similar users based on interaction patterns
  const similarUsers = await findSimilarUsers(userId);

  // Get products liked by similar users
  const scores: Record<string, number> = {};

  for (const product of products) {
    let score = 0;
    for (const similarUser of similarUsers) {
      const interactions = await prisma.interaction.findMany({
        where: {
          userId: similarUser.id,
          productId: product.id,
        },
      });

      score += interactions.length * similarUser.similarity;
    }
    scores[product.id] = score;
  }

  return scores;
};

export const computeContentBasedFilteringScores = async (userInteractions: any[], products: any[]): Promise<Record<string, number>> => {
  const scores: Record<string, number> = {};

  // Create user profile based on interaction history
  const userProfile = createUserProfile(userInteractions);

  // Compare each product with user profile
  for (const product of products) {
    scores[product.id] = calculateSimilarity(userProfile, product.features);
  }

  return scores;
};

export const findSimilarUsers = async (userId: string): Promise<any[]> => {
  const allUsers = await prisma.user.findMany({
    where: { NOT: { id: userId } },
  });

  const similarities = await Promise.all(
    allUsers.map(async (user) => {
      const similarity = await calculateUserSimilarity(userId, user.id);
      return { id: user.id, similarity };
    })
  );

  return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 10);
};

export const createUserProfile = (interactions: any[]): Record<string, number> => {
  const profile: Record<string, number> = {};

  for (const interaction of interactions) {
    const { product } = interaction;
    const weight = interaction.type === "purchase" ? 3 : 1;

    Object.entries(product.features).forEach(([feature, value]) => {
      if (typeof value === "number") {
        profile[feature] = (profile[feature] || 0) + value * weight;
      }
    });
  }

  return profile;
};

export const calculateUserSimilarity = async (user1Id: string, user2Id: string): Promise<number> => {
  const user1Interactions = await prisma.interaction.findMany({
    where: { userId: user1Id },
  });

  const user2Interactions = await prisma.interaction.findMany({
    where: { userId: user2Id },
  });

  const user1Products = new Set(user1Interactions.map((i) => i.productId));
  const user2Products = new Set(user2Interactions.map((i) => i.productId));

  const intersection = new Set([...user1Products].filter((x) => user2Products.has(x)));

  return intersection.size / Math.sqrt(user1Products.size * user2Products.size);
};

// export {
//   getRecommendations,
//   computeRecommendations,
//   computeCollaborativeFilteringScores,
//   computeContentBasedFilteringScores,
//   findSimilarUsers,
//   createUserProfile,
//   calculateUserSimilarity,
//   getFromCache,
//   setCache,
//   invalidateCache,
// };
