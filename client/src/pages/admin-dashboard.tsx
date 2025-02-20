import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, Event } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: events, isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

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
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Approve events and products</p>
        </header>

        <div className="grid gap-8">
          <section>
            <h2 className="text-2xl font-semibold mb-6">Pending Events</h2>
            <div className="grid gap-6">
              {pendingEvents?.length === 0 ? (
                <p className="text-muted-foreground">No pending events</p>
              ) : (
                pendingEvents?.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <CardTitle>{event.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{event.description}</p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p>Location: {event.location}</p>
                          <p>Dates: {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</p>
                        </div>
                        <Button
                          onClick={() => approveEvent.mutate(event.id)}
                          disabled={approveEvent.isPending}
                        >
                          {approveEvent.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Approve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6">Pending Products</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {pendingProducts?.length === 0 ? (
                <p className="text-muted-foreground">No pending products</p>
              ) : (
                pendingProducts?.map((product) => (
                  <Card key={product.id}>
                    <CardHeader>
                      <CardTitle>{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{product.description}</p>
                      <div className="space-y-2">
                        <p>Price: ${(product.price / 100).toFixed(2)}</p>
                        <p>Category: {product.category}</p>
                        <p>Stock: {product.stock}</p>
                      </div>
                      <Button
                        className="mt-4 w-full"
                        onClick={() => approveProduct.mutate(product.id)}
                        disabled={approveProduct.isPending}
                      >
                        {approveProduct.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Approve
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
