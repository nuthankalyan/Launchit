import { Router } from 'express';
import { apiController } from '../controllers/api.controller';
import { validateItemData, validateItemId } from '../middleware/validation';

const apiRouter = Router();

// Welcome endpoint
apiRouter.get('/', apiController.getWelcome);

// Items endpoints
apiRouter.get('/items', apiController.getAllItems);
apiRouter.get('/items/:id', validateItemId, apiController.getItem);
apiRouter.post('/items', validateItemData, apiController.createItem);
apiRouter.put('/items/:id', validateItemId, validateItemData, apiController.updateItem);
apiRouter.delete('/items/:id', validateItemId, apiController.deleteItem);

export { apiRouter };
