import { db } from "../lib/db.js";
import { categories, eq, and, desc, isNull } from "@workspace/db";
import type {
  InsertCategory,
  UpdateCategory,
  CategoryQuery,
} from "@workspace/types/db";
import { AppError } from "../lib/errors.js";

/**
 * Categories Service
 * Handles all business logic for category operations
 */

export class CategoriesService {
  /**
   * Get all categories with optional filtering
   */
  async getAll(filters?: CategoryQuery) {
    const conditions = [];

    if (filters?.type) {
      conditions.push(eq(categories.type, filters.type));
    }

    if (filters?.isActive !== undefined) {
      conditions.push(eq(categories.isActive, filters.isActive));
    }

    // Handle parentId filter (null means root categories)
    if (filters?.parentId !== undefined) {
      if (filters.parentId === null) {
        conditions.push(isNull(categories.parentId));
      } else {
        conditions.push(eq(categories.parentId, filters.parentId));
      }
    }

    const result = await db
      .select()
      .from(categories)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(categories.sortOrder, desc(categories.createdAt));

    return result;
  }

  /**
   * Get a single category by ID
   */
  async getById(id: string) {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!category) {
      throw new AppError(404, "Category not found", "CATEGORY_NOT_FOUND");
    }

    return category;
  }

  /**
   * Create a new category
   */
  async create(data: InsertCategory) {
    // Validate parent category exists if parentId is provided
    if (data.parentId) {
      await this.getById(data.parentId);
    }

    const [newCategory] = await db
      .insert(categories)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();

    return newCategory;
  }

  /**
   * Update an existing category
   */
  async update(id: string, data: UpdateCategory) {
    // Check if category exists
    await this.getById(id);

    // Validate parent category exists if parentId is provided
    if (data.parentId) {
      // Prevent circular reference (category can't be its own parent)
      if (data.parentId === id) {
        throw new AppError(
          400,
          "Category cannot be its own parent",
          "INVALID_PARENT",
        );
      }
      await this.getById(data.parentId);
    }

    const [updatedCategory] = await db
      .update(categories)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    return updatedCategory;
  }

  /**
   * Delete a category (soft delete by setting isActive = false)
   */
  async delete(id: string) {
    // Check if category exists
    await this.getById(id);

    // Soft delete
    const [deletedCategory] = await db
      .update(categories)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    return deletedCategory;
  }

  /**
   * Permanently delete a category (use with caution)
   */
  async hardDelete(id: string) {
    // Check if category exists
    await this.getById(id);

    await db.delete(categories).where(eq(categories.id, id));

    return { success: true, message: "Category permanently deleted" };
  }
}

// Export singleton instance
export const categoriesService = new CategoriesService();
