import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { insertEventSchema, insertStallSchema, insertProductSchema, insertCartItemSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

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
      console.error("Event creation error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid event data" });
    }
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
    const event = await storage.getEvent(parseInt(req.params.id));
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
      console.error("Event update error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid event data" });
    }
  });

  // Stalls
  app.get("/api/stalls", async (_req, res) => {
    const stalls = await storage.getStalls();
    res.json(stalls);
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

  app.get("/api/products/paginate", async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const searchTerm = req.query.searchTerm as string;
    const category = req.query.category as string;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
    const sortBy = req.query.sortBy as string;
    const sortOrder = req.query.sortOrder as string;

    const products = await storage.getPaginatedProducts(
      page,
      pageSize,
      searchTerm,
      category,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder
    );
    res.json(products);
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
    const product = await storage.getProduct(parseInt(req.params.id));
    res.json(product);
  });

  app.get("/api/product/:id", async (req, res) => {
    const product = await storage.getProductDetails(parseInt(req.params.id));
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  });

  // Edit Product
  app.put("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "vendor"].includes(req.user.role)) {
      return res.sendStatus(403);
    }
    const product = await storage.updateProduct(parseInt(req.params.id), req.body);
    if (!product) return res.sendStatus(404);
    res.json(product);
  });

  // Cart
  app.get("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const items = await storage.getCartItems(req.user.id);
    res.json(items);
  });

  app.post("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const item = await storage.addToCart({
      ...req.body,
      userId: req.user.id,
    });
    res.status(201).json(item);
  });

  app.patch("/api/cart/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const item = await storage.updateCartItem(
      parseInt(req.params.id),
      req.body.quantity
    );
    if (!item) return res.sendStatus(404);
    res.json(item);
  });

  app.delete("/api/cart/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const success = await storage.removeFromCart(parseInt(req.params.id));
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
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order details" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const orders = await storage.getUserOrders(req.user.id);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
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
    const subscriber = await storage.createSuscriber({
     ...req.body
    });
    res.status(201).json(subscriber);
  });

  const httpServer = createServer(app);
  return httpServer;
}

