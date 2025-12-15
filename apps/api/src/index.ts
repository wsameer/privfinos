import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from './lib/logger.js';
import { env } from './lib/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { requestLogger } from './middleware/request-logger.js';
import health from './routes/health.js';

const app = new Hono();

// Global middleware
app.use('*', requestLogger);
app.use(
  '*',
  cors({
    origin: env.CORS_ORIGIN.split(','),
    credentials: true,
  })
);

// Routes
app.route('/health', health);

// Root route
app.get('/', (c) => {
  return c.json({
    name: 'PrivFinOS API',
    version: '0.0.1',
    status: 'running',
  });
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        message: 'Not found',
        code: 'NOT_FOUND',
      },
    },
    404
  );
});

// Error handler
app.onError(errorHandler);

// Start server
const port = env.PORT;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    logger.info(`Server is running on http://localhost:${info.port}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  }
);
