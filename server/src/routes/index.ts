import { Router } from 'express';
import { healthRouter } from './health';
import { apiRouter } from './api';
import { authRouter } from './auth';
import launchPageRouter from './launch-page';

const routes = Router();

// Health check endpoint
routes.use('/health', healthRouter);

// Authentication endpoints
routes.use('/auth', authRouter);

// Launch page endpoints
routes.use('/launch-pages', launchPageRouter);

// API endpoints
routes.use('/v1', apiRouter);

export { routes };
