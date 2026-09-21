"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_js_1 = require("./config/env.js");
const index_js_1 = __importDefault(require("./routes/index.js"));
const error_middleware_js_1 = require("./middleware/error.middleware.js");
const rateLimiter_js_1 = require("./middleware/rateLimiter.js");
const handlers_js_1 = require("./events/handlers.js");
const adExpiry_job_js_1 = require("./jobs/adExpiry.job.js");
const prisma_js_1 = require("./config/prisma.js");
const auto_seed_js_1 = require("./prisma/auto-seed.js");
const app = (0, express_1.default)();
// Security and utility middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows images/videos to be loaded in frontend
}));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow same-origin (no origin header) and configured origins
        if (!origin || origin === env_js_1.ENV.CORS_ORIGIN || env_js_1.ENV.NODE_ENV === 'production') {
            callback(null, true);
        }
        else {
            callback(null, true); // Allow all for now — restrict by ENV.CORS_ORIGIN if needed
        }
    },
    credentials: true,
}));
app.use((0, morgan_1.default)(env_js_1.ENV.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Static uploads folder
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// SEO: Dynamic Robots.txt - Requirement 35
app.get('/robots.txt', (_req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /account/\nSitemap: http://localhost:5000/sitemap.xml`);
});
// SEO: Dynamic Sitemap.xml - Requirement 35
app.get('/sitemap.xml', async (_req, res) => {
    try {
        const [properties, articles] = await Promise.all([
            prisma_js_1.prisma.property.findMany({
                where: { isPublished: true, status: 'APPROVED' },
                select: { slug: true, updatedAt: true },
                take: 500,
            }),
            prisma_js_1.prisma.article.findMany({
                where: { isPublished: true },
                select: { slug: true, updatedAt: true },
                take: 500,
            }),
        ]);
        const baseUrl = 'http://localhost:5173';
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        // Static pages
        const staticPages = [
            '',
            '/latest-news',
            '/real-estate',
            '/videos',
            '/advertise-property',
            '/property-requirement',
            '/property-search',
            '/compare',
            '/about',
            '/contact',
            '/privacy-policy',
            '/terms',
            '/disclaimer',
        ];
        staticPages.forEach((page) => {
            xml += `  <url>\n    <loc>${baseUrl}${page}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        });
        // Dynamic properties
        properties.forEach((prop) => {
            xml += `  <url>\n    <loc>${baseUrl}/property/${prop.slug}</loc>\n    <lastmod>${prop.updatedAt.toISOString().split('T')[0]}</lastmod>\n    <priority>0.9</priority>\n  </url>\n`;
        });
        // Dynamic articles
        articles.forEach((art) => {
            xml += `  <url>\n    <loc>${baseUrl}/article/${art.slug}</loc>\n    <lastmod>${art.updatedAt.toISOString().split('T')[0]}</lastmod>\n    <priority>0.7</priority>\n  </url>\n`;
        });
        xml += `</urlset>`;
        res.type('application/xml');
        res.send(xml);
    }
    catch (err) {
        res.status(500).send('Error generating sitemap');
    }
});
// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'BHOOMI BULLETIN API',
        timestamp: new Date().toISOString(),
        environment: env_js_1.ENV.NODE_ENV,
    });
});
// Apply API limiter and mount routes
app.use('/api', rateLimiter_js_1.apiLimiter, index_js_1.default);
// Global error handler
app.use(error_middleware_js_1.errorHandler);
// Initialize Event Bus handlers and background cron jobs
(0, handlers_js_1.registerEventHandlers)();
(0, adExpiry_job_js_1.initAdExpiryCron)();
// Serve React Frontend in Production - Robust resolution for any working directory
const candidatePaths = [
    path_1.default.resolve(process.cwd(), 'client/dist'),
    path_1.default.resolve(process.cwd(), '../client/dist'),
    path_1.default.resolve(process.cwd(), 'dist'),
    path_1.default.resolve(__dirname, '../../client/dist'),
    path_1.default.resolve(__dirname, '../client/dist'),
];
let clientDist = candidatePaths.find((p) => fs_1.default.existsSync(path_1.default.join(p, 'index.html'))) || candidatePaths[0];
app.use(express_1.default.static(clientDist));
app.get('*', (_req, res) => {
    const indexPath = path_1.default.join(clientDist, 'index.html');
    if (fs_1.default.existsSync(indexPath)) {
        return res.sendFile(indexPath);
    }
    return res.status(200).send(`<!DOCTYPE html><html><body><h2>Bhoomi Bulletin Server is Running</h2><p>Static frontend build is initializing. Please refresh in a moment.</p></body></html>`);
});
// Start server
const startServer = async () => {
    try {
        await (0, auto_seed_js_1.autoSeedIfEmpty)();
    }
    catch (err) {
        console.error('Failed to auto-seed:', err);
    }
    app.listen(Number(env_js_1.ENV.PORT), '0.0.0.0', () => {
        console.log(`====================================================`);
        console.log(`🚀 BHOOMI BULLETIN API Server running on port ${env_js_1.ENV.PORT}`);
        console.log(`📡 Environment: ${env_js_1.ENV.NODE_ENV}`);
        console.log(`🗄️ Database: SQLite (Prisma)`);
        console.log(`====================================================`);
    });
};
startServer();
