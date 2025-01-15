import { gql } from "apollo-server-express";

export const typeDefs = gql`
  scalar JSON

  type User {
    id: ID!
    email: String!
    createdAt: String!
    updatedAt: String!
  }

  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    category: String!
    brand: String!
    features: JSON!
    createdAt: String!
    updatedAt: String!
  }

  type Interaction {
    id: ID!
    userId: String!
    productId: String!
    type: String!
    createdAt: String!
  }

  type Recommendation {
    product: Product!
    score: Float!
  }

  type Query {
    getRecommendations(userId: ID!, limit: Int): [Recommendation!]!
    getProducts(
      offset: Int
      limit: Int
      category: String
      brand: String
    ): [Product!]!
  }

  type Mutation {
    createInteraction(userId: ID!, productId: ID!, type: String!): Interaction!
    createUser(email: String!): User
  }
`;
