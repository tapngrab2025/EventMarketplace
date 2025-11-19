import { VendorLayout } from "@/components/layouts/VendorLayout";
import { StallEditForm } from "@/components/stall/stall-edit-form";
import { useRoute } from "wouter";

export default function VendorStallEdit() {
  const [, params] = useRoute("/vendor/stalls/:id/edit");
  const id = parseInt(params?.id || "0");
  return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Edit Stall</h1>
        {id ? <StallEditForm stallId={id} onClose={() => {}} /> : null}
      </div>
  );
}