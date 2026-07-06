import { CalendarDays, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import MarqueeSlider from "./SliderTicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@radix-ui/react-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const quickFilters = ["Live Music", "Workshops", "Nightlife", "Family Events"];

export default function SearchSection() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [sortBy, setSortBy] = useState("newest");

  const search = (term = searchTerm) => {
    const searchParams = new URLSearchParams();
    const trimmedTerm = term.trim();

    if (trimmedTerm) searchParams.set("searchTerm", trimmedTerm);
    if (startDate) searchParams.set("startDate", startDate.toISOString());
    if (endDate) searchParams.set("endDate", endDate.toISOString());
    if (sortBy) searchParams.set("sortBy", sortBy);

    const query = searchParams.toString();
    // setLocation(query ? `/search?${query}` : "/search");
    setLocation(query ? `/event-search?${query}` : "/event-search");
  };

  return (
    <section className="max-w-full overflow-hidden bg-white">
      <div className="relative mx-auto w-full max-w-full overflow-hidden border border-t-0 border-zinc-200 pb-8 pt-12 overflow-x-hidden">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
            Let's Find Your Grab
          </div>

          <h2 className="mt-4 font-serif text-4xl tracking-tight text-zinc-900 sm:text-5xl">
            Discover your favorite entertainment right here
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-5xl px-6">
          <div className="grid min-w-0 gap-4 lg:grid-cols-[1.2fr_1fr_0.9fr_auto]">
            <label className="flex h-12 min-w-0 items-center gap-3 rounded border border-zinc-200 bg-white px-4 transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
              <MapPin className="h-5 w-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by location, name or city"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") search();
                }}
                className="min-w-0 w-full bg-transparent text-base text-zinc-900 outline-none placeholder:text-zinc-400"
              />
            </label>

            <div className="flex min-w-0">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex h-12 w-full min-w-0 items-center justify-start gap-3 rounded border border-zinc-200 bg-white px-4 font-normal text-zinc-900 transition hover:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  >
                    <CalendarDays className="h-5 w-5 text-zinc-400" />
                    {startDate && endDate ? (
                      <span className="truncate">{format(startDate, "PP")} - {format(endDate, "PP")}</span>
                    ) : (
                      <span className="text-zinc-400 truncate">Select Date Range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{
                      from: startDate,
                      to: endDate,
                    }}
                    onSelect={(range) => {
                      setStartDate(range?.from);
                      setEndDate(range?.to);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* <label className="flex h-12 min-w-0 items-center gap-3 rounded border border-zinc-200 bg-white px-4 transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
             <SlidersHorizontal className="h-5 w-5 text-zinc-400" />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="min-w-0 w-full bg-transparent text-base text-zinc-900 outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Popular Now</option>
                <option value="price-low">Price: Low to High</option>
                <option value="week">Happening This Week</option>
                </select> 
                </label> */}
            <div className="flex-1">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full h-12 border-zinc-200 bg-white">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5 text-zinc-400" />
                    <SelectValue placeholder="Sort By" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="popular">Popular Now</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <button
              type="button"
              onClick={() => search()}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded bg-blue-600 px-8 text-base text-white shadow-[0_18px_35px_rgba(37,99,235,0.35)] transition hover:bg-blue-700 lg:w-auto"
            >
              <Search className="h-5 w-5" />
              Search
            </button>
          </div>

          {/* <div className="mt-8 flex flex-col flex-wrap items-center justify-center gap-3 lg:flex-row">
            <span className="text-sm font-medium text-zinc-500">
              Popular searches
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {quickFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => {
                    setSearchTerm(filter);
                    search(filter);
                  }}
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 lg:text-sm"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div> */}
        </div>

        <div className="overflow-hidden">
          <MarqueeSlider />
        </div>
      </div>
    </section>
  );
}
