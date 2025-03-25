import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { ProductForm } from "./product-form";
import { Stall } from "@shared/schema";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddProductProps {
  productDialogOpen: boolean;
  setProductDialogOpen: (open: boolean) => void;
  stall: Stall | null;
  setSelectedStall: (stall: Stall | null) => void;
  selectedStall: Stall | null;
}

export function AddProduct({ productDialogOpen, setProductDialogOpen, stall, setSelectedStall, selectedStall }: AddProductProps) {
  return (
    <Dialog 
    open={productDialogOpen && selectedStall?.id === stall.id}
    onOpenChange={(open) => {
      setProductDialogOpen(open);
      if (open) setSelectedStall(stall);
      if (!open) setSelectedStall(null);
    }}
    >
                                            <DialogTrigger asChild>
                                        <Button size="sm" variant="outline">
                                          <Plus className="h-4 w-4 mr-2" />
                                          Add Product
                                        </Button>
                                      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Product to {selectedStall?.name}</DialogTitle>
          <DialogDescription>
            Create a new product for this stall.
          </DialogDescription>
        </DialogHeader>
        {selectedStall && (
          <ProductForm
            stall={selectedStall}
            onSuccess={() => {
              setProductDialogOpen(false);
              setSelectedStall(null);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}