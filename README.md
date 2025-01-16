# E-commerce Recommendation System API

## Overview
This project is an E-commerce Recommendation System API designed to provide personalized product recommendations to users based on their browsing and purchase history.

## Prerequisites
Before you begin, ensure you have met the following requirements:
- You have installed Node.js and npm.
- You have a Postgresql instance running.
- You have a modern web browser.
- You have a Redis instance running. (if not you can run redis using the docker compose command!)
```bash
docker compose up --build -d
```

## Installation
1. Clone the repository:
  ```bash
  git clone https://github.com/yourusername/ecommerce_recommendation_system_api.git
  ```
2. Navigate to the project directory:
  ```bash
  cd ecommerce_recommendation_system_api
  ```
3. Install dependencies:
  ```bash
  npm install
  ```

## Usage
1. Populate the Database:
```bash
npm run seed
```
2. Start the server:
  ```bash
  npm start
  ```
3. Build the project:
  ```bash
  npm run build
  ```
4. Start the Dev Server:
```bash
npm run dev
```
5. Migrate Database for dev:
```bash
npm run prisma:migrate
```
6. Migrate Databse for deployment:
```bash
npm run prisma:deploy
```
7. Access the API at `http://localhost:4000/graphql`.

## API Endpoints
You can refer the queryExamples.txt file for reference.