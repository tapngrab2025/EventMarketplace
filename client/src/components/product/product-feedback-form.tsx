import { useState } from "react";
import { useProductFeedback } from "@/hooks/use-product-feedback";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { Loader2, StarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductFeedbackFormProps {
  productId: number;
  onSuccess?: () => void;
}

export function ProductFeedbackForm({
  productId,
  orderId,
  onSuccess,
}: ProductFeedbackFormProps) {
  const { submitFeedback } = useProductFeedback(productId);
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await submitFeedback.mutateAsync({
        rating,
        comment,
        imageUrl,
      });
      
      // Reset form
      setRating(0);
      setComment("");
      setImageUrl("");
      
      onSuccess?.();
    } catch (error) {
      // console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Rating *
        </label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className="focus:outline-none transition-colors duration-200 hover:scale-110"
              onClick={() => setRating(value)}
              disabled={isSubmitting}
            >
              <StarIcon
                className={`w-6 h-6 ${value <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="comment"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Comment
        </label>
        <Textarea
          id="comment"
          placeholder="Share your experience with this product..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[100px]"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Add Photos (Optional)
        </label>
        <FileDropzone
          onUploadComplete={setImageUrl}
          accept={{
            'image/*': ['.png', '.jpg', '.jpeg', '.gif']
          }}
          disabled={isSubmitting}
        />
        {imageUrl && (
          <div className="mt-2">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-32 object-cover rounded-md"
            />
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || submitFeedback.isPending}
        className="w-full"
      >
        {(isSubmitting || submitFeedback.isPending) ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Submitting...
          </>
        ) : (
          "Submit Feedback"
        )}
      </Button>
    </form>
  );
}