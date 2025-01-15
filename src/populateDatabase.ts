import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const populateDatabase = async () => {
  try {
    // Create sample users
    const user1 = await prisma.user.create({
      data: {
        email: "user1@example.com",
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: "user2@example.com",
      },
    });

    // Create sample products
    const product1 = await prisma.product.create({
      data: {
        name: "Product 1",
        description: "Description for product 1",
        price: 100.0,
        category: "Category 1",
        brand: "Brand 1",
        features: { feature1: "value1", feature2: "value2" },
      },
    });

    const product2 = await prisma.product.create({
      data: {
        name: "Product 2",
        description: "Description for product 2",
        price: 200.0,
        category: "Category 2",
        brand: "Brand 2",
        features: { feature1: "value1", feature2: "value2" },
      },
    });

    // Create sample interactions
    await prisma.interaction.create({
      data: {
        userId: user1.id,
        productId: product1.id,
        type: "view",
      },
    });

    await prisma.interaction.create({
      data: {
        userId: user2.id,
        productId: product2.id,
        type: "purchase",
      },
    });

    console.log("Database populated successfully");
  } catch (error) {
    console.error("Error populating database:", error);
  } finally {
    await prisma.$disconnect();
  }
};

populateDatabase();