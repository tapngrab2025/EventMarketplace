import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function ThankYouPage() {
  const [, params] = useRoute("/thank-you/:id");
  const orderId = params?.id;

  const { data: orderData, isLoading } = useQuery({
    queryKey: [`/api/orders/${orderId}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/orders/${orderId}`);
      return res.json();
    },
    enabled: !!orderId,
  });

  const order = orderData?.[0]; // Get first order from array

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h1 className="text-3xl font-bold mb-4">Thank You for Your Order!</h1>
      <p className="text-muted-foreground mb-8">
        Your order #{orderId} has been placed successfully.
      </p>
      
      <div className="max-w-md mx-auto bg-card p-6 rounded-lg shadow mb-8">
        <h2 className="font-semibold mb-4">Order Details</h2>
        <div className="space-y-2 text-left">
          <p><span className="font-medium">Name:</span> {order?.fullName}</p>
          <p><span className="font-medium">Address:</span> {order?.address}</p>
          <p><span className="font-medium">Phone:</span> {order?.phone}</p>
          <p><span className="font-medium">Total Amount:</span> ${((order?.total || 0) / 100).toFixed(2)}</p>
          <p><span className="font-medium">Payment Method:</span> {order?.paymentMethod}</p>
          <p><span className="font-medium">Status:</span> {order?.status}</p>
        </div>
      </div>

      <div className="space-x-4">
        <Link href="/">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
        <Link href="/orders">
          <Button>View Orders</Button>
        </Link>
      </div>
    </div>
  );
}