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
import ProductCard from "@/components/products/product-card";
import SignUp from "@/components/common/signup";

export default function ProductPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const { toast } = useToast();

    const { data: product, isLoading } = useQuery<Product>({
        queryKey: [`/api/product/${id}`],
    });

    const { data: products, isLoadingRelative } = useQuery<Product>({
        queryKey: [`/api/product/${id}/relative`],
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

    if (isLoading || isLoadingRelative) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
        );
    }

    if (!product) {
        return (
            <NotFound />
        );
    }

    return (
        <>
        <main className="container mx-auto py-8 px-4">
            {/* <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(product, null, 2)}</pre> */}
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
                        <h1 className="text-[32px] font-bold uppercase">{product.name}</h1>
                        <p className="text-2xl text-primaryGreen mt-7"><span className="material-icons-outlined">location_on</span> {product.stall?.location}</p>
                        <p className="font-medium mt-5 font-semibold text-primaryGreen text-[2rem]">{product.event?.name} - {product.stall?.name}</p>
                        <div className="grid grid-cols-2 gap-4 text-primaryGreen">
                            <div>
                                <span className="text-primaryGreen">Start Date:</span>
                                <p>{new Date(product.event?.startDate || '').toLocaleDateString()}</p>
                            </div>
                            <div>
                                <span className="text-primaryGreen">End Date:</span>
                                <p>{new Date(product.event?.endDate || '').toLocaleDateString()}</p>
                            </div>
                        </div>
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
                                className="bg-teal-500 text-white font-semibold py-2 px-6 rounded-[50px] hover:bg-teal-600 transition duration-300 max-w-full"
                                size="lg"
                                onClick={() => addToCart.mutate()}
                                disabled={addToCart.isPending || product.stock === 0}
                            >
                                {addToCart.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                )}
                                Grab it
                            </Button>
                        )}
                    </div>
                </div>
            </section>
            <section className="border-t pt-6 mt-6 space-y-4">
                <h2 className="text-2xl font-semibold">Event Details</h2>
                <div className="grid gap-4 text-2xl">
                    <p className="text-xl">{product.event?.description}</p>
                </div>
            </section>
            {products?.length === 0 ? (
                <></>
            ) : (
                <section className="pt-6 mt-6 space-y-4 text-center">
                    <h2 className="text-2xl font-semibold">Stalls Grabs</h2>
                    <p className="">Discover more of the activities with our curated event collections</p>
                    <div className="w-full max-w-7xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
                        {products?.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                        </div>
                    </div>
                </section>
            )}
            
        </main>
        <SignUp />
        </>
    );
}