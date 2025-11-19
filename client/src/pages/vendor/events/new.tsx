import { VendorLayout } from "@/components/layouts/VendorLayout";
import { EventForm } from "@/components/event/event-form";
import { useLocation } from "wouter";

export default function VendorEventNew() {
  const [, setLocation] = useLocation();
  return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Create Event</h1>
        <EventForm onSuccess={() => setLocation("/vendor")} />
      </div>
  );
}