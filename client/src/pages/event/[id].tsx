import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { Event, Stall } from "@shared/schema";
import { Loader2, CalendarDays, MapPin, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { EventCoupons } from "@/components/coupon/event-coupons";

export default function EventDetailsPage() {
  const { addToCart } = useCart();
  const { user } = useAuth();
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

  if (loadingEvent || loadingStalls) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          {event?.imageUrl && (
              <img
                src={event.imageUrl}
                alt={event.name}
                className="w-full h-48 lg:h-96 object-cover"
              />
            )}
          <CardTitle className="text-3xl text-primaryGreen">{event?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 text-primaryGreen">{event?.description}</p>
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
      
      {/* Display available coupons for this event */}
      <EventCoupons eventId={id} />

      <div className="space-y-8">
        {stalls?.map((stall) => (
          <Card key={stall.id}>
            <CardHeader>
              <CardTitle className="text-primaryGreen">{stall.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-primaryGreen">{stall.description}</p>
              <div className="flex items-center mb-4">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm text-muted-foreground">{stall.location}</span>
              </div>

              {/* Products Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {stall.products?.map((product) => (
                  <>
                    {product.approved && <Card key={product.id} className="overflow-hidden">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-5">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-1xl my-3">
                              ${(product.price / 100).toFixed(2)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {product.stock} left
                            </span>
                        </div>
                        <div className="flex justify-between mt-4 gap-x-2 items-center">
                          <Button
                            className="bg-teal-500 text-white font-semibold py-2 px-6 rounded-[50px] hover:bg-teal-600 transition duration-300 max-w-full w-fit"
                            // onClick={() => addToCart.mutate(product.id)}
                            onClick={() => addToCart.mutate({productId: product?.id, quantity: 1})}
                            disabled={addToCart.isPending || product.stock === 0}
                          >
                            {addToCart.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <ShoppingCart className="h-4 w-4 mr-2" />
                            )}
                            Grab It
                          </Button>
                          <Link
                            to={`/products/${product.id}`}
                            className="text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition duration-300"
                          >
                            <img src="../src/assets/view.png" alt="view product" className="w-7 h-7 inline-block" />
                          </Link>
                        </div>
                      </CardContent>
                    </Card>}
                  </>

                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}