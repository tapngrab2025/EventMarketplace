import { pgTable, text, serial, integer, boolean, jsonb, timestamp, date, varchar, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "vendor", "customer", "organizer"] }).notNull().default("customer"),
  email: text("email").notNull().unique(),
  status: varchar("status").notNull().default("active"),
});

export const profile = pgTable("profile", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  firstName: text("first_name"),
  middleName: text("middle_name"),
  lastName: text("last_name"),
  bio: text("bio"),
  dob: date("date_of_birth"),
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
  archived: boolean("archived").notNull().default(false),
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
  archived: boolean("archived").notNull().default(false),
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
  availableToDispatch: integer("available_dispatch_stock").notNull().default(0),
  dispatchStock: integer("dispatch_stock").default(0),
  archived: boolean("archived").notNull().default(false),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "set null" }) // nullable foreign key
    .$type<number | null>(), 
  cartToken: text("cart_token"),
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
  // address: text("address").notNull(),
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
  couponId: integer("coupon_id").references(() => coupons.id),
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
// Update the insertUserSchema to include the new fields
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  email: true,
})
.extend({
  email: z.string().email("Invalid email format"),
  first_name: z.string().optional(),
  middle_name: z.string().optional(),
  last_name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  phoneNumber: z.string().optional(),
  birthDay: z.string().optional(),
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
export type UpdateOrder = typeof orders.$inferSelect;
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

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;


export const system_settings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const product_feedback = pgTable("product_feedback", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  userId: integer("user_id").notNull().references(() => users.id),
  orderId: integer("order_id").notNull().references(() => orders.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  imageUrl: text("image_url"),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Coupon table
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountPercentage: integer("discount_percentage").notNull(),
  eventId: integer("event_id").notNull().references(() => events.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  createdBy: integer("created_by").notNull().references(() => users.id),
});

// Excluded stalls for coupons
export const couponExcludedStalls = pgTable("coupon_excluded_stalls", {
  couponId: integer("coupon_id").notNull().references(() => coupons.id, { onDelete: "cascade" }),
  stallId: integer("stall_id").notNull().references(() => stalls.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: primaryKey({ columns: [t.couponId, t.stallId] }),
}));

// Create insert schema for coupons
export const insertCouponSchema = createInsertSchema(coupons)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    discountPercentage: z.number().min(1).max(100),
    expiresAt: z.string().transform((str) => new Date(str)).optional(),
  });

// Create insert schema for product feedback
export const insertProductFeedbackSchema = createInsertSchema(product_feedback)
  .omit({
    id: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    rating: z.number().min(1).max(5),
    comment: z.string().min(10, "Comment must be at least 10 characters").optional(),
    imageUrl: z.string().optional(),
  });
  
