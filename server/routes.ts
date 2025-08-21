import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { useAuth } from '@/hooks/use-auth';
import Cookies from 'js-cookie';
import { insertEventSchema } from "@shared/schema";
const CART_TOKEN_COOKIE = 'cart_token';

export async function registerRoutes(app: Express): Promise<Server> {
  // const { user } = useAuth();
  setupAuth(app);

  // const cartToken = !user ? Cookies.get(CART_TOKEN_COOKIE) : undefined;

  // Events
  app.get("/api/events", async (_req, res) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  app.post("/api/events", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "vendor", "organizer"].includes(req.user.role) ) {
      return res.status(403).json({ message: "Unauthorized - Vendor/Organizer access required" });
    }
    try {
      const parsedEvent = insertEventSchema.parse({
        ...req.body,
        vendorId: req.user.id,
        approved: false
      });
      const event = await storage.createEvent(parsedEvent);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid event data" });
    }
  });

  // Get archived events
  app.get("/api/events/archived", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.sendStatus(403);
    }
    const archivedEvents = await storage.getArchivedEvents();
    res.json(archivedEvents);
  });

  app.patch("/api/events/:id/approve", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "organizer"].includes(req.user.role)) {
      return res.sendStatus(403);
    }
    const event = await storage.updateEvent(parseInt(req.params.id), {
      approved: true,
    });
    if (!event) return res.sendStatus(404);
    res.json(event);
  });

  app.get("/api/events/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
    }
    const event = await storage.getEvent(id);
    if (!event) return res.sendStatus(404);
    res.json(event);
})

  app.get("/api/events/city/:city", async (req, res) => {
    const event = await storage.getCityEvent(req.params.city);
    if (!event) return res.sendStatus(404);
    res.json(event);
  })

  // Edit Event
  app.put("/api/events/:id", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "organizer", "vendor"].includes(req.user.role)) {
      return res.sendStatus(403);
    }
    try {
      const parsedEvent = insertEventSchema.parse({
        ...req.body,
      });
      const event = await storage.updateEvent(parseInt(req.params.id), parsedEvent);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid event data" });
    }
  });

  // Stalls
  app.get("/api/stalls", async (_req, res) => {
    const stalls = await storage.getStalls();
    res.json(stalls);
  });

  // Get archived stalls
  app.get("/api/stalls/archived", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.sendStatus(403);
    }
    const archivedStalls = await storage.getArchivedStalls();
    res.json(archivedStalls);
  });

  app.get("/api/events/:eventId/stalls", async (req, res) => {
    const stalls = await storage.getStallsByEvent(parseInt(req.params.eventId));
    res.json(stalls);
  });

  app.post("/api/stalls", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "vendor") {
      return res.sendStatus(403);
    }
    const stall = await storage.createStall({
      ...req.body,
      vendorId: req.user.id,
    });
    res.status(201).json(stall);
  });

  app.patch("/api/stalls/:id/approve", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.sendStatus(403);
    }
    const stall = await storage.updateStall(parseInt(req.params.id), {
      approved: true,
    });
    if (!stall) return res.sendStatus(404);
    res.json(stall);
  });

  app.get("/api/stalls/:id", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "vendor", "organizer"].includes(req.user.role)) {
      return res.sendStatus(403);
    }
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid stall ID" });
    }
    const stalls = await storage.getStall(parseInt(req.params.id));
    res.json(stalls);
  });

  // Edit Stall
  app.put("/api/stalls/:id", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "vendor", "organizer"].includes(req.user.role)) {
      return res.sendStatus(403);
    }
    const stall = await storage.updateStall(parseInt(req.params.id), req.body);
    if (!stall) return res.sendStatus(404);
    res.json(stall);
  });

  // Products
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/feature", async (_req, res) => {
    const products = await storage.getProductsFeatured();
    res.json(products);
  });

  app.get("/api/products/paginate", async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const searchTerm = req.query.searchTerm as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const category = req.query.category as string;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
    const sortBy = req.query.sortBy as string;
    const sortOrder = req.query.sortOrder as string;

    const products = await storage.getPaginatedProducts(
      page,
      pageSize,
      searchTerm,
      startDate,
      endDate,
      category,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder
    );
    res.json(products);
  });

  // Get archived products
  app.get("/api/products/archived", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.sendStatus(403);
    }
    const archivedProducts = await storage.getArchivedProducts();
    res.json(archivedProducts);
  });

  app.get("/api/stalls/:stallId/products", async (req, res) => {
    const products = await storage.getProductsByStall(parseInt(req.params.stallId));
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "vendor") {
      return res.sendStatus(403);
    }
    const product = await storage.createProduct({
      ...req.body,
      // availableStock: req.body.stock,
    });
    res.status(201).json(product);
  });

  app.patch("/api/products/:id/approve", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "organizer"].includes(req.user.role)) {
      return res.sendStatus(403);
    }
    const product = await storage.updateProduct(parseInt(req.params.id), {
      approved: true,
    });
    if (!product) return res.sendStatus(404);
    res.json(product);
  });

  app.get("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "vendor", "organizer"].includes(req.user.role)) {
      return res.sendStatus(403);
    }
    if(isNaN(parseInt(req.params.id))) return res.status(400).json({ message: "Invalid product ID" });
    const product = await storage.getProduct(parseInt(req.params.id));
    res.json(product);
  });

  app.get("/api/product/:id", async (req, res) => {
    const product = await storage.getProductDetails(parseInt(req.params.id));
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  });

  app.get("/api/product/:id/relative", async (req, res) => {
    const product = await storage.getProductsByRelative(parseInt(req.params.id));
    if (!product) return res.status(404).json({ error: "Products not found" });
    res.json(product);
  });

  // Edit Product
  app.put("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "vendor"].includes(req.user.role)) {
      return res.sendStatus(403);
    }
    const updatedBody = {
      ...req.body,
      // availableStock: req.body.stock !== undefined ? req.body.stock : req.body.availableStock
    };
    const product = await storage.updateProduct(parseInt(req.params.id), updatedBody);
    if (!product) return res.sendStatus(404);
    res.json(product);
  });

  app.get("/api/cart", async (req, res) => {
    const cartToken = req.headers["x-cart-token"];
    const userId = req.user?.id;
    // if (!req.isAuthenticated() && !cartToken) {
    if(!userId && !cartToken){
      return res.status(401).json({ message: "Missing user ID or cart token" });
    }
    const items = await storage.getCartItems(
      req.isAuthenticated() ? req.user.id : undefined,
      cartToken?.toString() || null
    );
    res.json(items);
  });

  app.post("/api/cart", async (req, res) => {
    const cartToken = req.headers["x-cart-token"];
    const userId = req.user?.id;
    
    if (!userId && !cartToken) {
      return res.status(401).json({ message: "Missing user ID or cart token" });
    }
    
    try {
      const cartItem = await storage.addToCart({
        ...req.body,
        userId: userId || null,
        cartToken: cartToken || null
      });
      res.json(cartItem);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Failed to add item to cart' });
      }
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    const cartToken = req.headers["x-cart-token"];
    const userId = req.user?.id;
    
    if (!userId && !cartToken) {
      return res.status(401).json({ message: "Missing user ID or cart token" });
    }
    const cartItem = await storage.updateCartItem(
      parseInt(req.params.id),
      req.body.quantity,
      userId,
      cartToken as string
    );
    if (!cartItem) return res.sendStatus(404);
    res.json(cartItem);
  });
  
  app.delete("/api/cart/:id", async (req, res) => {
    const cartToken = req.headers["x-cart-token"];
    const userId = req.user?.id;
    
    if (!userId && !cartToken) {
      return res.status(400).json({ message: "Missing user ID or cart token" });
    }
    
    const success = await storage.removeFromCart(
      parseInt(req.params.id),
      userId,
      cartToken as string
    );
    if (!success) return res.sendStatus(404);
    res.sendStatus(204);
  });

  // Orders endpoints
  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const order = await storage.createOrder({
      ...req.body,
      user_id: req.user.id,
    });
    res.status(201).json(order);
  });

  app.get("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const order = await storage.getOrder(parseInt(req.params.id));
      if (!order) return res.sendStatus(404);
      
      // Check if the user owns this order or is an admin
      if (order[0].user_id !== req.user.id && req.user.role !== "admin") {
        return res.sendStatus(403);
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order details" });
    }
  });

  app.get("/api/user/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const orders = await storage.getUserOrders(req.user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Get stall-specific order details
  app.get("/api/stall-orders/:orderId/:stallId", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const stallId = parseInt(req.params.stallId);
      const orderDetails = await storage.getStallOrder(orderId, stallId);
      res.json(orderDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stall order details" });
    }
  });

  // Update delivery status
  app.put("/api/stall-orders/:orderId/:stallId/delivery", async (req, res) => {
    const orderId = parseInt(req.params.orderId);
    const stallId = parseInt(req.params.stallId);
    const { status, notes } = req.body;

    if (!['pending','ready','delivered'].includes(status)) return  res.status(500).json({ error: "Status should be either 'pending' | 'ready' | 'delivered'" });
    try {
      const updated = await storage.updateDeliveryStatus(orderId, stallId, status, notes);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update delivery status" });
    }
  });

  app.post("/api/subscribers", async (req, res) => {
    try {
      const subscriber = await storage.createSubscriber(req.body.email);
      return res.status(201).json(subscriber);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to subscribe"
      });
    }
  });
  

  // Cron job endpoint to archive expired events
  app.post("/api/cron/archive-expired-events", async (req, res) => {
    try {
      // Optional: Add some basic security with a secret key
      const { secret } = req.body;
      if (secret !== process.env.CRON_SECRET) {
        return res.status(401).json({ message: "Unauthorized: Invalid secret key" });
      }
      
      // Archive expired events
      const archivedCount = await storage.archiveExpiredEvents();
      
      return res.status(200).json({
        success: true,
        message: `Successfully archived ${archivedCount} expired events and their associated stalls and products.`,
        archivedCount
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to archive expired events",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

