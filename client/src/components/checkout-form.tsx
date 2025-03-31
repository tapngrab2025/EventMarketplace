import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import { useLocation } from "wouter";

const checkoutSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Delivery address is required"),
});

export function CheckoutForm({ onSuccess, total, items }: { onSuccess: () => void, total: number, items: any[] }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(checkoutSchema),
  });

  const checkout = useMutation({
    mutationFn: async (data: z.infer<typeof checkoutSchema>) => {
      const res = await apiRequest("POST", "/api/orders", {
        ...data,
        paymentMethod: "cash",
        total,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price
        }))
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      setLocation(`/thank-you/${data.id}`);
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => checkout.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} type="tel" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4 border-t">
          <div className="flex justify-between font-medium text-lg mb-4">
            <span>Total Amount</span>
            <span>${(total / 100).toFixed(2)}</span>
          </div>
          <Button type="submit" className="w-full" disabled={checkout.isPending}>
            {checkout.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Place Order (Cash Payment)
          </Button>
        </div>
      </form>
    </Form>
  );
}