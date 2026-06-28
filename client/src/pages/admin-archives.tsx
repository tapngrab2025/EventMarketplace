import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Event, Product, Stall } from "@shared/schema";
import {
  Archive,
  CalendarDays,
  Layers3,
  Loader2,
  Package,
  Search,
  Store,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface AdminArchivesProps {
  searchTerm?: string;
}

type ArchiveType = "event" | "stall" | "product";

type ArchivedRow = {
  id: string;
  type: ArchiveType;
  name: string;
  description: string;
  primaryDetail: string;
  secondaryDetail: string;
  reference: string;
  icon: LucideIcon;
};

const archiveFilters: Array<{ label: string; value: "all" | ArchiveType }> = [
  { label: "Type: All", value: "all" },
  { label: "Type: Events", value: "event" },
  { label: "Type: Stalls", value: "stall" },
  { label: "Type: Products", value: "product" },
];

export default function AdminArchives({ searchTerm = "" }: AdminArchivesProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ArchiveType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "archived">("all");

  const { data: archivedEvents, isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events/archived"],
  });

  const { data: archivedStalls, isLoading: loadingStalls } = useQuery<Stall[]>({
    queryKey: ["/api/stalls/archived"],
  });

  const { data: archivedProducts, isLoading: loadingProducts } = useQuery<
    Product[]
  >({
    queryKey: ["/api/products/archived"],
  });

  const rows = useMemo(
    () =>
      buildArchivedRows(
        archivedEvents ?? [],
        archivedStalls ?? [],
        archivedProducts ?? [],
      ),
    [archivedEvents, archivedProducts, archivedStalls],
  );

  const normalizedSearch = [searchTerm, search]
    .filter(Boolean)
    .join(" ")
    .trim()
    .toLowerCase();

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesFilter =
        typeFilter === "all" ? true : row.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || statusFilter === "archived";
      const matchesSearch = normalizedSearch
        ? [
            row.name,
            row.description,
            row.primaryDetail,
            row.secondaryDetail,
            row.reference,
            row.type,
          ].some((value) => value.toLowerCase().includes(normalizedSearch))
        : true;

      return matchesFilter && matchesStatus && matchesSearch;
    });
  }, [normalizedSearch, rows, statusFilter, typeFilter]);

  const isLoading = loadingEvents || loadingStalls || loadingProducts;
  const totalArchived = rows.length;
  const productCount = archivedProducts?.length ?? 0;
  const eventCount = archivedEvents?.length ?? 0;
  const stallCount = archivedStalls?.length ?? 0;

  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <ArchiveSummaryCard
          title="Archived Events"
          value={eventCount}
          detail={`${stallCount} archived stalls`}
          subdetail="Expired event history"
          icon={CalendarDays}
        />
        <ArchiveSummaryCard
          title="Archived Products"
          value={productCount}
          detail={`${totalArchived} total archived records`}
          subdetail="Catalog items no longer active"
          icon={Package}
        />
      </div>

      <section className="overflow-hidden rounded-lg border border-[#e4e1da] bg-white shadow-sm">
        <div className="px-5 pb-4 pt-5">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-[#6e6a63]">
            <Archive className="h-[15px] w-[15px]" />
            Archived Items
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-[#e4e1da] px-5 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#86827a]" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name"
              className="h-10 rounded-lg border-[#dedbd3] pl-10 text-sm shadow-none focus-visible:ring-[#111936]/20"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={typeFilter}
              onValueChange={(value) =>
                setTypeFilter(value as "all" | ArchiveType)
              }
            >
              <SelectTrigger className="h-10 min-w-[146px] rounded-lg border-[#dedbd3] text-sm font-medium text-[#29324a] shadow-none focus:ring-[#111936]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {archiveFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as "all" | "archived")
              }
            >
              <SelectTrigger className="h-10 min-w-[156px] rounded-lg border-[#dedbd3] text-sm font-medium text-[#29324a] shadow-none focus:ring-[#111936]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">Status: All</SelectItem>
                <SelectItem value="archived">Status: Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-[#e4e1da] hover:bg-transparent">
              <TableHead className="w-[84px] px-5">
                <Checkbox
                  className="h-4 w-4 rounded border-[#dedbd3] data-[state=checked]:bg-[#111936]"
                  aria-label="Select all archived items"
                />
              </TableHead>
              <TableHead className="h-[58px] min-w-[280px] text-[15px] font-semibold text-[#3a3a3a]">
                Item
              </TableHead>
              <TableHead className="h-[58px] text-[15px] font-semibold text-[#3a3a3a]">
                Type
              </TableHead>
              <TableHead className="h-[58px] min-w-[260px] text-[15px] font-semibold text-[#3a3a3a]">
                Details
              </TableHead>
              <TableHead className="h-[58px] min-w-[160px] text-[15px] font-semibold text-[#3a3a3a]">
                Reference
              </TableHead>
              <TableHead className="h-[58px] text-right text-[15px] font-semibold text-[#3a3a3a]">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-36 text-center">
                  <div className="flex items-center justify-center gap-3 text-sm font-semibold text-[#5f636d]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading archived items
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-36 text-center">
                  <div className="mx-auto max-w-sm">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#f3f4f6] text-[#111936]">
                      <Layers3 className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm font-bold text-[#2f3137]">
                      No archived items found
                    </p>
                    <p className="mt-1 text-sm text-[#86827a]">
                      Try another search term or archive type.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => {
                const Icon = row.icon;

                return (
                  <TableRow
                    key={row.id}
                    className="h-[82px] border-[#e4e1da] hover:bg-[#fafafa]"
                  >
                    <TableCell className="px-5">
                      <Checkbox
                        className="h-4 w-4 rounded border-[#dedbd3] data-[state=checked]:bg-[#111936]"
                        aria-label={`Select ${row.name}`}
                      />
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eceff3] text-[#111936]">
                          <Icon className="h-[18px] w-[18px]" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-semibold text-[#2f3137]">
                            {row.name}
                          </p>
                          <p className="mt-1 line-clamp-1 text-[13px] text-[#86827a]">
                            {row.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-7 rounded-full px-2.5 text-xs font-semibold capitalize",
                          getArchiveTypeClass(row.type),
                        )}
                      >
                        {row.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <p className="text-[15px] font-medium text-[#424957]">
                        {row.primaryDetail}
                      </p>
                      <p className="mt-1 text-[13px] text-[#86827a]">
                        {row.secondaryDetail}
                      </p>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-[15px] font-medium text-[#424957]">
                      {row.reference}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      <Badge
                        variant="outline"
                        className="h-7 rounded-full border-[#f4d8a9] bg-[#fff7e8] px-2.5 text-xs font-semibold text-[#a56414]"
                      >
                        Archived
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </section>
    </section>
  );
}

function ArchiveSummaryCard({
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
    <article className="rounded-lg border border-[#e4e1da] bg-white p-6 shadow-sm">
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

function buildArchivedRows(
  events: Event[],
  stalls: Stall[],
  products: Product[],
): ArchivedRow[] {
  return [
    ...events.map((event) => ({
      id: `event-${event.id}`,
      type: "event" as const,
      name: event.name,
      description: event.description,
      primaryDetail: event.location,
      secondaryDetail: `${formatDate(event.startDate)} to ${formatDate(
        event.endDate,
      )}`,
      reference: event.city ? event.city : `Vendor #${event.vendorId}`,
      icon: CalendarDays,
    })),
    ...stalls.map((stall) => ({
      id: `stall-${stall.id}`,
      type: "stall" as const,
      name: stall.name,
      description: stall.description,
      primaryDetail: stall.location,
      secondaryDetail: `Event #${stall.eventId}`,
      reference: `Vendor #${stall.vendorId}`,
      icon: Store,
    })),
    ...products.map((product) => ({
      id: `product-${product.id}`,
      type: "product" as const,
      name: product.name,
      description: product.description,
      primaryDetail: `${product.category} · $${(product.price / 100).toFixed(
        2,
      )}`,
      secondaryDetail: `${product.stock} in stock`,
      reference: `Stall #${product.stallId}`,
      icon: Package,
    })),
  ];
}

function getArchiveTypeClass(type: ArchiveType) {
  switch (type) {
    case "event":
      return "border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb]";
    case "stall":
      return "border-[#acefca] bg-[#effdf4] text-[#14804a]";
    case "product":
      return "border-[#e9d5ff] bg-[#faf5ff] text-[#7e22ce]";
  }
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}
