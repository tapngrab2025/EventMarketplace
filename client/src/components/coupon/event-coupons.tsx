import { useQuery } from "@tanstack/react-query";
import { Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface EventCouponsProps {
  eventId: number | string;
}

export function EventCoupons({ eventId }: EventCouponsProps) {
  const { data: coupons, isLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/coupons`],
    enabled: !!eventId,
  });

  if (isLoading || !coupons?.length) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-3">
          <Ticket className="h-5 w-5 text-primaryGreen" />
          <h3 className="font-semibold">Available Coupons</h3>
        </div>
        <div className="space-y-2">
          {coupons.map((coupon: any) => (
            <div key={coupon.id} className="flex items-center justify-between p-2 border rounded-md">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  {coupon.code}
                </Badge>
                <span className="text-sm font-medium text-green-600">
                  {coupon.discountPercentage}% OFF
                </span>
              </div>
              {coupon.expiresAt && (
                <span className="text-xs text-muted-foreground">
                  Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}