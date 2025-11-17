import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, requireAuth } from "./auth";
import { storage } from "./storage";
import { insertEventSchema } from "@shared/schema";
import { insertProductFeedbackSchema } from "@shared/schema";
import { insertCouponSchema } from "@shared/schema";
import crypto from "crypto";
import { config } from "./config";
import { exit } from "process";

export async function registerRoutes(app: Express): Promise<Server> {

  setupAuth(app);

  // Events
  app.get("/api/events", async (_req, res) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  app.post("/api/events", async (req, res) => {
    if (!req.isAuthenticated() || !["admin", "vendor", "organizer"].includes(req.user.role)) {
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
    if (isNaN(parseInt(req.params.id))) return res.status(400).json({ message: "Invalid product ID" });
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
    if (!userId && !cartToken) {
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

  app.post("/api/orders/payhere", async (req, res) => {
  try {
    const { fullName, email, phone, total, items } = req.body;
    
    // console.log(items);
    // exit(1);
    // Create order in your database first
    const order = await storage.createOrder({
      ...req.body,
      user_id: req.user.id,
      status: "pending",
      paymentMethod: "payhere"
    });

    // Generate PayHere form data
    const merchantSecret = config.payhere.merchantSecret;
    const merchantId = config.payhere.merchantId;
    const baseUrl = config.baseUrl;
    const orderId = order.id;
    const amountFormatted = (total / 100).toFixed(2);
    const currency = "LKR";

    const hash = crypto
      .createHash("md5")
      .update(
        `${merchantId}${orderId}${amountFormatted}${currency}${crypto
          .createHash("md5")
          .update(merchantSecret)
          .digest("hex")
          .toUpperCase()}`
      )
      .digest("hex")
      .toUpperCase();

    // Return PayHere form data
    res.json({
      merchant_id: merchantId,
      return_url: `${baseUrl}/thank-you/${orderId}`,
      cancel_url: `${baseUrl}/cart`,
      notify_url: `${baseUrl}/api/payhere/notify`,
      order_id: `${orderId}`,
      items: items.map(item => item.name).join(", "),
      currency: currency,
      amount: amountFormatted,
      first_name: fullName.split(" ")[0],
      last_name: fullName.split(" ").slice(1).join(" "),
      email: email,
      phone: phone,
      country : 'Sri Lanka',
      city: 'Colombo',
      address : '123 Main St',
      hash: hash
    });
  } catch (error) {
    console.error("PayHere order creation error:", error);
    res.status(500).json({ error: "Failed to create PayHere order" });
  }
  });

  // PayHere notification handler
  app.post("/api/payhere/notify", async (req, res) => {
    try {
      const { merchant_id, order_id, payment_id, payhere_amount, payhere_currency, 
              status_code, md5sig, status_message } = req.body;

      // Verify the PayHere signature
      const merchantSecret = config.payhere.merchantSecret;
      const hash = crypto
        .createHash("md5")
        .update(
          `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${crypto
            .createHash("md5")
            .update(merchantSecret)
            .digest("hex")
            .toUpperCase()}`
        )
        .digest("hex")
        .toUpperCase();

      if (hash !== md5sig) {
        return res.status(400).json({ error: "Invalid signature" });
      }

      // Update order status based on PayHere status
      if (status_code === 2) { // Payment successful
        await storage.updateOrder(parseInt(order_id), {
          user_id: req.user.id,
          status: "paid",
          paymentId: payment_id
        });
      } else if (status_code === -2) { // Payment rejected
        await storage.updateOrder(parseInt(order_id), {
          user_id: req.user.id,
          status: "failed",
          paymentId: payment_id
        });
      }

      res.json({ status: "success" });
    } catch (error) {
      console.error("PayHere notification error:", error);
      res.status(500).json({ error: "Failed to process PayHere notification" });
    }
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

  app.get("/api/user/orders", requireAuth,  async (req, res) => {
    // if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const orders = await storage.getUserOrders(req.user?.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Get stall-specific order details (requires auth)
  app.get("/api/stall-orders/:orderId/:stallId", requireAuth, async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const stallId = parseInt(req.params.stallId);

      // Access control: admin can access; vendor can access only if owns the stall; customer can access only if owns the order
      const stall = await storage.getStall(stallId);
      const order = await storage.getOrder(orderId);
      const isAdmin = req.user?.role === "admin";
      const isVendorOwner = stall?.vendorId === req.user?.id;
      const isOrderOwner = Array.isArray(order) && order[0]?.user_id === req.user?.id;
      if (!isAdmin && !isVendorOwner && !isOrderOwner) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const orderDetails = await storage.getStallOrder(orderId, stallId);
      res.json(orderDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stall order details" });
    }
  });

  // Update delivery status (requires auth)
  app.put("/api/stall-orders/:orderId/:stallId/delivery", requireAuth, async (req, res) => {
    const orderId = parseInt(req.params.orderId);
    const stallId = parseInt(req.params.stallId);
    const { status, notes } = req.body;

    if (!['pending', 'ready', 'delivered'].includes(status)) return res.status(500).json({ error: "Status should be either 'pending' | 'ready' | 'delivered'" });
    try {
      // Only admin or the stall's vendor can update delivery status
      const stall = await storage.getStall(stallId);
      const isAdmin = req.user?.role === "admin";
      const isVendorOwner = stall?.vendorId === req.user?.id;
      if (!isAdmin && !isVendorOwner) {
        return res.status(403).json({ message: "Forbidden" });
      }
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

  // Coupon endpoints
  // Get all coupons for an event
  app.get("/api/events/:id/coupons", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const coupons = await storage.getCoupons(eventId);
      
      // Get excluded stalls for each coupon
      const couponsWithExcludedStalls = await Promise.all(
        coupons.map(async (coupon) => {
          const excludedStallIds = await storage.getExcludedStalls(coupon.id);
          return {
            ...coupon,
            excludedStalls: excludedStallIds.map(stallId => ({ stallId }))
          };
        })
      );
      
      res.json(couponsWithExcludedStalls);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).json({ error: "Failed to fetch coupons" });
    }
  });

  // Create a new coupon
  app.post("/api/events/:id/coupons", async (req, res) => {
    if (!req.isAuthenticated() || !['admin', 'organizer'].includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    try {
      const eventId = parseInt(req.params.id);
      
      const couponData = insertCouponSchema.parse({
        ...req.body,
        eventId,
        createdBy: req.user.id
      });
      
      const excludedStallIds = req.body.excludedStallIds || [];
      delete couponData.excludedStallIds;
      
      const coupon = await storage.createCoupon(couponData);
      
      // Add excluded stalls
      for (const stallId of excludedStallIds) {
        await storage.addExcludedStall(coupon.id, stallId);
      }
      
      // Get the complete coupon with excluded stalls
      const excludedStalls = await storage.getExcludedStalls(coupon.id);
      
      res.status(201).json({
        ...coupon,
        excludedStalls: excludedStalls.map(stallId => ({ stallId }))
      });
    } catch (error) {
      console.error("Error creating coupon:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create coupon" });
    }
  });

  // Update a coupon
  app.put("/api/coupons/:id", async (req, res) => {
    if (!req.isAuthenticated() || !['admin', 'organizer'].includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    try {
      const couponId = parseInt(req.params.id);
      
      const couponData = { ...req.body };
      const excludedStallIds = req.body.excludedStallIds || [];
      delete couponData.excludedStallIds;
      
      // Update coupon
      const updatedCoupon = await storage.updateCoupon(couponId, couponData);
      
      if (!updatedCoupon) {
        return res.status(404).json({ error: "Coupon not found" });
      }
      
      // Get current excluded stalls
      const currentExcludedStalls = await storage.getExcludedStalls(couponId);
      
      // Remove stalls that are no longer excluded
      for (const stallId of currentExcludedStalls) {
        if (!excludedStallIds.includes(stallId)) {
          await storage.removeExcludedStall(couponId, stallId);
        }
      }
      
      // Add newly excluded stalls
      for (const stallId of excludedStallIds) {
        if (!currentExcludedStalls.includes(stallId)) {
          await storage.addExcludedStall(couponId, stallId);
        }
      }
      
      // Get updated excluded stalls
      const updatedExcludedStalls = await storage.getExcludedStalls(couponId);
      
      res.json({
        ...updatedCoupon,
        excludedStalls: updatedExcludedStalls.map(stallId => ({ stallId }))
      });
    } catch (error) {
      console.error("Error updating coupon:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to update coupon" });
    }
  });

  // Delete a coupon
  app.delete("/api/coupons/:id", async (req, res) => {
    if (!req.isAuthenticated() || !['admin', 'organizer'].includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    try {
      const couponId = parseInt(req.params.id);
      
      await storage.deleteCoupon(couponId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting coupon:", error);
      res.status(500).json({ error: "Failed to delete coupon" });
    }
  });

  // Validate a coupon code
  app.post("/api/validate-coupon", async (req, res) => {
    try {
      const {code, productIds} = req.body;

      if (!code) {
        return res.status(400).json({ error: "Coupon code is required" });
      }
      
      // Use the improved validateCoupon method
      const validationResult = await storage.validateCoupon(code, productIds);
      
      // Return the validation result
      res.json(validationResult);
    } catch (error) {
      console.error("Error validating coupon:", error);
      res.status(500).json({ error: "Failed to validate coupon" });
    }
  });


   // System Settings Routes
  app.get("/api/settings/feedback", async (req, res) => {
    const feedbackEnabled = await storage.getSystemSetting("feedback_enabled");
    res.json({ enabled: feedbackEnabled === "true" });
  });

  app.patch("/api/settings/feedback", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.sendStatus(403);
    }
    const { enabled } = req.body;
    await storage.setSystemSetting(
      "feedback_enabled",
      enabled ? "true" : "false",
      "Controls whether product feedback feature is enabled"
    );
    res.json({ success: true });
  });

  // Product Feedback Routes
  app.post("/api/product/:productId/feedback", async (req, res) => {

    if (!req.isAuthenticated()) {
      return res.sendStatus(403);
    }
    const productId = parseInt(req.params.productId);
    const userId = req.user!.id;

    try {
      const canProvideFeedback = await storage.canUserProvideFeedback(userId, productId);
      if (!canProvideFeedback) {
        return res.status(403).json({
          error: "You are not eligible to provide feedback for this product"
        });
      }

      const feedbackData = insertProductFeedbackSchema.parse({
        ...req.body,
        productId,
        userId,
      });

      const feedback = await storage.createProductFeedback(feedbackData);
      res.json(feedback);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(error.message);
      } else {
        res.status(500).json({ error: "Failed to create feedback" });
      }
    }
  });

  app.get("/api/products/:productId/feedback", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const feedback = await storage.getProductFeedback(productId);
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching product feedback:", error);
      res.status(500).json({ error: "Failed to fetch product feedback" });
    }
  });

  app.put("/api/feedback/:feedbackId/status", async (req, res) => {
    if (!req.isAuthenticated() && !["admin"].includes(req.user.role)) {
      return res.sendStatus(403);
    }
    const feedbackId = parseInt(req.params.feedbackId);
    const { status } = req.body;

    if (status !== "approved" && status !== "rejected") {
      return res.status(400).json({ error: "Invalid status" });
    }

    try {
      await storage.updateFeedbackStatus(feedbackId, status);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update feedback status" });
    }
  });

  app.get("/api/products/:productId/user-feedback", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(403);
    }
    const productId = parseInt(req.params.productId);
    const userId = req.user!.id;

    const feedback = await storage.getUserProductFeedback(userId, productId);
    res.json(feedback);
  });

  app.get("/api/products/:productId/order", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(403);
    }

    const productId = parseInt(req.params.productId);
    const userId = req.user!.id;

    try {

      const orderResults = await storage.getUserExistingOrderForProduct(userId, productId);
      // const orderResults = await db
      //   .select({ orderId: orderItems.orderId })
      //   .from(orderItems)
      //   .innerJoin(orders, eq(orders.id, orderItems.orderId))
      //   .where(
      //     and(
      //       eq(orders.user_id, userId),
      //       eq(orderItems.productId, productId),
      //       eq(orders.status, "completed")
      //     )
      //   )
      //   .limit(1);

      if (orderResults.length === 0) {
        return res.json({ orderId: null });
      }

      res.json({ orderId: orderResults[0].orderId });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order information" });
    }
  });

  app.get("/api/products/:productId/can-feedback", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(403);
    }

    const productId = parseInt(req.params.productId);
    const userId = req.user!.id;

    const canProvideFeedback = await storage.canUserProvideFeedback(userId, productId);
    res.json({ canProvideFeedback });
  });

  // Vendor mobile API
  app.get("/api/vendor/events", requireAuth, async (req, res) => {
    if (!req.user || !["vendor", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const eventsList = await storage.getVendorEvents(req.user.id);
      res.json(eventsList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendor events" });
    }
  });

  app.get("/api/vendor/events/:eventId", requireAuth, async (req, res) => {
    if (!req.user || !["vendor", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const eventId = parseInt(req.params.eventId);
      const event = await storage.getEvent(eventId);
      if (!event) return res.sendStatus(404);
      const stalls = await storage.getVendorEventStalls(req.user.id, eventId);
      res.json({ event, stalls });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.get("/api/vendor/events/:eventId/stalls", requireAuth, async (req, res) => {
    if (!req.user || !["vendor", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const eventId = parseInt(req.params.eventId);
      const stalls = await storage.getVendorEventStalls(req.user.id, eventId);
      res.json(stalls);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stalls" });
    }
  });

  app.get("/api/vendor/events/:eventId/stalls/:stallId/orders", requireAuth, async (req, res) => {
    if (!req.user || !["vendor", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const eventId = parseInt(req.params.eventId);
      const stallId = parseInt(req.params.stallId);
      const stall = await storage.getStall(stallId);
      if (!stall || stall.vendorId !== req.user.id || stall.eventId !== eventId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const orders = await storage.getVendorStallOrders(stallId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stall orders" });
    }
  });

  app.get("/api/vendor/events/:eventId/orders", requireAuth, async (req, res) => {
    if (!req.user || !["vendor", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const eventId = parseInt(req.params.eventId);
      const orders = await storage.getVendorEventOrders(req.user.id, eventId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event orders" });
    }
  });

  app.get("/api/vendor/events/:eventId/sales", requireAuth, async (req, res) => {
    if (!req.user || !["vendor", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const eventId = parseInt(req.params.eventId);
      const sales = await storage.getVendorEventSales(req.user.id, eventId);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.get("/api/vendor/orders", requireAuth, async (req, res) => {
    if (!req.user || !["vendor", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const eventsList = await storage.getVendorEvents(req.user.id);
      const all: any[] = [];
      for (const ev of eventsList) {
        const orders = await storage.getVendorEventOrders(req.user.id, ev.id);
        all.push(...orders);
      }
      // De-duplicate by order id
      const map = new Map<number, any>();
      for (const o of all) { map.set(o.id, o); }
      res.json(Array.from(map.values()));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendor orders" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
