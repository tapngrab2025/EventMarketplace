import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, Event, insertEventSchema, insertProductSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function VendorDashboard() {
  const { user } = useAuth();
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: events, isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const myEvents = events?.filter((event) => event.vendorId === user?.id);
  const myProducts = products?.filter((product) => product.vendorId === user?.id);

  if (loadingEvents || loadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-muted-foreground">Manage your events and products</p>
        </header>

        <div className="grid gap-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">My Events</h2>
              <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                  </DialogHeader>
                  <EventForm onSuccess={() => setEventDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid gap-6">
              {myEvents?.length === 0 ? (
                <p className="text-muted-foreground">No events created yet</p>
              ) : (
                myEvents?.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {event.name}
                        <span className={`text-sm px-2 py-1 rounded-full ${event.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {event.approved ? 'Approved' : 'Pending'}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{event.description}</p>
                      <p className="mt-2">Location: {event.location}</p>
                      <p>Dates: {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">My Products</h2>
              <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Product</DialogTitle>
                  </DialogHeader>
                  <ProductForm 
                    events={myEvents || []} 
                    onSuccess={() => setProductDialogOpen(false)} 
                  />
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {myProducts?.length === 0 ? (
                <p className="text-muted-foreground">No products created yet</p>
              ) : (
                myProducts?.map((product) => (
                  <Card key={product.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {product.name}
                        <span className={`text-sm px-2 py-1 rounded-full ${product.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {product.approved ? 'Approved' : 'Pending'}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                      <p className="text-muted-foreground">{product.description}</p>
                      <p className="mt-2">Price: ${(product.price / 100).toFixed(2)}</p>
                      <p>Stock: {product.stock}</p>
                      <p>Category: {product.category}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function EventForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
  });

  const createEvent = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/events", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      onSuccess();
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => createEvent.mutate(data))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
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
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={createEvent.isPending}>
          {createEvent.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create Event
        </Button>
      </form>
    </Form>
  );
}

function ProductForm({ events, onSuccess }: { events: Event[], onSuccess: () => void }) {
  const form = useForm({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      price: 0,
      stock: 0,
    },
  });

  const createProduct = useMutation({
    mutationFn: async (data: any) => {
      // Convert price to cents
      const dataWithCents = {
        ...data,
        price: Math.round(parseFloat(data.price) * 100),
      };
      const res = await apiRequest("POST", "/api/products", dataWithCents);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      onSuccess();
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => createProduct.mutate(data))}
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (in dollars)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
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
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input {...field} />
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
          name="eventId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event (optional)</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="">No Event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={createProduct.isPending}>
          {createProduct.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create Product
        </Button>
      </form>
    </Form>
  );
}