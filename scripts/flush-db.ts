import { db } from "../server/db";
import { users, profile, events, stalls, products, cartItems, reviews, orderItems, orders } from "../shared/schema";
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
    await db.delete(events);
    await db.delete(profile);

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