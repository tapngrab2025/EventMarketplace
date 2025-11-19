import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { Event, Stall } from "@shared/schema";
import { Loader2, CalendarDays, MapPin, ShoppingCart, Users, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { EventCoupons } from "@/components/coupon/event-coupons";
import { useEffect, useState } from "react";
import { Images } from "@/config/images";

export default function EventDetailsPage() {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [, params] = useRoute("/event/:id");
  const id = params?.id;
  const [animateItems, setAnimateItems] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    setAnimateItems(true);
  }, []);

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
        <Loader2 className="h-12 w-12 animate-spin text-primaryGreen" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-teal-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primaryOrange opacity-5 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-teal-300 opacity-5 rounded-full"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className={`transition-all duration-700 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <Card className="mb-8 overflow-hidden shadow-xl border-none">
            <CardHeader className="p-0 relative">
              {event?.imageUrl && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
                  <img
                    src={event.imageUrl}
                    alt={event.name}
                    className="w-full h-64 lg:h-[500px] object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <CardTitle className="text-4xl font-bold text-white mb-2">{event?.name}</CardTitle>
                    <div className="flex flex-wrap gap-4 text-white/90">
                      <div className="flex items-center bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm">{event?.location}</span>
                      </div>
                      <div className="flex items-center bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          {new Date(event?.startDate || "").toLocaleDateString()} -{" "}
                          {new Date(event?.endDate || "").toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className={`transition-all duration-700 delay-200 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">{event?.description}</p>
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center bg-teal-50 px-4 py-2 rounded-lg">
                    <Users className="h-5 w-5 mr-2 text-primaryGreen" />
                    <span className="text-gray-700">Vendors: {stalls?.length || 0}</span>
                  </div>
                  <div className="flex items-center bg-teal-50 px-4 py-2 rounded-lg">
                    <Tag className="h-5 w-5 mr-2 text-primaryGreen" />
                    <span className="text-gray-700">Products: {stalls?.reduce((acc, stall) => acc + (stall.products?.filter(p => p.approved)?.length || 0), 0)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Display available coupons for this event */}
        <div className={`transition-all duration-700 delay-300 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <EventCoupons eventId={id} />
        </div>

        <div className="space-y-8 mt-12">
          {stalls?.map((stall, stallIndex) => (
            <div 
              key={stall.id}
              className={`transition-all duration-700 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${300 + stallIndex * 100}ms` }}
            >
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-none">
                <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                  <CardTitle className="text-2xl">{stall.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 mb-6">{stall.description}</p>
                  <div className="flex items-center mb-6 bg-teal-50 px-4 py-2 rounded-lg inline-block">
                    <MapPin className="h-4 w-4 mr-2 text-primaryGreen" />
                    <span className="text-gray-700">{stall.location}</span>
                  </div>

                  {/* Products Grid */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {stall.products?.map((product, productIndex) => (
                      <>
                        {product.approved && (
                          <div 
                            key={product.id}
                            className={`transition-all duration-500 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                            style={{ transitionDelay: `${400 + productIndex * 50}ms` }}
                          >
                            <Card className="overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
                              {product.imageUrl && (
                                <div className="overflow-hidden">
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
                                  />
                                </div>
                              )}
                              <CardContent className="p-4 flex-grow flex flex-col">
                                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-grow">
                                  {product.description}
                                </p>
                                <div className="flex items-center justify-between mt-auto">
                                  <span className="font-bold text-xl text-primaryGreen">
                                    ${(product.price / 100).toFixed(2)}
                                  </span>
                                  <span className={`text-sm px-2 py-1 rounded ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                                    {product.stock > 0 ? `${product.stock} left` : 'Sold out'}
                                  </span>
                                </div>
                                <div className="flex justify-between mt-4 gap-x-2 items-center">
                                  <Button
                                    className="bg-teal-500 text-white font-semibold py-2 px-6 rounded-full hover:bg-primaryOrange transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex-grow"
                                    onClick={() => addToCart.mutate({productId: product?.id, quantity: 1})}
                                    disabled={addToCart.isPending || product.stock === 0}
                                  >
                                    {addToCart.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                      <ShoppingCart className="h-4 w-4 mr-2" />
                                    )}
                                    {product.stock === 0 ? 'Sold Out' : 'Grab It'}
                                  </Button>
                                  <Link
                                    to={`/products/${product.id}`}
                                    className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-all duration-300"
                                  >
                                    <img src={Images.view} alt="view product" className="w-6 h-6" />
                                  </Link>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}