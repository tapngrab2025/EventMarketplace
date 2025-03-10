import { db } from "../server/db";
import { users, profile, events, stalls, products, cartItems, reviews } from "../shared/schema";

async function flushDatabase() {
  try {
    console.log("🗑️ Flushing database...");
    
    // Delete in order to respect foreign key constraints
    await db.delete(cartItems);
    await db.delete(reviews);
    await db.delete(products);
    await db.delete(stalls);
    await db.delete(events);
    await db.delete(profile);
    await db.delete(users);
    
    console.log("✅ Database flushed successfully!");
  } catch (error) {
    console.error("❌ Error flushing database:", error);
    process.exit(1);
  }
  process.exit(0);
}

flushDatabase();