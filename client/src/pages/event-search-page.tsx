import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarRange, Search, MapPin, SlidersHorizontal } from 'lucide-react';
import { format } from "date-fns";
import { Calendar } from '@/components/ui/calendar';
import EventCard from '@/components/events/event-card';
import { Event } from '@shared/schema';

const getPaginatedEvents = async ({
  page,
  pageSize,
  searchTerm,
  startDate,
  endDate,
  sortBy
}: {
  page: number;
  pageSize: number;
  searchTerm?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy: string;
}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    ...(searchTerm && { searchTerm }),
    ...(startDate && { startDate: startDate instanceof Date ? startDate.toISOString() : startDate }),
    ...(endDate && { endDate: endDate instanceof Date ? endDate.toISOString() : endDate }),
    ...(sortBy && { sortBy })
  });

  return await apiRequest('GET', `/api/events/paginate?${params}`);
};

const EventSearchPage = () => {
  const params = new URLSearchParams(window.location.search);
  
  const [searchTerm, setSearchTerm] = useState(params.get('searchTerm') || '');
  const [startDate, setStartDate] = useState<Date | undefined>(
    params.get('startDate') ? new Date(params.get('startDate')!) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    params.get('endDate') ? new Date(params.get('endDate')!) : undefined
  );
  const [sortBy, setSortBy] = useState(params.get('sortBy') || 'newest');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { data, isLoading, error } = useQuery({
    queryKey: ['events', page, searchTerm, startDate, endDate, sortBy],
    queryFn: async () => {
      const response = await getPaginatedEvents({
        page,
        pageSize,
        searchTerm,
        startDate,
        endDate,
        sortBy
      });
      return response.json();
    }
  });

  const handleSearch = useMutation({
    mutationFn: async () => {
      setPage(1);
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });

  const handleClear = () => {
    setSearchTerm('');
    setStartDate(undefined);
    setEndDate(undefined);
    setSortBy('newest');
    setPage(1);
    setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
    }, 0);
  };

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="mx-auto max-w-2xl text-center mb-12">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-500">
          Search Events
        </div>
        <h2 className="mt-4 font-serif text-4xl tracking-tight text-zinc-900 sm:text-5xl">
          Find your next experience
        </h2>
      </div>

      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-4 mb-12 bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
        <div className="flex-[1.5] relative">
          <label className="flex h-12 min-w-0 items-center gap-3 rounded border border-zinc-200 bg-white px-4 transition focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-100">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <Input
            placeholder="Search by location, name or city"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 bg-white border-none outline-none focus:outline-none"
          />
          </label>
        </div>

        <div className="flex-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full h-12 justify-start text-left font-normal border-zinc-200 bg-white hover:bg-zinc-50">
                <CalendarRange className="mr-2 h-5 w-5 text-zinc-400" />
                {startDate && endDate ? (
                  <span className="truncate">{format(startDate, "PP")} - {format(endDate, "PP")}</span>
                ) : (
                  <span className="text-zinc-400">Select Date Range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: startDate, to: endDate }}
                onSelect={(range) => {
                  setStartDate(range?.from);
                  setEndDate(range?.to);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

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

        <div className="flex gap-2">
          <Button
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded bg-orange-500 px-8 text-base text-white shadow-[0_18px_35px_rgba(249,115,22,0.35)] transition hover:bg-orange-400 lg:w-auto"
            onClick={() => handleSearch.mutate()}
          >
            <Search className="h-5 w-5 mr-2" />
            Search
          </Button>
          <Button
            variant="ghost"
            className="rounded-xl px-4 text-zinc-500 hover:text-zinc-900"
            onClick={handleClear}
          >
            Clear
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-[400px] rounded-2xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-500 font-medium">Error loading events. Please try again.</p>
        </div>
      ) : data?.events.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-lg">No events found matching your criteria.</p>
          <Button variant="link" onClick={handleClear} className="text-orange-500 mt-2">
            Clear all filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.events.map((event: Event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-16">
              <Button
                variant="outline"
                className="rounded-xl border-zinc-200"
                onClick={() => {
                  setPage(p => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm font-medium text-zinc-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                className="rounded-xl border-zinc-200"
                onClick={() => {
                  setPage(p => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventSearchPage;
