// ... existing imports
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export function Nav() {
  const { user } = useAuth();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* ... existing nav items ... */}
        
        {user?.role === 'admin' && (
          <Link href="/admin-dashboard" className="text-sm font-medium transition-colors hover:text-primary">
            Admin Dashboard
          </Link>
        )}
        
        {/* ... rest of navigation ... */}
      </div>
    </nav>
  );
}