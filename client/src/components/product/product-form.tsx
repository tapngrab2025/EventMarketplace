import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { FileDropzone } from "@/components/ui/file-dropzone";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Event,
  Stall,
  Product,
  insertEventSchema,
  insertStallSchema,
  insertProductSchema,
} from "@shared/schema";

export function ProductForm({ stall, onSuccess }: { stall: Stall; onSuccess: () => void }) {
    const { toast } = useToast();
  
    const form = useForm({
      resolver: zodResolver(insertProductSchema),
      defaultValues: {
        name: "",
        description: "",
        imageUrl: "",
        category: "souvenir",
        price: 0,
        stock: 0,
        stallId: stall.id,
      },
    });
  
    const createProduct = useMutation({
      mutationFn: async (data: any) => {
        const formattedData = {
          ...data,
          price: Math.round(Number(data.price) * 100), // Convert dollars to cents
          stock: Math.round(Number(data.stock)),
          stallId: stall.id,
        };
  
        console.log('Submitting product:', formattedData);
        const res = await apiRequest("POST", "/api/products", formattedData);
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Failed to create product");
        }
        return res.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        toast({
          title: "Success",
          description: "Product created successfully",
        });
        form.reset();
        onSuccess();
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create product",
          variant: "destructive",
        });
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
        createProduct.mutate(data);
    });
  
    return (
      <Form {...form}>
        <form
          onSubmit={formSubmit}
          className="space-y-4"
        >
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
            render={({ field: { onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Price (in dollars)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
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
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <FileDropzone
                    onUploadComplete={field.onChange}
                    accept={{
                      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
                    }}
                    filePath="products"
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
  
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="souvenir">Souvenir</option>
                    <option value="giveaway">Giveaway</option>
                    <option value="promotional">Promotional</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field: { onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
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
          <Button
            type="submit"
            className="w-full"
            disabled={createProduct.isPending}
          >
            {createProduct.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Product
          </Button>
        </form>
      </Form>
    );
  }// Move the ProductForm component here