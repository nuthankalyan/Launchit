import { Router } from 'express';
import { launchPageController } from '../controllers/launch-page.controller';
import { auth } from '../middleware/auth';

const router = Router();

// Protected routes (require authentication)
router.post('/', auth, launchPageController.createLaunchPage);
router.get('/user', auth, launchPageController.getUserLaunchPages);
router.get('/:id', launchPageController.getLaunchPage);
router.put('/:id', auth, launchPageController.updateLaunchPage);
router.delete('/:id', auth, launchPageController.deleteLaunchPage);
router.post('/:id/regenerate', auth, launchPageController.regenerateLaunchPage);
router.post('/:id/publish', auth, launchPageController.publishLaunchPage);

// Public routes for serving HTML content
router.get('/:id/preview', launchPageController.getLaunchPageHtml);
router.get('/published/:slug', launchPageController.getPublishedPage);

export { router as launchPageRouter };
export default router;
