import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface CouponManagementProps {
  eventId: number;
}

const couponFormSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters"),
  discountPercentage: z.coerce
    .number()
    .min(1, "Discount must be at least 1%")
    .max(100, "Discount cannot exceed 100%"),
  isActive: z.boolean().default(true),
  expiresAt: z.string().optional(),
  excludedStallIds: z.array(z.number()).default([]),
});

type CouponFormValues = z.infer<typeof couponFormSchema>;

export function CouponManagement({ eventId }: CouponManagementProps) {
  const { toast } = useToast();
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);

  const { data: coupons, isLoading: loadingCoupons } = useQuery({
    queryKey: [`/api/events/${eventId}/coupons`],
    enabled: !!eventId,
  });

  const { data: stalls, isLoading: loadingStalls } = useQuery({
    queryKey: [`/api/events/${eventId}/stalls`],
    enabled: !!eventId,
  });

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: "",
      discountPercentage: 5,
      isActive: true,
      expiresAt: "",
      excludedStallIds: [],
    },
  });

  useEffect(() => {
    if (selectedCouponId && coupons) {
      const coupon = coupons.find((c) => c.id === selectedCouponId);
      if (coupon) {
        const expiresAt = coupon.expiresAt
          ? new Date(coupon.expiresAt).toISOString().split("T")[0]
          : "";
        
        form.reset({
          code: coupon.code,
          discountPercentage: coupon.discountPercentage,
          isActive: coupon.isActive,
          expiresAt,
          excludedStallIds: coupon.excludedStalls?.map((s) => s.stallId) || [],
        });
      }
    } else {
      form.reset({
        code: "",
        discountPercentage: 5,
        isActive: true,
        expiresAt: "",
        excludedStallIds: [],
      });
    }
  }, [selectedCouponId, coupons, form]);

  const createCoupon = useMutation({
    mutationFn: async (data: CouponFormValues) => {
      const res = await apiRequest("POST", `/api/events/${eventId}/coupons`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/coupons`] });
      setCouponDialogOpen(false);
      toast({
        title: "Success",
        description: "Coupon created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create coupon",
        variant: "destructive",
      });
    },
  });

  const updateCoupon = useMutation({
    mutationFn: async (data: CouponFormValues) => {
      const res = await apiRequest("PUT", `/api/coupons/${selectedCouponId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/coupons`] });
      setSelectedCouponId(null);
      setCouponDialogOpen(false);
      toast({
        title: "Success",
        description: "Coupon updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update coupon",
        variant: "destructive",
      });
    },
  });

  const deleteCoupon = useMutation({
    mutationFn: async (couponId: number) => {
      const res = await apiRequest("DELETE", `/api/coupons/${couponId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/coupons`] });
      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete coupon",
        variant: "destructive",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (selectedCouponId) {
      updateCoupon.mutate(data);
    } else {
      createCoupon.mutate(data);
    }
  });

  if (loadingCoupons || loadingStalls) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Coupon Management</CardTitle>
        <Dialog open={couponDialogOpen} onOpenChange={setCouponDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedCouponId(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCouponId ? "Edit Coupon" : "Create New Coupon"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coupon Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="SUMMER10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Percentage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          {...field}
                          placeholder="10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiration Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {stalls && stalls.length > 0 && (
                  <div className="space-y-2">
                    <Label>Excluded Stalls (Optional)</Label>
                    <div className="border rounded-md p-4 space-y-2">
                      {stalls.map((stall) => (
                        <div key={stall.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`stall-${stall.id}`}
                            checked={form.watch("excludedStallIds").includes(stall.id)}
                            onCheckedChange={(checked) => {
                              const currentExcluded = form.watch("excludedStallIds");
                              if (checked) {
                                form.setValue("excludedStallIds", [
                                  ...currentExcluded,
                                  stall.id,
                                ]);
                              } else {
                                form.setValue(
                                  "excludedStallIds",
                                  currentExcluded.filter((id) => id !== stall.id)
                                );
                              }
                            }}
                          />
                          <Label htmlFor={`stall-${stall.id}`}>{stall.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={createCoupon.isPending || updateCoupon.isPending}
                  >
                    {(createCoupon.isPending || updateCoupon.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {selectedCouponId ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {coupons && coupons.length > 0 ? (
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="flex items-center justify-between border rounded-md p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{coupon.code}</h3>
                    <Badge variant={coupon.isActive ? "default" : "outline"}>
                      {coupon.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {coupon.discountPercentage}% discount
                    {coupon.expiresAt &&
                      ` • Expires: ${new Date(coupon.expiresAt).toLocaleDateString()}`}
                  </p>
                  {coupon.excludedStalls && coupon.excludedStalls.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="text-xs text-muted-foreground">
                        Excluded stalls:
                      </span>
                      {coupon.excludedStalls.map((excluded) => {
                        const stall = stalls?.find((s) => s.id === excluded.stallId);
                        return (
                          <Badge key={excluded.stallId} variant="outline" className="text-xs">
                            {stall?.name || `Stall #${excluded.stallId}`}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCouponId(coupon.id);
                      setCouponDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteCoupon.mutate(coupon.id)}
                    disabled={deleteCoupon.isPending}
                  >
                    {deleteCoupon.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No coupons created yet</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setCouponDialogOpen(true)}
            >
              Create your first coupon
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}