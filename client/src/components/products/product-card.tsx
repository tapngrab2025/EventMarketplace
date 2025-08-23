import { Product } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShoppingCart } from "lucide-react";
import { DEFAULT_IMAGES } from "@/config/constants";
import { useCart } from "@/hooks/use-cart";

export default function ProductCard({ product }: { product: Product }) {
  const { data: productDetail, isLoading } = useQuery<Product>({
    queryKey: [`/api/product/${product.id}`],
  });

  const { addToCart } = useCart();

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
          <p className="text-gray-500 font-medium line-clamp-3 text-sm my-3 text-teal-500">
            {product.description}
          </p>
          <p className="text-gray-600 line-clamp-1">
            <span className="font-semibold text-gray-800">Stall:</span> #{product.stallId}
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
          <div className="flex items-center justify-between">
            <span className="font-bold text-2xl my-3">
              ${(product.price / 100).toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">
              {product.stock} left
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 gap-x-2">
          <Button
            className="bg-teal-500 text-white font-semibold py-2 px-6 rounded-[50px] hover:bg-primaryOrange transition duration-300 max-w-full w-fit"
            onClick={() => addToCart.mutate({ productId: product.id, quantity: 1 })}

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
            className="text-gray-600 font-semibold rounded-lg transition duration-300"
          >
            <img src="../src/assets/view.png" alt="view product" className="w-7 h-7 inline-block" />
          </Link>
        </div>
      </div>
    </div>
  );
}
