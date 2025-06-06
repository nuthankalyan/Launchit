import { Router } from 'express';
import { launchPageController } from '../controllers/launch-page.controller';
import { auth } from '../middleware/auth';

const router = Router();

// Public routes for fetching published pages - must come before /:id routes
router.get('/published', launchPageController.getAllPublishedPages);
router.get('/published/:slug', launchPageController.getPublishedPage);

// Protected routes (require authentication)
router.post('/', auth, launchPageController.createLaunchPage);
router.get('/user', auth, launchPageController.getUserLaunchPages);
router.get('/:id', launchPageController.getLaunchPage);
router.put('/:id', auth, launchPageController.updateLaunchPage);
router.delete('/:id', auth, launchPageController.deleteLaunchPage);
router.post('/:id/regenerate', auth, launchPageController.regenerateLaunchPage);
router.post('/:id/publish', auth, launchPageController.publishLaunchPage);

// Public route for preview
router.get('/:id/preview', launchPageController.getLaunchPageHtml);

export { router as launchPageRouter };
export default router;
