"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyRequirementController = void 0;
const prisma_js_1 = require("../config/prisma.js");
class PropertyRequirementController {
    static async createRequirement(req, res) {
        try {
            const { name, email, phone, type, propertyType, preferredLocation, budgetMin, budgetMax, preferredSize, additionalDetails } = req.body;
            const requirement = await prisma_js_1.prisma.propertyRequirement.create({
                data: {
                    userId: req.user?.id || null,
                    name: name || req.user?.name || "Anonymous",
                    email: email || req.user?.email || "",
                    phone: phone || req.user?.phone || "",
                    type: type || "BUY",
                    propertyType: propertyType || "APARTMENT",
                    preferredLocation: preferredLocation || "Not specified",
                    budgetMin: budgetMin ? parseFloat(budgetMin) : null,
                    budgetMax: budgetMax ? parseFloat(budgetMax) : null,
                    preferredSize: preferredSize || null,
                    additionalDetails: additionalDetails || null,
                },
            });
            return res.status(201).json({ success: true, message: "Requirement submitted successfully", requirement });
        }
        catch (err) {
            return res.status(400).json({ success: false, message: err.message || "Failed to submit requirement" });
        }
    }
    static async getRequirements(req, res) {
        try {
            const { mine } = req.query;
            const where = {};
            if (mine === "true" && req.user) {
                where.userId = req.user.id;
            }
            const requirements = await prisma_js_1.prisma.propertyRequirement.findMany({
                where,
                orderBy: { createdAt: "desc" },
            });
            return res.json({ success: true, data: requirements, requirements });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
    static async deleteRequirement(req, res) {
        try {
            if (!req.user)
                return res.status(401).json({ success: false, message: "Unauthorized" });
            const { id } = req.params;
            const requirement = await prisma_js_1.prisma.propertyRequirement.findUnique({ where: { id: id } });
            if (!requirement)
                return res.status(404).json({ success: false, message: "Requirement not found" });
            if (requirement.userId !== req.user.id && req.user.role !== "ADMIN") {
                return res.status(403).json({ success: false, message: "Forbidden" });
            }
            await prisma_js_1.prisma.propertyRequirement.delete({ where: { id: id } });
            return res.json({ success: true, message: "Requirement deleted successfully" });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
}
exports.PropertyRequirementController = PropertyRequirementController;
