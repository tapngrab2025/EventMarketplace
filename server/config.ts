export const config = {
  // ... other config
  payhere: {
    merchantId: process.env.PAYHERE_MERCHANT_ID || "",
    merchantSecret: process.env.PAYHERE_MERCHANT_SECRET || "",
    sandbox: process.env.NODE_ENV !== "production"
  },
  baseUrl: process.env.BASE_URL || "http://localhost:3000"
};