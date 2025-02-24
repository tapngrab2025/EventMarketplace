import { LogoSVG } from "@/assets/logo-svg";
import { ReactNode, useState } from "react";

export function Logo() {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="flex items-center justify-center relative">
            {!imageError ? (
                <>
                    {/* <img
                        src="/logo.png"
                        alt="EventMarket Logo"
                        className="h-[50px] w-[150px] object-contain"
                        onError={() => setImageError(true)}
                    /> */}
                    <div onError={() => setImageError(true)}>
                        <LogoSVG />
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