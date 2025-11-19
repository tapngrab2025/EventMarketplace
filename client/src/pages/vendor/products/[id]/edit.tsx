import { VendorLayout } from "@/components/layouts/VendorLayout";
import { ProductEditForm } from "@/components/product/product-edit-form";
import { useRoute } from "wouter";

export default function VendorProductEdit() {
  const [, params] = useRoute("/vendor/products/:id/edit");
  const id = parseInt(params?.id || "0");
  return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Edit Product</h1>
        {id ? <ProductEditForm productId={id} onClose={() => {}} /> : null}
      </div>
  );
}