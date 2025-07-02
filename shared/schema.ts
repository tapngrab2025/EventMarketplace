import { pgTable, text, serial, integer, boolean, jsonb, timestamp, date, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "vendor", "customer", "organizer"] }).notNull().default("customer"),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  status: varchar("status").notNull().default("active"),
});

export const profile = pgTable("profile", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bio: text("bio"),
  dob: date("date_of_birth").notNull(),
  gender: text("gender", { enum: ["male", "female", "other", "not_to_disclose"] }).notNull(),
  imageUrl: text("image_url").default("/images/default-profile.png"),
  address: text("address").default(""),
  city: text("city").default(""),
  country: text("country").default(""),
  postalCode: text("postal_code").default(""),
  phoneNumber: text("phone_number").default(""),
  socialMedia: jsonb("social_media").default({}), // Store social media links
  occupation: text("occupation").default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  city: text("city"),
  imageUrl: text("image_url").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  vendorId: integer("vendor_id").notNull(),
  approved: boolean("approved").notNull().default(false),
});

export const stalls = pgTable("stalls", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  location: text("location").notNull(), // Location within the event venue
  eventId: integer("event_id").notNull(),
  vendorId: integer("vendor_id").notNull(),
  approved: boolean("approved").notNull().default(false),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Stored in cents
  imageUrl: text("image_url").notNull(),
  category: text("category", { enum: ["souvenir", "giveaway", "promotional"] }).notNull(),
  stallId: integer("stall_id").notNull(),
  approved: boolean("approved").notNull().default(false),
  stock: integer("stock").notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  stallId: integer("stall_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderDeliveryStatus = pgTable('order_delivery_status', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id),
  stallId: integer('stall_id').references(() => stalls.id),
  status: text('status', { enum: ['pending', 'ready', 'delivered'] }).notNull().default('pending'),
  updatedAt: timestamp('updated_at').defaultNow(),
  notes: text('notes'),
});


// Add these types if not already present
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id), // Keep this as user_id
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  total: integer("total").notNull(),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
});

export const sessions = pgTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create the insert schemas with proper validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
  email: true,
})
.extend({
  email: z.string().email("Invalid email format"),
});

export const insertEventSchema = createInsertSchema(events)
  .omit({
    id: true,
    approved: true,
  })
  .extend({
    startDate: z.string().transform((str) => new Date(str)),
    endDate: z.string().transform((str) => new Date(str)),
  });

export const insertStallSchema = createInsertSchema(stalls).omit({
  id: true,
  approved: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  approved: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
});

export const insertProfileSchema = createInsertSchema(profile)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    contact: z.string()
      .min(1, "Contact information is required")
      .max(10, "Contact information must be at most 10 characters")
      .regex(/^[a-zA-Z0-9]+$/, "Contact information can only contain letters and numbers"),
    postalCode: z.string().optional(),
    phoneNumber: z.string().optional(),
    socialMedia: z.object({
      facebook: z.string().optional(),
      twitter: z.string().optional(),
      instagram: z.string().optional(),
      linkedin: z.string().optional(),
    }).optional(),
  });

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriber = createInsertSchema(subscribers).omit({
  id: true,
  createdAt: true,
});

export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type InsertOrderItem = typeof orderItems.$inferInsert;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Stall = typeof stalls.$inferSelect;
export type InsertStall = z.infer<typeof insertStallSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type Profile = typeof profile.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Sessions = typeof sessions.$inferInsert;
export type Subscriber = typeof subscribers.$inferInsert;
export type InsertSubscriber = z.infer<typeof insertSubscriber>;

export type ProductWithDetails = Product & {
  Stall: Stall;
  event: Event;
}