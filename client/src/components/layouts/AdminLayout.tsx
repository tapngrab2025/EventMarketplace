import React, { ReactNode, useState } from "react";
import { RightNavigation } from "@/components/common/RightNavigation";
import { Logo } from "../common/logo";
import { X } from "lucide-react";
import { DefaultFooter } from "../common/DefaultFooter";

interface AdminLayoutProps {
    children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen flex">
            <div className="flex-1">
                <header className="border-b">
                    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                        <Logo/>
                        <RightNavigation 
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
                            </div>
                        </div>
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
                <DefaultFooter/>
            </div>
        </div>
    );
}