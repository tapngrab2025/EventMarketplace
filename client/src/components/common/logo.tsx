import { LogoSVG } from "@/assets/logo-svg";
import { ReactNode, useState } from "react";
import { useLocation } from "wouter";

export function Logo() {
    // const [imageError, setImageError] = useState(false);
    const [imageError, setImageError] = useState(true);
    const [, setLocation] = useLocation();

    return (
        <div className="flex items-center justify-center relative cursor-pointer" onClick={() => setLocation('/')}>
            {!imageError ? (
                <>
                    <div onError={() => setImageError(true)}>
                        <LogoSVG />
                    </div>
                    <h1 className="sr-only">
                        EventMarket
                    </h1>
                </>
            ) : (
                <h1 
                className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                >
                    EventMarket
                </h1>
            )}
        </div>
    );
}