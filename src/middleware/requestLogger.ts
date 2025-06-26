import { Request, Response, NextFunction, RequestHandler } from 'express';
import axios from 'axios';

interface LogData {
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  duration?: string;
  requestBody?: any;
  responseBody?: any;
  ipAddress?: string;
}

const LOGGING_URL = 'http://20.244.56.144/evaluation-service/logs';
const AUTH_TOKEN = process.env.EVAL_API_TOKEN || ''; // Set this in .env

export function requestLogger(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = process.hrtime();

    const logData: LogData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ipAddress: req.ip
    };

    if (req.body && Object.keys(req.body).length > 0) {
      logData.requestBody = maskSensitiveData(req.body);
    }

    console.log('Request:', logData);

    const originalSend = res.send;
    res.send = function (body?: any): any {
      logData.responseBody = maskSensitiveData(body);
      return originalSend.call(this, body);
    };

    res.on('finish', async () => {
      const duration = process.hrtime(startTime);
      const durationMs = (duration[0] * 1000 + duration[1] / 1000000).toFixed(2);

      logData.status = res.statusCode;
      logData.duration = `${durationMs}ms`;

      console.log('Response:', logData);

      try {
        await axios.post(LOGGING_URL, logData, {
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (err: any) {
        console.error('Failed to send log to evaluation-service:', err.response?.status, err.response?.data);
      }
    });

    next();
  };
}

function maskSensitiveData(data: any): any {
  if (typeof data !== 'object' || data === null) return data;

  const sensitiveFields = ['password', 'token', 'clientSecret'];
  const masked = Array.isArray(data) ? [...data] : { ...data };

  sensitiveFields.forEach(field => {
    if (masked[field]) {
      masked[field] = '*****';
    }
  });

  return masked;
}
