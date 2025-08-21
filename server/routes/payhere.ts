import { Router } from "express";
import crypto from "crypto";
import { config } from "../config";
import { storage } from "server/storage";

const router = Router();

router.post("/api/orders/payhere", async (req, res) => {
  try {
    const { fullName, email, phone, total, items } = req.body;
    
    // Create order in your database first
    const order = await storage.createOrder({
      ...req.body,
      status: "pending",
      paymentMethod: "payhere"
    });

    // Generate PayHere form data
    const merchantSecret = config.payhere.merchantSecret;
    const merchantId = config.payhere.merchantId;
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
      return_url: `${config.baseUrl}/thank-you/${order.id}`,
      cancel_url: `${config.baseUrl}/cart`,
      notify_url: `${config.baseUrl}/api/payhere/notify`,
      order_id: order.id,
      items: items.map(item => item.product.name).join(", "),
      currency: currency,
      amount: amountFormatted,
      first_name: fullName.split(" ")[0],
      last_name: fullName.split(" ").slice(1).join(" "),
      email: email,
      phone: phone,
      hash: hash
    });
  } catch (error) {
    console.error("PayHere order creation error:", error);
    res.status(500).json({ error: "Failed to create PayHere order" });
  }
});

// PayHere notification handler
router.post("/api/payhere/notify", async (req, res) => {
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
        status: "paid",
        paymentId: payment_id
      });
    } else if (status_code === -2) { // Payment rejected
      await storage.updateOrder(parseInt(order_id), {
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

export default router;