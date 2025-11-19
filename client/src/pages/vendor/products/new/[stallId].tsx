import { VendorLayout } from "@/components/layouts/VendorLayout";
import { ProductForm } from "@/components/product/product-form";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Stall } from "@shared/schema";

export default function VendorProductNew() {
  const [, params] = useRoute("/vendor/products/new/:stallId");
  const stallId = parseInt(params?.stallId || "0");
  const [, setLocation] = useLocation();
  const { data: stall } = useQuery<Stall>({ queryKey: ["/api/stalls/" + stallId], enabled: !!stallId });
  return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Add Product</h1>
        {stall ? (
          <ProductForm stall={stall} onSuccess={() => setLocation("/vendor")} />
        ) : null}
      </div>
  );
}