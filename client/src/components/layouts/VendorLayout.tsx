import  React, { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product, Event } from "@shared/schema";
import { Loader2, ShoppingCart, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { RightNavigation } from "@/components/common/RightNavigation";
import { Logo } from "../common/logo";
import { X } from "lucide-react";


interface VendorLayoutProps {
    children: ReactNode;
}

export function VendorLayout({ children }: VendorLayoutProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    //     queryKey: ["/api/products"],
    // });

    // const { data: events, isLoading: loadingEvents } = useQuery<Event[]>({
    //     queryKey: ["/api/events"],
    // });

    // if (loadingProducts || loadingEvents) {
    //     return (
    //         <div className="flex items-center justify-center min-h-screen">
    //             <Loader2 className="h-8 w-8 animate-spin text-border" />
    //         </div>
    //     );
    // }
    return (
        <div className="min-h-screen flex">
            <div className="flex-1">
                <header className="border-b">
                    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                        <Logo/>
                        <RightNavigation 
                        // searchTerm={searchTerm} 
                        // setSearchTerm={setSearchTerm} 
                        isMobileMenuOpen={isMobileMenuOpen}
                        setIsMobileMenuOpen={setIsMobileMenuOpen} />
                    </div>
                    <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}>
                        <div className={`bg-white h-full w-full md:w-80 absolute right-0 top-0 p-6 transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                            }`}>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
                            >
                                <X className="h-6 w-6" />
                            </button>
                            <div className="flex flex-col space-y-6 mt-12">
                                <a href="/profile" className="text-gray-600 hover:text-gray-800 text-center">Profile</a>
                                {/* <div className="relative">
                                    <Input
                                        type="search"
                                        placeholder="Search events and products..."
                                        className="pr-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full"
                                    >
                                        <Search className="h-4 w-4 text-gray-500" />
                                    </button>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </header>
                <main className="p-6">
                    {React.Children.map(children, child => {
                        if (React.isValidElement(child)) {
                            return React.cloneElement(child, { searchTerm, setSearchTerm });
                        }
                        return child;
                    })}
                </main>
            </div>
        </div>
    );
}