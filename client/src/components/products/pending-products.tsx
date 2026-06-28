import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Boxes,
  CheckCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  Package,
  Tag,
} from "lucide-react";
import { UseMutationResult } from "@tanstack/react-query";

interface PendingProductsProps {
  pendingProducts?: Product[];
  approveProduct: UseMutationResult<any, Error, number>;
}

export default function PendingProducts({
  pendingProducts,
  approveProduct,
}: PendingProductsProps) {
  const products = pendingProducts ?? [];

  return (
    <section className="rounded-lg border border-[#e4e1da] bg-white p-4  lg:p-5">
      <div className="flex flex-col gap-4 border-b border-[#e4e1da] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f3f4f6] text-[#111936]">
            <Package className="h-[18px] w-[18px]" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-normal text-[#2f3137]">
              Pending Product Approvals
            </h2>
            <p className="text-[13px] text-[#86827a]">
              Approve catalog items submitted by vendors.
            </p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-3 py-1 text-xs font-semibold text-[#B45309]">
          <Clock3 className="h-3.5 w-3.5" />
          {products.length} pending
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#dedbd3] bg-[#fafafa] px-5 py-8 text-center md:col-span-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E]/10 text-[#15803D]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-[#2f3137]">
              No pending products
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#86827a]">
              Vendor product submissions are fully reviewed.
            </p>
          </div>
        ) : (
          products.map((product) => (
            <article
              key={product.id}
              className="flex h-full flex-col rounded-lg border border-[#e4e1da] bg-white p-4 shadow-sm transition duration-200 hover:border-[#cbc7bd]"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold tracking-normal text-[#2f3137]">
                    {product.name}
                  </h3>
                  <span className="rounded-full bg-[#F59E0B]/10 px-2.5 py-1 text-xs font-semibold text-[#B45309]">
                    Awaiting review
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#86827a]">
                  {product.description}
                </p>

                <div className="mt-4 grid gap-2 text-[13px] text-[#5f636d]">
                  <div className="flex items-center justify-between rounded-lg bg-[#f8f8f6] px-3 py-2">
                    <span className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-[#111936]" />
                      Price
                    </span>
                    <span className="font-semibold text-[#2f3137]">
                      ${(product.price / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-[#f8f8f6] px-3 py-2">
                    <span className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-[#111936]" />
                      Category
                    </span>
                    <span className="font-semibold capitalize text-[#2f3137]">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-[#f8f8f6] px-3 py-2">
                    <span className="flex items-center gap-2">
                      <Boxes className="h-4 w-4 text-[#111936]" />
                      Stock
                    </span>
                    <span className="font-semibold text-[#2f3137]">
                      {product.stock}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                className="mt-4 h-10 w-full rounded-lg bg-[#111936] text-sm font-semibold text-white hover:bg-[#172242]"
                onClick={() => approveProduct.mutate(product.id)}
                disabled={approveProduct.isPending}
              >
                {approveProduct.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Approve
              </Button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
