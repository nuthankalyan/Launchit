import { Router } from 'express';
import { healthController } from '../controllers/health.controller';

const healthRouter = Router();

// Simple health check endpoint
healthRouter.get('/', healthController.getStatus);

export { healthRouter };
