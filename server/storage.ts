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
  InsertProfile,
  system_settings,
  product_feedback,
  coupons,
  couponExcludedStalls,
  Coupon,
  InsertCoupon,
  OrderItem,
  UpdateOrder,
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, ne, and, gte, lte, sql, like, ilike, or, between, inArray, count } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { PgColumn } from "drizzle-orm/pg-core";
import fs from 'fs';
import path from 'path';

const PostgresSessionStore = connectPg(session);

function lower(column: PgColumn<any, any, any>): any {
  return sql`LOWER(${column})`;
}

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

  async getUserByUserEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
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

  // Add this method to your storage interface
  async createOrUpdateProfile(userId: number, profileData: Partial<InsertProfile>): Promise<Profile> {
    // Check if profile exists
    const existingProfile = await db.select().from(profile).where(eq(profile.userId, userId));

    if (existingProfile.length > 0) {
      // Update existing profile
      return (await db.update(profile)
        .set(profileData)
        .where(eq(profile.userId, userId))
        .returning())[0];
    } else {
      // Create new profile
      return (await db.insert(profile)
        .values([{
          userId,
          ...profileData,
        }])
        .returning())[0];
    }
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
    return await db.select().from(events).where(eq(events.archived, false)).orderBy(events.id, 'desc');
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events)
      .where(eq(events.id, id));
    return event;
  }

  async getEventIdByProductId(productId: number): Promise<number | undefined> {
    const [stall] = await db.select({ eventId: stalls.eventId }).from(products).innerJoin(stalls, eq(stalls.id, products.stallId)).where(eq(products.id, productId));
    return stall?.eventId;
  }

  async getCityEvent(city: string): Promise<any | undefined> {
    // First get the event
    const eventResults = await db.select()
      .from(events)
      .where(and(eq(events.archived, false), eq(lower(events.city), city.toLowerCase())));


    if (eventResults.length === 0) return {};

    const event = eventResults[0];

    // Then get all products related to this event
    const productsResults = await db.select({ products })
      .from(products)
      .innerJoin(stalls, eq(stalls.id, products.stallId))
      .where(eq(stalls.eventId, event.id));

    // Return the event with its products
    return {
      ...event,
      products: productsResults
    };
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
    return await db.select().from(stalls).where(eq(stalls.archived, false)).orderBy(stalls.id, 'desc');
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
      .where(and(eq(stalls.archived, false), eq(stalls.eventId, eventId)))
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
    const query = db.select({ ...products, }).from(products).where(
      and(eq(products.archived, false), 
      eq(products.approved, true))
    );

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
      db.select({ count: sql<number>`count(*)` }).from(products).where(
        and(eq(products.archived, false), 
        eq(products.approved, true))
      )
    ]);

    return { products: productsPaginates, total: total[0].count };
  }
  // Get all products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(
      and(eq(products.archived, false), 
      eq(products.approved, true))
    ).orderBy(products.id, 'desc');
  }

  async getProductsAll(): Promise<Product[]> {
    return await db.select().from(products).where(
      and(eq(products.archived, false))
    ).orderBy(products.id, 'desc');
  }

  async getProductsFeatured(): Promise<ProductWithDetails[]> {
    return await db.select()
      .from(products)
      .where(eq(products.archived, false))
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
        availableToDispatch: products.availableToDispatch,
        dispatchStock: products.dispatchStock,
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
      .where(and(eq(products.id, id), eq(products.archived, false)));

    if (!productStallId || productStallId.length === 0) return [];
    const stallId = productStallId[0]?.stallId;
    if (!stallId) return [];
    const relativeProducts = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.stallId, stallId),
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
      .where(and(eq(products.id, id), eq(products.archived, false), eq(products.approved, true)));
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

  async getUserExistingOrderForProduct(userId: number, productId: number): Promise<any> {
      const orderResults = await db
        .select({ orderId: orders.id })
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .where(
          and(
            eq(orders.user_id, userId),
            eq(orderItems.productId, productId),
            // eq(orders.status, "completed")
          )
        )
        .limit(1);
    return orderResults;
  }

  // Cart operations
  async getCartItems(userId?: number, cartToken?: string | null): Promise<CartItem[]> {
    if (userId && cartToken) {
      return await db
        .select()
        .from(cartItems)
        .where(or(
          eq(cartItems.userId, userId),
          eq(cartItems.cartToken, cartToken)
        ));
    } else if (userId && userId > 0 && !cartToken) {
      return await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.userId, userId));
    } else if (cartToken) {
      return await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.cartToken, cartToken));
    }
    return [];
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    return await db.transaction(async (tx) => {
      // Get product stock information
      const [product] = await tx
        .select()
        .from(products)
        .where(eq(products.id, insertCartItem.productId));

      if (!product) {
        throw new Error('Product not found');
      }

      // Check if the product already exists in the cart
      const existingItem = await tx
        .select()
        .from(cartItems)
        .where(
          and(
            eq(cartItems.productId, insertCartItem.productId),
            insertCartItem.userId
              ? eq(cartItems.userId, insertCartItem.userId)
              : eq(cartItems.cartToken, insertCartItem.cartToken)
          )
        )
        .limit(1);

      const newQuantity = existingItem.length > 0
        ? existingItem[0].quantity + insertCartItem.quantity
        : insertCartItem.quantity;

      // Validate stock
      if (newQuantity > product.stock) {
        throw new Error(`Only ${product.stock} items available in stock`);
      }

      if (existingItem.length > 0) {
        // Update quantity of existing item
        const [updated] = await tx
          .update(cartItems)
          .set({
            quantity: newQuantity
          })
          .where(eq(cartItems.id, existingItem[0].id))
          .returning();
        return updated;
      } else {
        // Insert new item if it doesn't exist
        const [cartItem] = await tx
          .insert(cartItems)
          .values(insertCartItem)
          .returning();
        return cartItem;
      }
    });
  }

  // When user logs in, merge anonymous cart with user cart
  async mergeAnonymousCart(userId: number, cartToken: string | null): Promise<void> {
    await db.transaction(async (tx) => {
      // Get anonymous cart items
      const anonymousItems = await tx
        .select()
        .from(cartItems)
        .where(eq(cartItems.cartToken, cartToken));

      // Update each item to associate with the user
      for (const item of anonymousItems) {
        // Get product stock information
        const [product] = await tx
          .select()
          .from(products)
          .where(eq(products.id, item.productId));

        if (!product) {
          // Skip this item if product not found
          continue;
        }

        // Check if user already has this product in cart
        const existingItem = await tx
          .select()
          .from(cartItems)
          .where(and(
            eq(cartItems.userId, userId),
            eq(cartItems.productId, item.productId)
          ))
          .limit(1);

        if (existingItem.length > 0) {
          const newQuantity = existingItem[0].quantity + item.quantity;

          // Validate stock
          if (newQuantity > product.stock) {
            // If merged quantity exceeds stock, set to maximum available
            await tx
              .update(cartItems)
              .set({ quantity: product.stock })
              .where(eq(cartItems.id, existingItem[0].id));
          } else {
            // Update quantity of existing item
            await tx
              .update(cartItems)
              .set({ quantity: newQuantity })
              .where(eq(cartItems.id, existingItem[0].id));
          }

          // Delete anonymous item
          await tx
            .delete(cartItems)
            .where(eq(cartItems.id, item.id));
        } else {
          // Validate stock for anonymous item
          if (item.quantity > product.stock) {
            // If quantity exceeds stock, set to maximum available
            await tx
              .update(cartItems)
              .set({ 
                userId, 
                cartToken: null,
                quantity: product.stock 
              })
              .where(eq(cartItems.id, item.id));
          } else {
            // Associate anonymous item with user
            await tx
              .update(cartItems)
              .set({ userId, cartToken: null })
              .where(eq(cartItems.id, item.id));
          }
        }
      }
    });
  }

  async updateCartItem(
    id: number,
    quantity: number,
    userId?: number,
    cartToken?: string | null
  ): Promise<CartItem | undefined> {
    return await db.transaction(async (tx) => {
      // Get cart item and product information
      const [cartItem] = await tx
        .select()
        .from(cartItems)
        .where(eq(cartItems.id, id));

      if (!cartItem) {
        throw new Error('Cart item not found');
      }

      const [product] = await tx
        .select()
        .from(products)
        .where(eq(products.id, cartItem.productId));

      if (!product) {
        throw new Error('Product not found');
      }

      // Validate stock
      if (quantity > product.stock) {
        throw new Error(`Only ${product.stock} items available in stock`);
      }

      const [updated] = await tx
        .update(cartItems)
        .set({ quantity })
        .where(
          and(
            eq(cartItems.id, id),
            userId ? eq(cartItems.userId, userId) : eq(cartItems.cartToken, cartToken)
          )
        )
        .returning();
      return updated;
    });
  }

  async removeFromCart(
    id: number,
    userId?: number,
    cartToken?: string | null
  ): Promise<boolean> {
    const [deleted] = await db
      .delete(cartItems)
      .where(
        and(
          eq(cartItems.id, id),
          userId ? eq(cartItems.userId, userId) : eq(cartItems.cartToken, cartToken)
        )
      )
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
            // address: insertOrder.address,
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

          // Update product stock
          for (const item of insertOrder.items) {
            await tx
              .update(products)
              .set({
                stock: sql<number>`${products.stock} - ${item.quantity}`,
                availableToDispatch: sql<number>`${item.quantity}`,
              })
              .where(eq(products.id, item.productId));
          }
        }

        return order;
      });
    } catch (error) {
      throw new Error('Failed to create order');
    }
  }

  async updateOrder(orderId: number, updateOrder: UpdateOrder): Promise<Order | undefined> {
    return (await db
      .update(orders)
      .set(updateOrder)
      .where(eq(orders.id, orderId))
      .returning())[0];
  }

  // async getUserOrders(userId: number): Promise<Order[]> {
  async getUserOrders(userId: number): Promise<any[]> {
    return await db
      .select({
        id: orders.id,
        user_id: orders.user_id,
        fullName: orders.fullName,
        phone: orders.phone,
        // address: orders.address,
        total: orders.total,
        status: orders.status,
        paymentMethod: orders.paymentMethod,
        createdAt: orders.createdAt,
        event: {
          id: events.id,
          name: events.name,
          description: events.description
        },
      })
      .from(orders)
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .leftJoin(products, eq(products.id, orderItems.productId))
      .leftJoin(stalls, eq(stalls.id, products.stallId))
      .leftJoin(events, eq(events.id, stalls.eventId))
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
        // address: orders.address,
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
          },
          coupon: {
            id: coupons.id as unknown as number,
            code: coupons.code as unknown as string,
            discountPercentage: coupons.discountPercentage as unknown as number,
          }
        }
      })
      .from(orders)
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .leftJoin(products, eq(products.id, orderItems.productId))
      .leftJoin(stalls, eq(stalls.id, products.stallId))
      .leftJoin(coupons, eq(coupons.id, orderItems.couponId))
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
    const orderIds = await db
      .select()
      .from(orderItems)
      .where(and(
        eq(orderItems.orderId, orderId)
      ));

    if (orderIds) {
      await db.transaction(async (tx) => {
        for (const orderId of orderIds) {
          return await tx
            .update(products)
            .set({
              availableToDispatch: sql<number>`${products.availableToDispatch} - ${orderId.quantity}`,
              dispatchStock: sql<number>`${products.dispatchStock} + ${orderId.quantity}`,
            })
            .where(eq(products.id, orderId.productId))
            .returning();
        }
      });
    }

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

  // Vendor: list distinct events where vendor has stalls
  async getVendorEvents(vendorId: number): Promise<Event[]> {
    const rows = await db
      .select({
        id: events.id,
        name: events.name,
        description: events.description,
        startDate: events.startDate,
        endDate: events.endDate,
        imageUrl: events.imageUrl,
        approved: events.approved,
        archived: events.archived,
      })
      .from(events)
      .innerJoin(stalls, eq(stalls.eventId, events.id))
      .where(and(eq(stalls.vendorId, vendorId), eq(events.archived, false)))
      .orderBy(events.startDate, 'desc');

    // Distinct by event id
    const seen = new Set<number>();
    const unique = rows.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; });
    return unique as any;
  }

  // Vendor: stalls by event
  async getVendorEventStalls(vendorId: number, eventId: number): Promise<Stall[]> {
    return await db
      .select()
      .from(stalls)
      .where(and(eq(stalls.vendorId, vendorId), eq(stalls.eventId, eventId), eq(stalls.archived, false)))
      .orderBy(stalls.id, 'asc');
  }

  // Vendor: orders for a specific stall (with items limited to that stall)
  async getVendorStallOrders(stallId: number): Promise<any[]> {
    const rows = await db
      .select({
        order: {
          id: orders.id,
          user_id: orders.user_id,
          total: orders.total,
          status: orders.status,
          paymentMethod: orders.paymentMethod,
          createdAt: orders.createdAt,
        },
        item: {
          id: orderItems.id,
          quantity: orderItems.quantity,
          price: orderItems.price,
        },
        product: {
          id: products.id,
          name: products.name,
          stallId: products.stallId,
        }
      })
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
      .innerJoin(products, eq(products.id, orderItems.productId))
      .where(eq(products.stallId, stallId))
      .orderBy(orders.createdAt, 'desc');

    // Group items by order
    const byOrder = new Map<number, any>();
    for (const r of rows) {
      const o = r.order.id;
      if (!byOrder.has(o)) {
        byOrder.set(o, { ...r.order, items: [] as any[] });
      }
      byOrder.get(o).items.push({ ...r.item, product: r.product });
    }
    return Array.from(byOrder.values());
  }

  // Vendor: orders for an event across all vendor stalls
  async getVendorEventOrders(vendorId: number, eventId: number): Promise<any[]> {
    const rows = await db
      .select({
        order: {
          id: orders.id,
          user_id: orders.user_id,
          total: orders.total,
          status: orders.status,
          paymentMethod: orders.paymentMethod,
          createdAt: orders.createdAt,
        },
        item: {
          id: orderItems.id,
          quantity: orderItems.quantity,
          price: orderItems.price,
        },
        product: {
          id: products.id,
          name: products.name,
          stallId: products.stallId,
        },
        stall: {
          id: stalls.id,
          name: stalls.name,
        }
      })
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
      .innerJoin(products, eq(products.id, orderItems.productId))
      .innerJoin(stalls, eq(stalls.id, products.stallId))
      .where(and(eq(stalls.vendorId, vendorId), eq(stalls.eventId, eventId)))
      .orderBy(orders.createdAt, 'desc');

    const byOrder = new Map<number, any>();
    for (const r of rows) {
      const o = r.order.id;
      if (!byOrder.has(o)) {
        byOrder.set(o, { ...r.order, items: [] as any[], stalls: new Set<number>() });
      }
      byOrder.get(o).items.push({ ...r.item, product: r.product, stall: r.stall });
      byOrder.get(o).stalls.add(r.stall.id);
    }
    return Array.from(byOrder.values()).map(o => ({ ...o, stalls: Array.from(o.stalls) }));
  }

  // Vendor: sales aggregates for event
  async getVendorEventSales(vendorId: number, eventId: number): Promise<{
    event: Event;
    totals: { revenue: number; orders: number; items: number };
    byStall: Array<{ stallId: number; stallName: string; revenue: number; orders: number; items: number }>;
    byDay: Array<{ day: Date; revenue: number; orders: number }>
  }> {
    const [event] = await db.select().from(events).where(eq(events.id, eventId));

    // Per item revenue rows
    const rows = await db
      .select({
        orderId: orders.id,
        createdAt: orders.createdAt,
        stallId: stalls.id,
        stallName: stalls.name,
        revenue: sql<number>`(${orderItems.price} * ${orderItems.quantity})`,
        items: orderItems.quantity,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
      .innerJoin(products, eq(products.id, orderItems.productId))
      .innerJoin(stalls, eq(stalls.id, products.stallId))
      .where(and(eq(stalls.vendorId, vendorId), eq(stalls.eventId, eventId)));

    // Totals
    let totalRevenue = 0;
    const orderSet = new Set<number>();
    let totalItems = 0;
    for (const r of rows) {
      totalRevenue += r.revenue;
      totalItems += r.items;
      orderSet.add(r.orderId);
    }

    // By stall
    const stallMap = new Map<number, { stallId: number; stallName: string; revenue: number; orders: Set<number>; items: number }>();
    for (const r of rows) {
      const s = stallMap.get(r.stallId) || { stallId: r.stallId, stallName: r.stallName, revenue: 0, orders: new Set<number>(), items: 0 };
      s.revenue += r.revenue;
      s.items += r.items;
      s.orders.add(r.orderId);
      stallMap.set(r.stallId, s);
    }
    const byStall = Array.from(stallMap.values()).map(s => ({ stallId: s.stallId, stallName: s.stallName, revenue: s.revenue, orders: s.orders.size, items: s.items }));

    // By day
    const dayMap = new Map<string, { day: Date; revenue: number; orders: Set<number> }>();
    for (const r of rows) {
      const dayStr = new Date(r.createdAt as any).toISOString().slice(0, 10);
      const entry = dayMap.get(dayStr) || { day: new Date(dayStr), revenue: 0, orders: new Set<number>() };
      entry.revenue += r.revenue;
      entry.orders.add(r.orderId);
      dayMap.set(dayStr, entry);
    }
    const byDay = Array.from(dayMap.values()).map(d => ({ day: d.day, revenue: d.revenue, orders: d.orders.size }));

    return {
      event: event as Event,
      totals: { revenue: totalRevenue, orders: orderSet.size, items: totalItems },
      byStall,
      byDay,
    };
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

  // Get archived events
  async getArchivedEvents(): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.archived, true))
      .orderBy(events.endDate, 'desc');
  }

  // Get archived stalls
  async getArchivedStalls(): Promise<Stall[]> {
    return await db
      .select()
      .from(stalls)
      .where(eq(stalls.archived, true))
      .orderBy(stalls.id, 'desc');
  }

  // Get archived products
  async getArchivedProducts(): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.archived, true))
      .orderBy(products.id, 'desc');
  }

  // Archive expired events, stalls, and products
  async archiveExpiredEvents(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // First, get all expired events that aren't already archived
    const expiredEvents = await db
      .select({
        id: events.id,
        imageUrl: events.imageUrl
      })
      .from(events)
      .where(
        and(
          lte(events.endDate, today),
          eq(events.archived, false)
        )
      );

    if (expiredEvents.length === 0) {
      return 0;
    }

    const eventIds = expiredEvents.map(event => event.id);

    // Delete event images
    for (const event of expiredEvents) {
      if (event.imageUrl && event.imageUrl !== '/images/default-event.png') {
        try {
          const imagePath = path.join(process.cwd(), 'client', '.next', 'server', 'uploads', path.basename(event.imageUrl));
          await fs.promises.unlink(imagePath);
        } catch (error) {
          console.error(`Failed to delete event image: ${event.imageUrl}`, error);
        }
      }
    }

    // Archive the events
    await db
      .update(events)
      .set({ archived: true })
      .where(inArray(events.id, eventIds));

    // Get stalls for these events
    const stallsToArchive = await db
      .select({
        id: stalls.id,
        imageUrl: stalls.imageUrl
      })
      .from(stalls)
      .innerJoin(events, eq(events.id, stalls.eventId))
      .where(
        and(
          inArray(events.id, eventIds),
          eq(stalls.archived, false)
        )
      );

    if (stallsToArchive.length > 0) {
      const stallIds = stallsToArchive.map(stall => stall.id);

      // Delete stall images
      for (const stall of stallsToArchive) {
        if (stall.imageUrl && stall.imageUrl !== '/images/default-stall.png') {
          try {
            const imagePath = path.join(process.cwd(), 'client', '.next', 'server', 'uploads', path.basename(stall.imageUrl));
            await fs.promises.unlink(imagePath);
          } catch (error) {
            console.error(`Failed to delete stall image: ${stall.imageUrl}`, error);
          }
        }
      }

      // Archive the stalls
      await db
        .update(stalls)
        .set({ archived: true })
        .where(inArray(stalls.id, stallIds));

      // Get and archive products in these stalls
      const productsToArchive = await db
        .select({
          id: products.id,
          imageUrl: products.imageUrl
        })
        .from(products)
        .where(
          and(
            inArray(products.stallId, stallIds),
            eq(products.archived, false)
          )
        );

      // Delete product images
      for (const product of productsToArchive) {
        if (product.imageUrl && product.imageUrl !== '/images/default-product.png') {
          try {
            const imagePath = path.join(process.cwd(), 'client', '.next', 'server', 'uploads', 'products', path.basename(product.imageUrl));
            await fs.promises.unlink(imagePath);
          } catch (error) {
            console.error(`Failed to delete product image: ${product.imageUrl}`, error);
          }
        }
      }

      // Archive the products
      await db
        .update(products)
        .set({ archived: true })
        .where(
          and(
            inArray(products.stallId, stallIds),
            eq(products.archived, false)
          )
        );
    }

    return eventIds.length;
  }

  // System Settings Methods
  async getSystemSetting(key: string): Promise<string | null> {
    const setting = await db
      .select()
      .from(system_settings)
      .where(eq(system_settings.key, key));
    return setting[0]?.value ?? null;
  }

  async setSystemSetting(key: string, value: string, description?: string): Promise<void> {
    await db
      .insert(system_settings)
      .values({ key, value, description })
      .onConflictDoUpdate({
        target: system_settings.key,
        set: { value, updatedAt: new Date() },
      });
  }
  
  // Coupon management
  async createCoupon(couponData: InsertCoupon): Promise<Coupon> {
    const [coupon] = await db.insert(coupons).values(couponData).returning();
    return coupon;
  }

  async getCoupons(eventId?: number): Promise<Coupon[]> {
    if (eventId) {
      return await db.select().from(coupons).where(eq(coupons.eventId, eventId));
    }
    return await db.select().from(coupons);
  }

  async getCoupon(id: number): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
    return coupon;
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
    return coupon;
  }

  async updateCoupon(id: number, couponData: Partial<Coupon>): Promise<Coupon | undefined> {
    const [updated] = await db
      .update(coupons)
      .set({ ...couponData, updatedAt: new Date() })
      .where(eq(coupons.id, id))
      .returning();
    return updated;
  }

  async deleteCoupon(id: number): Promise<boolean> {
    await db.delete(coupons).where(eq(coupons.id, id));
    return true;
  }

  async addExcludedStall(couponId: number, stallId: number): Promise<void> {
    await db.insert(couponExcludedStalls).values({ couponId, stallId });
  }

  async removeExcludedStall(couponId: number, stallId: number): Promise<void> {
    await db.delete(couponExcludedStalls)
      .where(and(
        eq(couponExcludedStalls.couponId, couponId),
        eq(couponExcludedStalls.stallId, stallId)
      ));
  }

  async getExcludedStalls(couponId: number): Promise<number[]> {
    const excluded = await db
      .select({ stallId: couponExcludedStalls.stallId })
      .from(couponExcludedStalls)
      .where(eq(couponExcludedStalls.couponId, couponId));
    
    return excluded.map(e => e.stallId);
  }

  async validateCoupon(code: string, productIds: number[]): Promise<{ 
    valid: boolean; 
    coupon?: Coupon; 
    applicableProductIds?: number[];
    message?: string 
  }> {
    const coupon = await this.getCouponByCode(code);
    
    if (!coupon) {
      return { valid: false, message: "Invalid coupon code" };
    }
    
    if (!coupon.isActive) {
      return { valid: false, message: "Coupon is not active" };
    }
    
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, message: "Coupon has expired" };
    }
    
    // Get all products with their event IDs
    const productsWithEvents = await Promise.all(
      productIds.map(async (productId) => {
        const eventId = await this.getEventIdByProductId(productId);
        return { productId, eventId };
      })
    );
    
    // Filter products that belong to the coupon's event
    const validProductIds = productsWithEvents
      .filter(product => product.eventId === coupon.eventId)
      .map(product => product.productId);
    
    if (validProductIds.length === 0) {
      return { 
        valid: false, 
        message: "Coupon is not valid for any products in your cart" 
      };
    }
    
    // Return successful validation with applicable product IDs
    return { 
      valid: true, 
      coupon,
      applicableProductIds: validProductIds,
      message: validProductIds.length < productIds.length ? 
        "Coupon applied to some products only" : undefined
    };
  }

