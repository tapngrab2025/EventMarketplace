import { db } from "../server/db";
import { users } from "../shared/schema";
import { hashPassword } from "../server/auth"; // Remove .js extension
import { eq } from "drizzle-orm";

async function createAdmin() {
  try {
    const password = "admin123"; // You can change this password
    const hashedPassword = await hashPassword(password);

    // Check if admin already exists
    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.username, "admin"),
    });

    if (existingAdmin) {
      process.exit(0);
    }

    // Create admin user
    await db.insert(users).values({
      username: "admin",
      password: hashedPassword,
      role: "admin",
      name: "System Admin",
      email: "admin@mail.com",
    });

  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    process.exit(0);
  }
}

createAdmin();