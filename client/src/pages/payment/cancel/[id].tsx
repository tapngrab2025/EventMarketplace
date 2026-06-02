import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import {
  AlertCircle,
  CalendarDays,
  CreditCard,
  FileText,
  Loader2,
  ReceiptText,
  ShoppingBag,
  ShoppingCart,
  Store,
  UserRound,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

type StallInfo = {
  id: number | string;
  name: string;
};

type OrderItem = {
  id: number | string;
  quantity: number;
  price: number;
  product: {
    id: number | string;
    name: string;
    description?: string | null;
    stall: StallInfo;
  };
  coupon?: {
    id?: number | null;
    discountPercentage?: number | null;
  } | null;
};

type Order = {
  id: number;
  user_id: number;
  fullName?: string | null;
  address?: string | null;
  phone?: string | null;
  total?: number | null;
  status?: string | null;
  paymentMethod?: string | null;
  createdAt?: string | Date | null;
  items?: OrderItem[];
};

type StallGroup = {
  stall: StallInfo;
  items: OrderItem[];
  orderId?: string;
};

function formatCurrency(value?: number | null) {
  return `$${((value ?? 0) / 100).toFixed(2)}`;
}

function formatDate(value?: string | Date | null) {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatLabel(value?: string | null) {
  if (!value) return "--";

  return value
    .replace(/[_-]/g, " ")
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}

function getStatusClass(status?: string | null) {
  const normalized = status?.toLowerCase() ?? "";

  if (["cancelled"].includes(normalized)) {
    return "bg-red-100 text-red-700";
  }

  if (["completed", "delivered", "paid", "ready"].includes(normalized)) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (["pending", "processing"].includes(normalized)) {
    return "bg-yellow-100 text-yellow-700";
  }

  return "bg-zinc-100 text-zinc-700";
}

export default function CancelPage() {
  const [, params] = useRoute("/payment/cancel/:id");
  const orderId = params?.id;

  const {
    data: orderData,
    isLoading,
    isError,
  } = useQuery<Order[]>({
    queryKey: [`/api/orders/${orderId}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/orders/${orderId}`);
      return res.json();
    },
    enabled: !!orderId,
  });

  const order = orderData?.[0];

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white px-4 py-16">
        <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <ReceiptText className="mx-auto h-10 w-10 text-red-600" />
          <h1 className="mt-5 text-[24px] font-bold leading-tight text-slate-950">
            Order details unavailable
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-slate-500">
            We could not load this order information right now.
          </p>
          <Button
            asChild
            className="mt-6 h-11 w-full rounded-md bg-red-600 text-[14px] font-semibold hover:bg-red-700"
          >
            <Link href="/profile">View Orders</Link>
          </Button>
        </div>
      </main>
    );
  }

  const stallProducts = (order.items ?? []).reduce<Record<string, StallGroup>>(
    (acc, item) => {
      const stall = item.product?.stall;

      if (!stall?.id) return acc;

      const stallId = String(stall.id);

      if (!acc[stallId]) {
        acc[stallId] = {
          stall,
          items: [],
          orderId,
        };
      }

      acc[stallId].items.push(item);
      return acc;
    },
    {},
  );

  const stallGroups = Object.values(stallProducts);
  const orderDate = formatDate(order.createdAt);
  const totalAmount = formatCurrency(order.total);
  const statusLabel = formatLabel(order.status);
  const summaryCards = [
    {
      label: "Order ID",
      value: `#${orderId}`,
      icon: ShoppingBag,
    },
    {
      label: "Date",
      value: orderDate,
      icon: CalendarDays,
    },
    {
      label: "Total Amount",
      value: totalAmount,
      icon: CreditCard,
    },
  ];

  return (
    <main className="relative overflow-hidden bg-white mx-auto max-w-3xl">
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-500 text-white shadow-[0_14px_34px_rgba(239,68,68,0.35)]">
            <XCircle className="h-14 w-14 stroke-[3.2]" />
          </div>

          <h1 className="mt-6 text-xl font-extrabold leading-[1.15] tracking-tight text-slate-950 sm:text-2xl">
            Order Cancelled
          </h1>
          <p className="text-base leading-7 text-slate-500">
            Your payment has been cancelled. Order #{orderId} status has been updated.
          </p>
        </section>

        <section className="mx-auto mt-8 grid max-w-6xl gap-5 md:grid-cols-3">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="flex items-center gap-4 rounded-lg border border-zinc-100 bg-white px-7 py-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-[14px] font-bold leading-5 text-slate-950">
                    {card.label}
                  </p>
                  <p className="mt-1 truncate text-[18px] font-extrabold leading-6 text-red-700">
                    {card.value}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        <section className="mx-auto mt-8 max-w-6xl rounded-lg border border-zinc-100 bg-white p-5 shadow-[0_10px_32px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <UserRound className="h-5 w-5" />
                </div>
                <h2 className="text-[18px] font-extrabold leading-6 text-slate-950">
                  Customer Information
                </h2>
              </div>

              <dl className="mt-7 space-y-4 text-[14px] leading-5">
                <div className="grid grid-cols-[90px_minmax(0,1fr)] gap-3">
                  <dt className="font-bold text-slate-950">Name:</dt>
                  <dd className="truncate text-slate-700">
                    {order.fullName || "--"}
                  </dd>
                </div>
                <div className="grid grid-cols-[90px_minmax(0,1fr)] gap-3">
                  <dt className="font-bold text-slate-950">Phone:</dt>
                  <dd className="truncate text-slate-700">
                    {order.phone || "--"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="min-w-0 border-t border-zinc-200 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <FileText className="h-5 w-5" />
                </div>
                <h2 className="text-[18px] font-extrabold leading-6 text-slate-950">
                  Order Information
                </h2>
              </div>

              <dl className="mt-7 space-y-4 text-[14px] leading-5">
                <div className="grid grid-cols-[132px_minmax(0,1fr)] gap-3">
                  <dt className="font-bold text-slate-950">Order ID:</dt>
                  <dd className="text-slate-700">#{orderId}</dd>
                </div>
                <div className="grid grid-cols-[132px_minmax(0,1fr)] gap-3">
                  <dt className="font-bold text-slate-950">Date:</dt>
                  <dd className="text-slate-700">{orderDate}</dd>
                </div>
                <div className="grid grid-cols-[132px_minmax(0,1fr)] gap-3">
                  <dt className="font-bold text-slate-950">Status:</dt>
                  <dd>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[12px] font-bold leading-4 ${getStatusClass(
                        order.status,
                      )}`}
                    >
                      {statusLabel}
                    </span>
                  </dd>
                </div>
                <div className="grid grid-cols-[132px_minmax(0,1fr)] gap-3">
                  <dt className="font-bold text-slate-950">Payment Method:</dt>
                  <dd className="text-slate-700">
                    {formatLabel(order.paymentMethod)}
                  </dd>
                </div>
                <div className="grid grid-cols-[132px_minmax(0,1fr)] gap-3 pt-1">
                  <dt className="font-extrabold text-slate-950">
                    Total Amount:
                  </dt>
                  <dd className="text-[20px] font-extrabold leading-6 text-red-700">
                    {totalAmount}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-9 border-t border-zinc-200 pt-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <h2 className="text-[18px] font-extrabold leading-6 text-slate-950">
                Order Items
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              {stallGroups.map((stallGroup) => (
                <div
                  key={stallGroup.stall.id}
                  className="rounded-lg border border-zinc-200 bg-white p-5"
                >
                  <div className="grid gap-5 md:grid-cols-[64px_minmax(0,1fr)_120px]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 md:mt-5">
                      <Store className="h-7 w-7" />
                    </div>

                    <div className="min-w-0 space-y-4">
                      {stallGroup.items.map((item) => (
                        <div key={item.id} className="min-w-0">
                          <p className="text-[14px] leading-5 text-slate-500">
                            Stall:{" "}
                            <span className="font-extrabold text-red-700">
                              {stallGroup.stall.name}
                            </span>
                          </p>
                          <p className="mt-2 text-[16px] font-medium leading-6 text-slate-950">
                            {item.product.name}
                          </p>
                          <p className="mt-2 text-[14px] leading-5 text-slate-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="text-left md:pt-5 md:text-right">
                      <p className="text-[15px] font-extrabold leading-5 text-slate-950">
                        {formatCurrency(
                          stallGroup.items.reduce(
                            (total, item) => total + item.price * item.quantity,
                            0,
                          ),
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {stallGroups.length === 0 && (
                <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
                  <p className="text-[15px] font-semibold text-slate-600">
                    No items in this order.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 border-t border-zinc-200 pt-5">
            <div className="flex items-center justify-between gap-4 text-[15px] font-bold leading-5 text-slate-950">
              <span>Total Amount</span>
              <span>{totalAmount}</span>
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between gap-6 overflow-hidden rounded-lg border border-red-100 bg-red-50 px-5 py-5">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-sm">
                <AlertCircle className="h-7 w-7" />
              </div>
              <p className="text-[13px] leading-6 text-slate-700">
                Your payment was cancelled. Items have been
                <br className="hidden sm:block" />
                restored to inventory and are available for purchase.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row">
          <Button
            asChild
            variant="outline"
            className="h-12 w-full rounded-md border-red-500 px-8 text-[14px] font-extrabold text-red-700 hover:bg-red-50 sm:w-auto"
          >
            <Link href="/">
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>

          <Button
            asChild
            className="h-12 w-full rounded-md bg-red-700 px-10 text-[14px] font-extrabold text-white shadow-[0_10px_22px_rgba(185,28,28,0.22)] hover:bg-red-800 sm:w-auto"
          >
            <Link href="/profile">
              <FileText className="h-4 w-4" />
              View Orders
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
