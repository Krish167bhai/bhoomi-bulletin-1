import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { eventBus, AppEvents } from '../events/eventBus.js';

export class ArticleController {
  static async getPublishedArticles(req: Request, res: Response) {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const skip = (page - 1) * limit;
    const { category, tag } = req.query;

    const where: any = { isPublished: true };
    if (category && category !== 'ALL') {
      where.category = category as any;
    }
    if (tag) {
      where.tags = { contains: String(tag) };
    }

    const [total, articles] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
        include: {
          author: { select: { id: true, name: true, avatar: true } },
        },
      }),
    ]);

    return res.json({
      success: true,
      articles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  static async getArticleBySlug(req: Request, res: Response) {
    const slug = req.params.slug as string;

    const article = await prisma.article.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        author: { select: { id: true, name: true, avatar: true, bio: true } },
      },
    });

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Log article view event asynchronously
    eventBus.emitEvent(AppEvents.ANALYTICS_EVENT, {
      eventType: 'ARTICLE_VIEW',
      targetId: article.id,
      targetType: 'ARTICLE',
      userId: req.user?.id || null,
      ipAddress: req.ip,
    });

    // Related articles
    const related = await prisma.article.findMany({
      where: {
        isPublished: true,
        category: article.category,
        id: { not: article.id },
      },
      take: 4,
      orderBy: { publishedAt: 'desc' },
      include: { author: { select: { name: true } } },
    });

    return res.json({ success: true, article, related });
  }

  // Videos page: Real estate video content (Requirement 2 & 5)
  static async getVideoNews(req: Request, res: Response) {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(30, Math.max(1, parseInt(req.query.limit as string) || 12));
    const skip = (page - 1) * limit;

    const where = {
      isPublished: true,
      category: 'VIDEO_NEWS' as any,
    };

    const [total, videos] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
        include: {
          author: { select: { name: true } },
        },
      }),
    ]);

    return res.json({
      success: true,
      videos,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  }
}
