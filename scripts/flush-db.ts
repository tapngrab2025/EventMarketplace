import { db } from "../server/db";
import { users, profile, events, stalls, products, cartItems, reviews, orderItems, orders, coupons, couponExcludedStalls, orderDeliveryStatus, product_feedback, subscribers, system_settings, sessions } from "../shared/schema";
import { eq, not, and } from "drizzle-orm";

async function flushDatabase(excludeRole?: string) {
  try {
    console.log("🗑️ Flushing database...");
    
    // Delete in order to respect foreign key constraints
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(cartItems);
    await db.delete(reviews);
    await db.delete(products);
    await db.delete(stalls);
    await db.delete(coupons);
    await db.delete(couponExcludedStalls);
    await db.delete(orderDeliveryStatus);
    await db.delete(product_feedback);
    await db.delete(reviews);
    await db.delete(subscribers);
    await db.delete(system_settings);
    await db.delete(events);
    await db.delete(profile);
    await db.delete(sessions);

    // If excludeRole is provided, exclude users with that role
    if(excludeRole === "all_users") {
      console.log(`✅ Database flushed successfully! (Except users)`);
    } else if (excludeRole) {
      await db.delete(users).where(not(eq(users.role, excludeRole)));
      console.log(`✅ Database flushed successfully! (Preserved users with role: ${excludeRole})`);
    } else {
      await db.delete(users);
      console.log("✅ Database flushed successfully!");
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