import { Product } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ShoppingCart } from "lucide-react";
import { DEFAULT_IMAGES } from "@/config/constants";

export default function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const { toast } = useToast();


  const { data: productDetail, isLoading } = useQuery<Product>({
    queryKey: [`/api/product/${product.id}`],
});

  const addToCart = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    },
  });

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
      {/* <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(productDetail?.event, null, 2)}</pre>*/}
      <img
        src={product.imageUrl || DEFAULT_IMAGES.PRODUCT}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {product.name} @ {productDetail?.event.name}
        </h3>
        <div className="space-y-1 flex-1">
          <p className="text-gray-600 font-medium line-clamp-3">
            {product.description}
          </p>
          <p className="text-gray-600 line-clamp-1">
            <span className="font-semibold">Stall:</span> #{product.stallId}
          </p>
          <p className="text-gray-600 line-clamp-1">{productDetail?.event.name}</p>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p className="line-clamp-1">{productDetail?.event.startDate ? new Date(productDetail?.event.startDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Date not available'}</p>
            <p>8:00 P.M.</p>
          </div>
        </div>
        <div className="flex justify-between mt-4 gap-x-2">
          {user?.role === "customer" && (
            <Button
              className="bg-teal-500 text-white font-semibold py-2 px-6 rounded-[50px] hover:bg-teal-600 transition duration-300 max-w-full w-full"
              onClick={() => addToCart.mutate()}
              disabled={addToCart.isPending || product.stock === 0}
            >
              {addToCart.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ShoppingCart className="h-4 w-4 mr-2" />
              )}
              Grab It
            </Button>
          )}
          <Link
            to={`/products/${product.id}`}
            className="text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition duration-300"
          >
            👁️
          </Link>
        </div>
      </div>
    </div>
  );
}
