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
    if (!req.isAuthenticated() || !["vendor", "organizer"].includes(req.user.role) ) {
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

  // Products
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
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

  const httpServer = createServer(app);
  return httpServer;
}