import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Product, Event } from "@shared/schema";
import ProductCard from "@/components/product-card";
import EventCard from "@/components/event-card";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface VendorDashboardProps {
  searchTerm?: string;
}

export default function HomePage(
  { searchTerm = "" }:VendorDashboardProps
) {

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: events, isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const filteredProducts = products?.filter(
    (product) =>
      product.approved &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredEvents = events?.filter(
    (event) =>
      event.approved &&
      (event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loadingProducts || loadingEvents) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Your One-Stop Event Marketplace
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover unique souvenirs, promotional items, and giveaways for your next event.
            Connect with vendors and event organizers all in one place.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Upcoming Events</h2>
          {filteredEvents?.length === 0 ? (
            <p className="text-muted-foreground">No events found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents?.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Featured Products</h2>
          {filteredProducts?.length === 0 ? (
            <p className="text-muted-foreground">No products found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}