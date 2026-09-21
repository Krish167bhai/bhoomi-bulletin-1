import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { ENV } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { registerEventHandlers } from './events/handlers.js';
import { initAdExpiryCron } from './jobs/adExpiry.job.js';
import { prisma } from './config/prisma.js';
import { autoSeedIfEmpty } from './prisma/auto-seed.js';

const app = express();

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows images/videos to be loaded in frontend
}));
app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin (no origin header) and configured origins
    if (!origin || origin === ENV.CORS_ORIGIN || ENV.NODE_ENV === 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now — restrict by ENV.CORS_ORIGIN if needed
    }
  },
  credentials: true,
}));
app.use(morgan(ENV.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// SEO: Dynamic Robots.txt - Requirement 35
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /account/\nSitemap: http://localhost:5000/sitemap.xml`);
});

// SEO: Dynamic Sitemap.xml - Requirement 35
app.get('/sitemap.xml', async (_req, res) => {
  try {
    const [properties, articles] = await Promise.all([
      prisma.property.findMany({
        where: { isPublished: true, status: 'APPROVED' },
        select: { slug: true, updatedAt: true },
        take: 500,
      }),
      prisma.article.findMany({
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
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'BHOOMI BULLETIN API',
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
  });
});

// Apply API limiter and mount routes
app.use('/api', apiLimiter, apiRouter);

// Global error handler
app.use(errorHandler);

// Initialize Event Bus handlers and background cron jobs
registerEventHandlers();
initAdExpiryCron();

// Serve React Frontend in Production - Robust resolution for any working directory
const candidatePaths = [
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(process.cwd(), 'dist'),
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist'),
];

let clientDist = candidatePaths.find((p) => fs.existsSync(path.join(p, 'index.html'))) || candidatePaths[0];

app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  const indexPath = path.join(clientDist, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.status(200).send(`<!DOCTYPE html><html><body><h2>Bhoomi Bulletin Server is Running</h2><p>Static frontend build is initializing. Please refresh in a moment.</p></body></html>`);
});

// Start server
const startServer = async () => {
  try {
    await autoSeedIfEmpty();
  } catch (err) {
    console.error('Failed to auto-seed:', err);
  }
  app.listen(ENV.PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 BHOOMI BULLETIN API Server running on port ${ENV.PORT}`);
    console.log(`📡 Environment: ${ENV.NODE_ENV}`);
    console.log(`🗄️ Database: SQLite (Prisma)`);
    console.log(`====================================================`);
  });
};

startServer();
