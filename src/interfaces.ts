export interface ShortUrlRequest {
  url: string;
  validity?: number;
  shortcode?: string;
}

export interface ShortUrlResponse {
  shortLink: string;
  expiry: string;
}

export interface ClickData {
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  source?: string; 
}

export interface UrlStats {
  originalUrl: string;
  shortcode: string;
  creationDate: string;
  expiryDate: string;
  totalClicks: number;
  clicks: ClickData[];
}
