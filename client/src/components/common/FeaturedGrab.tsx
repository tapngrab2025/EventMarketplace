import { useRef } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Slider from "react-slick";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import FeaturedProductCard from "./FeaturedProductCard";

export default function FeaturedGrab() {
  const sliderRef = useRef<Slider | null>(null);

  const { data: featuredProducts, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/feature"],
  });

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4500,
    arrows: false,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: "44px",
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: "24px",
        },
      },
    ],
  };

  if (isLoading) {
    return (
      <section className="overflow-hidden">
        <div className="relative mx-auto w-full max-w-7xl border border-t-0 border-zinc-200 bg-white px-4 py-16 sm:px-8 lg:px-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden">
      <div className="relative mx-auto w-full max-w-7xl border border-t-0 border-zinc-200 bg-white px-4 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-500">
            Featured Grabs
          </div>

          <h2 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-zinc-900 sm:text-5xl">
            Our curated product collections
          </h2>
        </div>

        <div className="relative mt-12">
          <button
            type="button"
            aria-label="Previous featured product"
            onClick={() => sliderRef.current?.slickPrev()}
            className="absolute left-0 top-1/2 z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:border-orange-500 hover:text-orange-500"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label="Next featured product"
            onClick={() => sliderRef.current?.slickNext()}
            className="absolute right-0 top-1/2 z-10 flex h-8 w-8 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:border-orange-500 hover:text-orange-500"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <Slider
            ref={sliderRef}
            {...sliderSettings}
            className="featured-grab-slider -mx-3"
          >
            {featuredProducts?.map((product) => (
              <div key={product.id} className="px-3">
                <FeaturedProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}
