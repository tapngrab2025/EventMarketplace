import { Product } from "@shared/schema";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Loader2, MapPin, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { DEFAULT_IMAGES } from "@/config/constants";

interface FeaturedProductCardProps {
  product: Product;
}

export default function FeaturedProductCard({ product }: FeaturedProductCardProps) {
  const featureProduct = product.products;
  if (!featureProduct) {
    return null;
  }
  const { data: productDetail, isLoading } = useQuery({
    queryKey: [`/api/product/${featureProduct.id}`],
  });
  console.log(productDetail);

  const { addToCart } = useCart();

  return (
    <article className="group flex h-full min-h-[390px] flex-col overflow-hidden rounded border border-zinc-200 bg-white transition duration-300">
      <div className="relative aspect-[1/1] overflow-hidden">
        <img
          src={featureProduct.imageUrl || DEFAULT_IMAGES.PRODUCT}
          alt={featureProduct.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col px-4 pt-3">
        <h3 className="line-clamp-1 text-base font-semibold leading-snug text-zinc-900">
          {featureProduct.name}
        </h3>

        <div className="mt-4 space-y-1.5">
          <div className="flex items-start gap-3 text-sm text-zinc-600">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
            <span>
              {productDetail?.event.startDate ? new Date(productDetail?.event.startDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Date not available'}
            </span>
          </div>

          <div className="flex items-start gap-3 text-sm text-zinc-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
            <span>{productDetail?.stall?.location}</span>
          </div>

          <div className="flex items-start gap-2 text-base font-semibold text-zinc-900">
            <span>${(featureProduct.price / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 px-4 pb-4">
        <Button
          className="inline-flex w-full items-center justify-center bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
          onClick={() => addToCart.mutate({ productId: featureProduct.id, quantity: 1 })}
          disabled={addToCart.isPending || featureProduct.stock === 0}
        >
          {addToCart.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <ShoppingCart className="h-4 w-4 mr-2" />
          )}
          Grab It
        </Button>
      </div>
    </article>
  );
}
