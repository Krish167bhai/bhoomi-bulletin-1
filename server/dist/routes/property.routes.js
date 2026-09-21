"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const property_controller_js_1 = require("../controllers/property.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// Route dispatcher for GET / (handles both public listings and createdBy=me)
router.get("/", auth_middleware_js_1.optionalAuth, (req, res) => {
    if (req.query.createdBy === "me") {
        return property_controller_js_1.PropertyController.getMyProperties(req, res);
    }
    return property_controller_js_1.PropertyController.getPublishedProperties(req, res);
});
// Public routes
router.get("/published", property_controller_js_1.PropertyController.getPublishedProperties);
router.get("/compare", auth_middleware_js_1.optionalAuth, property_controller_js_1.PropertyController.compareProperties);
router.get("/slug/:slug", auth_middleware_js_1.optionalAuth, property_controller_js_1.PropertyController.getPropertyBySlug);
// Authenticated user routes
router.post("/submit", auth_middleware_js_1.authenticate, property_controller_js_1.PropertyController.submitProperty);
router.get("/my-properties", auth_middleware_js_1.authenticate, property_controller_js_1.PropertyController.getMyProperties);
// Favourites endpoints (matching both /favourites and /favourites/my)
router.post("/favourite/toggle", auth_middleware_js_1.authenticate, property_controller_js_1.PropertyController.toggleFavourite);
router.post("/:id/favourite", auth_middleware_js_1.authenticate, (req, res) => {
    req.body.propertyId = req.params.id;
    return property_controller_js_1.PropertyController.toggleFavourite(req, res);
});
router.delete("/:id/favourite", auth_middleware_js_1.authenticate, (req, res) => {
    req.body.propertyId = req.params.id;
    return property_controller_js_1.PropertyController.toggleFavourite(req, res);
});
router.get("/favourites", auth_middleware_js_1.authenticate, property_controller_js_1.PropertyController.getMyFavourites);
router.get("/favourites/my", auth_middleware_js_1.authenticate, property_controller_js_1.PropertyController.getMyFavourites);
// Property detail & delete by ID
router.get("/:id", auth_middleware_js_1.optionalAuth, property_controller_js_1.PropertyController.getPropertyBySlug);
router.delete("/:id", auth_middleware_js_1.authenticate, property_controller_js_1.PropertyController.deleteProperty);
exports.default = router;
