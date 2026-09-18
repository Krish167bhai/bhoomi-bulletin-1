import { Router } from 'express';
import { SavedSearchController } from '../controllers/savedSearch.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', SavedSearchController.createSavedSearch);
router.get('/my', SavedSearchController.getMySavedSearches);
router.patch('/:id/toggle-alerts', SavedSearchController.toggleAlertStatus);
router.delete('/:id', SavedSearchController.deleteSavedSearch);

export default router;
