import { VendorLayout } from "@/components/layouts/VendorLayout";
import { StallForm } from "@/components/stall/stall-form";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";

export default function VendorStallNew() {
  const [, params] = useRoute("/vendor/stalls/new/:eventId");
  const eventId = parseInt(params?.eventId || "0");
  const [, setLocation] = useLocation();
  const { data: event } = useQuery<Event>({ queryKey: ["/api/events/" + eventId], enabled: !!eventId });
  return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Add Stall</h1>
        {event ? (
          <StallForm event={event} onSuccess={() => setLocation("/vendor")} />
        ) : null}
      </div>
  );
}