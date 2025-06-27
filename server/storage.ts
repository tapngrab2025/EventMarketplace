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
  ProductWithDetails,
  orderDeliveryStatus,
  Subscriber,
  InsertSubscriber,
  subscribers,
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, ne, and, gte, lte, sql, like, ilike, or, between } from "drizzle-orm";
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

  async getUsers(id: number): Promise<User[]> {
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
  // paginate products
  async getPaginatedProducts(
    page: number,
    pageSize: number,
    searchTerm?: string,
    startDate?: string,
    endDate?: string,
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    sortBy?: string,
    sortOrder?: string
  ): Promise<{ products: Product[]; total: number }> {
    const offset = (page - 1) * pageSize;
    const query = db.select({ ...products, }).from(products);

    if (searchTerm) {
      query.where(
        ilike(products.name, `%${searchTerm}%`)
      );
    }

    if (startDate && endDate) {
       const start = new Date(startDate);
      const end = new Date(endDate);
      // Set start to beginning of day and end to end of day
      start.setUTCHours(0, 0, 0, 0);
      end.setUTCHours(23, 59, 59, 999);
      query
      .leftJoin(stalls, eq(stalls.id, products.stallId))
      .leftJoin(events, eq(events.id, stalls.eventId))
      .where(
        or(
          between(events.startDate, start, end), 
          between(events.endDate, start, end))
      )
    }

    if (category) {
      query.where(eq(products.category, category));
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      query.where(
        and(
          gte(products.price, minPrice),
          lte(products.price, maxPrice)
        )
      );
    } else if (minPrice !== undefined) {
      query.where(eq(products.price, minPrice));
    } else if (maxPrice !== undefined) {
      query.where(eq(products.price, maxPrice));
    }

    if (sortBy && sortOrder) {
      query.orderBy(sortBy, sortOrder);
    }

    const [productsPaginates, total] = await Promise.all([
      query.limit(pageSize).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(products)
    ]);

    return { products: productsPaginates, total: total[0].count };
  }
  // Get all products
  async getProducts(): Promise<Product[]> {
    return await db.select()
    .from(products)
    .orderBy(products.id, 'desc');
  }

  async getProductsFeatured(): Promise<ProductWithDetails[]> {
    return await db.select()
    .from(products)
    .leftJoin(stalls, eq(stalls.id, products.stallId))
    .leftJoin(events, eq(events.id, stalls.eventId))
    .orderBy(products.id, 'desc');
  }

  // Get single product with details
  async getProductDetails(id: number): Promise<ProductWithDetails | { error: string }> {
    const product = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        imageUrl: products.imageUrl,
        price: products.price,
        stock: products.stock,
        stallId: products.stallId,
        approved: products.approved,
        category: products.category,
        stall: {
          id: stalls.id,
          name: stalls.name,
          description: stalls.description,
          location: stalls.location,
          imageUrl: stalls.imageUrl,
          vendorId: stalls.vendorId,
          eventId: stalls.eventId,
        },
        event: {
          id: events.id,
          name: events.name,
          description: events.description,
          startDate: events.startDate,
          endDate: events.endDate,
          imageUrl: events.imageUrl,
        },
      })
      .from(products)
      .leftJoin(stalls, eq(stalls.id, products.stallId))
      .leftJoin(events, eq(events.id, stalls.eventId))
      .where(eq(products.id, id));

    if (!product) return { error: "Product not found" };
    return product[0];
  }

  async getProductsByRelative(id: number): Promise<Product[]> {
    const productStallId = await db
      .select({ stallId: products.stallId })
      .from(products)
      .where(eq(products.id, id));

    if (!productStallId) return [];
    const relativeProducts = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.stallId, productStallId[0].stallId),
          ne(products.id, id)
        )
      )
      .limit(4)
      .orderBy(products.id, 'asc');
    return relativeProducts;
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
            user_id: insertOrder.user_id,
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
        if (insertOrder.user_id) {
          await tx
            .delete(cartItems)
            .where(eq(cartItems.userId, insertOrder.user_id));
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
      .where(eq(orders.user_id, userId))
      .orderBy(orders.createdAt, 'desc');
  }

  async getOrder(order_id: number): Promise<Order[]> {
    const orderWithItems = await db
      .select({
        id: orders.id,
        user_id: orders.user_id,
        fullName: orders.fullName,
        phone: orders.phone,
        address: orders.address,
        total: orders.total,
        status: orders.status,
        paymentMethod: orders.paymentMethod,
        createdAt: orders.createdAt,
        items: {
          id: orderItems.id,
          quantity: orderItems.quantity,
          price: orderItems.price,
          product: {
            id: products.id as unknown as number,
            name: products.name as unknown as string,
            description: products.description as unknown as string,
            imageUrl: products.imageUrl as unknown as string,
            stall: {
              id: stalls.id as unknown as number,
              name: stalls.name as unknown as string,
            }
          }
        }
      })
      .from(orders)
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .leftJoin(products, eq(products.id, orderItems.productId))
      .leftJoin(stalls, eq(stalls.id, products.stallId))
      .where(eq(orders.id, order_id));

    // Group items by order
    const groupedOrders = orderWithItems.reduce((acc, curr) => {
      const order = acc.find(o => o.id === curr.id);
      if (!order) {
        acc.push({
          ...curr,
          items: curr.items ? [curr.items] : []
        });
      } else if (curr.items) {
        order.items.push(curr.items);
      }
      return acc;
    }, [] as any[]);

    return groupedOrders;
  }

  async getStallOrder(orderId: number, stallId: number): Promise<any> {
    const stallOrderItems = await db
      .select({
        order: orders,
        items: {
          id: orderItems.id,
          quantity: orderItems.quantity,
          price: orderItems.price,
          product: products,
          deliveryStatus: orderDeliveryStatus
        }
      })
      .from(orders)
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .leftJoin(products, eq(products.id, orderItems.productId))
      .leftJoin(orderDeliveryStatus, and(
        eq(orderDeliveryStatus.orderId, orders.id),
        eq(orderDeliveryStatus.stallId, stallId)
      ))
      .where(and(
        eq(orders.id, orderId),
        eq(products.stallId, stallId)
      ));

    return stallOrderItems;
  }

  async updateDeliveryStatus(
    orderId: number,
    stallId: number,
    status: 'pending' | 'ready' | 'delivered',
    notes?: string
  ): Promise<any> {
    const [existing] = await db
      .select()
      .from(orderDeliveryStatus)
      .where(and(
        eq(orderDeliveryStatus.orderId, orderId),
        eq(orderDeliveryStatus.stallId, stallId)
      ));

    if (existing) {
      return await db
        .update(orderDeliveryStatus)
        .set({ status, notes, updatedAt: new Date() })
        .where(eq(orderDeliveryStatus.id, existing.id))
        .returning();
    }

    return await db
      .insert(orderDeliveryStatus)
      .values({ orderId, stallId, status, notes })
      .returning();
  }


  async createSubscriber(email: string): Promise<Subscriber[] | any> {
    const existingSubscriber = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email));

    if (existingSubscriber.length > 0) {
      throw new Error('User email already subscribed');
    }

    return await db.insert(subscribers).values({ email }).returning();
  }
}

export const storage = new DatabaseStorage();