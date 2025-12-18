import type { MiddlewareHandler } from "hono";
import { validator } from "hono/validator";
import type { z } from "zod";

/**
 * Validation middleware factory for Hono
 * Validates request data (json, query, param) against Zod schemas
 */

type ValidationTarget = "json" | "query" | "param";

export function validate(target: ValidationTarget, schema: any) {
  return validator(target, (value, c) => {
    const result = schema.safeParse(value);

    if (!result.success) {
      return c.json(
        {
          success: false,
          error: {
            message: "Validation error",
            code: "VALIDATION_ERROR",
            details: result.error.issues,
          },
        },
        400,
      );
    }

    return result.data;
  });
}

/**
 * Combines multiple validation targets
 * Usage: validateRequest({ json: SomeSchema, query: QuerySchema })
 */
export function validateRequest(schemas: {
  json?: any;
  query?: any;
  param?: any;
}): MiddlewareHandler[] {
  const middlewares: MiddlewareHandler[] = [];

  if (schemas.json) {
    middlewares.push(validate("json", schemas.json));
  }
  if (schemas.query) {
    middlewares.push(validate("query", schemas.query));
  }
  if (schemas.param) {
    middlewares.push(validate("param", schemas.param));
  }

  return middlewares;
}
