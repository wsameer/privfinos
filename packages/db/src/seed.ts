import { config } from "dotenv";
import { getDatabase, categories, accounts } from "./index.js";

// Load environment variables from root .env file
config({ path: "../../.env" });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

async function seed() {
  console.log("🌱 Starting database seed...");

  const db = getDatabase(DATABASE_URL);

  try {
    // ============================================================================
    // Seed Income Categories
    // ============================================================================
    console.log("📥 Seeding income categories...");

    const incomeCategories = await db
      .insert(categories)
      .values([
        {
          name: "Salary",
          type: "INCOME",
          color: "#10b981",
          icon: "💼",
          sortOrder: 1,
        },
        {
          name: "Freelance",
          type: "INCOME",
          color: "#3b82f6",
          icon: "💻",
          sortOrder: 2,
        },
        {
          name: "Investment",
          type: "INCOME",
          color: "#8b5cf6",
          icon: "📈",
          sortOrder: 3,
        },
        {
          name: "Business",
          type: "INCOME",
          color: "#f59e0b",
          icon: "🏢",
          sortOrder: 4,
        },
        {
          name: "Gift",
          type: "INCOME",
          color: "#ec4899",
          icon: "🎁",
          sortOrder: 5,
        },
        {
          name: "Other Income",
          type: "INCOME",
          color: "#6366f1",
          icon: "💰",
          sortOrder: 6,
        },
      ])
      .returning();

    console.log(`✅ Created ${incomeCategories.length} income categories`);

    // ============================================================================
    // Seed Expense Categories with Subcategories
    // ============================================================================
    console.log("📤 Seeding expense categories...");

    // Main categories
    const expenseCategories = await db
      .insert(categories)
      .values([
        {
          name: "Housing",
          type: "EXPENSE",
          color: "#ef4444",
          icon: "🏠",
          sortOrder: 1,
        },
        {
          name: "Transportation",
          type: "EXPENSE",
          color: "#f97316",
          icon: "🚗",
          sortOrder: 2,
        },
        {
          name: "Food & Dining",
          type: "EXPENSE",
          color: "#84cc16",
          icon: "🍽️",
          sortOrder: 3,
        },
        {
          name: "Utilities",
          type: "EXPENSE",
          color: "#06b6d4",
          icon: "⚡",
          sortOrder: 4,
        },
        {
          name: "Healthcare",
          type: "EXPENSE",
          color: "#ef4444",
          icon: "🏥",
          sortOrder: 5,
        },
        {
          name: "Entertainment",
          type: "EXPENSE",
          color: "#ec4899",
          icon: "🎬",
          sortOrder: 6,
        },
        {
          name: "Shopping",
          type: "EXPENSE",
          color: "#a855f7",
          icon: "🛍️",
          sortOrder: 7,
        },
        {
          name: "Education",
          type: "EXPENSE",
          color: "#3b82f6",
          icon: "📚",
          sortOrder: 8,
        },
        {
          name: "Personal Care",
          type: "EXPENSE",
          color: "#8b5cf6",
          icon: "💆",
          sortOrder: 9,
        },
        {
          name: "Other Expense",
          type: "EXPENSE",
          color: "#64748b",
          icon: "📦",
          sortOrder: 10,
        },
      ])
      .returning();

    console.log(`✅ Created ${expenseCategories.length} expense categories`);

    // Create subcategories
    const housingCategory = expenseCategories.find(
      (c) => c.name === "Housing"
    );
    const transportCategory = expenseCategories.find(
      (c) => c.name === "Transportation"
    );
    const foodCategory = expenseCategories.find(
      (c) => c.name === "Food & Dining"
    );

    if (housingCategory) {
      const housingSubcategories = await db
        .insert(categories)
        .values([
          {
            name: "Rent/Mortgage",
            type: "EXPENSE",
            color: housingCategory.color,
            parentId: housingCategory.id,
            sortOrder: 1,
          },
          {
            name: "Property Tax",
            type: "EXPENSE",
            color: housingCategory.color,
            parentId: housingCategory.id,
            sortOrder: 2,
          },
          {
            name: "Home Insurance",
            type: "EXPENSE",
            color: housingCategory.color,
            parentId: housingCategory.id,
            sortOrder: 3,
          },
          {
            name: "Repairs & Maintenance",
            type: "EXPENSE",
            color: housingCategory.color,
            parentId: housingCategory.id,
            sortOrder: 4,
          },
        ])
        .returning();

      console.log(
        `✅ Created ${housingSubcategories.length} housing subcategories`
      );
    }

    if (transportCategory) {
      const transportSubcategories = await db
        .insert(categories)
        .values([
          {
            name: "Gas/Fuel",
            type: "EXPENSE",
            color: transportCategory.color,
            parentId: transportCategory.id,
            sortOrder: 1,
          },
          {
            name: "Car Payment",
            type: "EXPENSE",
            color: transportCategory.color,
            parentId: transportCategory.id,
            sortOrder: 2,
          },
          {
            name: "Car Insurance",
            type: "EXPENSE",
            color: transportCategory.color,
            parentId: transportCategory.id,
            sortOrder: 3,
          },
          {
            name: "Public Transit",
            type: "EXPENSE",
            color: transportCategory.color,
            parentId: transportCategory.id,
            sortOrder: 4,
          },
          {
            name: "Parking",
            type: "EXPENSE",
            color: transportCategory.color,
            parentId: transportCategory.id,
            sortOrder: 5,
          },
        ])
        .returning();

      console.log(
        `✅ Created ${transportSubcategories.length} transportation subcategories`
      );
    }

    if (foodCategory) {
      const foodSubcategories = await db
        .insert(categories)
        .values([
          {
            name: "Groceries",
            type: "EXPENSE",
            color: foodCategory.color,
            parentId: foodCategory.id,
            sortOrder: 1,
          },
          {
            name: "Restaurants",
            type: "EXPENSE",
            color: foodCategory.color,
            parentId: foodCategory.id,
            sortOrder: 2,
          },
          {
            name: "Coffee Shops",
            type: "EXPENSE",
            color: foodCategory.color,
            parentId: foodCategory.id,
            sortOrder: 3,
          },
          {
            name: "Delivery",
            type: "EXPENSE",
            color: foodCategory.color,
            parentId: foodCategory.id,
            sortOrder: 4,
          },
        ])
        .returning();

      console.log(
        `✅ Created ${foodSubcategories.length} food subcategories`
      );
    }

    // ============================================================================
    // Seed Accounts
    // ============================================================================
    console.log("🏦 Seeding accounts...");

    const accountsList = await db
      .insert(accounts)
      .values([
        {
          name: "Checking Account",
          type: "CHECKING",
          balance: "5000.00",
          currency: "USD",
          color: "#3b82f6",
          icon: "🏦",
          sortOrder: 1,
        },
        {
          name: "Savings Account",
          type: "SAVINGS",
          balance: "10000.00",
          currency: "USD",
          color: "#10b981",
          icon: "💰",
          sortOrder: 2,
        },
        {
          name: "Credit Card",
          type: "CREDIT_CARD",
          balance: "-500.00",
          currency: "USD",
          color: "#ef4444",
          icon: "💳",
          sortOrder: 3,
          notes: "Main credit card for rewards",
        },
        {
          name: "Cash",
          type: "CASH",
          balance: "200.00",
          currency: "USD",
          color: "#84cc16",
          icon: "💵",
          sortOrder: 4,
        },
      ])
      .returning();

    console.log(`✅ Created ${accountsList.length} accounts`);

    // ============================================================================
    // Summary
    // ============================================================================
    console.log("\n✨ Database seeding completed successfully!");
    console.log(
      `📊 Summary:
  - Income categories: 6
  - Expense categories: 10
  - Subcategories: ~13
  - Accounts: 4
    `);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run seed
seed();
