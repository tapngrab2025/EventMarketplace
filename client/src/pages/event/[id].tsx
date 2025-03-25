import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Event, Product, Stall } from "@shared/schema";
import { Loader2, CalendarDays, MapPin, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function EventDetailsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, params] = useRoute("/event/:id");
  const id = params?.id;

  const { data: event, isLoading: loadingEvent } = useQuery<Event>({
    queryKey: [`/api/events/${id}`],
    enabled: !!id,
  });

  const { data: stalls, isLoading: loadingStalls } = useQuery<Stall[]>({
    queryKey: [`/api/events/${id}/stalls`],
    enabled: !!id,
  });

  const addToCart = useMutation({
    mutationFn: async (productId: number) => {
      const res = await apiRequest("POST", "/api/cart", {
        productId,
        quantity: 1,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  if (loadingEvent || loadingStalls) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }
  console.log(event);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl">{event?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{event?.description}</p>
          <div className="space-y-2">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{event?.location}</span>
            </div>
            <div className="flex items-center">
              <CalendarDays className="h-5 w-5 mr-2" />
              <span>
                {new Date(event?.startDate || "").toLocaleDateString()} -{" "}
                {new Date(event?.endDate || "").toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {stalls?.map((stall) => (
          <Card key={stall.id}>
            <CardHeader>
              <CardTitle>{stall.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{stall.description}</p>
              <div className="flex items-center mb-4">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm text-muted-foreground">{stall.location}</span>
              </div>

              {/* Products Grid */}
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {stall.products?.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          ${(product.price / 100).toFixed(2)}
                        </span>
                        {user?.role === "customer" && <Button
                          size="sm"
                          onClick={() => addToCart.mutate(product.id)}
                          disabled={addToCart.isPending}
                        >
                          {addToCart.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ShoppingCart className="h-4 w-4" />
                          )}
                        </Button>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}