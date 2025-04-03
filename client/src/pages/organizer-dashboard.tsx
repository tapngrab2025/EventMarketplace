import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, Event, Stall } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ApprovalSection } from "@/components/dashboard/approval-section";
import { AddEvent } from "@/components/event/add-event";
import { MyEventsSection } from "@/components/dashboard/my-events-section";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VendorDashboardProps {
  searchTerm?: string;
}

export default function OrganizerDashboard({ searchTerm = "" }: VendorDashboardProps) {
  const { toast } = useToast();
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

  // Events list start
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

  const pendingEvents = events?.filter((event) => !event.approved);
  const pendingProducts = products?.filter((product) => !product.approved);

  const approveEvent = useMutation({
    mutationFn: async (eventId: number) => {
      const res = await apiRequest("PATCH", `/api/events/${eventId}/approve`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Event approved successfully",
      });
    },
  });

  const approveProduct = useMutation({
    mutationFn: async (productId: number) => {
      const res = await apiRequest("PATCH", `/api/products/${productId}/approve`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product approved successfully",
      });
    },
  });

  if (loadingEvents || loadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and approve events
          </p>
        </header>

        <Tabs defaultValue="approvals" className="space-y-6">
          <TabsList>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="myEvents">My Events</TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="space-y-6">
            <ApprovalSection
              pendingEvents={pendingEvents}
              pendingProducts={pendingProducts}
              approveEvent={approveEvent}
              approveProduct={approveProduct}
            />
          </TabsContent>

          <TabsContent value="myEvents" className="space-y-6">
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
                enableButton={false}
              />
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
