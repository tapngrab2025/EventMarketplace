import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function useCoupon() {
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [applicableProductIds, setApplicableProductIds] = useState<number[]>([]);

  const validateCoupon = useMutation({
    mutationFn: async (data: { code: string; productIds: number[] }) => {
      const res = await apiRequest('POST', '/api/validate-coupon', data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.valid) {
        setAppliedCoupon(data.coupon);
        setApplicableProductIds(data.applicableProductIds || []);
        
        const message = data.message 
          ? `${data.coupon.code} - ${data.coupon.discountPercentage}% discount applied. ${data.message}`
          : `${data.coupon.code} - ${data.coupon.discountPercentage}% discount applied`;
          
        toast({
          title: 'Coupon Applied',
          description: message,
        });
      } else {
        setAppliedCoupon(null);
        setApplicableProductIds([]);
        toast({
          title: 'Invalid Coupon',
          description: data.message || 'This coupon cannot be applied to your order',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      setAppliedCoupon(null);
      setApplicableProductIds([]);
      toast({
        title: 'Error',
        description: error.message || 'Failed to validate coupon',
        variant: 'destructive',
      });
    },
  });

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setApplicableProductIds([]);
    toast({
      title: 'Coupon Removed',
      description: 'Coupon has been removed from your order',
    });
  };

  const calculateDiscount = (total: number, items?: any[]) => {
    if (!appliedCoupon) return 0;
    
    // If no items provided or no applicable product IDs, calculate discount on total
    if (!items || !applicableProductIds.length) {
      const discountAmount = Math.round((total * appliedCoupon.discountPercentage) / 100);
      return discountAmount;
    }
    
    // Calculate discount only on applicable products
    const applicableTotal = items
      .filter(item => applicableProductIds.includes(item.productId))
      .reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    const discountAmount = Math.round((applicableTotal * appliedCoupon.discountPercentage) / 100);
    return discountAmount;
  };

  return {
    couponCode,
    setCouponCode,
    appliedCoupon,
    applicableProductIds,
    validateCoupon,
    removeCoupon,
    calculateDiscount,
  };
}