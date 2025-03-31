import { useQuery, useMutation } from "@tanstack/react-query";
import { CartItem, Product } from "@shared/schema";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckoutForm } from "@/components/checkout-form";
import { useState } from "react";

export default function CartDrawer() {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { toast } = useToast();

  const { data: cartItems, isLoading: loadingCart } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
  });

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const updateCartItem = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      if (quantity === 0) {
        await apiRequest("DELETE", `/api/cart/${id}`);
      } else {
        await apiRequest("PATCH", `/api/cart/${id}`, { quantity });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeFromCart = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
      });
    },
  });

  if (loadingCart || loadingProducts) {
    return (
      <SheetContent>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </SheetContent>
    );
  }

  const cartItemsWithProducts = cartItems?.map((item) => ({
    ...item,
    product: products?.find((p) => p.id === item.productId),
  }));

  const total = cartItemsWithProducts?.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );

  return (
    <SheetContent className="w-full sm:max-w-lg">
      <SheetHeader>
        <SheetTitle>{isCheckingOut ? "Checkout" : "Shopping Cart"}</SheetTitle>
      </SheetHeader>
      <div className="mt-8 space-y-4">
        {isCheckingOut ? (
          <CheckoutForm 
            onSuccess={() => setIsCheckingOut(false)}
            total={total || 0}
            items={cartItemsWithProducts || []}
          />
        ) : (
          <>
            {cartItemsWithProducts?.map((item) => (
              <div
                key={item.id}
                className="flex items-start space-x-4 py-4 border-b"
              >
                <img
                  src={item.product?.imageUrl}
                  alt={item.product?.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-grow">
                  <h3 className="font-medium">{item.product?.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    ${((item.product?.price ?? 0) / 100).toFixed(2)} each
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updateCartItem.mutate({
                          id: item.id,
                          quantity: item.quantity - 1,
                        })
                      }
                      disabled={updateCartItem.isPending}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updateCartItem.mutate({
                          id: item.id,
                          quantity: item.quantity + 1,
                        })
                      }
                      disabled={
                        updateCartItem.isPending ||
                        item.quantity >= (item.product?.stock ?? 0)
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removeFromCart.mutate(item.id)}
                      disabled={removeFromCart.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    $
                    {(
                      ((item.product?.price ?? 0) * item.quantity) /
                      100
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            <div className="pt-4 space-y-4">
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>${((total || 0) / 100).toFixed(2)}</span>
              </div>
              <Button 
                className="w-full" 
                onClick={() => setIsCheckingOut(true)}
                disabled={!cartItemsWithProducts?.length}
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </div>
    </SheetContent>
  );
}
