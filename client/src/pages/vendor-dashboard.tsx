import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import {
  Event,
  Stall,
  Product,
} from "@shared/schema";
import { AddEvent } from "@/components/event/add-event";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Plus, Pencil } from "lucide-react";
import { useState } from "react";
import { DEFAULT_IMAGES } from "@/config/constants";
import { AddStall } from "@/components/stall/add-stall";
import { AddProduct } from "@/components/product/add-product";
import { MyEventsSection } from "@/components/dashboard/my-events-section";
import { Input } from "@/components/ui/input";
import { OtherEventsSection } from "@/components/dashboard/other-events-section";

interface VendorDashboardProps {
  searchTerm?: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>> 
}

export default function VendorDashboard(
  { searchTerm = "", setSearchTerm }: VendorDashboardProps
) {
  const { user } = useAuth();
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [stallDialogOpen, setStallDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
  const [eventEditDialogOpen, setEventEditDialogOpen] = useState(false);
  const [editEventId, setEditEventId] = useState<number | null>(null);
  const [editStallId, setEditStallId] = useState<number | null>(null);
  const [editProductId, setEditProductId] = useState<number | null>(null);

  const { data: events, isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: stalls, isLoading: loadingStalls } = useQuery<Stall[]>({
    queryKey: ["/api/stalls"],
  });

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // First, filter products based on search term
  const matchedProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get stalls that either match the search term or contain matching products
  const matchedStalls = stalls?.filter((stall) => {
    const stallMatches = stall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stall.description.toLowerCase().includes(searchTerm.toLowerCase());

    const hasMatchingProduct = matchedProducts?.some(
      (product) => product.stallId === stall.id
    );

    return (stallMatches || hasMatchingProduct) && stall.vendorId === user?.id;
  });

  // Get events that either match the search term or contain matching stalls
  const myEvents = events?.filter((event) => {
    const eventMatches = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    const hasMatchingStall = matchedStalls?.some(
      (stall) => stall.eventId === event.id
    );

    return (eventMatches || hasMatchingStall) && event.vendorId === user?.id;
  });

  // Filter stalls for display based on matched events
  const myStalls = matchedStalls?.filter((stall) =>
    myEvents?.some((event) => event.id === stall.eventId)
  );

  const otherEvents = events?.filter((event) => {
    const eventMatches = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    const hasMatchingStall = matchedStalls?.some(
      (stall) => stall.eventId != event.id
    );

    return (eventMatches || hasMatchingStall) && event.vendorId != user?.id;
  });

  // Filter products for display based on matched stalls
  const otherProducts = products?.filter((product) =>
    myStalls?.some((stall) => stall.id != product.stallId)
  );

  const otherStalls = matchedStalls?.filter((stall) =>
    myEvents?.some((event) => event.id != stall.eventId)
  );

  if (loadingEvents || loadingStalls || loadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-4 md:mb-8">
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage events, stalls, and products
          </p>
        </header>
        <div className="flex mb-6">
            <Input
                type="search"
                placeholder="Search events and products..."
                className="pr-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div> 

        <div className="grid gap-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">My Events</h2>
              <AddEvent
                eventDialogOpen={eventDialogOpen}
                setEventDialogOpen={setEventDialogOpen}
              />
            </div>
            <MyEventsSection
              events={myEvents}
              stalls={myStalls}
              products={matchedProducts}
              editEventId={editEventId}
              setEditEventId={setEditEventId}
              eventEditDialogOpen={eventEditDialogOpen}
              setEventEditDialogOpen={setEventEditDialogOpen}
              stallDialogOpen={stallDialogOpen}
              setStallDialogOpen={setStallDialogOpen}
              selectedEvent={selectedEvent}
              setSelectedEvent={setSelectedEvent}
              productDialogOpen={productDialogOpen}
              setProductDialogOpen={setProductDialogOpen}
              selectedStall={selectedStall}
              setSelectedStall={setSelectedStall}
              editStallId={editStallId}
              setEditStallId={setEditStallId}
              editProductId={editProductId}
              setEditProductId={setEditProductId}
              enableButton={true}
            />
          </section>
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Others Events</h2>
            </div>
            <OtherEventsSection
              events={otherEvents}
              stalls={otherStalls}
              products={otherProducts}
              stallDialogOpen={stallDialogOpen}
              setStallDialogOpen={setStallDialogOpen}
              selectedEvent={selectedEvent}
              setSelectedEvent={setSelectedEvent}
              productDialogOpen={productDialogOpen}
              setProductDialogOpen={setProductDialogOpen}
              selectedStall={selectedStall}
              setSelectedStall={setSelectedStall}
            />
          </section>
        </div>
      </div>
    </div>
  );
}