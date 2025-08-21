import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';
import { CartItem } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const CART_TOKEN_COOKIE = 'cart_token';

export function useCart() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize cart token if not exists
  useEffect(() => {
    if (!user && !Cookies.get(CART_TOKEN_COOKIE)) {
      Cookies.set(CART_TOKEN_COOKIE, uuidv4());
    }
  }, [user]);

  const cartToken = !user ? Cookies.get(CART_TOKEN_COOKIE) : undefined;
  const headers: Record<string, string> = {};
  if (cartToken) {
    headers['x-cart-token'] = cartToken;
  }

  const { data: cartItems, isLoading } = useQuery<CartItem[]>({    
    queryKey: ["/api/cart", user?.id],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/cart", undefined, headers);
        return response.json();
      } catch (error) {
        if (error instanceof Error && error.message.startsWith('401:')) {
          return [];
        }
        throw error;
      }
    }
  });

  const addToCart = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      const response = await apiRequest(
        "POST",
        "/api/cart",
        { productId, quantity, userId: user?.id },
        headers
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add item to cart');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateCartItem = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      let res;
      if (quantity === 0) {
        res = await apiRequest("DELETE", `/api/cart/${id}`, { userId: user?.id }, headers);
      } else {
        res = await apiRequest("PATCH", `/api/cart/${id}`, { quantity, userId: user?.id }, headers);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item updated",
        description: "The item has been updated in your cart.",
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

  const removeFromCart = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cart/${id}`, { userId: user?.id }, headers);
    },
    onSuccess: () => {;
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
      });
    },
  });

  return {
    cartItems,
    isLoading,
    addToCart,
    updateCartItem,
    removeFromCart
  };
}