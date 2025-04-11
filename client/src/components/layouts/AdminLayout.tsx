import React, { ReactNode, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product, Event } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { RightNavigation } from "@/components/common/RightNavigation";
import { Logo } from "../common/logo";

interface AdminLayoutProps {
    children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
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
                        <Logo/>
                        {/* <div className="flex items-center gap-4"> */}
                            <RightNavigation 
                            searchTerm={searchTerm} 
                            setSearchTerm={setSearchTerm} />
                        {/* </div> */}
                    </div>
                </header>
                <main className="p-6">
                    {React.Children.map(children, child => {
                        if (React.isValidElement(child)) {
                            return React.cloneElement(child, { searchTerm });
                        }
                        return child;
                    })}
                </main>
            </div>
        </div>
    );
}