import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarRange } from 'lucide-react';
import { format } from "date-fns";
import { Calendar } from '@/components/ui/calendar';
import ProductCard from '@/components/products/product-card';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}


// Add this function outside the component:
const getProducts = async ({
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
    // ...(category && { category }),
    // ...(minPrice && { minPrice }),
    // ...(maxPrice && { maxPrice }),
    ...(startDate && { startDate: startDate instanceof Date ? startDate.toISOString() : startDate }),
    ...(endDate && { endDate: endDate instanceof Date ? endDate.toISOString() : endDate }),
    ...(sortBy === 'newest' ? { sortBy: 'id', sortOrder: 'desc' } : { sortBy: 'id', sortOrder: 'asc' })
  });

  return await apiRequest('GET', `/api/products/paginate?${params}`);
};


const SearchPage = () => {
  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  
  const [searchTerm, setSearchTerm] = useState(params.get('location') || '');
  const [startDate, setStartDate] = useState<Date | undefined>(
    params.get('startDate') ? new Date(params.get('startDate')!) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    params.get('endDate') ? new Date(params.get('endDate')!) : undefined
  );
  const [sortBy, setSortBy] = useState(params.get('sortBy') || 'newest');
  
  // Trigger initial search if we have URL parameters
  useEffect(() => {
    if (params.toString()) {
      handleSearch.mutate();
    }
  }, []);
  
  // const [category, setCategory] = useState('all');
  // const [minPrice, setMinPrice] = useState<string>('');
  // const [maxPrice, setMaxPrice] = useState<string>('');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { data, isLoading, error } = useQuery({
    // queryKey: ['products', page, searchTerm, category, minPrice, maxPrice, sortBy],
    queryKey: ['products'],
    queryFn: async () => {
      const response = await getProducts({
        page: 1,
        pageSize,
        searchTerm,
        startDate,
        endDate,
        sortBy
      });
      return response.json();
    }
  });

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  const handleSearch = useMutation({
    mutationFn: async () => {
      setPage(1); // Reset to first page when searching
      const response = await getProducts({
        page: 1,
        pageSize,
        searchTerm,
        startDate,
        endDate,
        sortBy
      });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Match the query key from useQuery
    },
    onError: (error) => {
      console.error('Search failed:', error);
    }
  });

  const handleClear = useMutation({
    mutationFn: async () => {
      setPage(1);
      setSearchTerm('');
      // setCategory('all');
      // setMinPrice('');
      // setMaxPrice('');
      setStartDate(undefined);
      setEndDate(undefined);
      setSortBy('newest');
      const response = await getProducts({
        page: 1,
        pageSize,
        searchTerm,
        startDate,
        endDate,
        sortBy
      });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Match the query key from useQuery
    },
    onError: (error) => {
      console.error('Search failed:', error);
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 mb-12">
        <div className="flex-1">
          <Input
            placeholder="Search products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-[15px] bg-white border-[#A3A3A3]"
          />
        </div>

        {/* <div className="flex-1">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-white rounded-[15px] border-[#A3A3A3]">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="souvenir">Souvenir</SelectItem>
              <SelectItem value="giveaway">Giveaway</SelectItem>
              <SelectItem value="promotional">Promotional</SelectItem>
            </SelectContent>
          </Select>
        </div> */}

        {/* <div className="flex-1 flex gap-2">
          <Input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full rounded-[15px] bg-white border-[#A3A3A3]"
          />
          <Input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded-[15px] bg-white border-[#A3A3A3]"
          />
        </div> */}
        <div className="flex flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full bg-white rounded-[15px] border-[#A3A3A3]">
                  <CalendarRange className="mr-2 h-4 w-4 text-gray-400" />
                  {startDate && endDate ? (
                    `${format(startDate, "PP")} - ${format(endDate, "PP")}`
                  ) : (
                    "Select Date Range"
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
        <div className="flex-1">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-white rounded-[15px] border-[#A3A3A3]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            className="bg-teal-500 text-white hover:bg-teal-600 rounded-[50px] px-8"
            onClick={() => handleSearch.mutate()}
          >
            Search
          </Button>
          <Button
            variant="outline"
            className="rounded-[50px] px-8"
            onClick={() => handleClear.mutate()}
          >
            Clear
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">Error loading products</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {/* {data?.products.map((product: Product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-teal-600 font-bold">${(product.price / 100).toFixed(2)}</span>
                    <span className="text-gray-500 text-sm">{product.category}</span>
                  </div>
                </div>
              </div>
            ))} */}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="py-2 px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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

export default SearchPage;