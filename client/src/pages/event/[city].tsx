import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { Event } from "@shared/schema";
import { Loader2, CalendarDays, MapPin, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

export default function EventDetailsCityPage() {
    const { addToCart } = useCart();
    const [, params] = useRoute("/event/city/:city");
    const city = params?.city;

    const { data: event, isLoading: loadingEvent } = useQuery<Event>({
        queryKey: [`/api/events/city/${city}`],
        enabled: !!city,
    });

    if (loadingEvent) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {!event || Object.keys(event).length === 0 ? (
                <div className="min-h-screen flex flex-col items-center justify-center p-4">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold text-gray-800">No Event Found</h1>
                        <p className="text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
                        <Link to="/" className="inline-block bg-teal-500 text-white px-6 py-2 rounded-full hover:bg-teal-600 transition duration-300">
                            Return Home
                        </Link>
                    </div>
                </div>
            ) : (
                <>
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

                    <div className="space-y-8">
                        {/* Products Grid */}
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {event?.products?.filter(product => product?.products?.approved)?.map((product) => (
                                <>
                                    {
                                        <Card key={product?.products?.id} className="overflow-hidden">
                                            {product?.products?.imageUrl && (
                                                <img
                                                    src={product?.products?.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-48 object-cover"
                                                />
                                            )}
                                            <CardContent className="p-4">
                                                <h3 className="font-semibold mb-2 line-clamp-2">{product?.products?.name}</h3>
                                                <p className="text-sm text-muted-foreground mb-3 line-clamp-5">
                                                    {product?.products?.description}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">
                                                        ${(product?.products?.price / 100).toFixed(2)}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {product?.products?.stock} left
                                                    </span>
                                                </div>
                                                <div className="flex justify-between mt-4 gap-x-2">
                                                        <Button
                                                            className="bg-teal-500 text-white font-semibold py-2 px-6 rounded-[50px] hover:bg-teal-600 transition duration-300 max-w-full w-full"
                                                            onClick={() => addToCart.mutate({productId: product?.products?.id, quantity: 1})}
                                                            disabled={addToCart.isPending || product?.products?.stock === 0}
                                                        >
                                                            {addToCart.isPending ? (
                                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                            ) : (
                                                                <ShoppingCart className="h-4 w-4 mr-2" />
                                                            )}
                                                            Grab It
                                                        </Button>
                                                    <Link
                                                        to={`/products/${product?.products?.id}`}
                                                        className="text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition duration-300"
                                                    >
                                                        👁️
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    }
                                </>

                            ))}
                        </div>
                    </div>
                </>
            )}

        </div>
    );
}