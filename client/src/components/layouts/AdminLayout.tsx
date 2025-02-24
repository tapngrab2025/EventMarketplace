import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Product, Event } from "@shared/schema";
import ProductCard from "@/components/product-card";
import EventCard from "@/components/event-card";
import CartDrawer from "@/components/cart-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShoppingCart, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useLocation } from "wouter";

interface AdminLayoutProps {
    children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const { user, logoutMutation } = useAuth();
    const [, setLocation] = useLocation();
    const [searchTerm, setSearchTerm] = useState("");

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
        <div className="min-h-screen flex">
            <div className="flex-1">
                <header className="border-b">
                    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            EventMarket
                        </h1>
                        <div className="flex items-center gap-4">
                            <Input
                                type="search"
                                placeholder="Search events and products..."
                                className="w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {!user ? (
                                <Button onClick={() => setLocation("/auth")}>Sign In</Button>
                            ) : (
                                <>
                                    {user.role === "vendor" && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setLocation("/vendor")}
                                            title="Vendor Dashboard"
                                        >
                                            <LayoutDashboard className="h-5 w-5" />
                                        </Button>
                                    )}
                                    {user.role === "customer" && (
                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <Button variant="outline" size="icon">
                                                    <ShoppingCart className="h-5 w-5" />
                                                </Button>
                                            </SheetTrigger>
                                            <CartDrawer />
                                        </Sheet>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            logoutMutation.mutate(undefined, {
                                                onSuccess: () => setLocation("/auth")
                                            });
                                        }}
                                        disabled={logoutMutation.isPending}
                                    >
                                        {logoutMutation.isPending ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <LogOut className="h-5 w-5" />
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </header>
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}