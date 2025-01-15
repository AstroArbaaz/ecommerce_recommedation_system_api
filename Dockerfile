# Stage 1: Build the application
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# initialize the database
RUN npm run prisma:generate

# Deploy the prisma migration
RUN npx prisma migrate dev --name testing --preview-feature

# Build the application
RUN npm run build

# Stage 2: Create the production image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only the built files and necessary files from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/package-lock.json ./

# Install only production dependencies
RUN npm install --only=production

# Deploy the prisma migration only in production
RUN npm run prisma:migrate --only=production

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application
CMD ["node", "dist/server.js"]