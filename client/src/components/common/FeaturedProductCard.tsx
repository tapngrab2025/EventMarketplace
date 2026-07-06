import type { Event, Product, Stall } from "@shared/schema";
import { CalendarDays, Loader2, MapPin, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { DEFAULT_IMAGES } from "@/config/constants";

export type FeaturedProduct = {
  products: Product;
  stalls?: Stall | null;
  events?: Event | null;
};

interface FeaturedProductCardProps {
  product: FeaturedProduct;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function FeaturedProductCard({
  product,
}: FeaturedProductCardProps) {
  const featureProduct = product.products;
  const { addToCart } = useCart();

  if (!featureProduct) {
    return null;
  }

  const eventDate = product.events?.startDate
    ? dateFormatter.format(new Date(product.events.startDate))
    : "Date not available";
  const location = product.stalls?.location || "Location not available";

  return (
    <article className="group flex h-full w-full min-w-0 max-w-full flex-col overflow-hidden rounded border border-zinc-200 bg-white transition duration-300">
      <div className="relative aspect-[4/3] overflow-hidden sm:aspect-square">
        <img
          src={featureProduct.imageUrl || DEFAULT_IMAGES.PRODUCT}
          alt={featureProduct.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col px-3 pt-3 sm:px-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 sm:text-base">
          {featureProduct.name}
        </h3>

        <div className="mt-3 min-w-0 space-y-1.5 sm:mt-4">
          <div className="flex min-w-0 items-start gap-2 text-xs text-zinc-600 sm:gap-3 sm:text-sm">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <span className="min-w-0 line-clamp-1">{eventDate}</span>
          </div>

          <div className="flex min-w-0 items-start gap-2 text-xs text-zinc-600 sm:gap-3 sm:text-sm">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <span className="min-w-0 line-clamp-2">{location}</span>
          </div>

          <div className="flex min-w-0 items-start justify-between gap-2 text-sm font-semibold text-zinc-900 sm:text-base">
            <span className="min-w-0 truncate">
              ${(featureProduct.price / 100).toFixed(2)}
            </span>
            <span className="shrink-0 text-xs font-medium text-zinc-500 sm:text-sm">
              {featureProduct.stock} left
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto px-3 pb-3 pt-4 sm:px-4 sm:pb-4">
        <Button
          className="inline-flex h-11 w-full min-w-0 items-center justify-center whitespace-normal bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          onClick={() =>
            addToCart.mutate({ productId: featureProduct.id, quantity: 1 })
          }
          disabled={addToCart.isPending || featureProduct.stock === 0}
        >
          {addToCart.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ShoppingCart className="mr-2 h-4 w-4" />
          )}
          Grab It
        </Button>
      </div>
    </article>
  );
}
