import express from 'express';
import { requestLogger } from './middleware/requestLogger';
import {
  createShortUrlHandler,
  redirectShortUrl,
  getUrlStatsHandler
} from './controllers/urlController';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(requestLogger()); 

// Routes
app.post('/shorturls', createShortUrlHandler);
app.get('/:shortcode', redirectShortUrl);
app.get('/shorturls/:shortcode', getUrlStatsHandler);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`URL Shortener Service running on port ${PORT}`);
});
