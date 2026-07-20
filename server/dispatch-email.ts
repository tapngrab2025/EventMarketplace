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
<html lang="en"><body style="margin:0;padding:0;background:#f4f5f7;font-family:Segoe UI,Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;background:#f4f5f7"><tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden">
      <tr><td style="padding:28px 40px;background:#111827;text-align:center;color:#fff;font-size:20px;font-weight:700">Tap &amp; Grab</td></tr>
      <tr><td style="padding:28px 40px;text-align:center;background:#ecfdf5;border-bottom:1px solid #d1fae5">
        <div style="font-size:28px;color:#10b981">&#10003;</div>
        <h1 style="margin:8px 0 0;font-size:22px;color:#065f46">Your order is on its way!</h1>
        <p style="margin:6px 0 0;font-size:14px;color:#047857">Your product has been dispatched.</p>
      </td></tr>
      <tr><td style="padding:32px 40px">
        <p style="margin:0;font-size:15px;color:#374151">Hi <strong>${escapeHtml(details.customerName)}</strong>,</p>
        <p style="margin:12px 0 20px;font-size:15px;line-height:1.6;color:#374151">Here are the dispatched items from your order.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px">
          <tr><th align="left" style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:12px;text-transform:uppercase">Item</th><th style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:12px;text-transform:uppercase">Qty</th><th align="right" style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:12px;text-transform:uppercase">Price</th></tr>
          ${itemsHtml}
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px"><tr><td style="color:#6b7280;font-size:13px">Order Number</td><td align="right" style="color:#111827;font-size:13px;font-weight:600">#${escapeHtml(details.orderId)}</td></tr><tr><td style="padding-top:8px;color:#6b7280;font-size:13px">Dispatch Date</td><td align="right" style="padding-top:8px;color:#111827;font-size:13px;font-weight:600">${escapeHtml(new Date().toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" }))}</td></tr></table>
        ${notesHtml}
      </td></tr>
      <tr><td style="padding:20px 40px;text-align:center;background:#f9fafb;color:#9ca3af;font-size:12px">&copy; ${new Date().getFullYear()} Tap &amp; Grab. All rights reserved.</td></tr>
    </table>
  </td></tr></table>
</body></html>`,
  });
}
