import { Request, Response } from 'express';
import { launchPageService } from '../services/launch-page.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export const launchPageController = {
  // Create a new launch page
  createLaunchPage: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { name, description, tagline } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!name || !name.trim()) {
        res.status(400).json({
          success: false,
          message: 'Project name is required'
        });
        return;
      }

      const launchPage = await launchPageService.createLaunchPage({
        userId,
        name: name.trim(),
        description: description?.trim(),
        tagline: tagline?.trim()
      });

      res.status(201).json({
        success: true,
        data: launchPage
      });
    } catch (error: any) {
      console.error('Error creating launch page:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create launch page',
        error: error.message
      });
    }
  },

  // Get a specific launch page by ID
  getLaunchPage: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const launchPage = await launchPageService.getLaunchPage(id);

      if (!launchPage) {
        res.status(404).json({
          success: false,
          message: 'Launch page not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: launchPage
      });
    } catch (error: any) {
      console.error('Error fetching launch page:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch launch page',
        error: error.message
      });
    }
  },
  // Get launch page HTML content
  getLaunchPageHtml: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const launchPage = await launchPageService.getLaunchPage(id);

      if (!launchPage) {
        res.status(404).send('<html><body><h1>Page not found</h1></body></html>');
        return;
      }

      // Set headers to allow iframe embedding
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Allow embedding from same origin
      res.removeHeader('X-Frame-Options'); // Remove default helmet X-Frame-Options
      res.setHeader('Content-Security-Policy', `
        default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: *;
        frame-ancestors 'self' localhost:3000 localhost:5000;
        script-src 'self' 'unsafe-inline' 'unsafe-eval' *;
        style-src 'self' 'unsafe-inline' *;
        img-src 'self' data: blob: *;
        font-src 'self' data: *;
        connect-src 'self' *;
      `.replace(/\s+/g, ' ').trim());

      if (launchPage.status === 'generating') {
        res.status(202).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Generating ${launchPage.name}...</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
              .loader { text-align: center; }
              .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
            <meta http-equiv="refresh" content="3">
          </head>
          <body>
            <div class="loader">
              <div class="spinner"></div>
              <h2>Generating your launch page...</h2>
              <p>Please wait while we create something amazing for "${launchPage.name}"</p>
            </div>
          </body>
          </html>
        `);
        return;
      }

      if (launchPage.status === 'error') {
        res.status(500).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Error - ${launchPage.name}</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
              .error { text-align: center; color: #e74c3c; }
            </style>
          </head>
          <body>
            <div class="error">
              <h1>🚫 Generation Failed</h1>
              <p>Sorry, we couldn't generate your launch page. Please try again later.</p>
            </div>
          </body>
          </html>
        `);
        return;
      }

      res.status(200).send(launchPage.htmlContent);
    } catch (error: any) {
      console.error('Error serving launch page HTML:', error);
      res.status(500).send('<html><body><h1>Server Error</h1></body></html>');
    }
  },

  // Get all launch pages for the authenticated user
  getUserLaunchPages: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const launchPages = await launchPageService.getUserLaunchPages(userId);

      res.status(200).json({
        success: true,
        data: launchPages
      });
    } catch (error: any) {
      console.error('Error fetching user launch pages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch launch pages',
        error: error.message
      });
    }
  },

  // Update a launch page
  updateLaunchPage: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, tagline } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      // Check if the launch page exists and belongs to the user
      const existingPage = await launchPageService.getLaunchPage(id);
      if (!existingPage) {
        res.status(404).json({
          success: false,
          message: 'Launch page not found'
        });
        return;
      }

      if (existingPage.userId !== userId) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      const updates: any = {};
      if (name !== undefined) updates.name = name.trim();
      if (description !== undefined) updates.description = description?.trim();
      if (tagline !== undefined) updates.tagline = tagline?.trim();

      const updatedPage = await launchPageService.updateLaunchPage(id, updates);

      res.status(200).json({
        success: true,
        data: updatedPage
      });
    } catch (error: any) {
      console.error('Error updating launch page:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update launch page',
        error: error.message
      });
    }
  },

  // Delete a launch page
  deleteLaunchPage: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      // Check if the launch page exists and belongs to the user
      const existingPage = await launchPageService.getLaunchPage(id);
      if (!existingPage) {
        res.status(404).json({
          success: false,
          message: 'Launch page not found'
        });
        return;
      }

      if (existingPage.userId !== userId) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      const deleted = await launchPageService.deleteLaunchPage(id);

      if (deleted) {
        res.status(200).json({
          success: true,
          message: 'Launch page deleted successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to delete launch page'
        });
      }
    } catch (error: any) {
      console.error('Error deleting launch page:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete launch page',
        error: error.message
      });
    }
  },

  // Regenerate a launch page
  regenerateLaunchPage: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      // Check if the launch page exists and belongs to the user
      const existingPage = await launchPageService.getLaunchPage(id);
      if (!existingPage) {
        res.status(404).json({
          success: false,
          message: 'Launch page not found'
        });
        return;
      }

      if (existingPage.userId !== userId) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      const regeneratedPage = await launchPageService.regenerateLaunchPage(id);

      res.status(200).json({
        success: true,
        data: regeneratedPage
      });
    } catch (error: any) {
      console.error('Error regenerating launch page:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to regenerate launch page',
        error: error.message
      });
    }
  },

  // Publish a launch page
  publishLaunchPage: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { slug } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      // Validate slug
      if (!slug || typeof slug !== 'string' || slug.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'Valid URL slug is required'
        });
        return;
      }

      // Process the slug: lowercase, remove special chars, replace spaces with hyphens
      const processedSlug = slug.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      
      // Check if page exists and belongs to the user
      const existingPage = await launchPageService.getLaunchPage(id);
      if (!existingPage) {
        res.status(404).json({
          success: false,
          message: 'Launch page not found'
        });
        return;
      }

      if (existingPage.userId !== userId) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      // Ensure the page is in a publishable state
      if (existingPage.status !== 'generated') {
        res.status(400).json({
          success: false,
          message: 'Only generated pages can be published'
        });
        return;
      }

      // Publish the page
      try {
        const publishedPage = await launchPageService.publishLaunchPage(id, processedSlug);
        
        res.status(200).json({
          success: true,
          data: publishedPage,
          message: 'Launch page published successfully'
        });
      } catch (error: any) {
        // This will catch the error if slug is already taken
        res.status(400).json({
          success: false,
          message: error.message
        });
      }
    } catch (error: any) {
      console.error('Error publishing launch page:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to publish launch page',
        error: error.message
      });
    }
  },

  // Get a published launch page by slug
  getPublishedPage: async (req: Request, res: Response): Promise<void> => {
    try {
      const { slug } = req.params;
      
      const launchPage = await launchPageService.getPublishedPageBySlug(slug);

      if (!launchPage) {
        res.status(404).send('<html><body><h1>Published page not found</h1></body></html>');
        return;
      }

      // Set headers to ensure proper rendering
      res.setHeader('Content-Type', 'text/html');
      
      // Send the HTML content
      res.status(200).send(launchPage.htmlContent);
    } catch (error: any) {
      console.error('Error serving published page:', error);
      res.status(500).send('<html><body><h1>Server Error</h1></body></html>');
    }
  }
};
