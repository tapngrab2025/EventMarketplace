import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CartItem, Product } from "@shared/schema";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { CheckoutForm } from "@/components/checkout-form";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useCart } from '@/hooks/use-cart';

export default function CartDrawer({isCheckingOut, setIsCheckingOut}: {isCheckingOut: boolean, setIsCheckingOut: (isCheckingOut: boolean) => void}) {
  const { user } = useAuth();
  const { cartItems, isLoading: loadingCart, updateCartItem, removeFromCart } = useCart();
  const [, setLocation] = useLocation();

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
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

  const cartItemsWithProducts = cartItems?.reduce((acc, item) => {
    const existingItem = acc.find(i => i.productId === item.productId);
    if (existingItem) {
      existingItem.quantity += item.quantity;
      return acc;
    }
    const product = products?.find((p) => p.id === item.productId);
    return [...acc, {
      ...item,
      product
    }];
  }, [] as (CartItem & { product: Product | undefined })[]) || [];

  const total = cartItemsWithProducts.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (!user) {
      // Redirect to auth page
      setLocation("/auth");
      return;
    } else {
      setIsCheckingOut(true);
    }
  };

  return (
    <SheetContent className="w-full sm:max-w-lg">
      <SheetHeader>
        <SheetTitle>{isCheckingOut ? "Checkout" : "Shopping Cart"}</SheetTitle>
      </SheetHeader>
      <div className="mt-8 space-y-4">
        {isCheckingOut ? (
          <CheckoutForm 
            onSuccess={() => setIsCheckingOut(false)}
            total={total}
            items={cartItemsWithProducts}
          />
        ) : (
          <>
            {cartItemsWithProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Your cart is empty
              </div>
            ) : (
              cartItemsWithProducts.map((item) => (
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
              )))}
            <div className="pt-4 space-y-4">
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>${((total || 0) / 100).toFixed(2)}</span>
              </div>
              <Button 
                className="w-full" 
                onClick={() => handleCheckout()}
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
