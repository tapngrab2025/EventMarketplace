import { Product } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { UseMutationResult } from "@tanstack/react-query";

interface PendingProductsProps {
  pendingProducts?: Product[];
  approveProduct: UseMutationResult<any, Error, number>;
}

export default function PendingProducts({ pendingProducts, approveProduct }: PendingProductsProps) {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6">Pending Products</h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {pendingProducts?.length === 0 ? (
          <p className="text-muted-foreground">No pending products</p>
        ) : (
          pendingProducts?.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{product.description}</p>
                <div className="space-y-2">
                  <p>Price: ${(product.price / 100).toFixed(2)}</p>
                  <p>Category: {product.category}</p>
                  <p>Stock: {product.stock}</p>
                </div>
                <Button
                  className="mt-4 w-full"
                  onClick={() => approveProduct.mutate(product.id)}
                  disabled={approveProduct.isPending}
                >
                  {approveProduct.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}