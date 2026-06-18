import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Event, Product, Stall } from "@shared/schema";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Package,
  Plus,
  Search,
  Store,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MyEventsSection } from "@/components/dashboard/my-events-section";
import { OtherEventsSection } from "@/components/dashboard/other-events-section";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventForm } from "@/components/event/event-form";
import { EditEventForm } from "@/components/event/event-edit-form";
import { StallForm } from "@/components/stall/stall-form";
import { StallEditForm } from "@/components/stall/stall-edit-form";
import { ProductForm } from "@/components/product/product-form";
import { ProductEditForm } from "@/components/product/product-edit-form";

interface VendorDashboardProps {
  searchTerm?: string;
  setSearchTerm?: React.Dispatch<React.SetStateAction<string>>;
}

export default function VendorDashboard({
  searchTerm = "",
  setSearchTerm,
}: VendorDashboardProps) {
  const { user } = useAuth();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [panelMode, setPanelMode] = useState<VendorPanelMode | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [editingStallId, setEditingStallId] = useState<number | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [selectedStallEvent, setSelectedStallEvent] = useState<Event | null>(
    null,
  );
  const [selectedProductStall, setSelectedProductStall] =
    useState<Stall | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const dashboardSearch = setSearchTerm ? searchTerm : localSearchTerm;

  const { data: events, isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: stalls, isLoading: loadingStalls } = useQuery<Stall[]>({
    queryKey: ["/api/stalls"],
  });

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products/all"],
  });

  const normalizedSearch = dashboardSearch.trim().toLowerCase();
  const matchesSearch = (...values: Array<string | null | undefined>) =>
    normalizedSearch
      ? values
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedSearch),
          )
      : true;

  const matchedProducts = products?.filter((product) =>
    matchesSearch(product.name, product.description, product.category),
  );

  const matchedStalls = stalls?.filter((stall) => {
    const stallMatches = matchesSearch(
      stall.name,
      stall.description,
      stall.location,
    );
    const hasMatchingProduct = matchedProducts?.some(
      (product) => product.stallId === stall.id,
    );

    return (stallMatches || hasMatchingProduct) && stall.vendorId === user?.id;
  });

  const myEvents = events?.filter((event) => {
    const eventMatches = matchesSearch(
      event.name,
      event.description,
      event.location,
      event.city,
    );
    const hasMatchingStall = matchedStalls?.some(
      (stall) => stall.eventId === event.id,
    );

    return (eventMatches || hasMatchingStall) && event.vendorId === user?.id;
  });

  const myStalls = matchedStalls?.filter((stall) =>
    myEvents?.some((event) => event.id === stall.eventId),
  );

  const otherEvents = events?.filter((event) => {
    const eventMatches = matchesSearch(
      event.name,
      event.description,
      event.location,
      event.city,
    );
    const hasMatchingStall = matchedStalls?.some(
      (stall) => stall.eventId === event.id,
    );

    return (eventMatches || hasMatchingStall) && event.vendorId !== user?.id;
  });

  const otherStalls = matchedStalls?.filter((stall) =>
    otherEvents?.some((event) => event.id === stall.eventId),
  );

  const visibleMyProducts = products?.filter((product) =>
    myStalls?.some((stall) => stall.id === product.stallId),
  );

  const visibleOtherProducts = products?.filter((product) =>
    otherStalls?.some((stall) => stall.id === product.stallId),
  );

  const openPanel = ({
    mode,
    event,
    stall,
    product,
  }: {
    mode: VendorPanelMode;
    event?: Event;
    stall?: Stall;
    product?: Product;
  }) => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }
    setPanelMode(mode);
    setEditingEventId(mode === "edit" ? event?.id ?? null : null);
    setEditingStallId(mode === "stall-edit" ? stall?.id ?? null : null);
    setEditingProductId(mode === "product-edit" ? product?.id ?? null : null);
    setSelectedStallEvent(mode === "stall" ? event ?? null : null);
    setSelectedProductStall(mode === "product-create" ? stall ?? null : null);
    window.requestAnimationFrame(() => setPanelOpen(true));
  };

  const closePanel = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }
    setPanelOpen(false);
    closeTimerRef.current = window.setTimeout(() => {
      setPanelMode(null);
      setEditingEventId(null);
      setEditingStallId(null);
      setEditingProductId(null);
      setSelectedStallEvent(null);
      setSelectedProductStall(null);
      closeTimerRef.current = null;
    }, 320);
  };

  useEffect(() => {
    if (!panelMode) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePanel();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [panelMode]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  if (loadingEvents || loadingStalls || loadingProducts) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7FAFC]">
        <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-5 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <Loader2 className="h-5 w-5 animate-spin text-primaryGreen" />
          <span className="text-sm font-medium text-slate-600">
            Loading vendor workspace
          </span>
        </div>
      </div>
    );
  }

  const totalMyEvents = myEvents?.length ?? 0;
  const totalOtherEvents = otherEvents?.length ?? 0;
  const totalMyStalls = myStalls?.length ?? 0;
  const totalMyProducts = visibleMyProducts?.length ?? 0;
  const approvedMyEvents =
    myEvents?.filter((event) => event.approved).length ?? 0;
  const pendingMyEvents = Math.max(totalMyEvents - approvedMyEvents, 0);

  return (
    <div className="-m-6 min-h-screen bg-[#F7FAFC] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="overflow-hidden rounded-[20px] border border-white/80 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primaryOrange/20 bg-primaryOrange/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primaryOrange">
                <Store className="h-3.5 w-3.5" />
                Vendor workspace
              </div>
              <h1 className="mt-5 text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
                Vendor Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
                Manage your events, stalls, and product catalog with a clearer
                view of every marketplace touchpoint.
              </p>
            </div>

            <button
              type="button"
              onClick={() => openPanel({ mode: "create" })}
              className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-primaryGreen"
            >
              <Plus className="h-4 w-4" />
              Add Event
            </button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardMetric
            icon={CalendarDays}
            label="My Events"
            value={totalMyEvents}
            accent="text-primaryGreen"
            surface="bg-primaryGreen/10"
          />
          <DashboardMetric
            icon={Store}
            label="My Stalls"
            value={totalMyStalls}
            accent="text-primaryOrange"
            surface="bg-primaryOrange/10"
          />
          <DashboardMetric
            icon={Package}
            label="Products"
            value={totalMyProducts}
            accent="text-slate-700"
            surface="bg-slate-100"
          />
          <DashboardMetric
            icon={pendingMyEvents > 0 ? Clock3 : CheckCircle2}
            label="Pending Events"
            value={pendingMyEvents}
            accent={pendingMyEvents > 0 ? "text-amber-600" : "text-emerald-600"}
            surface={pendingMyEvents > 0 ? "bg-amber-100" : "bg-emerald-100"}
          />
        </section>

        <section className="rounded-[20px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-5">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search events, stalls, and products..."
              className="h-11 rounded-xl border-slate-200 bg-white pl-11 pr-4 text-sm shadow-sm focus-visible:ring-primaryGreen"
              value={dashboardSearch}
              onChange={(event) => {
                if (setSearchTerm) {
                  setSearchTerm(event.target.value);
                } else {
                  setLocalSearchTerm(event.target.value);
                }
              }}
            />
          </div>
        </section>

        <Tabs defaultValue="myEvents" className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="h-auto rounded-2xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm">
              <TabsTrigger
                value="myEvents"
                className="rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-slate-950 data-[state=active]:text-white"
              >
                My Events
              </TabsTrigger>
              <TabsTrigger
                value="otherEvents"
                className="rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-slate-950 data-[state=active]:text-white"
              >
                Other Events
              </TabsTrigger>
            </TabsList>

            <span className="inline-flex w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">
              {totalOtherEvents} available events
            </span>
          </div>

          <TabsContent value="myEvents" className="space-y-6">
            <section className="rounded-[20px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-6 lg:p-7">
              <div className="mb-6 border-b border-slate-100 pb-5">
                <h2 className="text-2xl font-bold tracking-normal text-slate-950">
                  My Events
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Events you own, with stalls and products grouped for quick
                  management.
                </p>
              </div>
              <MyEventsSection
                events={myEvents}
                stalls={myStalls}
                products={visibleMyProducts}
                enableButton={true}
                onAddEvent={() => openPanel({ mode: "create" })}
                onEditEvent={(event) => openPanel({ mode: "edit", event })}
                onAddStall={(event) => openPanel({ mode: "stall", event })}
                onEditStall={(stall) =>
                  openPanel({ mode: "stall-edit", stall })
                }
                onAddProduct={(stall) =>
                  openPanel({ mode: "product-create", stall })
                }
                onEditProduct={(product) =>
                  openPanel({ mode: "product-edit", product })
                }
              />
            </section>
          </TabsContent>

          <TabsContent value="otherEvents" className="space-y-6">
            <section className="rounded-[20px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-6 lg:p-7">
              <div className="mb-6 border-b border-slate-100 pb-5">
                <h2 className="text-2xl font-bold tracking-normal text-slate-950">
                  Other Events
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Browse organizer events and add your stalls where you want to
                  sell.
                </p>
              </div>
              <OtherEventsSection
                events={otherEvents}
                stalls={otherStalls}
                products={visibleOtherProducts}
                enableButton={true}
                onAddStall={(event) => openPanel({ mode: "stall", event })}
                onEditStall={(stall) =>
                  openPanel({ mode: "stall-edit", stall })
                }
                onAddProduct={(stall) =>
                  openPanel({ mode: "product-create", stall })
                }
                onEditProduct={(product) =>
                  openPanel({ mode: "product-edit", product })
                }
              />
            </section>
          </TabsContent>
        </Tabs>
      </div>

      <VendorSlidePanel
        mode={panelMode}
        eventId={editingEventId}
        stallId={editingStallId}
        productId={editingProductId}
        stallEvent={selectedStallEvent}
        productStall={selectedProductStall}
        open={panelOpen}
        onClose={closePanel}
      />
    </div>
  );
}

