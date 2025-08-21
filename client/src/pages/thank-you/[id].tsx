import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { QRCodeSVG } from 'qrcode.react';
import { Download } from "lucide-react";

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

  // Group items by stall
  const stallProducts = order?.items?.reduce((acc: any, item: any) => {
    const stallId = item.product.stall.id;
    if (!acc[stallId]) {
      acc[stallId] = {
        stall: item.product.stall,
        items: [],
        orderId: orderId
      };
    }
    acc[stallId].items.push(item);
    return acc;
  }, {});

  function sanitizeId(name: string) {
    return name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  }

  function downloadQRCode(stallName: string, qrValue: string) {
    const sanitizedId = sanitizeId(stallName);
    const qrElement = document.getElementById(`qr-${sanitizedId}`);
    
    if (!qrElement) {
      return;
    }

    // Get the SVG data
    const svgData = new XMLSerializer().serializeToString(qrElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Create image from SVG with larger dimensions
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Set larger canvas dimensions (2x the original size)
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      const ctx = canvas.getContext('2d');
      // Scale up the image while maintaining quality
      ctx?.scale(2, 2);
      ctx?.drawImage(img, 0, 0);
      
      // Convert to PNG and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `order-${sanitizedId}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png', 1.0); // Added quality parameter
    };
    img.src = svgUrl;
  }


  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h1 className="text-3xl font-bold mb-4">Thank You for Your Order!</h1>
      <p className="text-muted-foreground mb-8">
        Your order #{orderId} has been placed successfully.
      </p>
      
      <div className="max-w-xl mx-auto bg-card p-6 rounded-lg shadow mb-8">
        <h2 className="font-semibold text-xl mb-6">Order Details</h2>
        <div className="space-y-4 text-left divide-y">
          <div className="pb-4">
            <h3 className="font-medium text-lg mb-2">Customer Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Name:</span> {order?.fullName}</p>
              <p><span className="font-medium">Address:</span> {order?.address}</p>
              <p><span className="font-medium">Phone:</span> {order?.phone}</p>
            </div>
          </div>
          <div className="py-4">
            <h3 className="font-medium text-lg mb-2">Purchased Items</h3>
            <div className="space-y-3">
              {Object.values(stallProducts || {}).map((stallGroup: any) => (
                <div key={stallGroup.stall.id} className="border rounded-lg p-4">
                  <h4 className="text-md mb-2 bg-muted/50 p-2 rounded-md flex items-center">
                    <span className="text-muted-foreground">Stall : </span>
                    <span className="font-semibold ml-1 text-primary">{stallGroup.stall.name}</span>
                  </h4>
                  <div className="flex gap-4 flex-col sm:flex-row">
                    <div className="flex-1">
                      {stallGroup.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-sm mb-2">
                          <div className="pl-2">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-muted-foreground">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-medium">
                            ${((item.price * item.quantity) / 100).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <QRCodeSVG
                        id={`qr-${sanitizeId(stallGroup.stall.name)}`}
                        value={JSON.stringify({
                          type: 'stall_order',
                          orderId: stallGroup.orderId,
                          stallId: stallGroup.stall.id,
                          items: stallGroup.items.map((item: any) => ({
                            productId: item.product.id,
                            quantity: item.quantity
                          }))
                        })}
                        size={150} // Increased from 100 to 150
                        level="H"
                        includeMargin
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex gap-2 items-center"
                        onClick={() => downloadQRCode(stallGroup.stall.name, stallGroup.stall.id)}
                      >
                        <Download className="h-4 w-4" />
                        Download QR
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-3 mt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Subtotal</span>
                  <span>${((order?.total || 0) / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>



          <div className="py-4">
            <h3 className="font-medium text-lg mb-2">Order Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Order ID:</span> #{orderId}</p>
              <p><span className="font-medium">Date:</span> {new Date(order?.createdAt).toLocaleDateString()}</p>
              <p><span className="font-medium">Status:</span> 
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  order?.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order?.status}
                </span>
              </p>
              <p><span className="font-medium">Payment Method:</span> {order?.paymentMethod}</p>
              <p><span className="font-medium">Total Amount:</span> 
                <span className="text-lg font-bold ml-2">
                  ${((order?.total || 0) / 100).toFixed(2)}
                </span>
              </p>
            </div>
          </div>
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