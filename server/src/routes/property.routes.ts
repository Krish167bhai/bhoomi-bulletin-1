import { Router } from "express";
import { PropertyController } from "../controllers/property.controller.js";
import { authenticate, optionalAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Route dispatcher for GET / (handles both public listings and createdBy=me)
router.get("/", optionalAuth, (req, res) => {
  if (req.query.createdBy === "me") {
    return PropertyController.getMyProperties(req, res);
  }
  return PropertyController.getPublishedProperties(req, res);
});

// Public routes
router.get("/published", PropertyController.getPublishedProperties);
router.get("/compare", optionalAuth, PropertyController.compareProperties);
router.get("/slug/:slug", optionalAuth, PropertyController.getPropertyBySlug);

// Authenticated user routes
router.post("/submit", authenticate, PropertyController.submitProperty);
router.get("/my-properties", authenticate, PropertyController.getMyProperties);

// Favourites endpoints (matching both /favourites and /favourites/my)
router.post("/favourite/toggle", authenticate, PropertyController.toggleFavourite);
router.post("/:id/favourite", authenticate, (req, res) => {
  req.body.propertyId = req.params.id;
  return PropertyController.toggleFavourite(req, res);
});
router.delete("/:id/favourite", authenticate, (req, res) => {
  req.body.propertyId = req.params.id;
  return PropertyController.toggleFavourite(req, res);
});
router.get("/favourites", authenticate, PropertyController.getMyFavourites);
router.get("/favourites/my", authenticate, PropertyController.getMyFavourites);

// Property detail & delete by ID
router.get("/:id", optionalAuth, PropertyController.getPropertyBySlug);
router.delete("/:id", authenticate, PropertyController.deleteProperty);

export default router;
