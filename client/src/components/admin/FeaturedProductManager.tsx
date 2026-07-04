import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Loader2, Save, Trash2, Check, Plus, Search } from "lucide-react";
import { ProductWithDetails } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_IMAGES } from "@/config/constants";

export default function FeaturedProductManager() {
  const { data: products, isLoading, error } = useQuery<ProductWithDetails[]>({
    queryKey: ["/api/products/feature/manager"],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [availableProducts, setAvailableProducts] = useState<ProductWithDetails[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (products) {
      setAvailableProducts(products.filter(p => !p.featured));
      setFeaturedProducts(products.filter(p => p.featured));
    }
  }, [products]);

  const filteredAvailableProducts = availableProducts.filter(product => {
    const query = searchQuery.toLowerCase();
    const matchesName = product.name.toLowerCase().includes(query);
    const matchesEvent = product.event?.name?.toLowerCase().includes(query) || false;
    const matchesStall = product.Stall?.name?.toLowerCase().includes(query) || false;
    return matchesName || matchesEvent || matchesStall;
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const featuredIds = featuredProducts.map(p => p.id);
      const res = await apiRequest("POST", "/api/products/feature/manager", { productIds: featuredIds });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products/feature/manager"] });
      toast({
        title: "Success",
        description: "Featured products updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update featured products",
        variant: "destructive",
      });
    }
  });

  const moveToFeatured = (product: ProductWithDetails) => {
    setAvailableProducts(prev => prev.filter(p => p.id !== product.id));
    setFeaturedProducts(prev => [...prev, product]);
  };

  const moveFromFeatured = (product: ProductWithDetails) => {
    setFeaturedProducts(prev => prev.filter(p => p.id !== product.id));
    setAvailableProducts(prev => [...prev, product]);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 text-center text-red-500">
        Error loading products
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Featured Product Manager</h1>
        <p className="text-gray-600">Select products to feature on your homepage</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Available Products */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Available Products</h2>
            <span className="text-gray-500">{filteredAvailableProducts.length} items</span>
          </div>

          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products, events, or stalls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
            {filteredAvailableProducts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                {searchQuery ? "No products match your search" : "All products are featured"}
              </p>
            ) : (
              filteredAvailableProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={() => moveToFeatured(product)}
                  isAvailable
                />
              ))
            )}
          </div>
        </div>

        {/* Featured Products */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Featured Products</h2>
            <span className="text-gray-500">{featuredProducts.length} items</span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {featuredProducts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No products selected yet</p>
            ) : (
              featuredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onRemove={() => moveFromFeatured(product)}
                  isAvailable={false}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function ProductCard({ product, onAdd, onRemove, isAvailable }: {
  product: ProductWithDetails;
  onAdd?: () => void;
  onRemove?: () => void;
  isAvailable: boolean;
}) {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition">
      <img
        src={product.imageUrl || DEFAULT_IMAGES.PRODUCT}
        alt={product.name}
        className="w-20 h-20 object-cover rounded"
      />
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-1">{product.event?.name || "Unknown Event"}</p>
        <p className="text-orange-500 font-semibold mt-1">${(product.price / 100).toFixed(2)}</p>
      </div>
      {isAvailable ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onAdd}
          className="text-green-600 hover:text-green-800 hover:bg-green-50"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 hover:bg-red-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
