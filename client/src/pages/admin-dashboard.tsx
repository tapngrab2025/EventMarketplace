import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Product, Event, User } from "@shared/schema";
import {
  Archive,
  ArrowUpRight,
  CalendarDays,
  Loader2,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ApprovalSection } from "@/components/dashboard/approval-section";
import { FeedbackSettings } from "@/components/dashboard/feedback-settings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface VendorDashboardProps {
  searchTerm?: string;
}

export default function AdminDashboard({
  searchTerm = "",
}: VendorDashboardProps) {
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const { data: events, isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products/all"],
  });

  const { data: users, isLoading: loadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const pendingEvents = events
    ?.filter((event) => !event.approved)
    .filter((event) =>
      normalizedSearch
        ? [event.name, event.description, event.location, event.city]
            .filter(Boolean)
            .some((value) =>
              String(value).toLowerCase().includes(normalizedSearch),
            )
        : true,
    );
  const pendingProducts = products
    ?.filter((product) => !product.approved)
    .filter((product) =>
      normalizedSearch
        ? [product.name, product.description, product.category]
            .filter(Boolean)
            .some((value) =>
              String(value).toLowerCase().includes(normalizedSearch),
            )
        : true,
    );

  const approveEvent = useMutation({
    mutationFn: async (eventId: number) => {
      const res = await apiRequest(
        "PATCH",
        `/api/events/${eventId}/approve`,
        {},
      );
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
      const res = await apiRequest(
        "PATCH",
        `/api/products/${productId}/approve`,
        {},
      );
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

  if (loadingEvents || loadingProducts || loadingUsers) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7FAFC] [font-family:'Inter',sans-serif]">
        <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/85 px-5 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <Loader2 className="h-5 w-5 animate-spin text-[#0EA5A4]" />
          <span className="text-sm font-medium text-slate-600">
            Loading admin console
          </span>
        </div>
      </div>
    );
  }

  const totalUsers = (users?.length ?? 0) + (user ? 1 : 0);
  const profileName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "Admin";
  const initials = getInitials(profileName);
  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="-m-6 min-h-screen bg-[#F7FAFC] px-4 py-6 text-slate-950 [font-family:'Inter',sans-serif] sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-72" />
      <div className="relative mx-auto max-w-7xl space-y-8">
        <header className="overflow-hidden rounded-[20px] border border-white/80 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#0EA5A4]/20 bg-[#0EA5A4]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0B7776]">
                <Sparkles className="h-3.5 w-3.5" />
                Admin console
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
                  Welcome back, {profileName}
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
                  Review marketplace submissions, monitor approval queues, and
                  keep platform controls aligned from one focused workspace.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row xl:items-center">
              <div className="rounded-2xl border border-slate-200/70 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0EA5A4]/10 text-[#0EA5A4]">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                      Today
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {currentDate}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 border border-[#0EA5A4]/20 bg-[#0EA5A4]/10">
                    <AvatarImage
                      src={profile?.imageUrl ?? undefined}
                      alt={profileName}
                    />
                    <AvatarFallback className="bg-[#0EA5A4]/10 text-sm font-bold text-[#0B7776]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {profileName}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      {user?.email ?? "Administrator"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <DashboardLinkCard
            href="/users"
            eyebrow={`${totalUsers} accounts`}
            title="User Management"
            description="Manage users, roles, and account status."
            icon={Users}
            tone="primary"
          />
          <DashboardLinkCard
            href="/admin/archives"
            eyebrow="Archive"
            title="Archived Items"
            description="Review archived events, products, and marketplace records."
            icon={Archive}
            tone="warning"
          />
        </section>

        <div className="">
          <ApprovalSection
            pendingEvents={pendingEvents}
            pendingProducts={pendingProducts}
            approveEvent={approveEvent}
            approveProduct={approveProduct}
          />
        </div>

        <section className="rounded-[20px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.07)] backdrop-blur-xl lg:p-7">
          <div className="flex flex-col gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0EA5A4]/10 text-[#0EA5A4]">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-normal text-slate-950">
                    Platform Settings
                  </h2>
                  <p className="text-sm text-slate-500">
                    Manage operational controls for the marketplace.
                  </p>
                </div>
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#22C55E]/20 bg-[#22C55E]/10 px-3 py-1 text-xs font-semibold text-[#15803D]">
              <ShieldCheck className="h-3.5 w-3.5" />
              System healthy
            </span>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <FeedbackSettings variant="embedded" />
          </div>
        </section>
      </div>
    </div>
  );
}

type LinkCardTone = "primary" | "warning";

const linkCardToneStyles: Record<
  LinkCardTone,
  { bg: string; text: string; ring: string }
> = {
  primary: {
    bg: "bg-[#0EA5A4]/10",
    text: "text-[#0B7776]",
    ring: "ring-[#0EA5A4]/20",
  },
  warning: {
    bg: "bg-[#F59E0B]/10",
    text: "text-[#B45309]",
    ring: "ring-[#F59E0B]/20",
  },
};

function DashboardLinkCard({
  href,
  eyebrow,
  title,
  description,
  icon: Icon,
  tone,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: LinkCardTone;
}) {
  const styles = linkCardToneStyles[tone];

  return (
    <Link
      to={href}
      className="group overflow-hidden rounded-[20px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(15,23,42,0.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5A4]/50 focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{eyebrow}</p>
          <h2 className="mt-3 text-2xl font-bold tracking-normal text-slate-950">
            {title}
          </h2>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${styles.bg} ${styles.text} ring-1 ${styles.ring}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-5 flex items-end justify-between gap-4">
        <p className="text-sm leading-6 text-slate-500">{description}</p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white transition duration-200 group-hover:bg-[#0EA5A4]">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
