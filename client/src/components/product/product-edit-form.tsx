import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { Product, insertProductSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sub } from "date-fns";

interface EditProductFormProps {
  productId: number;
  onClose: () => void;
}

export function ProductEditForm({ productId, onClose }: EditProductFormProps) {
  const { toast } = useToast();
  const { data: product } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });

  const form = useForm({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      category: "souvenir",
      stock: 0,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset(product);
    }
  }, [product, form]);

  const editProduct = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", `/api/products/${productId}`, data);
      return res.json();
    },
    onSuccess() {
      toast({
        title: "Product updated",
        description: "The product has been updated successfully",
      });
      onClose();
      // Invalidate both the specific product and the products list
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  const formSubmit = form.handleSubmit((data) => {
    const missingFields = [];
      if (!data.name) missingFields.push("Event Name");
      if (!data.description) missingFields.push("Description");
      if (!data.price) missingFields.push("Price");
      if (!data.category) missingFields.push("Category");
      if (!data.stock) missingFields.push("Stock");

      if (missingFields.length > 0) {
        toast({
          title: "Error",
          description: `Please fill in the following fields: ${missingFields.join(", ")}`,
          variant: "destructive",
        });
        return;
      }
    editProduct.mutate(data);
  });


  return (
    <Form {...form}>
      <form onSubmit={formSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (in cents)</FormLabel>
              <FormControl>
                {/* <Input type="number" {...field} /> */}
                <Input 
                  type="text" 
                  value={(field.value / 100).toFixed(2)} // Convert cents to dollars
                  onChange={(e) => field.onChange(Math.round(parseFloat(e.target.value) * 100))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="souvenir">Souvenir</SelectItem>
                  <SelectItem value="giveaway">Giveaway</SelectItem>
                  <SelectItem value="promotional">Promotional</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stock"
          render={({  field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Stock</FormLabel>
              <FormControl>
                {/* <Input type="number" {...field} /> */}
                <Input
                    type="number"
                    onChange={(e) => onChange(Number(e.target.value))}
                    {...field}
                  />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Image</FormLabel>
              <FormControl>
                <FileDropzone
                  onUploadComplete={field.onChange}
                  accept={{
                    'image/*': ['.png', '.jpg', '.jpeg', '.gif']
                  }}
                />
              </FormControl>
              {field.value && (
                <div className="mt-2">
                  <img
                    src={field.value}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={editProduct.isPending}
        >
          {editProduct.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Update Product
        </Button>
      </form>
    </Form>
  );
}