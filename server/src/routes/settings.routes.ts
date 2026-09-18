import { Router } from 'express';
import { SettingsService } from '../services/settings.service.js';

const router = Router();

// Public branding endpoint (for Header, Footer, Favicon)
router.get('/branding', async (_req, res) => {
  const branding = await SettingsService.getBranding();
  return res.json({ success: true, branding });
});

export default router;
