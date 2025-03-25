import { IStorage } from "./types";
import {
  User,
  Event,
  Stall,
  Product,
  CartItem,
  InsertUser,
  InsertEvent,
  InsertStall,
  InsertProduct,
  InsertCartItem,
  users,
  events,
  stalls,
  products,
  cartItems,
  Profile,
  profile,
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, ne } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserProfile(userId: number): Promise<Profile[]> {
    return await db
      .select()
      .from(profile)
      .where(eq(profile.userId, userId));
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(
    id: number,
    user: Partial<User>,
    userProfile: Partial<Profile>
  ): Promise<[User | undefined, Profile | undefined]> {
    // Update user data
    const [updated] = await db.update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();

    // Check if profile exists
    const [existingProfile] = await db.select()
      .from(profile)
      .where(eq(profile.userId, id));

    let updatedProfile;
    if (existingProfile) {
      // Update existing profile
      [updatedProfile] = await db.update(profile)
        .set(userProfile)
        .where(eq(profile.userId, id))
        .returning();
    } else {
      // Create new profile
      [updatedProfile] = await db.insert(profile)
        .values({ ...userProfile, userId: id })
        .returning();
    }

    return [updated, updatedProfile];
  }

  async getUsers( id: number ): Promise<User[]> {
    return await db.select().from(users).where(ne(users.id, id));
  }

  async updateUseRole(
    id: number,
    role: "admin" | "organizer" | "vendor" | "customer",
    // role: any,
  ): Promise<User | undefined> {
    const [updated] = await db
     .update(users)
     .set({ role })
     .where(eq(users.id, id))
     .returning();
    return updated;
  }

  async updateUserStatus(
    id: number,
    status: "active" | "inactive"
  ): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ status })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  // Event operations
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(insertEvent).returning();
    return event;
  }

  async updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined> {
    const [updated] = await db
      .update(events)
      .set(event)
      .where(eq(events.id, id))
      .returning();
    return updated;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(events)
      .where(eq(events.id, id))
      .returning();
    return !!deleted;
  }

  // Stall operations
  async getStalls(): Promise<Stall[]> {
    return await db.select().from(stalls);
  }

  async getStallsByEvent(eventId: number): Promise<Stall[]> {
    return await db
      .select()
      .from(stalls)
      .where(eq(stalls.eventId, eventId));
  }

  async getStall(id: number): Promise<Stall | undefined> {
    const [stall] = await db.select().from(stalls).where(eq(stalls.id, id));
    return stall;
  }

  async createStall(insertStall: InsertStall): Promise<Stall> {
    const [stall] = await db.insert(stalls).values(insertStall).returning();
    return stall;
  }

  async updateStall(id: number, stall: Partial<Stall>): Promise<Stall | undefined> {
    const [updated] = await db
      .update(stalls)
      .set(stall)
      .where(eq(stalls.id, id))
      .returning();
    return updated;
  }

  async deleteStall(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(stalls)
      .where(eq(stalls.id, id))
      .returning();
    return !!deleted;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductsByStall(stallId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.stallId, stallId));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async updateProduct(
    id: number,
    product: Partial<Product>,
  ): Promise<Product | undefined> {
    const [updated] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();
    return !!deleted;
  }

  // Cart operations
  async getCartItems(userId: number): Promise<CartItem[]> {
    return await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.userId, userId));
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    const [cartItem] = await db
      .insert(cartItems)
      .values(insertCartItem)
      .returning();
    return cartItem;
  }

  async updateCartItem(
    id: number,
    quantity: number,
  ): Promise<CartItem | undefined> {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updated;
  }

  async removeFromCart(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(cartItems)
      .where(eq(cartItems.id, id))
      .returning();
    return !!deleted;
  }
}

export const storage = new DatabaseStorage();