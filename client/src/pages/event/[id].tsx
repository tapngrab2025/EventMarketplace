import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { Event, Product, Stall } from "@shared/schema";
import {
  CalendarDays,
  CheckCircle2,
  Eye,
  Loader2,
  MapPin,
  Package,
  ShoppingCart,
  Store,
  Tag,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { EventCoupons } from "@/components/coupon/event-coupons";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_IMAGES } from "@/config/constants";
import NotFound from "../not-found";

type StallWithProducts = Stall & {
  products?: Product[];
};

export default function EventDetailsPage() {
  const { addToCart } = useCart();
  const [, params] = useRoute("/event/:id");
  const id = params?.id;
  const [animateItems, setAnimateItems] = useState(false);

  useEffect(() => {
    setAnimateItems(true);
  }, []);

  // const { data: event, isLoading: loadingEvent } = useQuery<Event>({
  //   queryKey: [`/api/events/${id}`],
  //   enabled: !!id,
  // });

  const { data: event, isLoading: loadingEvent } = useQuery<Event>({
    queryKey: [`/api/events/active/${id}`],
    enabled: !!id,
  });

  const { data: stalls, isLoading: loadingStalls } = useQuery<
    StallWithProducts[]
  >({
    queryKey: [`/api/events/${id}/stalls`],
    enabled: !!id,
  });

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  const formatDate = (date?: string | Date | null) =>
    date ? dateFormatter.format(new Date(date)) : "Date not available";

  const approvedProductCount = useMemo(
    () =>
      stalls?.reduce(
        (acc, stall) =>
          acc +
          (stall.products?.filter((product) => product.approved).length || 0),
        0,
      ) || 0,
    [stalls],
  );

  if (loadingEvent || loadingStalls) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primaryGreen" />
      </div>
    );
  }

  if (!event) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto">
        <section className="mx-auto max-w-7xl bg-orange-500 px-6 py-12 lg:px-10">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/80">
              Event #{event?.id}
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white">
              {event?.name}
            </h1>
          </div>
        </section>

        <main className="mx-auto max-w-7xl border-x border-b border-zinc-200 px-6 py-8 lg:px-10">
          <div className="overflow-hidden rounded border border-zinc-200 bg-white">
            <img
              src={event?.imageUrl || DEFAULT_IMAGES.EVENT}
              alt={event?.name || "Event"}
              className="h-full w-full"
            />
          </div>
          <section>
            <div className="flex flex-col justify-between gap-8">
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1.5 font-medium text-zinc-600">
                    <CheckCircle2 className="h-4 w-4 text-orange-500" />
                    {event?.approved ? "Approved" : "Pending"}
                  </span>
                  <span className="font-semibold text-zinc-900">
                    {event?.archived ? "Archived" : "Active"}
                  </span>
                </div>

                <p className="text-base leading-7 text-zinc-700">
                  {event?.description}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <div className="border border-zinc-200 bg-white p-4">
                  <MapPin className="mb-3 h-5 w-5 text-orange-500" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Location
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">
                    {event?.location}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {event?.city || "City not available"}
                  </p>
                </div>

                <div className="border border-zinc-200 bg-white p-4">
                  <CalendarDays className="mb-3 h-5 w-5 text-orange-500" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Dates
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">
                    {formatDate(event?.startDate)} -{" "}
                    {formatDate(event?.endDate)}
                  </p>
                </div>

                <div className="border border-zinc-200 bg-white p-4">
                  <Users className="mb-3 h-5 w-5 text-orange-500" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Vendors
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">
                    {stalls?.length || 0}
                  </p>
                </div>

                <div className="border border-zinc-200 bg-white p-4">
                  <Tag className="mb-3 h-5 w-5 text-orange-500" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Products
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">
                    {approvedProductCount}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Vendor #{event?.vendorId}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section
            className={`mt-8 transition-all delay-200 duration-700 ${
              animateItems
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <EventCoupons eventId={id} />
          </section>

          <section className="mt-10 space-y-8">
            {stalls?.map((stall, stallIndex) => {
              const approvedProducts =
                stall.products?.filter((product) => product.approved) || [];

              return (
                <article
                  key={stall.id}
                  className={`border border-zinc-200 bg-white transition-all duration-700 ${
                    animateItems
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                  style={{ transitionDelay: `${300 + stallIndex * 100}ms` }}
                >
                  <header className="border-b border-zinc-200 p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-teal-500">
                          <Store className="h-4 w-4 text-orange-500" />
                          Stall #{stall.id}
                        </p>
                        <h2 className="text-2xl font-semibold text-zinc-900">
                          {stall.name}
                        </h2>


                      <div className="my-2 flex shrink-0 items-start gap-1 text-sm text-zinc-600">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                        <span>{stall.location}</span>
                      </div>

                        <p className="max-w-3xl text-sm leading-6 text-zinc-600">
                          {stall.description}
                        </p>
                      </div>

                    </div>
                  </header>

                  <div className="p-5">
                    {approvedProducts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No approved products available for this stall.
                      </p>
                    ) : (
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {approvedProducts.map((product, productIndex) => (
                          <article
                            key={product.id}
                            className={`group flex h-full min-h-[390px] flex-col overflow-hidden rounded border border-zinc-200 bg-white transition duration-300 ${
                              animateItems
                                ? "translate-y-0 opacity-100"
                                : "translate-y-10 opacity-0"
                            }`}
                            style={{
                              transitionDelay: `${400 + productIndex * 50}ms`,
                            }}
                          >
                            <div className="relative aspect-square overflow-hidden">
                              <img
                                src={product.imageUrl || DEFAULT_IMAGES.PRODUCT}
                                alt={product.name}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />
                            </div>

                            <div className="flex flex-1 flex-col px-4 pt-3">
                              <div className="flex items-start justify-between gap-3">
                                <h3 className="line-clamp-1 text-base font-semibold leading-snug text-zinc-900">
                                  {product.name}
                                </h3>
                                <span className="shrink-0 text-xs font-semibold text-teal-500">
                                  #{product.id}
                                </span>
                              </div>

                              <p className="my-3 line-clamp-3 text-sm font-medium text-teal-500">
                                {product.description}
                              </p>

                              <div className="mt-auto space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-2xl font-bold text-zinc-900">
                                    ${(product.price / 100).toFixed(2)}
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 text-sm text-zinc-600">
                                    <Package className="h-4 w-4 text-orange-500" />
                                    {product.stock > 0
                                      ? `${product.stock} left`
                                      : "Sold out"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 pb-4">
                                  <Button
                                    className="inline-flex flex-1 items-center justify-center bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
                                    onClick={() =>
                                      addToCart.mutate({
                                        productId: product.id,
                                        quantity: 1,
                                      })
                                    }
                                    disabled={
                                      addToCart.isPending || product.stock === 0
                                    }
                                  >
                                    {addToCart.isPending ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <ShoppingCart className="mr-2 h-4 w-4" />
                                    )}
                                    {product.stock === 0
                                      ? "Sold Out"
                                      : "Grab It"}
                                  </Button>

                                  <Link
                                    to={`/products/${product.id}`}
                                    aria-label={`View ${product.name}`}
                                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-zinc-200 text-zinc-700 transition hover:border-orange-500 hover:text-orange-500"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        </main>
      </div>
    </div>
  );
}