// Product Feedback Methods
  async createProductFeedback(feedback: typeof product_feedback.$inferInsert): Promise<typeof product_feedback.$inferSelect> {
    // Verify the user has purchased the product
    const order = await db
      .select()
      .from(orderItems)
      .where(
        and(
          eq(orderItems.orderId, feedback.orderId),
          eq(orderItems.productId, feedback.productId)
        )
      );

    if (!order.length) {
      throw new Error("You can only provide feedback for products you have purchased");
    }

    // Check if feedback already exists
    const existingFeedback = await db
      .select()
      .from(product_feedback)
      .where(
        and(
          eq(product_feedback.productId, feedback.productId),
          eq(product_feedback.userId, feedback.userId),
          eq(product_feedback.orderId, feedback.orderId)
        )
      );

    if (existingFeedback.length) {
      throw new Error("You have already provided feedback for this product");
    }

    const [result] = await db
      .insert(product_feedback)
      .values(feedback)
      .returning();

    return result;
  }

  async getProductFeedback(productId: number): Promise<typeof product_feedback.$inferSelect[]> {
    const feedbackEnabled = await this.getSystemSetting("feedback_enabled");
    if (feedbackEnabled !== "true") {
      return [];
    }

    return await db
      .select()
      .from(product_feedback)
      .where(
        and(
          eq(product_feedback.productId, productId),
          eq(product_feedback.status, "approved")
        )
      )
      .orderBy(product_feedback.createdAt, "desc");
  }

  async updateFeedbackStatus(feedbackId: number, status: "approved" | "rejected"): Promise<void> {
    await db
      .update(product_feedback)
      .set({ status, updatedAt: new Date() })
      .where(eq(product_feedback.id, feedbackId));
  }

  async getUserProductFeedback(userId: number, productId: number): Promise<typeof product_feedback.$inferSelect | null> {
    const feedback = await db
      .select()
      .from(product_feedback)
      .where(
        and(
          eq(product_feedback.userId, userId),
          eq(product_feedback.productId, productId)
        )
      );
    
    return feedback[0] ?? null;
  }

  async canUserProvideFeedback(userId: number, productId: number): Promise<boolean> {
    try {
      // First check if feedback is enabled
      const feedbackEnabled = await this.getSystemSetting("feedback_enabled");
      if (feedbackEnabled !== "true") {
        return false;
      }

      // Check if user has purchased the product and order is completed
      const orderResults = await db
        .select()
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .where(
          and(
            eq(orders.user_id, userId),
            eq(orderItems.productId, productId)
            // eq(orders.status, "completed")
          )
        );

      if (!orderResults.length) {
        return false;
      }

      // Check if user has already provided feedback
      const existingFeedback = await this.getUserProductFeedback(userId, productId);
      return !existingFeedback;
    } catch (error) {
      console.error('Error checking feedback eligibility:', error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();

