import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Link, useLocation } from "wouter";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  Home,
  Loader2,
  LogOut,
  MapPin,
  PackageCheck,
  Pencil,
  Save,
  ShieldCheck,
  ShoppingBag,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { Profile, User as SelectUser } from "@shared/schema";

type AccountTab = "dashboard" | "orders" | "profile" | "address";

type UserOrder = {
  id: number;
  user_id?: number;
  fullName?: string | null;
  phone?: string | null;
  total?: number | null;
  status?: string | null;
  paymentMethod?: string | null;
  createdAt?: string | Date | null;
  event?: {
    id?: number | null;
    name?: string | null;
    description?: string | null;
  } | null;
};

type DashboardOrder = UserOrder & {
  eventNames: string[];
};

type ProfileFormData = {
  username: string;
  email: string;
  bio: string;
  dob: string;
  gender: string;
  imageUrl: string;
  address: string;
  contact: string;
  city: string;
  country: string;
  postalCode: string;
  phoneNumber: string;
  socialMedia: Record<string, unknown>;
  occupation: string;
};

const emptyText = "Not added";

function buildProfileFormData(
  user: SelectUser | null,
  profile: Profile | null,
): ProfileFormData {
  return {
    username: user?.username ?? "",
    email: user?.email ?? "",
    bio: profile?.bio ?? "",
    dob: profile?.dob ?? "",
    gender: profile?.gender ?? "not_to_disclose",
    imageUrl: profile?.imageUrl ?? "",
    address: profile?.address ?? "",
    contact: "",
    city: profile?.city ?? "",
    country: profile?.country ?? "",
    postalCode: profile?.postalCode ?? "",
    phoneNumber: profile?.phoneNumber ?? "",
    socialMedia: (profile?.socialMedia as Record<string, unknown>) ?? {},
    occupation: profile?.occupation ?? "",
  };
}

