import { ReactNode } from "react";

interface DefaultLayoutProps {
  children: ReactNode;
}

export function DefaultLayout({ children }: DefaultLayoutProps) {
  return (
    <div className="min-h-screen">
      {/* Add default header, navigation, etc. */}
      <header className="border-b">
        {/* Default navigation */}
      </header>
      <main className="container mx-auto py-6">
        {children}
      </main>
      <footer className="border-t">
        {/* Default footer */}
      </footer>
    </div>
  );
}