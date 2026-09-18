import { Router } from "express";
import authRoutes from "./auth.routes.js";
import propertyRoutes from "./property.routes.js";
import propertyRequirementRoutes from "./propertyRequirement.routes.js";
import articleRoutes from "./article.routes.js";
import enquiryRoutes from "./enquiry.routes.js";
import adminRoutes from "./admin.routes.js";
import reviewRoutes from "./review.routes.js";
import savedSearchRoutes from "./savedSearch.routes.js";
import uploadRoutes from "./upload.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import settingsRoutes from "./settings.routes.js";
import paymentRoutes from "./payment.routes.js";
import notificationRoutes from "./notification.routes.js";
import { SearchController } from "../controllers/search.controller.js";

const apiRouter = Router();

// Root API Welcome / Health route
apiRouter.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Welcome to BHOOMI BULLETIN API",
    version: "1.0.0",
    health: "/api/health",
  });
});

apiRouter.use("/auth", authRoutes);
apiRouter.use("/properties", propertyRoutes);
apiRouter.use("/property-requirements", propertyRequirementRoutes);
apiRouter.use("/articles", articleRoutes);
apiRouter.use("/enquiries", enquiryRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/reviews", reviewRoutes);
apiRouter.use("/saved-searches", savedSearchRoutes);
apiRouter.use("/upload", uploadRoutes);
apiRouter.use("/analytics", analyticsRoutes);
apiRouter.use("/settings", settingsRoutes);
apiRouter.use("/payment", paymentRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.get("/search", SearchController.globalSearch);

export default apiRouter;
