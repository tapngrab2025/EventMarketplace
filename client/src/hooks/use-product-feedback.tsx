import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useProductFeedback(productId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: feedbackEnabled, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["/api/settings/feedback"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/settings/feedback");
        if (!res.ok) {
          throw new Error("Failed to fetch feedback settings");
        }
        const data = await res.json();
        return data.enabled;
      } catch (error) {
        console.error("Error fetching feedback settings:", error);
        return false; // Default to disabled if settings cannot be fetched
      }
    },
  });

  const { data: productFeedback, isLoading: isLoadingFeedback } = useQuery({
    queryKey: ["/api/products", productId, "feedback"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/products/${productId}/feedback`);
        if (!res.ok) {
          throw new Error("Failed to fetch product feedback");
        }
        return res.json();
      } catch (error) {
        console.error("Error fetching product feedback:", error);
        return []; // Return empty array if feedback cannot be fetched
      }
    },
    enabled: feedbackEnabled,
  });

  const { data: userFeedback, isLoading: isLoadingUserFeedback } = useQuery({
    queryKey: ["/api/products", productId, "user-feedback"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/products/${productId}/user-feedback`);
        if (!res.ok) {
          throw new Error("Failed to fetch user feedback");
        }
        return res.json();
      } catch (error) {
        console.error("Error fetching user feedback:", error);
        return null; // Return null if user feedback cannot be fetched
      }
    },
    enabled: feedbackEnabled,
  });

  const { data: canProvideFeedback, isLoading: isLoadingCanFeedback } = useQuery({
    queryKey: ["/api/products", productId, "can-feedback"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/products/${productId}/can-feedback`);
        if (!res.ok) {
          throw new Error("Failed to check feedback eligibility");
        }
        const data = await res.json();
        return data.canProvideFeedback;
      } catch (error) {
        console.error("Error checking feedback eligibility:", error);
        return false; // Default to false if eligibility cannot be checked
      }
    },
    enabled: feedbackEnabled,
  });

  // Get user's completed order for this product
  const { data: orderInfo } = useQuery<{ orderId: number }>({    
    queryKey: [`/api/products/${productId}/order`],
    enabled: !!canProvideFeedback
  });

  const submitFeedback = useMutation<void, Error, { rating: number; comment: string; imageUrl?: string }>({
    mutationFn: async (data) => {
      console.log(orderInfo);
      if (!orderInfo?.orderId) {
        throw new Error("No order found for this product");
      }
      const res = await apiRequest(
        "POST",
        `/api/product/${productId}/feedback`,
        {
          ...data,
          orderId: orderInfo.orderId
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to submit feedback");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId] });
      toast({
        title: "Success",
        description: "Feedback submitted successfully",
      });
    },
    onError: (error: Error) => {
      let description = error.message ? "Comment text needs to at least 10 characters" : "Failed to submit feedback";
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
    },
  });

  const updateFeedbackStatus = useMutation({
    mutationFn: async ({
      feedbackId,
      status,
    }: {
      feedbackId: number;
      status: "approved" | "rejected";
    }) => {
      const res = await apiRequest(
        "PUT",
        `/api/feedback/${feedbackId}/status`,
        { status }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update feedback status");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId] });
      toast({
        title: "Success",
        description: "Feedback status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    feedbackEnabled,
    productFeedback,
    userFeedback,
    canProvideFeedback,
    submitFeedback,
    updateFeedbackStatus,
    isLoading: isLoadingSettings || isLoadingFeedback || isLoadingUserFeedback || isLoadingCanFeedback,
  };
}