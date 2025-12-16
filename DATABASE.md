# Database Setup and Usage Guide

This guide explains how to set up and use the PostgreSQL database with Drizzle ORM in PrivFinOS.

## Overview

PrivFinOS uses:
- **PostgreSQL 16** - Reliable, open-source relational database
- **Drizzle ORM** - Type-safe ORM with excellent TypeScript support
- **Zod** - Runtime validation for data integrity

## Database Schema

### Tables

#### 1. **Categories**
Unified table for both income and expense categories with support for subcategories.

```typescript
{
  id: uuid (primary key)
  name: string (max 100 chars)
  type: 'INCOME' | 'EXPENSE'
  color: string (hex color, optional)
  icon: string (emoji or icon name, optional)
  parentId: uuid (for subcategories, optional)
  sortOrder: integer
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Features:**
- Hierarchical structure (parent-child relationships)
- Color coding and icons for better UX
- Soft delete with `isActive` flag
- Custom sorting with `sortOrder`

#### 2. **Accounts**
Financial accounts (checking, savings, credit cards, etc.)

```typescript
{
  id: uuid (primary key)
  name: string (max 100 chars)
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'INVESTMENT' | 'CASH' | 'LOAN' | 'OTHER'
  balance: numeric(15,2)
  currency: string (3-letter code, default 'USD')
  color: string (hex color, optional)
  icon: string (optional)
  isActive: boolean
  notes: text (optional)
  sortOrder: integer
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Features:**
- Multiple account types
- Multi-currency support
- Precision decimal handling for balances
- Custom notes per account

#### 3. **Transactions**
All financial transactions with support for transfers between accounts.

```typescript
{
  id: uuid (primary key)
  accountId: uuid (foreign key to accounts)
  categoryId: uuid (foreign key to categories, optional)
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  amount: numeric(15,2)
  description: string (max 200 chars)
  notes: text (optional)
  date: timestamp
  toAccountId: uuid (for transfers, optional)
  tags: array of strings
  receiptUrl: text (optional)
  isReconciled: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Features:**
- Three transaction types (income, expense, transfer)
- Optional categorization
- Tag system for flexible organization
- Receipt attachment support
- Reconciliation tracking

## Local Development Setup

### 1. Start PostgreSQL

Using Docker Compose (recommended):
```bash
docker compose up -d db
```

Or install PostgreSQL locally and create a database:
```bash
createdb privfinos
```

### 2. Configure Environment

Copy the example file:
```bash
cp .env.example .env
```

The default settings should work fine. Edit `.env` only if you need custom configuration:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/privfinos
```

### 3. Generate and Run Migrations

Generate migrations from schema:
```bash
pnpm db:generate
```

Push schema to database:
```bash
pnpm db:push
```

### 4. Seed the Database

Populate with sample data:
```bash
pnpm db:seed
```

This will create:
- 6 income categories
- 10 expense categories with ~13 subcategories
- 4 sample accounts

### 5. Start Development

```bash
pnpm dev
```

The API will connect to the database automatically.

## Available Scripts

Run these from the project root:

### Database Management
```bash
# Generate migration files from schema changes
pnpm db:generate

# Push schema directly to database (development)
pnpm db:push

# Open Drizzle Studio (visual database browser)
pnpm db:studio

# Seed database with sample data
pnpm db:seed
```

### Docker with Database
```bash
# Start all services (app + database)
pnpm docker:up

# View logs
pnpm docker:logs

# Stop all services
pnpm docker:down

# Clean everything including data volumes
pnpm docker:clean
```

## Drizzle Studio

Drizzle Studio provides a visual interface to browse and edit your database.

```bash
pnpm db:studio
```

Opens at: http://localhost:4983

Features:
- Browse tables and data
- Run queries
- Edit records
- View relationships

**Example queries:**
```typescript
// Get all expense categories
const expenseCategories = await db
  .select()
  .from(categories)
  .where(eq(categories.type, 'EXPENSE'));

// Get top-level categories (no parent)
const topLevel = await db
  .select()
  .from(categories)
  .where(isNull(categories.parentId));
```

### Why Soft Deletes?

Using `isActive` instead of hard deletes preserves:
- Historical transaction data
- Audit trails
- Ability to restore accidentally deleted items

### Why UUIDs?

UUIDs provide:
- Globally unique identifiers
- Security (no sequential ID guessing)
- Distributed system compatibility
- Easy data migration

## Type Safety

### Schema Types (Drizzle)

Defined in `packages/db/src/schema.ts`:
```typescript
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
```

### Validation Types (Zod)

Defined in `packages/types/src/db.ts`:
```typescript
export const CategorySchema = z.object({...});
export type Category = z.infer<typeof CategorySchema>;
```

### Usage in API

```typescript
import { getDb, eq } from '@/lib/db';
import { categories } from '@repo/db';
import { InsertCategorySchema } from '@repo/types/db';

// Validate input
const data = InsertCategorySchema.parse(req.body);

// Insert with type safety
const [category] = await getDb()
  .insert(categories)
  .values(data)
  .returning();
```

## Production Deployment

### Docker Compose

The database is automatically configured in `docker-compose.yml`:

1. Copy and configure:
```bash
cp .env.production.example .env.production
# Edit .env.production with secure password
```

2. Start services:
```bash
pnpm docker:up
```

3. Run migrations:
```bash
docker exec -it privfinos-app sh
pnpm db:push
pnpm db:seed
```

### Database Backups

#### Backup
```bash
docker exec privfinos-db pg_dump -U postgres privfinos > backup.sql
```

#### Restore
```bash
docker exec -i privfinos-db psql -U postgres privfinos < backup.sql
```

#### Automated Backups (Cron)
```bash
# Add to crontab
0 2 * * * docker exec privfinos-db pg_dump -U postgres privfinos | gzip > /backups/privfinos-$(date +\%Y\%m\%d).sql.gz
```

## Migrations Workflow

### Making Schema Changes

1. **Edit schema**: Modify `packages/db/src/schema.ts`

2. **Generate migration**:
```bash
pnpm db:generate
```
This creates a SQL migration file in `packages/db/migrations/`

3. **Review migration**: Check the generated SQL

4. **Apply migration**:
```bash
# Development
pnpm db:push

# Production
docker exec -it privfinos-app sh
pnpm --filter=@repo/db db:push
```

### Best Practices

- ✅ Review generated SQL before applying
- ✅ Test migrations on staging first
- ✅ Backup before running migrations
- ✅ Keep migrations in version control
- ❌ Don't edit generated migration files manually
- ❌ Don't delete old migrations

## Troubleshooting

### Connection Errors

**Error**: `connection refused`
```bash
# Check if PostgreSQL is running
docker compose ps

# Check logs
docker compose logs db
```

**Error**: `authentication failed`
```bash
# Verify credentials in .env.local
echo $DATABASE_URL

# Reset database
docker compose down -v
docker compose up -d db
```

### Migration Issues

**Error**: `relation already exists`
```bash
# Drop and recreate (development only!)
docker compose down -v
docker compose up -d db
pnpm db:push
pnpm db:seed
```

**Error**: `column does not exist`
```bash
# Regenerate migrations
pnpm db:generate
pnpm db:push
```

### Data Issues

**Problem**: Seed data not appearing
```bash
# Check if seed script ran
pnpm db:seed

# Manually check database
docker exec -it privfinos-db psql -U postgres privfinos
\dt  # List tables
SELECT * FROM categories;  # Check data
```

## Advanced Usage

### Custom Queries

```typescript
import { getDb, sql } from '@/lib/db';

// Raw SQL
const result = await getDb().execute(sql`
  SELECT
    c.name,
    COUNT(t.id) as transaction_count
  FROM categories c
  LEFT JOIN transactions t ON c.id = t.category_id
  GROUP BY c.id, c.name
`);
```

### Transactions

```typescript
import { getDb } from '@/lib/db';

await getDb().transaction(async (tx) => {
  // Multiple operations in a transaction
  await tx.insert(accounts).values({...});
  await tx.insert(transactions).values({...});
  // Both succeed or both fail
});
```

### Query Filtering

```typescript
import { getDb, and, eq, gte, lte } from '@/lib/db';
import { transactions } from '@repo/db';

// Complex query
const results = await getDb()
  .select()
  .from(transactions)
  .where(
    and(
      eq(transactions.accountId, accountId),
      gte(transactions.date, startDate),
      lte(transactions.date, endDate)
    )
  )
  .orderBy(desc(transactions.date));
```

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Zod Documentation](https://zod.dev/)

## Support

For database-related issues:
1. Check this documentation
2. Review Drizzle ORM docs
3. Check Docker logs: `pnpm docker:logs`
4. Verify environment variables
5. Test connection: `psql $DATABASE_URL`
