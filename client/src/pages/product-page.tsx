import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { useParams } from "wouter";
import { Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { DEFAULT_IMAGES } from "@/config/constants";
import NotFound from "./not-found";

export default function ProductPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const { toast } = useToast();

    const { data: product, isLoading } = useQuery<Product>({
        queryKey: [`/api/product/${id}`],
    });

    const addToCart = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/cart", {
                productId: id,
                quantity: 1,
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
            toast({
                title: "Added to cart",
                description: `${product?.name} has been added to your cart.`,
            });
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
        );
    }

    if (!product) {
        return (
            // <main className="container mx-auto py-8 px-4">
            //     <div className="grid md:grid-cols-2 gap-8">
            //         <div>Product not found</div>
            //     </div>
            // </main>
            <NotFound/>
        );
    }

    return (
        <main className="container mx-auto py-8 px-4">
            {/* <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(product, null, 2)}</pre> */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="aspect-square overflow-hidden rounded-lg">
                        <img
                            src={product.imageUrl || DEFAULT_IMAGES.PRODUCT}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                        <p className="text-xl font-semibold mt-2">
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

                        {user?.role === "customer" && (
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={() => addToCart.mutate()}
                                disabled={addToCart.isPending || product.stock === 0}
                            >
                                {addToCart.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                )}
                                Add to Cart
                            </Button>
                        )}
                    </div>

                    <div className="border-t pt-6 mt-6 space-y-4">
                        <h3 className="font-semibold">Event Details</h3>
                        <div className="grid gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Event:</span>
                                <p className="font-medium">{product.event?.name}</p>
                                <p className="text-sm text-gray-500">{product.event?.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-gray-600">Start Date:</span>
                                    <p>{new Date(product.event?.startDate || '').toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">End Date:</span>
                                    <p>{new Date(product.event?.endDate || '').toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-600">Stall:</span>
                                <p className="font-medium">{product.stall?.name}</p>
                                <p className="text-sm text-gray-500">{product.stall?.location}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}