import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { join } from "path";
import { existsSync } from "fs";

import { env } from "./lib/env.js";
import { logger } from "./lib/logger.js";
import { errorHandler } from "./middleware/error-handler.js";
import { requestLogger } from "./middleware/request-logger.js";
import health from "./routes/health.js";
import categories from "./routes/categories.js";
import accounts from "./routes/accounts.js";

const app = new Hono();

// Global middleware
app.use("*", requestLogger);
app.use(
  "*",
  cors({
    origin: env.CORS_ORIGIN.split(","),
    credentials: true,
  }),
);

// API Routes (must come before static file serving)
app.route("/api/health", health);
app.route("/api/categories", categories);
app.route("/api/accounts", accounts);

// API root endpoint
app.get("/api", (c) => {
  return c.json({
    name: "PrivFinOS API",
    version: "1.0.0",
    status: "running",
  });
});

// Serve static files in production (for frontend)
if (env.NODE_ENV === "production") {
  const webDistPath = join(process.cwd(), "..", "web", "dist");

  if (existsSync(webDistPath)) {
    logger.info(`Serving static files from: ${webDistPath}`);

    // Serve static assets
    app.use("/*", serveStatic({ root: webDistPath }));

    // SPA fallback - serve index.html for all non-API routes
    app.get("*", serveStatic({ path: join(webDistPath, "index.html") }));
  } else {
    logger.warn(`Web dist directory not found at: ${webDistPath}`);
  }
}

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        message: "Not found",
        code: "NOT_FOUND",
      },
    },
    404,
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
    logger.info(`Server is running on http://localhost:${info.port}/api`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  },
);
