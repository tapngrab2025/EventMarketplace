import React, { ReactNode } from "react";
import { useState } from "react";
import { RightNavigation } from "@/components/common/RightNavigation";
import { Logo } from "../common/logo";

interface DefaultLayoutProps {
  children: ReactNode;
}

export function DefaultLayout(
    { children }: DefaultLayoutProps
) {
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <div className="min-h-screen flex">
            <div className="flex-1">
                <header className="border-b">
                    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                        <Logo/>
                        <div className="flex items-center gap-4">
                            <RightNavigation 
                            searchTerm={searchTerm} 
                            setSearchTerm={setSearchTerm} />
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
            </div>
        </div>
  );
}