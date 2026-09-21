"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedSearchController = void 0;
const zod_1 = require("zod");
const prisma_js_1 = require("../config/prisma.js");
const savedSearchSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name is required (e.g., 3 BHK Delhi Under ₹80 Lakh)'),
    filters: zod_1.z.record(zod_1.z.any()),
    alertsActive: zod_1.z.boolean().optional().default(true),
});
class SavedSearchController {
    static async createSavedSearch(req, res) {
        if (!req.user)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const validated = savedSearchSchema.parse(req.body);
        const saved = await prisma_js_1.prisma.savedSearch.create({
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
    static async getMySavedSearches(req, res) {
        if (!req.user)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const searches = await prisma_js_1.prisma.savedSearch.findMany({
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
    static async toggleAlertStatus(req, res) {
        if (!req.user)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const id = req.params.id;
        const existing = await prisma_js_1.prisma.savedSearch.findUnique({ where: { id } });
        if (!existing || existing.userId !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Saved search not found' });
        }
        const updated = await prisma_js_1.prisma.savedSearch.update({
            where: { id },
            data: { alertsActive: !existing.alertsActive },
        });
        return res.json({
            success: true,
            message: `Alerts ${updated.alertsActive ? 'resumed' : 'paused'}.`,
            alertsActive: updated.alertsActive,
        });
    }
    static async deleteSavedSearch(req, res) {
        if (!req.user)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const id = req.params.id;
        const existing = await prisma_js_1.prisma.savedSearch.findUnique({ where: { id } });
        if (!existing || existing.userId !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Saved search not found' });
        }
        await prisma_js_1.prisma.savedSearch.delete({ where: { id } });
        return res.json({ success: true, message: 'Saved search deleted' });
    }
}
exports.SavedSearchController = SavedSearchController;
