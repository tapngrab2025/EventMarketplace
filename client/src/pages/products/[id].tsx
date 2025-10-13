import { useRoute } from "wouter";
import { Product } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_IMAGES } from "@/config/constants";
import NotFound from "./not-found";
import ProductCard from "@/components/products/product-card";
import SignUp from "@/components/common/signup";
import CountDown from "@/components/product/count-down";
import { useCart } from "@/hooks/use-cart";
import { apiRequest } from "@/lib/queryClient";
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

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/product/${id}`],
  });

  const { data: products, isLoadingRelative } = useQuery<Product>({
    queryKey: [`/api/product/${id}/relative`],
  });
  
  const {
    feedbackEnabled,
    productFeedback,
    userFeedback,
    canProvideFeedback,
    isLoading: isLoadingFeedback,
  } = useProductFeedback(productId);

  if (isLoading || isLoadingRelative) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
          </div>
      );
  }

  return (
            <main className="container mx-auto py-20 px-4">
            <section className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="aspect-square overflow-hidden max-h-60 lg:max-h-[600px] rounded-lg">
                        <img
                            src={product.imageUrl || DEFAULT_IMAGES.PRODUCT}
                            alt={product.name}
                            className="w-full h-full object-cover"
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
            <section className="border-t pt-6 mt-6 space-y-4 my-20">
                <h2 className="text-2xl font-semibold">Event Details</h2>
                <div className="grid gap-4 text-2xl">
                    <p className="text-xl">{product.event?.description}</p>
                </div>
            </section>
            {products?.length === 0 ? (
                <></>
            ) : (
                <section className="pt-6 mt-6 space-y-4 text-center my-20">
                    <h2 className="text-2xl font-semibold">Stalls Grabs</h2>
                    <p className="">Discover more of the activities with our curated event collections</p>
                    <div className="w-full max-w-7xl flex text-center">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
                        {products?.map((product) => (
                            <ProductCard key={product.id} product={product} />
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
                            <Loader2 className="h-6 w-6 animate-spin text-border" />
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
  );
}