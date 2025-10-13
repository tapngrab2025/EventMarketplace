import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, Event } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ApprovalSection } from "@/components/dashboard/approval-section";
import { FeedbackSettings } from "@/components/dashboard/feedback-settings";

interface VendorDashboardProps {
  searchTerm?: string;
}

export default function AdminDashboard({ searchTerm = "" }: VendorDashboardProps) {
  const { toast } = useToast();

  const { data: events, isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

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
      toast({
        title: "Success",
        description: "Product approved successfully",
      });
    },
  });

  if (loadingEvents || loadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage events, and products
          </p>
        </header>

        <div className="grid gap-8">
          <ApprovalSection
            pendingEvents={pendingEvents}
            pendingProducts={pendingProducts}
            approveEvent={approveEvent}
            approveProduct={approveProduct}
          />
          <FeedbackSettings />
        </div>
      </div>
    </div>
  );
}
