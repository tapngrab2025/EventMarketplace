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

export default function PendingProducts({ pendingProducts, approveProduct }: PendingProductsProps) {
  const products = pendingProducts ?? [];

  return (
    <section className="rounded-[20px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:p-6">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#22C55E]/10 text-[#15803D]">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-normal text-slate-950">Pending Product Approvals</h2>
            <p className="text-sm text-slate-500">Approve catalog items submitted by vendors.</p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-3 py-1 text-xs font-semibold text-[#B45309]">
          <Clock3 className="h-3.5 w-3.5" />
          {products.length} pending
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {products.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center md:col-span-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#22C55E]/10 text-[#15803D]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-950">No pending products</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Vendor product submissions are fully reviewed.
            </p>
          </div>
        ) : (
          products.map((product) => (
            <article
              key={product.id}
              className="flex h-full flex-col rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-5"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold tracking-normal text-slate-950">{product.name}</h3>
                  <span className="rounded-full bg-[#F59E0B]/10 px-2.5 py-1 text-xs font-semibold text-[#B45309]">
                    Awaiting review
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">{product.description}</p>

                <div className="mt-4 grid gap-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                    <span className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-[#0EA5A4]" />
                      Price
                    </span>
                    <span className="font-semibold text-slate-900">${(product.price / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                    <span className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-[#0EA5A4]" />
                      Category
                    </span>
                    <span className="font-semibold capitalize text-slate-900">{product.category}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                    <span className="flex items-center gap-2">
                      <Boxes className="h-4 w-4 text-[#0EA5A4]" />
                      Stock
                    </span>
                    <span className="font-semibold text-slate-900">{product.stock}</span>
                  </div>
                </div>
              </div>

              <Button
                className="mt-5 h-11 w-full rounded-2xl bg-[#0EA5A4] text-sm font-semibold text-white shadow-[0_12px_30px_rgba(14,165,164,0.28)] hover:bg-[#0B8F8E]"
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
