import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { Event } from "@shared/schema";
import { Loader2, CalendarDays, MapPin, ShoppingCart, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useEffect, useState } from "react";
import { Images } from "@/config/images";

export default function EventDetailsCityPage() {
    const { addToCart } = useCart();
    const [, params] = useRoute("/event/city/:city");
    const city = params?.city;
    const [animateItems, setAnimateItems] = useState(false);

    useEffect(() => {
        // Trigger animations after component mounts
        setAnimateItems(true);
    }, []);

    const { data: event, isLoading: loadingEvent } = useQuery<Event>({
        queryKey: [`/api/events/city/${city}`],
        enabled: !!city,
    });

    if (loadingEvent) {
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
                {!event || Object.keys(event).length === 0 ? (
                    <div className={`min-h-[70vh] flex flex-col items-center justify-center p-4 transition-all duration-700 ${animateItems ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                        <div className="text-center space-y-6 bg-white p-10 rounded-xl shadow-xl max-w-md">
                            <div className="text-6xl mb-4">🏙️</div>
                            <h1 className="text-4xl font-bold text-primaryGreen">No Events in {city}</h1>
                            <p className="text-gray-600">We couldn't find any events in this city at the moment.</p>
                            <Link to="/events" className="inline-block bg-teal-500 text-white px-8 py-3 rounded-full hover:bg-primaryOrange transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1">
                                Browse All Events
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
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
                                                <Tag className="h-5 w-5 mr-2 text-primaryGreen" />
                                                <span className="text-gray-700">Products: {event?.products?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className={`mt-12 transition-all duration-700 delay-300 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <h2 className="text-2xl font-bold text-primaryGreen mb-6">Available Products</h2>
                            {/* Products Grid */}
                            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {event?.products?.filter(product => product?.products?.approved)?.map((product, index) => (
                                    <div 
                                        key={product?.products?.id}
                                        className={`transition-all duration-500 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                                        style={{ transitionDelay: `${400 + index * 50}ms` }}
                                    >
                                        <Card className="overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
                                            {product?.products?.imageUrl && (
                                                <div className="overflow-hidden">
                                                    <img
                                                        src={product?.products?.imageUrl}
                                                        alt={product?.products?.name}
                                                        className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
                                                    />
                                                </div>
                                            )}
                                            <CardContent className="p-4 flex-grow flex flex-col">
                                                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product?.products?.name}</h3>
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-grow">
                                                    {product?.products?.description}
                                                </p>
                                                <div className="flex items-center justify-between mt-auto">
                                                    <span className="font-bold text-xl text-primaryGreen">
                                                        ${(product?.products?.price / 100).toFixed(2)}
                                                    </span>
                                                    <span className={`text-sm px-2 py-1 rounded ${product?.products?.stock > 10 ? 'bg-green-100 text-green-800' : product?.products?.stock > 0 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                                                        {product?.products?.stock > 0 ? `${product?.products?.stock} left` : 'Sold out'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between mt-4 gap-x-2 items-center">
                                                    <Button
                                                        className="bg-teal-500 text-white font-semibold py-2 px-6 rounded-full hover:bg-primaryOrange transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex-grow"
                                                        onClick={() => addToCart.mutate({productId: product?.products?.id, quantity: 1})}
                                                        disabled={addToCart.isPending || product?.products?.stock === 0}
                                                    >
                                                        {addToCart.isPending ? (
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        ) : (
                                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                                        )}
                                                        {product?.products?.stock === 0 ? 'Sold Out' : 'Grab It'}
                                                    </Button>
                                                    <Link
                                                        to={`/products/${product?.products?.id}`}
                                                        className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-all duration-300"
                                                    >
                                                        <img src={Images.view} alt="view product" className="w-6 h-6" />
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}