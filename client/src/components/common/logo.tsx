// import { LogoSVG } from "@/assets/logo-svg";
// import logoImage from "@/assets/TapNGrag-logo.jpg";
// import logoImage from "@/assets/TnG_Logo.png";
import logoImage from "@/assets/logo_latest.png";
import { useState } from "react";
import { useLocation } from "wouter";

export function Logo() {
    const [imageError, setImageError] = useState(false);
    // const [imageError, setImageError] = useState(true);
    const [, setLocation] = useLocation();

    return (
        <div className="flex items-center justify-center relative cursor-pointer" onClick={() => setLocation('/')}>
            {!imageError ? (
                <>
                    <div onError={() => setImageError(true)}>
                        {/* <LogoSVG /> */}
                        <img
                            src={logoImage}
                            alt="TAP-NGRAB"
                            className="h-16 w-auto"
                        />
                    </div>
                    <h1 className="sr-only">
                        EventMarket
                    </h1>
                </>
            ) : (
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    EventMarket
                </h1>
            )}
        </div>
    );
}