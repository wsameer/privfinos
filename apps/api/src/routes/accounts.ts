import { Hono } from "hono";
import { accountsService } from "../services/accounts.service.js";
import { validate } from "../middleware/validator.js";
import {
  InsertAccountSchema,
  UpdateAccountSchema,
  AccountQuerySchema,
} from "@workspace/types/db";
import { z } from "zod";
import type { ApiResponse } from "@workspace/types/api";

/**
 * Accounts Routes
 * Following Hono best practices: handlers defined directly with routes
 */

const app = new Hono();

// UUID param validator
const uuidParamSchema = z.object({
  id: z.uuid(),
});

/**
 * GET /api/accounts
 * Get all accounts with optional filtering
 */
app.get("/", validate("query", AccountQuerySchema), async (c) => {
  const query = c.req.valid("query");
  const accounts = await accountsService.getAll(query);

  return c.json<ApiResponse<typeof accounts>>({
    success: true,
    data: accounts,
  });
});

/**
 * GET /api/accounts/balance/total
 * Get total balance across all active accounts
 */
app.get("/balance/total", async (c) => {
  const balance = await accountsService.getTotalBalance();

  return c.json<ApiResponse<typeof balance>>({
    success: true,
    data: balance,
  });
});

/**
 * GET /api/accounts/:id
 * Get a single account by ID
 */
app.get("/:id", validate("param", uuidParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const account = await accountsService.getById(id);

  return c.json<ApiResponse<typeof account>>({
    success: true,
    data: account,
  });
});

/**
 * GET /api/accounts/:id/balance
 * Get account balance
 */
app.get("/:id/balance", validate("param", uuidParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const balance = await accountsService.getBalance(id);

  return c.json<ApiResponse<typeof balance>>({
    success: true,
    data: balance,
  });
});

/**
 * POST /api/accounts
 * Create a new account
 */
app.post("/", validate("json", InsertAccountSchema), async (c) => {
  const data = c.req.valid("json");
  const newAccount = await accountsService.create(data);

  return c.json<ApiResponse<typeof newAccount>>(
    {
      success: true,
      data: newAccount,
    },
    201,
  );
});

/**
 * PUT /api/accounts/:id
 * Update an existing account
 */
app.put(
  "/:id",
  validate("param", uuidParamSchema),
  validate("json", UpdateAccountSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    const updatedAccount = await accountsService.update(id, data);

    return c.json<ApiResponse<typeof updatedAccount>>({
      success: true,
      data: updatedAccount,
    });
  },
);

/**
 * DELETE /api/accounts/:id
 * Soft delete an account (sets isActive = false)
 */
app.delete("/:id", validate("param", uuidParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const deletedAccount = await accountsService.delete(id);

  return c.json<ApiResponse<typeof deletedAccount>>({
    success: true,
    data: deletedAccount,
  });
});

/**
 * DELETE /api/accounts/:id/hard
 * Permanently delete an account (use with caution!)
 * This will cascade delete all related transactions
 */
app.delete("/:id/hard", validate("param", uuidParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const result = await accountsService.hardDelete(id);

  return c.json<ApiResponse<typeof result>>({
    success: true,
    data: result,
  });
});

export default app;
