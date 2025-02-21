import { useQuery } from "@tanstack/react-query";
import { Event, Product } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data: events, isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    select: (data) => data?.filter(event => event.approved), // Only show approved events
  });

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Get upcoming events (sorted by start date)
  const upcomingEvents = events
    ?.filter((event) => {
      const eventDate = new Date(event.startDate);
      const today = new Date();
      return eventDate >= today;
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 4);

  // Group products by category and get most recent ones
  const groupedProducts = products?.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  console.log('Events:', events); // Debug log
  console.log('Upcoming Events:', upcomingEvents); // Debug log
  console.log('Products:', products); // Debug log
  console.log('Grouped Products:', groupedProducts); // Debug log

  // Show message if no events or products
  if (!loadingEvents && !loadingProducts && (!events?.length || !products?.length)) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto py-12 px-4">
          <h2 className="text-3xl font-bold mb-6">Welcome to Event Marketplace</h2>
          <p className="text-muted-foreground">
            {!events?.length && "No upcoming events available at the moment."}
          </p>
          <p className="text-muted-foreground">
            {!products?.length && "No products available at the moment."}
          </p>
        </main>
      </div>
    );
  }

  // Get recent products for each category
  const featuredProducts = Object.entries(groupedProducts || {}).reduce((acc, [category, products]) => {
    acc[category] = products
      .sort((a, b) => b.id - a.id)
      .slice(0, 4);
    return acc;
  }, {} as Record<string, Product[]>);

  if (loadingEvents || loadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-12 px-4">
        {/* Upcoming Events Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingEvents?.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{event.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={event.imageUrl}
                    alt={event.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                  <p className="text-sm text-muted-foreground mb-2">
                    {event.description.slice(0, 100)}...
                  </p>
                  <p className="text-sm">
                    {new Date(event.startDate).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Products Sections */}
        {Object.entries(featuredProducts).map(([category, products]) => (
          <section key={category} className="mb-12">
            <h2 className="text-3xl font-bold mb-6 capitalize">
              Featured {category}s
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="pt-6">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                    <h3 className="font-medium mb-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {product.description.slice(0, 100)}...
                    </p>
                    <p className="text-sm font-medium">
                      ${(product.price / 100).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}