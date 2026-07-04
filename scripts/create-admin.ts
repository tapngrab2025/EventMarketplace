import { db } from "../server/db";
import { users, system_settings } from "../shared/schema";
import { hashPassword } from "../server/auth";
import { eq } from "drizzle-orm";

async function createAdmin() {
  try {
    const password = "u@#&YB5MubLGM1sr"; 
    const hashedPassword = await hashPassword(password);

    const vendorTap = "vendorTap";
    const vendorTapPassword = "Bu@W98aFxDm4jsm8";
    const organizerTap = "organizerTap";
    const organizerTapPassword = "aFxDm4MubLGvJTer";
    const customerTap = "customerTap";
    const customerTapPassword = "wYiD$&81#woi0Rja";
    const vendorHashedTapPassword = await hashPassword(vendorTapPassword);
    const organizerHashedTapPassword = await hashPassword(organizerTapPassword);
    const customerHashedTapPassword = await hashPassword(customerTapPassword);


    // Check if admin already exists
    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.username, "admin"),
    });

    if (existingAdmin) {
      process.exit(0);
    }

    // Create admin user
    await db.insert(users).values({
      username: "adminTap",
      password: hashedPassword,
      role: "admin",
      name: "System Admin",
      email: "adminTap@mail.com",
    });
    //"admin", "vendor", "customer", "organizer"

    // Check if vendor already exists
    const existingVendorTap = await db.query.users.findFirst({
      where: eq(users.username, "vendor"),
    });

    if (existingVendorTap) {
      process.exit(0);
    }

    // Create vendor user
    await db.insert(users).values({
      username: vendorTap,
      password: vendorHashedTapPassword,
      role: "vendor",
      name: "Vendor",
      email: "vendorTap@mail.com",
    });

    // Check if organizer already exists
    const existingOrganizerTap = await db.query.users.findFirst({
      where: eq(users.username, "organizer"),
    });

    if (existingOrganizerTap) {
      process.exit(0);
    }

    // Create organizer user
    await db.insert(users).values({
      username: organizerTap,
      password: organizerHashedTapPassword,
      role: "organizer",
      name: "Organizer",
      email: "organizerTap@mail.com",
    });
    

    // Check if customer already exists
    const existingCustomerTap = await db.query.users.findFirst({
      where: eq(users.username, "customer"),
    });

    if (existingCustomerTap) {
      process.exit(0);
    }

    // Create customer user
    await db.insert(users).values({
      username: customerTap,
      password: customerHashedTapPassword,
      role: "customer",
      name: "Customer",
      email: "customerTap@mail.com",
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