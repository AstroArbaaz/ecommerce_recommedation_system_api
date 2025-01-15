import express from "express";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./types/graphql";
import { resolvers } from "./resolvers";
import cluster from "cluster";
import os from "os";

if (cluster.isPrimary) {
  // Get the number of available CPU cores
  const numCPUs = os.cpus().length;

  console.log(numCPUs);

  // Fork workers for each CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    // Fork a new worker if one dies
    cluster.fork();
  });
} else {
  const startServer = async () => {
    const app: any = express();

    // Create Apollo Server
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => {
        // Add authentication and context here
        
        return {
          // Add any necessary context
          success: true
        };
      },
    });

    // Start the Apollo Server
    await server.start();

    // Apply middleware
    server.applyMiddleware({ app });

    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {
      console.log(
        `Server running at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  };

  startServer();
}