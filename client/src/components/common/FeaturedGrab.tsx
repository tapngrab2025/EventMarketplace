import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import FeaturedProductCard, {
  type FeaturedProduct,
} from "./FeaturedProductCard";

export default function FeaturedGrab() {
  const { data: featuredProducts, isLoading } = useQuery<FeaturedProduct[] | []>({
    queryKey: ["/api/products/feature"],
  });

  const products = featuredProducts ?? [];

  if (isLoading) {
    return (
      <section className="max-w-full overflow-hidden">
        <div className="relative mx-auto w-full max-w-full bg-white px-4 py-16 sm:px-8 lg:max-w-7xl lg:px-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-full overflow-hidden">
      <div className="relative mx-auto w-full max-w-full overflow-hidden bg-white px-4 py-14 sm:px-8 sm:py-16 lg:max-w-7xl lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
            Featured Grabs
          </div>

          <h2 className="mt-4 font-serif text-3xl leading-tight tracking-tight text-zinc-900 sm:text-5xl">
            Our curated product collections
          </h2>
        </div>

        {products.length > 0 ? (
          <div className="mt-10 grid min-w-0 grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <div key={product.products.id} className="min-w-0">
                <FeaturedProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded border border-dashed border-zinc-200 px-4 py-12 text-center text-sm text-zinc-500 sm:mt-12">
            Featured products will appear here soon.
          </div>
        )}
      </div>
    </section>
  );
}
