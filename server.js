// ℹ️ Loads environment variables from a .env file into process.env
try {
  process.loadEnvFile();
} catch (error) {
  console.warn(".env file not found, using default environment values");
}

// Imports Express (a Node.js framework for handling HTTP requests) and initializes the server
const express = require("express");
const app = express();
const router = require("./routes/index.routes");

// ℹ️ Loads and applies global middleware (CORS, JSON parsing, etc.) for server configurations
const config = require("./config");
config(app);

// ℹ️ Middleware that establishes a database connection. Ensures the connection is created on every request. Required for serverless deployments.
const connectDB = require("./db");
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// // 👇 Defines and applies route handlers

app.use("/api", router);

// ❗ Centralized error handling (must be placed after routes)
const handleErrors = require("./errors");

handleErrors(app);

// ℹ️ Defines the server port (default: 5005)
const PORT = process.env.PORT;

// ℹ️ Optional for serverless deployments like Vercel.
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server listening. Local access on http://localhost:${PORT}`);
  });
}

startServer();