function getDisplayName(user: SelectUser | null, profile: Profile | null) {
  const profileName = [
    profile?.firstName,
    profile?.middleName,
    profile?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return profileName || user?.username || "Customer";
}

function formatDate(value?: string | Date | null) {
  if (!value) return "Date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value?: number | null) {
  const amount = (value ?? 0) / 100;

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatLabel(value?: string | null) {
  if (!value) return emptyText;

  return value
    .replace(/[_-]/g, " ")
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}

function isCompletedStatus(status?: string | null) {
  return ["completed", "delivered", "paid", "ready"].includes(
    status?.toLowerCase() ?? "",
  );
}

function isPendingStatus(status?: string | null) {
  return ["pending", "processing"].includes(status?.toLowerCase() ?? "");
}

function getStatusClass(status?: string | null) {
  const normalized = status?.toLowerCase();

  if (isCompletedStatus(normalized)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (isPendingStatus(normalized)) {
    // return "border-blue-200 bg-blue-50 text-blue-700";
    return "bg-yellow-100 text-yellow-700";
  }

  if (normalized === "failed" || normalized === "cancelled") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-zinc-200 bg-zinc-50 text-zinc-600";
}

function getStatusDotClass(status?: string | null) {
  const normalized = status?.toLowerCase();

  if (isCompletedStatus(normalized)) return "bg-emerald-500";
  if (isPendingStatus(normalized)) return "bg-blue-600";
  if (normalized === "failed" || normalized === "cancelled")
    return "bg-red-500";

  return "bg-zinc-400";
}

function ProfileValue({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded border border-zinc-100 bg-zinc-50/70 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-zinc-900">
        {value || emptyText}
      </p>
    </div>
  );
}

function AddressColumn({
  title,
  name,
  address,
  city,
  country,
  postalCode,
  onEdit,
}: {
  title: string;
  name: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  postalCode?: string | null;
  onEdit: () => void;
}) {
  const locationLine = [country, postalCode].filter(Boolean).join(" ");

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
        {title}
      </h2>
      <div className="mt-7 border-t border-zinc-300 pt-10">
        <div className="space-y-4 text-lg font-medium leading-8 text-zinc-950">
          <p>{name}</p>
          <p>{address || emptyText}</p>
          <p>{city || emptyText}</p>
          <p>{locationLine || emptyText}</p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="mt-4 text-lg font-medium text-blue-600 transition hover:text-blue-700"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

function OrdersTable({
  orders,
  isLoading,
}: {
  orders: DashboardOrder[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded border border-zinc-200 bg-white shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded border border-zinc-200 bg-white px-5 py-14 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-600">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-zinc-950">
          No orders yet
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
          Your grabs will show up here once you make a purchase.
        </p>
        <Button
          asChild
          className="mt-5 rounded bg-teal-600 font-semibold hover:bg-teal-700"
        >
          <Link href="/events">Browse Events</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded border border-zinc-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50 hover:bg-zinc-50">
            <TableHead className="min-w-[150px] font-semibold text-zinc-600">
              Order
            </TableHead>
            <TableHead className="min-w-[220px] font-semibold text-zinc-600">
              Event
            </TableHead>
            <TableHead className="min-w-[135px] font-semibold text-zinc-600">
              Date
            </TableHead>
            <TableHead className="min-w-[130px] font-semibold text-zinc-600">
              Status
            </TableHead>
            <TableHead className="min-w-[135px] font-semibold text-zinc-600">
              Payment
            </TableHead>
            <TableHead className="min-w-[130px] text-right font-semibold text-zinc-600">
              Total
            </TableHead>
            <TableHead className="w-16 text-right font-semibold text-zinc-600">
              View
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const eventTitle =
              order.eventNames.length > 0
                ? order.eventNames.join(", ")
                : "Event details unavailable";
            const eventDescription = order.event?.description;

            return (
              <TableRow key={order.id} className="hover:bg-teal-50/30">
                <TableCell>
                  <div className="font-semibold text-zinc-950">
                    Order #{order.id}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-sm truncate font-semibold text-zinc-800">
                    {eventTitle}
                  </div>
                  {eventDescription && (
                    <div className="mt-1 max-w-sm truncate text-xs text-zinc-500">
                      {eventDescription}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm text-zinc-600">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(order.createdAt)}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={[
                      "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold",
                      getStatusClass(order.status),
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "h-1.5 w-1.5 rounded-full",
                        getStatusDotClass(order.status),
                      ].join(" ")}
                    />
                    {formatLabel(order.status)}
                  </span>
                </TableCell>
                <TableCell className="text-sm font-medium text-zinc-600">
                  {formatLabel(order.paymentMethod)}
                </TableCell>
                <TableCell className="text-right font-bold text-zinc-950">
                  {formatCurrency(order.total)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded text-zinc-500 hover:bg-teal-50 hover:text-teal-700"
                  >
                    <Link
                      href={order.status === "cancelled" ? `/payment/cancel/${order.id}` : `/payment/thank-you/${order.id}`}
                      aria-label={`View order ${order.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default function ProfilePage() {
  const { user, profile, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<AccountTab>("dashboard");
  const [isEditing, setIsEditing] = useState(false);
  const [isAddressEditing, setIsAddressEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>(() =>
    buildProfileFormData(user, profile),
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isEditing || isAddressEditing) return;

    setFormData(buildProfileFormData(user, profile));
  }, [isAddressEditing, isEditing, profile, user]);

  const { data: orders = [], isLoading: ordersLoading } = useQuery<UserOrder[]>(
    {
      queryKey: ["/api/user/orders"],
      queryFn: async () => {
        const res = await apiRequest("GET", "/api/user/orders");
        return res.json();
      },
      enabled: !!user,
    },
  );

  const dashboardOrders = useMemo<DashboardOrder[]>(() => {
    const groupedOrders = new Map<number, DashboardOrder>();

    orders.forEach((order) => {
      const eventName = order.event?.name?.trim();
      const existingOrder = groupedOrders.get(order.id);

      if (existingOrder) {
        if (eventName && !existingOrder.eventNames.includes(eventName)) {
          existingOrder.eventNames.push(eventName);
        }

        return;
      }

      groupedOrders.set(order.id, {
        ...order,
        eventNames: eventName ? [eventName] : [],
      });
    });

    return Array.from(groupedOrders.values());
  }, [orders]);

  const totalOrders = dashboardOrders.length;
  const pendingOrders = dashboardOrders.filter((order) =>
    isPendingStatus(order.status),
  ).length;
  const completedOrders = dashboardOrders.filter((order) =>
    isCompletedStatus(order.status),
  ).length;
  const totalSpent = dashboardOrders.reduce(
    (sum, order) => sum + (order.total ?? 0),
    0,
  );
  const profileName = getDisplayName(user, profile);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
      setIsAddressEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    const requiredFields: Partial<Record<keyof ProfileFormData, string>> = {
      username: "Username",
      email: "Email",
      gender: "Gender",
      phoneNumber: "Phone Number",
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !formData[key as keyof ProfileFormData])
      .map(([, label]) => label);

    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in the following required fields: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate(formData);
  };

  const logout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => setLocation("/auth"),
    });
  };

  const selectTab = (tab: AccountTab) => {
    setActiveTab(tab);
    setIsEditing(false);
    setIsAddressEditing(false);
  };

  const editAddress = () => {
    setActiveTab("address");
    setIsEditing(false);
    setIsAddressEditing(true);
  };

  const cancelAddressEdit = () => {
    setIsAddressEditing(false);
    setFormData(buildProfileFormData(user, profile));
  };

  const cancelProfileEdit = () => {
    setIsEditing(false);
    setFormData(buildProfileFormData(user, profile));
  };

  const sidebarItems: Array<{
    id: AccountTab;
    label: string;
    icon: LucideIcon;
  }> = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "orders", label: "My Orders", icon: ShoppingBag },
    { id: "profile", label: "My Profile", icon: User },
    { id: "address", label: "Address", icon: MapPin },
  ];

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders,
      caption: "All time orders",
      icon: ShoppingBag,
      className: "bg-teal-50 text-teal-600",
    },
    {
      label: "Pending",
      value: pendingOrders,
      caption: "Orders awaiting action",
      icon: Clock3,
      className: "bg-blue-50 text-blue-700",
    },
    {
      label: "Completed",
      value: completedOrders,
      caption: "Orders delivered",
      icon: PackageCheck,
      className: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Total Spent",
      value: formatCurrency(totalSpent),
      caption: "Across all grabs",
      icon: CreditCard,
      className: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <main className="bg-zinc-50">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
          <div className="flex h-full flex-col rounded border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
                My Account
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded bg-teal-50 text-teal-600">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-950">
                    {profileName}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            <nav
              role="tablist"
              aria-label="Account sections"
              className="flex-1 space-y-1 p-3 text-sm font-medium text-zinc-600"
            >
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => selectTab(item.id)}
                    className={[
                      "flex w-full items-center gap-3 rounded px-3 py-3 text-left transition",
                      isActive
                        ? "bg-teal-50 text-teal-700"
                        : "hover:bg-zinc-50 hover:text-zinc-950",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-3 rounded px-3 py-3 text-left transition hover:bg-zinc-50 hover:text-zinc-950"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </aside>

        <section className="min-w-0" role="tabpanel">
          {activeTab === "dashboard" && (
            <div className="space-y-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
                    My Orders Welcome back, {profileName}
                  </h1>
                  <p className="mt-2 text-sm text-zinc-500">
                    Here's what's happening with your account today.
                  </p>
                </div>
                <Button
                  asChild
                  className="w-full rounded bg-teal-600 font-semibold hover:bg-teal-700 sm:w-auto"
                >
                  <Link href="/products">Grab On</Link>
                </Button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded border border-zinc-200 bg-white p-6 text-center shadow-sm"
                    >
                      <div
                        className={[
                          "mx-auto flex h-16 w-16 items-center justify-center rounded-full",
                          item.className,
                        ].join(" ")}
                      >
                        <Icon className="h-7 w-7" />
                      </div>
                      <p className="mt-5 text-sm font-medium text-zinc-500">
                        {item.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-zinc-950">
                        {item.value}
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">
                        {item.caption}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-emerald-50 text-emerald-600">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-950">
                        Account Status
                      </h3>
                      <p className="text-sm text-zinc-500">
                        {formatLabel(user?.status)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-teal-50 text-teal-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-950">Role</h3>
                      <p className="text-sm text-zinc-500">
                        {formatLabel(user?.role)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
                    My Orders
                  </h1>
                  <p className="mt-2 text-sm text-zinc-500">
                    {totalOrders} {totalOrders === 1 ? "order" : "orders"} in
                    your account
                  </p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded sm:w-auto"
                >
                  <Link href="/products">Browse Grabs</Link>
                </Button>
              </div>

              <OrdersTable orders={dashboardOrders} isLoading={ordersLoading} />
            </div>
          )}

          {activeTab === "profile" && (
            <div className="rounded border border-zinc-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-zinc-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
                    My Profile
                  </h1>
                  <p className="mt-1 text-sm text-zinc-500">
                    Manage the personal details connected to your account.
                  </p>
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSubmit}
                        disabled={updateProfileMutation.isPending}
                        className="rounded bg-teal-600 font-semibold hover:bg-teal-700"
                      >
                        {updateProfileMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save
                      </Button>
                      <Button
                        onClick={cancelProfileEdit}
                        variant="outline"
                        className="rounded"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="rounded"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-5">
                {isEditing ? (
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <Label htmlFor="username">
                        Username <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        readOnly
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        name="dob"
                        type="date"
                        value={formData.dob}
                        onChange={handleChange}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">
                        Gender <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="gender"
                        name="gender"
                        className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={formData.gender}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            gender: event.target.value,
                          })
                        }
                        required
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="not_to_disclose">
                          Prefer not to say
                        </option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        className="mt-2"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleChange}
                        className="mt-2"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <ProfileValue label="Username" value={user?.username} />
                    <ProfileValue label="Email" value={user?.email} />
                    <ProfileValue label="Phone" value={profile?.phoneNumber} />
                    <ProfileValue
                      label="Gender"
                      value={formatLabel(profile?.gender)}
                    />
                    <ProfileValue label="Date of Birth" value={profile?.dob} />
                    <ProfileValue
                      label="Occupation"
                      value={profile?.occupation}
                    />
                    <div className="rounded border border-zinc-100 bg-zinc-50/70 p-4 md:col-span-2 xl:col-span-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Bio
                      </p>
                      <p className="mt-1 text-sm font-medium leading-6 text-zinc-800">
                        {profile?.bio || emptyText}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "address" && (
            <div className="rounded border border-zinc-200 bg-white p-8 shadow-sm sm:p-10">
              {isAddressEditing ? (
                <div>
                  <div className="flex flex-col gap-3 border-b border-zinc-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
                        Address
                      </h1>
                      <p className="mt-1 text-sm text-zinc-500">
                        Update the address used for billing and shipping.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSubmit}
                        disabled={updateProfileMutation.isPending}
                        className="rounded bg-teal-600 font-semibold hover:bg-teal-700"
                      >
                        {updateProfileMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save
                      </Button>
                      <Button
                        onClick={cancelAddressEdit}
                        variant="outline"
                        className="rounded"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>

                  <div className="mt-7 grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-14 lg:grid-cols-2">
                  <AddressColumn
                    title="Billing Address"
                    name={profileName}
                    address={profile?.address}
                    city={profile?.city}
                    country={profile?.country}
                    postalCode={profile?.postalCode}
                    onEdit={editAddress}
                  />
                  <AddressColumn
                    title="Shipping Address"
                    name={profileName}
                    address={profile?.address}
                    city={profile?.city}
                    country={profile?.country}
                    postalCode={profile?.postalCode}
                    onEdit={editAddress}
                  />
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
