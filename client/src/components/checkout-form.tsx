import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Tag, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import { useLocation } from "wouter";
import { useCoupon } from "@/hooks/use-coupon";
import { Badge } from "@/components/ui/badge";

const checkoutSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  paymentMethod: z.enum(["cod", "payhere"])
});

export function CheckoutForm({ onSuccess, total, items }: { onSuccess: () => void, total: number, items: any[] }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { 
    couponCode, 
    setCouponCode, 
    appliedCoupon, 
    validateCoupon, 
    removeCoupon, 
    calculateDiscount,
    applicableProductIds
  } = useCoupon();
  
  const discount = calculateDiscount(total, items);
  const finalTotal = total - discount;
  
  const form = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "cod"
    }
  });

  const checkout = useMutation({
    mutationFn: async (data: z.infer<typeof checkoutSchema>) => {
      if (data.paymentMethod === "cod") {
        const res = await apiRequest("POST", "/api/orders", {
          ...data,
          total: finalTotal,
          discount: discount,
          couponCode: appliedCoupon?.code,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          }))
        });
        return res.json();
      } else {
        // PayHere integration
        const res = await apiRequest("POST", "/api/orders/payhere", {
          ...data,
          total: finalTotal,
          discount: discount,
          couponCode: appliedCoupon?.code,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          }))
        });
        const formData = await res.json();
        
        // Create and submit PayHere form
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://sandbox.payhere.lk/pay/checkout";
        
        Object.entries(formData).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      }
    },
    onSuccess: (data) => {
      if (data?.id) { // Only for COD orders
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        setLocation(`/thank-you/${data.id}`);
      }
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => checkout.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Payment Method</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="cod">Cash on Delivery</option>
                  <option value="payhere">Pay Online (PayHere)</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
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

        <div className="pt-4 border-t">
          {/* Coupon Code Input */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={!!appliedCoupon}
                className="flex-1"
              />
              {!appliedCoupon ? (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => validateCoupon.mutate({ 
                    code: couponCode, 
                    productIds: items.map(item => item.productId) 
                  })}
                  disabled={!couponCode || validateCoupon.isPending}
                >
                  {validateCoupon.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                </Button>
              ) : (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={removeCoupon}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {appliedCoupon && (
              <div className="space-y-1">
                <Badge className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {appliedCoupon.code} - {appliedCoupon.discountPercentage}% off
                </Badge>
                {applicableProductIds.length > 0 && applicableProductIds.length < items.length && (
                  <p className="text-xs text-amber-600">
                    Note: Discount applies only to products from the coupon's event
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${(total / 100).toFixed(2)}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${(discount / 100).toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between font-medium text-lg pt-2 border-t">
              <span>Total Amount</span>
              <span>${(finalTotal / 100).toFixed(2)}</span>
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={checkout.isPending}>
            {checkout.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {form.watch("paymentMethod") === "cod" ? "Place Order (Cash on Delivery)" : "Pay with PayHere"}
          </Button>
        </div>
      </form>
    </Form>
  );
}