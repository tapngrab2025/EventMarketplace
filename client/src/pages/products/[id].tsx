import { useRoute } from "wouter";
import { Product } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DEFAULT_IMAGES } from "@/config/constants";
import NotFound from "./not-found";
import ProductCard from "@/components/products/product-card";
import CountDown from "@/components/product/count-down";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useProductFeedback } from "@/hooks/use-product-feedback";
import { ProductFeedbackForm } from "@/components/product/product-feedback-form";
import { ProductFeedbackList } from "@/components/product/product-feedback-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProductDetails() {
  const [, params] = useRoute("/products/:id");
  const id = params?.id;
  const { user } = useAuth();
  const productId = parseInt(id!);
  const { addToCart } = useCart();
  const [animateItems, setAnimateItems] = useState(false);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/product/${id}`],
  });

  const { data: products, isLoadingRelative } = useQuery<Product[]>({
    queryKey: [`/api/product/${id}/relative`],
  });
  
  const {
    feedbackEnabled,
    productFeedback,
    userFeedback,
    canProvideFeedback,
    isLoading: isLoadingFeedback,
  } = useProductFeedback(productId);

  useEffect(() => {
    setAnimateItems(true);
  }, []);

  if (isLoading || isLoadingRelative) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-12 w-12 animate-spin text-primaryGreen" />
          </div>
      );
  }

  if (!product || !products) {
    return <NotFound />;
  }

  return (
            <div className="min-h-screen bg-gradient-to-b from-white to-teal-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primaryOrange opacity-5 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-teal-300 opacity-5 rounded-full"></div>
            <main className="container mx-auto py-20 px-4 relative z-10">
            <section className={`grid md:grid-cols-2 gap-8 transition-all duration-700 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
                <div className="space-y-4">
                    <div className="aspect-square overflow-hidden max-h-60 lg:max-h-[600px] rounded-lg">
                        <img
                            src={product.imageUrl || DEFAULT_IMAGES.PRODUCT}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h1 className="text-[36px] font-bold uppercase text-primaryGreen">{product.name}</h1>
                        <p className="text-lg mt-3 text-gray-500"><span className="material-icons text-xl">location_on</span> {product.stall?.location}</p>
                        <p className="font-medium mt-5 font-semibold text-xl leading-none">{product.event?.name} - {product.stall?.name}</p>
                        <div className="grid grid-cols-2 gap-4 text-primaryGreen my-12">
                            <CountDown date={product.event?.endDate} className="event_count_down" />
                        </div>
                        <p className="text-2xl font-semibold mt-5">
                            ${(product.price / 100).toFixed(2)}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold">Description</h3>
                        <p className="text-gray-600">{product.description}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                Stock: {product.stock} available
                            </span>
                        </div>
                            <Button
                                className="bg-teal-500 text-white font-semibold py-2 px-6 rounded-[50px] hover:bg-primaryOrange transition duration-300 max-w-full"
                                size="lg"
                                onClick={() => addToCart.mutate({ productId: product.id, quantity: 1 })}
                                disabled={addToCart.isPending || product.stock === 0}
                            >
                                {addToCart.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                )}
                                Grab it
                            </Button>
                    </div>
                </div>
            </section>
            <section className={`border-t pt-6 mt-6 space-y-4 my-20 transition-all duration-700 delay-200 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <h2 className="text-2xl font-semibold">Event Details</h2>
                <div className="grid gap-4 text-2xl">
                    <p className="text-xl">{product.event?.description}</p>
                </div>
            </section>
            {products?.length === 0 ? (
                <></>
            ) : (
                <section className={`pt-6 mt-6 space-y-4 text-center my-20 transition-all duration-700 delay-300 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h2 className="text-2xl font-semibold">Stalls Grabs</h2>
                    <p className="">Discover more of the activities with our curated event collections</p>
                    <div className="w-full max-w-7xl flex text-center">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-14">
                        {products?.map((product, index) => (
                            <div
                                key={product.id}
                                className={`transition-all duration-500 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                                style={{ transitionDelay: `${300 + index * 50}ms` }}
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}
                        </div>
                    </div>
                </section>
            )}

            {feedbackEnabled && (
                <div className="mt-12 space-y-8">
                <Card>
                    <CardHeader>
                    <CardTitle>Customer Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                    {isLoadingFeedback ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primaryGreen" />
                        </div>
                    ) : (
                        <>
                        {canProvideFeedback && (
                            <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4">Share Your Experience</h3>
                            <ProductFeedbackForm
                              productId={productId}
                              onSuccess={() => {
                                // Feedback submitted successfully
                              }}
                            />
                            </div>
                        )}

                        {userFeedback && (
                            <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4">Your Feedback</h3>
                            <div className="border rounded-lg p-4">
                                <p>{userFeedback.comment}</p>
                            </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-lg font-semibold mb-4">All Reviews</h3>
                            <ProductFeedbackList productId={productId} />
                        </div>
                        </>
                    )}
                    </CardContent>
                </Card>
                </div>
            )}
            
        </main>
        </div>
  );
}