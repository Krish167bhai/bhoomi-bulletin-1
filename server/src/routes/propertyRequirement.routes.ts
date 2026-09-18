import { Router } from "express";
import { PropertyRequirementController } from "../controllers/propertyRequirement.controller.js";
import { authenticate, optionalAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", optionalAuth, PropertyRequirementController.createRequirement);
router.get("/", optionalAuth, PropertyRequirementController.getRequirements);
router.delete("/:id", authenticate, PropertyRequirementController.deleteRequirement);

export default router;
