import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProductEditForm } from "./product-edit-form";

interface EditProductProps {
  productDialogOpen: boolean;
  setProductDialogOpen: (open: boolean) => void;
  productId: number;
  setProductId: (id: number | null) => void;
}

export function EditProduct({ productDialogOpen, setProductDialogOpen, productId, setProductId }: EditProductProps) {
  return (
    <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Make changes to your product details below.
          </DialogDescription>
        </DialogHeader>
        <ProductEditForm
          productId={productId}
          onClose={() => {
            setProductDialogOpen(false);
            setProductId(null);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}