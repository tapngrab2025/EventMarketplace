import { useMemo, useRef, type Key, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Slider from "react-slick";
import { Link } from "wouter";
import type { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { DEFAULT_IMAGES } from "@/config/constants";
import { useCart } from "@/hooks/use-cart";
import FeaturedProductCard, {
  type FeaturedProduct,
} from "./FeaturedProductCard";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

const PRODUCT_CATEGORY_LABELS = {
  book: "Books",
  kids_book: "Kids' Books",
  educational: "Educational",
  comic: "Comics",
  magazine: "Magazines",
  stationery: "Stationery",
  art_craft: "Art & Craft",
  souvenir: "Souvenirs",
  giveaway: "Giveaways",
  promotional: "Promotional",
} as const;

const PRODUCT_CATEGORY_ORDER = Object.keys(PRODUCT_CATEGORY_LABELS);

type ProductCategory = keyof typeof PRODUCT_CATEGORY_LABELS;

type ProductSliderSectionProps<TItem> = {
  eyebrow: string;
  title: string;
  items: TItem[];
  emptyMessage: string;
  getKey: (item: TItem) => Key;
  renderItem: (item: TItem) => ReactNode;
};

function getCategoryLabel(category: string) {
  return (
    PRODUCT_CATEGORY_LABELS[category as ProductCategory] ??
    category
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

function getSliderSettings(itemCount: number) {
  const slidesFor = (maxSlides: number) =>
    Math.max(1, Math.min(maxSlides, itemCount));

  return {
    dots: false,
    infinite: itemCount > 4,
    speed: 450,
    slidesToShow: slidesFor(4),
    slidesToScroll: 1,
    arrows: false,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          dots: false,
          infinite: itemCount > 3,
          slidesToShow: slidesFor(3),
        },
      },
      {
        breakpoint: 768,
        settings: {
          dots: false,
          infinite: itemCount > 2,
          slidesToShow: slidesFor(2),
        },
      },
      {
        breakpoint: 640,
        settings: {
          dots: false,
          infinite: itemCount > 1,
          slidesToShow: 1,
        },
      },
    ],
  };
}

function ProductSliderSection<TItem>({
  eyebrow,
  title,
  items,
  emptyMessage,
  getKey,
  renderItem,
}: ProductSliderSectionProps<TItem>) {
  const sliderRef = useRef<Slider | null>(null);
  const canSlide = items.length > 1;

  return (
    <section className="mt-14 first:mt-0 sm:mt-16">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
            {eyebrow}
          </div>
          <h2 className="mt-2 font-serif text-2xl leading-tight text-zinc-900 sm:text-3xl">
            {title}
          </h2>
        </div>

        {canSlide ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => sliderRef.current?.slickPrev()}
              className="grid h-10 w-10 place-items-center rounded border border-zinc-200 bg-white text-zinc-700 transition hover:border-blue-600 hover:text-blue-600"
              aria-label={`Previous ${title}`}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => sliderRef.current?.slickNext()}
              className="grid h-10 w-10 place-items-center rounded border border-zinc-200 bg-white text-zinc-700 transition hover:border-blue-600 hover:text-blue-600"
              aria-label={`Next ${title}`}
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>

      {items.length > 0 ? (
        <div className="mt-6 overflow-hidden">
          <Slider
            ref={sliderRef}
            {...getSliderSettings(items.length)}
            className="product-slider w-full [&_.slick-list]:overflow-hidden [&_.slick-track]:flex [&_.slick-slide]:h-auto [&_.slick-slide>div]:h-full"
          >
            {items.map((item) => (
              <div key={getKey(item)} className="h-full px-2 sm:px-3">
                <div className="h-full min-w-0">{renderItem(item)}</div>
              </div>
            ))}
          </Slider>
        </div>
      ) : (
        <div className="mt-6 rounded border border-dashed border-zinc-200 px-4 py-12 text-center text-sm text-zinc-500">
          {emptyMessage}
        </div>
      )}
    </section>
  );
}

function CategoryProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <article className="group flex h-full min-h-[390px] flex-col overflow-hidden rounded border border-zinc-200 bg-white transition duration-300">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.imageUrl || DEFAULT_IMAGES.PRODUCT}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col px-4 pt-3">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
          {getCategoryLabel(product.category)}
        </div>

        <h3 className="mt-2 line-clamp-1 text-base font-semibold leading-snug text-zinc-900">
          {product.name}
        </h3>

        <p className="my-3 line-clamp-3 text-sm font-medium leading-6 text-teal-600">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="truncate text-2xl font-bold text-zinc-900">
            ${(product.price / 100).toFixed(2)}
          </span>
          <span className="shrink-0 text-sm text-zinc-500">
            {product.stock} left
          </span>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 px-4 pb-4 pt-4">
        <Button
          className="inline-flex h-10 w-full items-center justify-center bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
          onClick={() =>
            addToCart.mutate({ productId: product.id, quantity: 1 })
          }
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
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded border border-zinc-200 text-zinc-700 transition hover:border-blue-600 hover:text-blue-600"
        >
          <Eye className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export default function FeaturedGrab() {
  const { data: featuredProducts, isLoading: loadingFeatured } = useQuery<
    FeaturedProduct[] | []
  >({
    queryKey: ["/api/products/feature"],
  });

  const { data: catalogProducts, isLoading: loadingCatalog } = useQuery<
    Product[]
  >({
    queryKey: ["/api/products"],
  });

  const featuredItems = featuredProducts ?? [];

  const categorySections = useMemo(() => {
    const groupedProducts = (catalogProducts ?? []).reduce<
      Record<string, Product[]>
    >((groups, product) => {
      if (!groups[product.category]) {
        groups[product.category] = [];
      }

      groups[product.category].push(product);
      return groups;
    }, {});

    Object.values(groupedProducts).forEach((products) => {
      products.sort((a, b) => b.id - a.id);
    });

    const knownCategories = PRODUCT_CATEGORY_ORDER.map((category) => ({
      category,
      title: getCategoryLabel(category),
      products: groupedProducts[category] ?? [],
    })).filter((section) => section.products.length > 0);

    const extraCategories = Object.entries(groupedProducts)
      .filter(([category]) => !PRODUCT_CATEGORY_ORDER.includes(category))
      .map(([category, products]) => ({
        category,
        title: getCategoryLabel(category),
        products,
      }));

    return [...knownCategories, ...extraCategories];
  }, [catalogProducts]);

  if (loadingFeatured || loadingCatalog) {
    return (
      <section className="max-w-full overflow-hidden bg-white">
        <div className="relative mx-auto w-full max-w-full px-4 py-16 sm:px-8 lg:max-w-7xl lg:px-10">
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-full overflow-hidden bg-white">
      <div className="relative mx-auto w-full max-w-full overflow-hidden px-4 py-14 sm:px-8 sm:py-16 lg:max-w-7xl lg:px-10">
        <ProductSliderSection
          eyebrow="Featured Grabs"
          title="Our curated product collections"
          items={featuredItems}
          emptyMessage="Featured products will appear here soon."
          getKey={(product) => product.products.id}
          renderItem={(product) => <FeaturedProductCard product={product} />}
        />

        {categorySections.map((section) => (
          <ProductSliderSection
            key={section.category}
            eyebrow="Shop by Category"
            title={section.title}
            items={section.products}
            emptyMessage={`${section.title} products will appear here soon.`}
            getKey={(product) => product.id}
            renderItem={(product) => <CategoryProductCard product={product} />}
          />
        ))}
      </div>
    </section>
  );
}
