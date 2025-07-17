import { User, Event, Stall, Product, CartItem, InsertUser, InsertEvent, InsertStall, InsertProduct, InsertCartItem, Profile, ProductWithDetails, Subscriber } from "@shared/schema";
import session from "express-session";

export interface IStorage {
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>, userProfile: Partial<Profile>): Promise<[User | undefined, Profile | undefined]>;

  // Event operations
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;

  // Stall operations
  getStalls(): Promise<Stall[]>;
  getStallsByEvent(eventId: number): Promise<Stall[]>;
  getStall(id: number): Promise<Stall | undefined>;
  createStall(stall: InsertStall): Promise<Stall>;
  updateStall(id: number, stall: Partial<Stall>): Promise<Stall | undefined>;
  deleteStall(id: number): Promise<boolean>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProductsByStall(stallId: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductDetails(id: number): Promise<ProductWithDetails | { error: string }>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Cart operations
  getCartItems(userId: number): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;

  // Order operations
  createOrder(userId: number, cartItems: CartItem[], paymentMethod: string): Promise<number | undefined>;
  // Delivery status operations
  getDeliveryStatus(orderId: number): Promise<{ status: string, notes: string } | undefined>;
  updateDeliveryStatus(orderId: number, status: string, notes: string): Promise<boolean>;

  // Subscriber operations
  createSubscriber(email: string): Promise<Subscriber[] | any>;
  getArchivedEvents(): Promise<Event[]>;
  getArchivedStalls(): Promise<Stall[]>;
  getArchivedProducts(): Promise<Product[]>;
}