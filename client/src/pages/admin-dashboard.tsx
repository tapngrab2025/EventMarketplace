import { useQuery, useMutation } from "@tanstack/react-query";
import { Event, Product, User } from "@shared/schema";
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Package,
  Settings,
  ShieldCheck,
  UserCircle,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ApprovalSection } from "@/components/dashboard/approval-section";
import { FeedbackSettings } from "@/components/dashboard/feedback-settings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface AdminDashboardProps {
  searchTerm?: string;
}

export default function AdminDashboard({
  searchTerm = "",
}: AdminDashboardProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
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
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-lg border border-[#e4e1da] bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-[#111936]" />
          <span className="text-sm font-semibold text-[#5f636d]">
            Loading admin dashboard
          </span>
        </div>
      </div>
    );
  }

  const totalUsers = (users?.length ?? 0) + (user ? 1 : 0);
  const totalEvents = events?.length ?? 0;
  const totalProducts = products?.length ?? 0;
  const profileName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "Admin";
  const initials = getInitials(profileName);

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={totalUsers}
          detail={`${users?.length ?? 0} managed accounts`}
          subdetail="Including your admin profile"
          icon={Users}
        />
        <MetricCard
          title="Pending Events"
          value={pendingEvents?.length ?? 0}
          detail={`${totalEvents} total events`}
          subdetail="Awaiting marketplace review"
          icon={CalendarDays}
        />
        <MetricCard
          title="Pending Products"
          value={pendingProducts?.length ?? 0}
          detail={`${totalProducts} total products`}
          subdetail="Vendor catalog approvals"
          icon={Package}
        />
      </section>

          <aside className="grid grid-cols-4 gap-4 mt-8">
          <section className="col-span-2 rounded-lg border border-[#e4e1da] bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Settings className="h-[18px] w-[18px] text-[#5f636d]" />
                <div>
                  <p className="text-sm font-bold text-[#2f3137]">
                    Platform Settings
                  </p>
                  <p className="text-[13px] text-[#86827a]">
                    Operational controls.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#acefca] bg-[#effdf4] px-2.5 py-1 text-xs font-bold text-[#14804a]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Healthy
              </span>
            </div>
            <FeedbackSettings variant="embedded" />
          </section>
        </aside>

      <div className="">
        <div className="space-y-4">
          <section className="space-y-4">
            <ApprovalSection
              pendingEvents={pendingEvents}
              pendingProducts={pendingProducts}
              approveEvent={approveEvent}
              approveProduct={approveProduct}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  detail,
  subdetail,
  icon: Icon,
}: {
  title: string;
  value: number;
  detail: string;
  subdetail: string;
  icon: LucideIcon;
}) {
  return (
    <article className="rounded-lg border border-[#e4e1da] bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-[#75716a]">{title}</p>
        <span className="grid h-8 w-8 place-items-center rounded-full text-[#454545]">
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className="mt-4 text-[34px] font-bold leading-none tracking-normal text-[#111936]">
        {value}
      </p>
      <div className="mt-7">
        <p className="text-sm font-semibold text-[#111936]">{detail}</p>
        <p className="text-sm leading-relaxed text-[#86827a]">{subdetail}</p>
      </div>
    </article>
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
