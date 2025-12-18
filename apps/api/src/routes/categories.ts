import { Hono } from "hono";
import { categoriesService } from "../services/categories.service.js";
import { validate } from "../middleware/validator.js";
import { z } from "zod";

import {
  InsertCategorySchema,
  UpdateCategorySchema,
  CategoryQuerySchema,
} from "@repo/types/db";
import type { ApiResponse } from "@repo/types/api";

/**
 * Categories Routes
 * Following Hono best practices: handlers defined directly with routes
 */

const app = new Hono();

// UUID param validator
const uuidParamSchema = z.object({
  id: z.uuid(),
});

/**
 * GET /api/categories
 * Get all categories with optional filtering
 */
app.get("/", validate("query", CategoryQuerySchema), async (c) => {
  const query = c.req.valid("query");
  const categories = await categoriesService.getAll(query);

  return c.json<ApiResponse<typeof categories>>({
    success: true,
    data: categories,
  });
});

/**
 * GET /api/categories/:id
 * Get a single category by ID
 */
app.get("/:id", validate("param", uuidParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const category = await categoriesService.getById(id);

  return c.json<ApiResponse<typeof category>>({
    success: true,
    data: category,
  });
});

/**
 * POST /api/categories
 * Create a new category
 */
app.post("/", validate("json", InsertCategorySchema), async (c) => {
  const data = c.req.valid("json");
  const newCategory = await categoriesService.create(data);

  return c.json<ApiResponse<typeof newCategory>>(
    {
      success: true,
      data: newCategory,
    },
    201,
  );
});

/**
 * PUT /api/categories/:id
 * Update an existing category
 */
app.put(
  "/:id",
  validate("param", uuidParamSchema),
  validate("json", UpdateCategorySchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    const updatedCategory = await categoriesService.update(id, data);

    return c.json<ApiResponse<typeof updatedCategory>>({
      success: true,
      data: updatedCategory,
    });
  },
);

/**
 * DELETE /api/categories/:id
 * Soft delete a category (sets isActive = false)
 */
app.delete("/:id", validate("param", uuidParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const deletedCategory = await categoriesService.delete(id);

  return c.json<ApiResponse<typeof deletedCategory>>({
    success: true,
    data: deletedCategory,
  });
});

/**
 * DELETE /api/categories/:id/hard
 * Permanently delete a category (use with caution!)
 */
app.delete("/:id/hard", validate("param", uuidParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const result = await categoriesService.hardDelete(id);

  return c.json<ApiResponse<typeof result>>({
    success: true,
    data: result,
  });
});

export default app;
