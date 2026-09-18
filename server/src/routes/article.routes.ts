import { Router } from 'express';
import { ArticleController } from '../controllers/article.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/published', ArticleController.getPublishedArticles);
router.get('/videos', ArticleController.getVideoNews);
router.get('/slug/:slug', optionalAuth, ArticleController.getArticleBySlug);

export default router;
