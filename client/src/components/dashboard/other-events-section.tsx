import { Event, Product, Stall } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Pencil,
  Plus,
  Store,
} from "lucide-react";
import { DEFAULT_IMAGES } from "@/config/constants";
import { Link } from "wouter";
import { EventCoupons } from "@/components/coupon/event-coupons";

interface OtherEventsSectionProps {
  events?: Event[];
  stalls?: Stall[];
  products?: Product[];
  enableButton: boolean | false;
  onAddStall?: (event: Event) => void;
  onEditStall?: (stall: Stall) => void;
  onAddProduct?: (stall: Stall) => void;
  onEditProduct?: (product: Product) => void;
}

export function OtherEventsSection({
  events = [],
  stalls = [],
  products = [],
  enableButton,
  onAddStall,
  onEditStall,
  onAddProduct,
  onEditProduct,
}: OtherEventsSectionProps) {
  return (
    <div className="space-y-6">
      {events?.length === 0 ? (
        <div className="rounded-[18px] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primaryOrange/10 text-primaryOrange">
            <Store className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-950">
            No other events found
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Try a different search or check back when more organizer events are
            available.
          </p>
        </div>
      ) : (
        events?.map((event) => {
          const eventStalls = stalls?.filter(
            (stall) => stall.eventId === event.id,
          );
          const eventProducts = products?.filter((product) =>
            eventStalls.some((stall) => stall.id === product.stallId),
          );

          return (
            <article
              key={event.id}
              className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]"
            >
              <div className="grid gap-0 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]">
                <div className="relative min-h-[250px] overflow-hidden bg-slate-100 xl:min-h-full">
                  <img
                    src={event.imageUrl || DEFAULT_IMAGES.EVENT}
                    alt={event.name}
                    className="h-full min-h-[250px] w-full object-cover"
                  />
                  <div className="absolute left-4 top-4">
                    <StatusBadge approved={event.approved} />
                  </div>
                </div>

                <div className="flex flex-col p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primaryOrange">
                        Organizer event #{event.id}
                      </p>
                      <h3 className="mt-2 text-2xl font-bold leading-tight tracking-normal text-slate-950">
                        {event.name}
                      </h3>
                    </div>
                    {enableButton && (
                      onAddStall ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onAddStall(event)}
                          className="w-fit shrink-0 rounded-xl bg-slate-950 hover:bg-primaryGreen"
                        >
                          <Plus className="h-4 w-4" />
                          Add Stall
                        </Button>
                      ) : (
                        <Link to={`/vendor/stalls/new/${event.id}`}>
                          <Button
                            size="sm"
                            className="w-fit shrink-0 rounded-xl bg-slate-950 hover:bg-primaryGreen"
                          >
                            <Plus className="h-4 w-4" />
                            Add Stall
                          </Button>
                        </Link>
                      )
                    )}
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">
                    {event.description}
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <InfoTile
                      icon={MapPin}
                      label="Location"
                      value={event.location}
                    />
                    <InfoTile
                      icon={CalendarDays}
                      label="Dates"
                      value={`${formatDate(event.startDate)} - ${formatDate(
                        event.endDate,
                      )}`}
                    />
                    <InfoTile
                      icon={Store}
                      label="Your Stalls"
                      value={`${eventStalls.length} added`}
                    />
                    <InfoTile
                      icon={Package}
                      label="Your Products"
                      value={`${eventProducts.length} listed`}
                    />
                  </div>

                  <div className="mt-5 [&>div]:mb-0 [&>div]:border-slate-200/80 [&>div]:bg-slate-50/80 [&>div]:shadow-none [&>div>div]:p-4">
                    <EventCoupons eventId={event.id} />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-slate-950">
                      Your Stalls
                    </h4>
                    <p className="mt-1 text-sm text-slate-500">
                      Stalls you have added to this organizer event.
                    </p>
                  </div>
                </div>

                {eventStalls.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                    You have not added a stall to this event yet.
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    {eventStalls.map((stall) => {
                      const stallProducts = products?.filter(
                        (product) => product.stallId === stall.id,
                      );

                      return (
                        <section
                          key={stall.id}
                          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex min-w-0 gap-3">
                              <img
                                src={stall.imageUrl || DEFAULT_IMAGES.STALL}
                                alt={stall.name}
                                className="h-14 w-14 shrink-0 rounded-xl object-cover"
                              />
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h5 className="text-base font-bold text-slate-950">
                                    {stall.name}
                                  </h5>
                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                    {stallProducts.length} products
                                  </span>
                                </div>
                                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                                  {stall.description}
                                </p>
                              </div>
                            </div>

                            {enableButton && (
                              <div className="flex flex-wrap gap-2">
                                {onEditStall ? (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEditStall(stall)}
                                    className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                  >
                                    <Pencil className="h-4 w-4" />
                                    Edit Stall
                                  </Button>
                                ) : (
                                  <Link to={`/vendor/stalls/${stall.id}/edit`}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                    >
                                      <Pencil className="h-4 w-4" />
                                      Edit Stall
                                    </Button>
                                  </Link>
                                )}
                                {onAddProduct ? (
                                  <Button
                                    type="button"
                                    onClick={() => onAddProduct(stall)}
                                    size="sm"
                                    className="rounded-xl bg-primaryOrange hover:bg-primaryOrange/90"
                                  >
                                    <Plus className="h-4 w-4" />
                                    Add Product
                                  </Button>
                                ) : (
                                  <Link to={`/vendor/products/new/${stall.id}`}>
                                    <Button
                                      size="sm"
                                      className="rounded-xl bg-primaryOrange hover:bg-primaryOrange/90"
                                    >
                                      <Plus className="h-4 w-4" />
                                      Add Product
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>

                          {stallProducts.length === 0 ? (
                            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                              No products added to this stall yet.
                            </div>
                          ) : (
                            <ProductTable
                              products={stallProducts}
                              onEditProduct={onEditProduct}
                            />
                          )}
                        </section>
                      );
                    })}
                  </div>
                )}
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}

function ProductTable({
  products,
  onEditProduct,
}: {
  products: Product[];
  onEditProduct?: (product: Product) => void;
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/80 bg-white">
      <Table>
        <TableHeader className="bg-slate-50/90">
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-11 min-w-[240px] px-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              Product
            </TableHead>
            <TableHead className="h-11 px-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              Status
            </TableHead>
            <TableHead className="h-11 px-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              Price
            </TableHead>
            <TableHead className="h-11 px-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              Stock
            </TableHead>
            <TableHead className="h-11 px-4 text-right text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="hover:bg-slate-50/80">
              <TableCell className="px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={product.imageUrl || DEFAULT_IMAGES.PRODUCT}
                    alt={product.name}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-bold text-slate-950">
                      {product.name}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500">
                      {product.category}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3">
                <StatusBadge approved={product.approved} compact />
              </TableCell>
              <TableCell className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-primaryGreen">
                {formatCurrency(product.price)}
              </TableCell>
              <TableCell className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-600">
                {product.stock} left
              </TableCell>
              <TableCell className="px-4 py-3 text-right">
                {onEditProduct ? (
                  <Button
                    type="button"
                    onClick={() => onEditProduct(product)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                    aria-label={`Edit ${product.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                ) : (
                  <Link to={`/vendor/products/${product.id}/edit`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                      aria-label={`Edit ${product.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

type IconComponent = typeof CalendarDays;

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: IconComponent;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-[76px] items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primaryOrange shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({
  approved,
  compact = false,
}: {
  approved: boolean;
  compact?: boolean;
}) {
  const Icon = approved ? CheckCircle2 : Clock3;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${
        compact ? "px-2 py-0.5 text-xs" : "px-3 py-1.5 text-xs"
      } ${
        approved
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {approved ? "Approved" : "Pending"}
    </span>
  );
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatCurrency(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price / 100);
}
