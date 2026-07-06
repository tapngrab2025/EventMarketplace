import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Event, Product, Stall } from "@shared/schema";
import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  MapPin,
  Package,
  ShoppingCart,
  Ticket,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useCart } from "@/hooks/use-cart";
import { EventCoupons } from "@/components/coupon/event-coupons";
import { type KeyboardEvent, useEffect, useMemo, useState } from "react";
import { DEFAULT_IMAGES } from "@/config/constants";
import publisherImage from "@/assets/publisher.png";

type StallWithProducts = Stall & {
  products?: Product[];
};

export default function EventDetailsPage() {
  const { addToCart } = useCart();
  const [, params] = useRoute("/event/:id");
  const [, setLocation] = useLocation();
  const id = params?.id;
  const [animateItems, setAnimateItems] = useState(false);

  useEffect(() => {
    setAnimateItems(true);
  }, []);

  const { data: event, isLoading: loadingEvent } = useQuery<Event>({
    queryKey: [`/api/events/${id}`],
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

  const openProductPage = (productId: number) => {
    setLocation(`/products/${productId}`);
  };

  const handleProductCardKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    productId: number,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProductPage(productId);
    }
  };

  if (loadingEvent || loadingStalls) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primaryGreen" />
      </div>
    );
  }

  const eventImage = event?.imageUrl || DEFAULT_IMAGES.EVENT;
  const eventCoverImage = new URL(event?.coverImageUrl || DEFAULT_IMAGES.EVENT , import.meta.url).href;

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-visible bg-zinc-950">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center"
            style={{ backgroundImage: `url(${eventCoverImage})` }}
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid min-h-[300px] items-end gap-6 pb-0 pt-20 sm:min-h-[330px] lg:grid-cols-[220px_minmax(0,1fr)] lg:pt-24">
            <div className="relative z-20 order-2 -mb-28 w-44 sm:w-56 lg:order-1 lg:-mb-36 lg:w-[220px]">
              <div className="overflow-hidden border-4 border-white bg-white">
                <img
                  src={eventImage}
                  alt={event?.name || "Event poster"}
                  className="aspect-[2/3] w-full object-cover"
                />
              </div>
            </div>

            <div className="order-1 max-w-3xl pb-8 text-white lg:order-2 lg:pb-10">
              <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-white/80">
                Event #{event?.id}
              </p>

              <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-normal sm:text-4xl lg:text-[38px]">
                {event?.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-white/85">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-600 border border-green-500 px-2 py-1 leading-none text-white">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-200" />
                  {event?.approved ? "Approved" : "Pending"}
                </span>
                <span className="rounded-full border border-white/65 px-3 py-1 leading-none text-white">
                  {event?.archived ? "Archived" : "Active"}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-medium text-white/90">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-sky-200" />
                  {formatDate(event?.startDate)} - {formatDate(event?.endDate)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-sky-200" />
                  {event?.location},{" "}
                  {event?.city || event?.location || "Location not available"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-32 sm:px-6 sm:pt-36 lg:px-10 lg:pt-12">
        <div className="space-y-10">
          <section className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div className="hidden lg:block" aria-hidden="true" />
            <div className="bg-white">
              <div className="mb-5 flex items-center gap-4">
                <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-900">
                  Synopsis
                </h2>
              </div>
              <p className="text-base text-zinc-700 max-w-3xl">
                {event?.description}
              </p>
            </div>
          </section>

          <section
            className={`transition-all duration-700 ${
              animateItems
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <EventCoupons eventId={id || ""} />
          </section>

          <section className="space-y-8">
            {stalls?.length ? (
              stalls.map((stall, stallIndex) => {
                const approvedProducts =
                  stall.products?.filter((product) => product.approved) || [];

                return (
                  <article
                    key={stall.id}
                    className={`bg-white transition-all duration-700 ${
                      animateItems
                        ? "translate-y-0 opacity-100"
                        : "translate-y-10 opacity-0"
                    }`}
                    style={{
                      transitionDelay: `${300 + stallIndex * 100}ms`,
                    }}
                  >
                    <header className="p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex items-start gap-4">
                            {/* image placeholder */}
                            <div className="w-24 h-24 p-1 border rounded-lg">
                              <img className="w-full h-full object-cover"  src={stall.imageUrl || DEFAULT_IMAGES.STALL} alt="" />
                            </div>

                            <div>
                              <h2 className="text-2xl font-semibold text-zinc-900">
                                {stall.name}
                              </h2>

                              <div className="flex gap-2 my-2">
                                <p className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 inset-ring inset-ring-green-600/20">
                                  <Store className="h-4 w-4 mr-1" />
                                  Stall No: {stall.id}
                                </p>

                                <p className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium border border-slate-200 text-slate-600">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {stall.location}
                                </p>
                              </div>

                              <p className="max-w-lg text-sm leading-6 text-zinc-600">
                                {stall.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </header>

                    <div className="p-5">
                      {approvedProducts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No approved products available for this stall.
                        </p>
                      ) : (
                        <Carousel
                          opts={{
                            align: "start",
                            containScroll: "trimSnaps",
                          }}
                          className="relative"
                        >
                          <CarouselContent>
                            {approvedProducts.map((product, productIndex) => (
                              <CarouselItem
                                key={product.id}
                                className="basis-[86%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                              >
                                <article
                                  role="link"
                                  tabIndex={0}
                                  aria-label={`View ${product.name}`}
                                  onClick={() => openProductPage(product.id)}
                                  onKeyDown={(event) =>
                                    handleProductCardKeyDown(event, product.id)
                                  }
                                  className={`group flex h-full cursor-pointer rounded-lg flex-col overflow-hidden bg-white transition-[opacity,transform] duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                                    animateItems
                                      ? "translate-y-0 opacity-100"
                                      : "translate-y-10 opacity-0"
                                  }`}
                                >
                                  <div className="relative aspect-4/5 overflow-hidden">
                                    <img
                                      src={
                                        product.imageUrl ||
                                        DEFAULT_IMAGES.PRODUCT
                                      }
                                      alt={product.name}
                                      className="h-full object-cover transition"
                                    />

                                    <div className="absolute top-0 right-0 p-4">
                                      <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-blue-600 inset-ring inset-ring-yellow-600/20">
                                        <Ticket className="h-4 w-4 mr-1" />
                                        {product.stock > 0
                                          ? `${product.stock} left`
                                          : "Sold out"}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex flex-1 flex-col">
                                    <div className="p-4 border-x">
                                      <h3 className="line-clamp-1 text-base font-semibold leading-snug text-zinc-900">
                                        {product.name}
                                      </h3>
                                      <div className="flex items-center justify-between gap-3">
                                        <span className="text-base font-medium text-zinc-900">
                                          ${(product.price / 100).toFixed(2)}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="mt-auto">
                                      <div className="flex items-center">
                                        <Button
                                          className="inline-flex flex-1 items-center justify-center rounded-t-none rounded-b-lg bg-blue-600 px-5  text-sm font-semibold text-white transition hover:bg-blue-600"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            addToCart.mutate({
                                              productId: product.id,
                                              quantity: 1,
                                            });
                                          }}
                                          disabled={
                                            addToCart.isPending ||
                                            product.stock === 0
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
                                      </div>
                                    </div>
                                  </div>
                                </article>
                              </CarouselItem>
                            ))}
                          </CarouselContent>

                          {approvedProducts.length > 1 && (
                            <>
                              <CarouselPrevious className="-left-4 z-10 h-8 w-8 border-zinc-200 bg-white text-zinc-900 shadow-sm hover:bg-slate-100 disabled:opacity-30" />
                              <CarouselNext className="-right-4 z-10 h-8 w-8 border-zinc-200 bg-white text-zinc-900 shadow-sm hover:bg-slate-100 disabled:opacity-30" />
                            </>
                          )}
                        </Carousel>
                      )}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="bg-white p-6 text-sm text-muted-foreground shadow-sm ring-1 ring-zinc-200">
                No stalls are available for this event yet.
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
