import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';

const savedSearchSchema = z.object({
  name: z.string().min(2, 'Name is required (e.g., 3 BHK Delhi Under ₹80 Lakh)'),
  filters: z.record(z.any()),
  alertsActive: z.boolean().optional().default(true),
});

export class SavedSearchController {
  static async createSavedSearch(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const validated = savedSearchSchema.parse(req.body);

    const saved = await prisma.savedSearch.create({
      data: {
        userId: req.user.id,
        name: validated.name,
        filters: JSON.stringify(validated.filters),
        alertsActive: validated.alertsActive,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Search and alert preferences saved successfully!',
      savedSearch: saved,
    });
  }

  static async getMySavedSearches(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const searches = await prisma.savedSearch.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      searches: searches.map((s) => ({
        ...s,
        filters: JSON.parse(s.filters || '{}'),
      })),
    });
  }

  static async toggleAlertStatus(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const id = req.params.id as string;

    const existing = await prisma.savedSearch.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Saved search not found' });
    }

    const updated = await prisma.savedSearch.update({
      where: { id },
      data: { alertsActive: !existing.alertsActive },
    });

    return res.json({
      success: true,
      message: `Alerts ${updated.alertsActive ? 'resumed' : 'paused'}.`,
      alertsActive: updated.alertsActive,
    });
  }

  static async deleteSavedSearch(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const id = req.params.id as string;

    const existing = await prisma.savedSearch.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Saved search not found' });
    }

    await prisma.savedSearch.delete({ where: { id } });
    return res.json({ success: true, message: 'Saved search deleted' });
  }
}
