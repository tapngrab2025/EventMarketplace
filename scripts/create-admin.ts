import { db } from "../server/db";
import { users, system_settings } from "../shared/schema";
import { hashPassword } from "../server/auth";
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

    // Initialize feedback settings if not exists
    const existingSettings = await db.query.system_settings.findFirst({
      where: eq(system_settings.key, "feedback_enabled"),
    });

    if (!existingSettings) {
      await db.insert(system_settings).values({
        key: "feedback_enabled",
        value: "true",
        description: "Controls whether product feedback feature is enabled",
      });
    }

  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    process.exit(0);
  }
}

createAdmin();