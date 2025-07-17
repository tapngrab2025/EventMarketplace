import { useQuery } from "@tanstack/react-query";
import { Event, Product, Stall } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventCard from "@/components/events/event-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminArchivesProps {
  searchTerm?: string;
}

export default function AdminArchives({ searchTerm = "" }: AdminArchivesProps) {
  const { data: archivedEvents, isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events/archived"],
  });

  const { data: archivedStalls, isLoading: loadingStalls } = useQuery<Stall[]>({
    queryKey: ["/api/stalls/archived"],
  });

  const { data: archivedProducts, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products/archived"],
  });

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
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Archived Items</h1>
          <p className="text-muted-foreground">
            View events, stalls, and products that have been archived
          </p>
        </header>

        <Tabs defaultValue="events">
          <TabsList className="mb-8">
            <TabsTrigger value="events">Events ({archivedEvents?.length || 0})</TabsTrigger>
            <TabsTrigger value="stalls">Stalls ({archivedStalls?.length || 0})</TabsTrigger>
            <TabsTrigger value="products">Products ({archivedProducts?.length || 0})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="events">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {archivedEvents?.length === 0 ? (
                <p className="text-muted-foreground">No archived events</p>
              ) : (
                archivedEvents?.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="stalls">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {archivedStalls?.length === 0 ? (
                <p className="text-muted-foreground">No archived stalls</p>
              ) : (
                archivedStalls?.map((stall) => (
                  <Card key={stall.id}>
                    <CardHeader>
                      <CardTitle>{stall.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{stall.description}</p>
                      <p>Location: {stall.location}</p>
                      <p>Event ID: {stall.eventId}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="products">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {archivedProducts?.length === 0 ? (
                <p className="text-muted-foreground">No archived products</p>
              ) : (
                archivedProducts?.map((product) => (
                  <Card key={product.id}>
                    <CardHeader>
                      <CardTitle>{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{product.description.substring(0, 100)}</p>
                      <p>Price: ${(product.price / 100).toFixed(2)}</p>
                      <p>Category: {product.category}</p>
                      <p>Stock: {product.stock}</p>
                      <p>Stall ID: {product.stallId}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}