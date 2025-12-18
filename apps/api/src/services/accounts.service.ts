import { db } from "../lib/db.js";
import { accounts, eq, and, desc } from "@repo/db";
import type { InsertAccount, UpdateAccount, AccountQuery } from "@repo/types";
import { AppError } from "../lib/errors.js";

/**
 * Accounts Service
 * Handles all business logic for account operations
 */

export class AccountsService {
  /**
   * Get all accounts with optional filtering
   */
  async getAll(filters?: AccountQuery) {
    const conditions = [];

    if (filters?.type) {
      conditions.push(eq(accounts.type, filters.type));
    }

    if (filters?.isActive !== undefined) {
      conditions.push(eq(accounts.isActive, filters.isActive));
    }

    const result = await db
      .select()
      .from(accounts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(accounts.sortOrder, desc(accounts.createdAt));

    return result;
  }

  /**
   * Get a single account by ID
   */
  async getById(id: string) {
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, id))
      .limit(1);

    if (!account) {
      throw new AppError(404, "Account not found", "ACCOUNT_NOT_FOUND");
    }

    return account;
  }

  /**
   * Get account balance (useful for separate balance endpoint)
   */
  async getBalance(id: string) {
    const account = await this.getById(id);
    return {
      accountId: account.id,
      balance: parseFloat(account.balance),
      currency: account.currency,
    };
  }

  /**
   * Create a new account
   */
  async create(data: InsertAccount) {
    const [newAccount] = await db
      .insert(accounts)
      .values({
        ...data,
        // Convert balance to string if provided (database uses numeric/string)
        balance: data.balance !== undefined ? String(data.balance) : undefined,
        updatedAt: new Date(),
      })
      .returning();

    return newAccount;
  }

  /**
   * Update an existing account
   */
  async update(id: string, data: UpdateAccount) {
    // Check if account exists
    await this.getById(id);

    const [updatedAccount] = await db
      .update(accounts)
      .set({
        ...data,
        // Convert balance to string if provided (database uses numeric/string)
        balance: data.balance !== undefined ? String(data.balance) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, id))
      .returning();

    return updatedAccount;
  }

  /**
   * Delete an account (soft delete by setting isActive = false)
   */
  async delete(id: string) {
    // Check if account exists
    await this.getById(id);

    // Soft delete
    const [deletedAccount] = await db
      .update(accounts)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, id))
      .returning();

    return deletedAccount;
  }

  /**
   * Permanently delete an account (use with caution)
   * Note: This will cascade delete all related transactions
   */
  async hardDelete(id: string) {
    // Check if account exists
    await this.getById(id);

    await db.delete(accounts).where(eq(accounts.id, id));

    return { success: true, message: "Account permanently deleted" };
  }

  /**
   * Calculate total balance across all active accounts
   */
  async getTotalBalance() {
    const activeAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.isActive, true));

    const total = activeAccounts.reduce((sum, account) => {
      return sum + parseFloat(account.balance);
    }, 0);

    return {
      total,
      currency: "USD", // Could be enhanced to handle multiple currencies
      accountCount: activeAccounts.length,
    };
  }
}

// Export singleton instance
export const accountsService = new AccountsService();
