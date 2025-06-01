import { Request, Response } from 'express';

// Controller for health endpoints
export const healthController = {
  // Get health status
  getStatus: (req: Request, res: Response): void => {
    res.status(200).json({
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date()
    });
  }
};

export default healthController;