type VendorPanelMode =
  | "create"
  | "edit"
  | "stall"
  | "stall-edit"
  | "product-create"
  | "product-edit";

type DashboardMetricProps = {
  icon: typeof CalendarDays;
  label: string;
  value: number;
  accent: string;
  surface: string;
};

function DashboardMetric({
  icon: Icon,
  label,
  value,
  accent,
  surface,
}: DashboardMetricProps) {
  return (
    <div className="rounded-[20px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-normal text-slate-950">
            {value}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${surface} ${accent}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function VendorSlidePanel({
  mode,
  eventId,
  stallId,
  productId,
  stallEvent,
  productStall,
  open,
  onClose,
}: {
  mode: VendorPanelMode | null;
  eventId: number | null;
  stallId: number | null;
  productId: number | null;
  stallEvent: Event | null;
  productStall: Stall | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!mode) {
    return null;
  }

  const title =
    mode === "create"
      ? "Create New Event"
      : mode === "edit"
        ? "Edit Event"
        : mode === "stall"
          ? "Add Stall"
          : mode === "stall-edit"
            ? "Edit Stall"
            : mode === "product-create"
              ? "Add Product"
              : "Edit Product";
  const eyebrow =
    mode === "stall" || mode === "stall-edit"
      ? "Stall setup"
      : mode === "product-create" || mode === "product-edit"
        ? "Product setup"
        : "Event setup";

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close vendor panel"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/35"
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-[720px] transform flex-col bg-white shadow-[0_24px_90px_rgba(15,23,42,0.28)] transition-transform duration-300 ease-out md:right-4 md:top-4 md:h-[calc(100dvh-2rem)] md:rounded-[24px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-5 py-5 backdrop-blur md:rounded-t-[24px] sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primaryGreen">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
              {title}
            </h2>
            {mode === "stall" && stallEvent && (
              <p className="mt-1 text-sm font-medium text-slate-500">
                {stallEvent.name}
              </p>
            )}
            {mode === "product-create" && productStall && (
              <p className="mt-1 text-sm font-medium text-slate-500">
                {productStall.name}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
            aria-label="Close vendor panel"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {mode === "create" ? (
            <EventForm onSuccess={onClose} />
          ) : mode === "edit" && eventId ? (
            <EditEventForm eventId={eventId} onClose={onClose} />
          ) : mode === "stall" && stallEvent ? (
            <StallForm event={stallEvent} onSuccess={onClose} />
          ) : mode === "stall-edit" && stallId ? (
            <StallEditForm stallId={stallId} onClose={onClose} />
          ) : mode === "product-create" && productStall ? (
            <ProductForm stall={productStall} onSuccess={onClose} />
          ) : mode === "product-edit" && productId ? (
            <ProductEditForm productId={productId} onClose={onClose} />
          ) : null}
        </div>
      </aside>
    </div>
  );
}
