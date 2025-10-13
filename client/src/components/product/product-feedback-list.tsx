import { useProductFeedback } from "@/hooks/use-product-feedback";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface ProductFeedbackListProps {
  productId: number;
}

export function ProductFeedbackList({ productId }: ProductFeedbackListProps) {
  const { user } = useAuth();
  const { productFeedback, updateFeedbackStatus, isLoading } = useProductFeedback(productId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-border" />
      </div>
    );
  }

  if (!Array.isArray(productFeedback) || productFeedback.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No feedback yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {productFeedback.map((feedback) => (
        <div
          key={feedback.id}
          className="border rounded-lg p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <StarIcon
                  key={value}
                  className={`w-4 h-4 ${value <= feedback.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {format(new Date(feedback.createdAt), "MMM d, yyyy")}
            </span>
          </div>

          {feedback.comment && (
            <p className="text-sm">{feedback.comment}</p>
          )}

          {feedback.imageUrl && (
            <img
              src={feedback.imageUrl}
              alt="Feedback"
              className="w-full h-32 object-cover rounded-md"
            />
          )}

          {user?.role === "admin" && feedback.status === "pending" && (
            <div className="flex space-x-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateFeedbackStatus.mutate({
                    feedbackId: feedback.id,
                    status: "approved",
                  })
                }
                disabled={updateFeedbackStatus.isPending}
              >
                {updateFeedbackStatus.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  "Approve"
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateFeedbackStatus.mutate({
                    feedbackId: feedback.id,
                    status: "rejected",
                  })
                }
                disabled={updateFeedbackStatus.isPending}
              >
                {updateFeedbackStatus.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  "Reject"
                )}
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}