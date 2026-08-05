import { sendEmail } from "./email";

export type DispatchEmailDetails = {
  email: string;
  customerName: string;
  orderId: number;
  notes: string | null;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
};

const escapeHtml = (value: string | number) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#39;");

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount / 100);

export async function sendDispatchEmail(details: DispatchEmailDetails): Promise<void> {
  const dispatchDate = new Date().toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" });
  const currentYear = new Date().getFullYear();

  const itemsHtml = details.items.map((item) => `
    <tr>
      <td style="padding:10px 0;color:#111827;font-size:14px">${escapeHtml(item.name)}</td>
      <td style="padding:10px 0;text-align:center;color:#6b7280;font-size:14px">${item.quantity}</td>
      <td style="padding:10px 0;text-align:right;color:#111827;font-size:14px;font-weight:600">${formatPrice(item.price)}</td>
    </tr>`).join("");

  const notesHtml = details.notes
    ? `<p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#374151"><strong>Dispatch note:</strong> ${escapeHtml(details.notes)}</p>`
    : "";

  await sendEmail({
    to: details.email,
    subject: `Your order #${details.orderId} has been dispatched`,
    text: [
      `Hi ${details.customerName},`,
      `Your order #${details.orderId} has been dispatched.`,
      ...details.items.map((item) => `${item.name} — Qty: ${item.quantity} — ${formatPrice(item.price)}`),
      details.notes ? `Dispatch note: ${details.notes}` : "",
    ].filter(Boolean).join("\n"),
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Order Has Been Dispatched</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f4f5f7;
      font-family: Segoe UI, Arial, Helvetica, sans-serif;
    "
  >
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="background-color: #f4f5f7; padding: 32px 0"
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            width="600"
            cellpadding="0"
            cellspacing="0"
            style="
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
              max-width: 600px;
              width: 100%;
            "
          >
            <!-- Header -->
            <tr>
              <td
                style="
                  background-color: #111827;
                  padding: 28px 40px;
                  text-align: center;
                "
              >
                <span
                  style="
                    color: #ffffff;
                    font-size: 20px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                  "
                  >Tap &amp; Grab</span
                >
              </td>
            </tr>

            <!-- Status Banner -->
            <tr>
              <td style="padding: 0">
                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                >
                  <tr>
                    <td
                      style="
                        background-color: #ecfdf5;
                        padding: 28px 40px;
                        text-align: center;
                        border-bottom: 1px solid #d1fae5;
                      "
                    >
                      <div
                        style="
                          display: inline-block;
                          width: 56px;
                          height: 56px;
                          background-color: #10b981;
                          border-radius: 50%;
                          line-height: 56px;
                          text-align: center;
                          margin-bottom: 14px;
                        "
                      >
                        <span style="color: #ffffff; font-size: 28px"
                          >&#10003;</span
                        >
                      </div>
                      <h1
                        style="
                          margin: 8px 0 0;
                          font-size: 22px;
                          color: #065f46;
                          font-weight: 700;
                        "
                      >
                        Your order is on its way!
                      </h1>
                      <p
                        style="margin: 6px 0 0; font-size: 14px; color: #047857"
                      >
                        Great news — your product has been dispatched.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 36px 40px 8px">
                <p style="font-size: 15px; color: #374151; margin: 0 0 4px">
                  Hi <strong>${escapeHtml(details.customerName)}</strong>,
                </p>
                <p
                  style="
                    font-size: 15px;
                    color: #374151;
                    line-height: 1.6;
                    margin: 12px 0 0;
                  "
                >
                  We're excited to let you know that your order has left our
                  warehouse and is now heading your way. Here are your order
                  details:
                </p>
              </td>
            </tr>

            <!-- Order Items Card -->
            <tr>
              <td style="padding: 20px 40px">
                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="border: 1px solid #e5e7eb; border-radius: 10px"
                >
                  <tr>
                    <td style="padding: 20px 24px">
                      <table
                        role="presentation"
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                      >
                        <tr>
                          <td
                            style="
                              padding-bottom: 14px;
                              border-bottom: 1px solid #f3f4f6;
                            "
                          >
                            <table
                              role="presentation"
                              width="100%"
                              cellpadding="0"
                              cellspacing="0"
                              style="border-collapse:collapse"
                            >
                              <thead>
                                <tr>
                                  <th align="left" style="padding:0 0 10px;color:#6b7280;font-size:12px;text-transform:uppercase">Item</th>
                                  <th style="padding:0 0 10px;color:#6b7280;font-size:12px;text-transform:uppercase">Qty</th>
                                  <th align="right" style="padding:0 0 10px;color:#6b7280;font-size:12px;text-transform:uppercase">Price</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${itemsHtml}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <table
                        role="presentation"
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        style="margin-top: 16px"
                      >
                        <tr>
                          <td
                            style="
                              font-size: 13px;
                              color: #6b7280;
                              padding: 4px 0;
                            "
                          >
                            Order Number
                          </td>
                          <td
                            style="
                              font-size: 13px;
                              color: #111827;
                              font-weight: 600;
                              text-align: right;
                              padding: 4px 0;
                            "
                          >
                            #${escapeHtml(details.orderId)}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              font-size: 13px;
                              color: #6b7280;
                              padding: 4px 0;
                            "
                          >
                            Dispatch Date
                          </td>
                          <td
                            style="
                              font-size: 13px;
                              color: #111827;
                              font-weight: 600;
                              text-align: right;
                              padding: 4px 0;
                            "
                          >
                            ${escapeHtml(dispatchDate)}
                          </td>
                        </tr>
                      </table>

                      ${notesHtml}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  background-color: #f9fafb;
                  padding: 24px 40px;
                  text-align: center;
                "
              >
                <p style="margin: 0; font-size: 12px; color: #9ca3af">
                  Questions about your order?
                  <a
                    href="mailto:support@tapandgrab.lk"
                    style="
                      color: #111827;
                      font-weight: 600;
                      text-decoration: none;
                    "
                    >Contact Support</a
                  >
                </p>
                <p style="margin: 16px 0 0; font-size: 12px; color: #9ca3af">
                  &copy; ${currentYear} Tap &amp; Grab. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  });
}
