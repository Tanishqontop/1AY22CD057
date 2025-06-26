import { ShortUrlRequest, UrlStats, ClickData, ShortUrlResponse } from '../interfaces';

const urlDatabase: Record<string, UrlStats> = {};

export function createShortUrl(host: string, data: ShortUrlRequest): { response: ShortUrlResponse, stats: UrlStats } {
  const { url, validity = 30, shortcode } = data;

  if (!isValidUrl(url)) {
    throw new Error('Invalid URL provided');
  }

  const finalShortcode = shortcode ? validateShortcode(shortcode) : generateShortcode();

  const creationDate = new Date();
  const expiryDate = new Date(creationDate.getTime() + validity * 60000);

  const stats: UrlStats = {
    originalUrl: url,
    shortcode: finalShortcode,
    creationDate: creationDate.toISOString(),
    expiryDate: expiryDate.toISOString(),
    totalClicks: 0,
    clicks: []
  };

  urlDatabase[finalShortcode] = stats;

  const response: ShortUrlResponse = {
    shortLink: `${host}/${finalShortcode}`,
    expiry: expiryDate.toISOString()
  };

  return { response, stats };
}

export function getUrlStats(shortcode: string): UrlStats {
  const stats = urlDatabase[shortcode];
  if (!stats) {
    throw new Error('Shortcode not found');
  }
  return stats;
}

export function recordClick(shortcode: string, clickData: Omit<ClickData, 'timestamp'>): void {
  const stats = urlDatabase[shortcode];
  if (!stats) {
    throw new Error('Shortcode not found');
  }

  stats.totalClicks += 1;
  stats.clicks.push({
    timestamp: new Date().toISOString(),
    ...clickData
  });
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function validateShortcode(shortcode: string): string {
  if (!/^[a-zA-Z0-9_-]{4,}$/.test(shortcode)) {
    throw new Error('Shortcode must be at least 4 characters and contain only letters, numbers, underscores, or hyphens');
  }
  if (urlDatabase[shortcode]) {
    throw new Error('Shortcode already in use');
  }
  return shortcode;
}

function generateShortcode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortcode: string;

  do {
    shortcode = '';
    for (let i = 0; i < 6; i++) {
      shortcode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (urlDatabase[shortcode]);

  return shortcode;
}
