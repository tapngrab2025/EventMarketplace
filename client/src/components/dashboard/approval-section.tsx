import { Event, Product } from "@shared/schema";
import PendingEvents from "@/components/events/pending-events";
import PendingProducts from "@/components/products/pending-products";
import { UseMutationResult } from "@tanstack/react-query";

interface ApprovalSectionProps {
  pendingEvents?: Event[];
  pendingProducts?: Product[];
  approveEvent: UseMutationResult<any, Error, number>;
  approveProduct: UseMutationResult<any, Error, number>;
}

export function ApprovalSection({
  pendingEvents,
  pendingProducts,
  approveEvent,
  approveProduct,
}: ApprovalSectionProps) {
  return (
    <div className="grid gap-8">
      <PendingEvents pendingEvents={pendingEvents} approveEvent={approveEvent} />
      <PendingProducts pendingProducts={pendingProducts} approveProduct={approveProduct} />
    </div>
  );
}