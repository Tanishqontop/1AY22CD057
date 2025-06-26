import { Request, Response, RequestHandler } from 'express';
import { createShortUrl, getUrlStats, recordClick } from '../models/urlModel';
import { ShortUrlRequest } from '../interfaces';

export const createShortUrlHandler: RequestHandler = (req: Request, res: Response) => {
  try {
    const body = req.body as ShortUrlRequest;
    const host = `${req.protocol}://${req.get('host')}`;
    const { response, stats } = createShortUrl(host, body);
    res.status(201).json({ shortUrl: response, stats });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const redirectShortUrl: RequestHandler = (req: Request, res: Response) => {
  try {
    const shortcode = req.params.shortcode;
    const stats = getUrlStats(shortcode);

    recordClick(shortcode, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      source: req.headers['referer'] || ''
    });

    res.redirect(stats.originalUrl);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getUrlStatsHandler: RequestHandler = (req: Request, res: Response) => {
  try {
    const shortcode = req.params.shortcode;
    const stats = getUrlStats(shortcode);
    res.json(stats);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};
