import * as recommendationService from "../services/recommendation";
import { PrismaClient } from "@prisma/client";
import GraphQLJSON from "graphql-type-json";

const prisma = new PrismaClient();

export const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    getRecommendations: async (
      _: any,
      { userId, limit }: { userId: string; limit?: number }
    ) => {
      return recommendationService.getRecommendations(userId, limit);
    },

    getProducts: async (
      _: any,
      {
        offset = 0,
        limit = 10,
        category,
        brand,
      }: {
        offset?: number;
        limit?: number;
        category?: string;
        brand?: string;
      }
    ) => {
      return prisma.product.findMany({
        where: {
          ...(category && { category }),
          ...(brand && { brand }),
        },
        skip: offset,
        take: limit,
      });
    },
  },

  Mutation: {
    createInteraction: async (
      _: any,
      {
        userId,
        productId,
        type,
      }: { userId: string; productId: string; type: string }
    ) => {
      return prisma.interaction.create({
        data: {
          userId,
          productId,
          type,
        },
      });
    },

    createUser: async (
      _: any,
      { email }: { email: string }
    ) => {
      return prisma.user.create({
        data: {
          email,
        },
      });
    },
  },
};
