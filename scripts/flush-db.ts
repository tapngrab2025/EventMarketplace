import { db } from "../server/db";
import { users, profile, events, stalls, products, cartItems, reviews, orderItems, orders, coupons, couponExcludedStalls, orderDeliveryStatus, product_feedback, subscribers, system_settings, sessions } from "../shared/schema";
import { eq, not, sql, inArray } from "drizzle-orm";

// ---- Explicit SQL table names (as declared in pgTable first arg) ----
const TABLE_NAMES = {
  orderDeliveryStatus: "order_delivery_status",
  product_feedback: "product_feedback",
  orderItems: "order_items",
  orders: "orders",
  cartItems: "cart_items",
  reviews: "reviews",
  couponExcludedStalls: "coupon_excluded_stalls",
  coupons: "coupons",
  products: "products",
  stalls: "stalls",
  subscribers: "subscribers",
  system_settings: "system_settings",
  events: "events",
  profile: "profile",
  sessions: "sessions",
  users: "users",
};

// Tables truncated/restarted when we are preserving users
const NON_USER_TABLES = [
  TABLE_NAMES.orderDeliveryStatus,
  TABLE_NAMES.product_feedback,
  TABLE_NAMES.orderItems,
  TABLE_NAMES.orders,
  TABLE_NAMES.cartItems,
  TABLE_NAMES.reviews,
  TABLE_NAMES.couponExcludedStalls,
  TABLE_NAMES.coupons,
  TABLE_NAMES.products,
  TABLE_NAMES.stalls,
  TABLE_NAMES.subscribers,
  TABLE_NAMES.system_settings,
  TABLE_NAMES.events,
];

// All tables when we are wiping everything
const ALL_TABLES = [
  ...NON_USER_TABLES,
  TABLE_NAMES.profile,
  TABLE_NAMES.sessions,
  TABLE_NAMES.users,
];

/**
 * Truncate a list of tables with CASCADE so FK deps are handled.
 * RESTART IDENTITY resets all serial/sequence columns back to 1.
 */
async function truncateTables(tableNames: string[], restartIdentity = true) {
  if (tableNames.length === 0) return;
  const list = tableNames.map(n => `"${n}"`).join(", ");
  const stmt = `TRUNCATE TABLE ${list} ${restartIdentity ? "RESTART IDENTITY" : ""} CASCADE`;
  await db.execute(sql.raw(stmt));
}

async function flushDatabase(excludeRole?: string) {
  try {
    console.log("🗑️ Flushing & reindexing database...");

    if (excludeRole === "all_users") {
      // Preserve users/profiles/sessions, truncate everything else
      await truncateTables(NON_USER_TABLES);
      console.log(`✅ Database flushed & reindexed successfully! (Users preserved)`);
    } else if (excludeRole) {
      // Preserve only users with the specified role (e.g. 'admin')
      await truncateTables(NON_USER_TABLES);

      // Get IDs of users we are keeping BEFORE we delete anything user-linked
      const kept = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.role, excludeRole));
      const keptIds = kept.map(u => u.id);

      // Delete sessions first (no FK dep on profile)
      await db.delete(sessions);
      // Delete profile(s) for non-kept users
      if (keptIds.length > 0) {
        await db.delete(profile).where(not(inArray(profile.userId, keptIds)));
      } else {
        await db.delete(profile);
      }
      // Delete non-kept users
      await db.delete(users).where(not(eq(users.role, excludeRole)));

      // Reset sequences to next available id
      await db.execute(sql.raw(
        `SELECT setval('users_id_seq',   COALESCE((SELECT MAX(id) FROM "users"),   0) + 1, false);`
      ));
      await db.execute(sql.raw(
        `SELECT setval('profile_id_seq', COALESCE((SELECT MAX(id) FROM "profile"), 0) + 1, false);`
      ));

      console.log(
        `✅ Database flushed & reindexed! (Preserved ${keptIds.length} user(s) with role: ${excludeRole})`
      );
    } else {
      // Full flush — everything, all IDs restart at 1
      await truncateTables(ALL_TABLES);
      console.log("✅ Database flushed & fully reindexed! (All data cleared, all IDs reset to 1)");
    }
  } catch (error) {
    console.error("❌ Error flushing database:", error);
    process.exit(1);
  }
  process.exit(0);
}

// Get role from command line argument
const excludeRole = process.argv[2];
flushDatabase(excludeRole);