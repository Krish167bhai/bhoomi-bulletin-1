"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_js_1 = __importDefault(require("./auth.routes.js"));
const property_routes_js_1 = __importDefault(require("./property.routes.js"));
const propertyRequirement_routes_js_1 = __importDefault(require("./propertyRequirement.routes.js"));
const article_routes_js_1 = __importDefault(require("./article.routes.js"));
const enquiry_routes_js_1 = __importDefault(require("./enquiry.routes.js"));
const admin_routes_js_1 = __importDefault(require("./admin.routes.js"));
const review_routes_js_1 = __importDefault(require("./review.routes.js"));
const savedSearch_routes_js_1 = __importDefault(require("./savedSearch.routes.js"));
const upload_routes_js_1 = __importDefault(require("./upload.routes.js"));
const analytics_routes_js_1 = __importDefault(require("./analytics.routes.js"));
const settings_routes_js_1 = __importDefault(require("./settings.routes.js"));
const payment_routes_js_1 = __importDefault(require("./payment.routes.js"));
const notification_routes_js_1 = __importDefault(require("./notification.routes.js"));
const search_controller_js_1 = require("../controllers/search.controller.js");
const apiRouter = (0, express_1.Router)();
// Root API Welcome / Health route
apiRouter.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "Welcome to BHOOMI BULLETIN API",
        version: "1.0.0",
        health: "/api/health",
    });
});
apiRouter.use("/auth", auth_routes_js_1.default);
apiRouter.use("/properties", property_routes_js_1.default);
apiRouter.use("/property-requirements", propertyRequirement_routes_js_1.default);
apiRouter.use("/articles", article_routes_js_1.default);
apiRouter.use("/enquiries", enquiry_routes_js_1.default);
apiRouter.use("/admin", admin_routes_js_1.default);
apiRouter.use("/reviews", review_routes_js_1.default);
apiRouter.use("/saved-searches", savedSearch_routes_js_1.default);
apiRouter.use("/upload", upload_routes_js_1.default);
apiRouter.use("/analytics", analytics_routes_js_1.default);
apiRouter.use("/settings", settings_routes_js_1.default);
apiRouter.use("/payment", payment_routes_js_1.default);
apiRouter.use("/notifications", notification_routes_js_1.default);
apiRouter.get("/search", search_controller_js_1.SearchController.globalSearch);
exports.default = apiRouter;
