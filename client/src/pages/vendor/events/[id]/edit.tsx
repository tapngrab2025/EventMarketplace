import { VendorLayout } from "@/components/layouts/VendorLayout";
import { EditEventForm } from "@/components/event/event-edit-form";
import { useRoute } from "wouter";

export default function VendorEventEdit() {
  const [, params] = useRoute("/vendor/events/:id/edit");
  const id = parseInt(params?.id || "0");
  return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Edit Event</h1>
        {id ? <EditEventForm eventId={id} onClose={() => {}} /> : null}
      </div>
  );
}