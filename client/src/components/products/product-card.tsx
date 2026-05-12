import { Product } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Loader2, MapPin, ShoppingCart, Eye } from "lucide-react";
import { DEFAULT_IMAGES } from "@/config/constants";
import { useCart } from "@/hooks/use-cart";

type ProductDetail = Product & {
  event?: {
    name?: string | null;
    startDate?: string | Date | null;
  } | null;
  stall?: {
    location?: string | null;
  } | null;
};

export default function ProductCard({ product }: { product: Product }) {
  const { data: productDetail } = useQuery<ProductDetail>({
    queryKey: [`/api/product/${product.id}`],
  });

  const { addToCart } = useCart();

  return (
    <article className="group flex h-full min-h-[390px] flex-col overflow-hidden rounded border border-zinc-200 bg-white transition duration-300">
      <div className="relative aspect-[1/1] overflow-hidden">
        <img
          src={product.imageUrl || DEFAULT_IMAGES.PRODUCT}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col px-4 pt-3">
        <h3 className="line-clamp-1 text-base font-semibold leading-snug text-zinc-900">
          {product.name}
        </h3>

        <p className="my-3 line-clamp-3 text-sm font-medium text-teal-500">
          {product.description}
        </p>

        <div className="space-y-1.5">
          <p className="line-clamp-1 text-sm text-zinc-600">
            <span className="font-semibold text-zinc-900">Stall:</span> #
            {product.stallId}
          </p>

          <p className="line-clamp-1 text-sm text-zinc-600">
            {productDetail?.event?.name}
          </p>

          <div className="flex items-start gap-3 text-sm text-zinc-600">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
            <span>
              {productDetail?.event?.startDate
                ? new Date(productDetail.event.startDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )
                : "Date not available"}
            </span>
          </div>

          <div className="flex items-start gap-3 text-sm text-zinc-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
            <span className="line-clamp-2">
              {productDetail?.stall?.location || "Location not available"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="my-3 text-2xl font-bold text-zinc-900">
              ${(product.price / 100).toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">
              {product.stock} left
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-auto px-4 pb-4 pt-4">
        <Button
          className="inline-flex w-full items-center justify-center bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
          onClick={() => addToCart.mutate({ productId: product.id, quantity: 1 })}
          disabled={addToCart.isPending || product.stock === 0}
        >
          {addToCart.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ShoppingCart className="mr-2 h-4 w-4" />
          )}
          Grab It
        </Button>
        <Link
          to={`/products/${product.id}`}
          aria-label={`View ${product.name}`}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-zinc-200 text-zinc-700 transition hover:border-orange-500 hover:text-orange-500"
        >
          <Eye className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
