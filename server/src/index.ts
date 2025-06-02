import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { routes } from './routes';
import { requestLogger, errorHandler, notFound } from './middleware/index';
import { config, isDevelopment } from './utils/config';
import { connectDatabase } from './utils/database';

// Load environment variables
dotenv.config();

// Connect to CockroachDB
connectDatabase();

// Create Express server
const app = express();

// Import the LaunchPage controller for the published pages route
import { launchPageController } from './controllers/launch-page.controller';

// Set port
const PORT = config.server.port;

// Middleware
app.use(helmet({
  contentSecurityPolicy: isDevelopment() ? false : {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      frameSrc: ["'self'"],
      frameAncestors: ["'self'", "localhost:3000"]
    }
  },
  crossOriginEmbedderPolicy: false
})); // Security headers with relaxed CSP for development
app.use(cors({
  origin: config.cors.origin,
  credentials: true
})); // Enable CORS
app.use(morgan(isDevelopment() ? 'dev' : 'combined')); // Logging
app.use(requestLogger); // Custom request logger
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API Routes
app.use('/api', routes);

// 404 Not Found handler for undefined routes
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
