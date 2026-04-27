import React, { ReactNode } from "react";
import { Logo } from "../common/logo";
import { DefaultNavigation } from "../common/DefaultNavigation";
import { DefaultFooter } from "../common/DefaultFooter";

interface DefaultLayoutProps {
    children: ReactNode;
    transparentHeader?: boolean;
}

export function DefaultLayout(
    { children }: DefaultLayoutProps
) {
    return (
        <div className="min-h-screen flex">
            <div className="flex-1">
                <header className="fixed left-0 right-0 top-0 z-50 bg-white">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex h-16 items-center justify-between border border-zinc-200 px-6">
                            <Logo />
                            <DefaultNavigation />
                        </div>
                    </div>
                </header>
                <div className="h-16" />
                <>
                    {React.Children.map(children, child => {
                        if (React.isValidElement(child)) {
                            return React.cloneElement(child);
                        }
                        return child;
                    })}
                </>
                <DefaultFooter/>
            </div>
        </div>
    );
}
