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
  InsertOrder,
  Order,
  orders,
  orderItems,
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
    return await db.select().from(events).orderBy(events.id, 'desc');
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
    return await db.select().from(stalls).orderBy(stalls.id, 'desc');
  }

  async getStallsByEvent(eventId: number): Promise<Stall[]> {
    const stallsWithProducts = await db
      .select({
        id: stalls.id,
        name: stalls.name,
        description: stalls.description,
        location: stalls.location,
        imageUrl: stalls.imageUrl,
        vendorId: stalls.vendorId,
        eventId: stalls.eventId,
        approved: stalls.approved,
        products: products
      })
      .from(stalls)
      .leftJoin(products, eq(products.stallId, stalls.id))
      .where(eq(stalls.eventId, eventId))
      .orderBy(stalls.id);

    // Group products by stall
    const groupedStalls = stallsWithProducts.reduce((acc, curr) => {
      const stall = acc.find(s => s.id === curr.id);
      if (!stall) {
        acc.push({
          ...curr,
          products: curr.products ? [curr.products] : []
        });
      } else if (curr.products) {
        stall.products.push(curr.products);
      }
      return acc;
    }, [] as any[]);

    return groupedStalls;
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
    return await db.select().from(products).orderBy(products.id, 'desc');
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

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    try {
      // Start a transaction
      return await db.transaction(async (tx) => {
        // Create the order
        const [order] = await tx
          .insert(orders)
          .values({
            userId: insertOrder.userId,
            fullName: insertOrder.fullName,
            phone: insertOrder.phone,
            address: insertOrder.address,
            total: insertOrder.total,
            status: "pending",
            paymentMethod: insertOrder.paymentMethod,
          })
          .returning();

        // Insert order items
        if (insertOrder.items && insertOrder.items.length > 0) {
          await tx
            .insert(orderItems)
            .values(
              insertOrder.items.map((item) => ({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              }))
            );
        }

        // Clear cart
        if (insertOrder.userId) {
          await tx
            .delete(cartItems)
            .where(eq(cartItems.userId, insertOrder.userId));
        }

        return order;
      });
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }
  
  async getUserOrders(userId: number): Promise<Order[]> {
      return await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(orders.createdAt, 'desc');
  }

  async getOrder(order_id: number): Promise<Order[]>  {
    return await db
    .select()
    .from(orders)
    .where(eq(orders.id, order_id));
  }
}

export const storage = new DatabaseStorage();