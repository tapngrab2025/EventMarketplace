import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, Event, Stall } from "@shared/schema";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Package,
  Plus,
  Store,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ApprovalSection } from "@/components/dashboard/approval-section";
import { MyEventsSection } from "@/components/dashboard/my-events-section";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventForm } from "@/components/event/event-form";
import { EditEventForm } from "@/components/event/event-edit-form";
import { StallForm } from "@/components/stall/stall-form";
import { StallEditForm } from "@/components/stall/stall-edit-form";
import { ProductForm } from "@/components/product/product-form";
import { ProductEditForm } from "@/components/product/product-edit-form";

interface VendorDashboardProps {
  searchTerm?: string;
}

export default function OrganizerDashboard({ searchTerm = "" }: VendorDashboardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [eventPanelMode, setEventPanelMode] = useState<EventPanelMode | null>(
    null,
  );
  const [eventPanelOpen, setEventPanelOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [editingStallId, setEditingStallId] = useState<number | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [selectedStallEvent, setSelectedStallEvent] = useState<Event | null>(
    null,
  );
  const [selectedProductStall, setSelectedProductStall] =
    useState<Stall | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const { data: events, isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: stalls, isLoading: loadingStalls } = useQuery<Stall[]>({
    queryKey: ["/api/stalls"],
  });

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products/all"],
  });

  const normalizedSearch = searchTerm.trim().toLowerCase();
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

    return stallMatches || hasMatchingProduct;
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

  const pendingEvents = events?.filter((event) => !event.approved);
  const pendingProducts = products?.filter((product) => !product.approved);

  const approveEvent = useMutation({
    mutationFn: async (eventId: number) => {
      const res = await apiRequest("PATCH", `/api/events/${eventId}/approve`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Event approved successfully",
      });
    },
  });

  const approveProduct = useMutation({
    mutationFn: async (productId: number) => {
      const res = await apiRequest("PATCH", `/api/products/${productId}/approve`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/all"] });
      toast({
        title: "Success",
        description: "Product approved successfully",
      });
    },
  });

  const openEventPanel = ({
    mode,
    event,
    stall,
    product,
  }: {
    mode: EventPanelMode;
    event?: Event;
    stall?: Stall;
    product?: Product;
  }) => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }
    setEventPanelMode(mode);
    setEditingEventId(mode === "edit" ? event?.id ?? null : null);
    setEditingStallId(mode === "stall-edit" ? stall?.id ?? null : null);
    setEditingProductId(mode === "product-edit" ? product?.id ?? null : null);
    setSelectedStallEvent(mode === "stall" ? event ?? null : null);
    setSelectedProductStall(mode === "product-create" ? stall ?? null : null);
    window.requestAnimationFrame(() => setEventPanelOpen(true));
  };

  const closeEventPanel = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }
    setEventPanelOpen(false);
    closeTimerRef.current = window.setTimeout(() => {
      setEventPanelMode(null);
      setEditingEventId(null);
      setEditingStallId(null);
      setEditingProductId(null);
      setSelectedStallEvent(null);
      setSelectedProductStall(null);
      closeTimerRef.current = null;
    }, 320);
  };

  useEffect(() => {
    if (!eventPanelMode) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeEventPanel();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [eventPanelMode]);

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
            Loading organizer workspace
          </span>
        </div>
      </div>
    );
  }

  const totalEvents = myEvents?.length ?? 0;
  const approvedEvents = myEvents?.filter((event) => event.approved).length ?? 0;
  const pendingMyEvents = Math.max(totalEvents - approvedEvents, 0);
  const totalStalls = myStalls?.length ?? 0;
  const totalProducts =
    matchedProducts?.filter((product) =>
      myStalls?.some((stall) => stall.id === product.stallId),
    ).length ?? 0;

  return (
    <div className="-m-6 min-h-screen bg-[#F7FAFC] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="overflow-hidden rounded-[20px] border border-white/80 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primaryGreen/20 bg-primaryGreen/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primaryGreen">
                <CalendarDays className="h-3.5 w-3.5" />
                Organizer workspace
              </div>
              <h1 className="mt-5 text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
                Organizer Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
                Manage approvals, polish event pages, and keep stalls and products
                organized from one calmer workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={() => openEventPanel({ mode: "create" })}
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
            value={totalEvents}
            accent="text-primaryGreen"
            surface="bg-primaryGreen/10"
          />
          <DashboardMetric
            icon={Store}
            label="Stalls"
            value={totalStalls}
            accent="text-primaryOrange"
            surface="bg-primaryOrange/10"
          />
          <DashboardMetric
            icon={Package}
            label="Products"
            value={totalProducts}
            accent="text-slate-700"
            surface="bg-slate-100"
          />
          <DashboardMetric
            icon={pendingMyEvents > 0 ? Clock3 : CheckCircle2}
            label="Pending Review"
            value={pendingMyEvents}
            accent={pendingMyEvents > 0 ? "text-amber-600" : "text-emerald-600"}
            surface={pendingMyEvents > 0 ? "bg-amber-100" : "bg-emerald-100"}
          />
        </section>

        <Tabs defaultValue="approvals" className="space-y-6">
          <TabsList className="h-auto rounded-2xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm">
            <TabsTrigger
              value="approvals"
              className="rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-slate-950 data-[state=active]:text-white"
            >
              Approvals
            </TabsTrigger>
            <TabsTrigger
              value="myEvents"
              className="rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-slate-950 data-[state=active]:text-white"
            >
              My Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="space-y-6">
            <ApprovalSection
              pendingEvents={pendingEvents}
              pendingProducts={pendingProducts}
              approveEvent={approveEvent}
              approveProduct={approveProduct}
            />
          </TabsContent>

          <TabsContent value="myEvents" className="space-y-6">
            <section className="rounded-[20px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-6 lg:p-7">
              <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-normal text-slate-950">
                    My Events
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    A clearer view of each event, its stalls, products, and
                    publishing status.
                  </p>
                </div>
              </div>
              <MyEventsSection
                events={myEvents}
                stalls={myStalls}
                products={matchedProducts}
                enableButton={true}
                onAddEvent={() => openEventPanel({ mode: "create" })}
                onEditEvent={(event) => openEventPanel({ mode: "edit", event })}
                onAddStall={(event) => openEventPanel({ mode: "stall", event })}
                onEditStall={(stall) =>
                  openEventPanel({ mode: "stall-edit", stall })
                }
                onAddProduct={(stall) =>
                  openEventPanel({ mode: "product-create", stall })
                }
                onEditProduct={(product) =>
                  openEventPanel({ mode: "product-edit", product })
                }
              />
            </section>
          </TabsContent>
        </Tabs>
      </div>

      <EventSlidePanel
        mode={eventPanelMode}
        eventId={editingEventId}
        stallId={editingStallId}
        productId={editingProductId}
        stallEvent={selectedStallEvent}
        productStall={selectedProductStall}
        open={eventPanelOpen}
        onClose={closeEventPanel}
      />
    </div>
  );
}

type EventPanelMode =
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

function EventSlidePanel({
  mode,
  eventId,
  stallId,
  productId,
  stallEvent,
  productStall,
  open,
  onClose,
}: {
  mode: EventPanelMode | null;
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
        aria-label="Close event panel"
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
            aria-label="Close event panel"
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
