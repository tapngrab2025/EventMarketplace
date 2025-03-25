import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import VendorDashboard from "@/pages/vendor-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import ProfilePage from "@/pages/profile-page";
import OrganizerDashboard from "@/pages/organizer-dashboard";
import { VendorLayout } from "./components/layouts/VendorLayout";
import { AdminLayout } from "./components/layouts/AdminLayout";
import { DefaultLayout } from "./components/layouts/DefaultLayout";
import { OrganizerLayout } from "./components/layouts/OrganizerLayout";
import AdminUsersDashboard from "./pages/admin-users";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute
        path="/"
        component={() => (
          <DefaultLayout>
            <HomePage />
          </DefaultLayout>
        )}
        roles={["admin", "vendor", "customer", "organizer"]}
      />
      <ProtectedRoute
        path="/profile"
        component={
          () => (
            <DefaultLayout>
              <ProfilePage />
            </DefaultLayout>
          )
        }
        roles={["admin", "vendor", "customer", "organizer"]}
      />
      <ProtectedRoute
        path="/vendor"
        component={() => (
          <VendorLayout>
            <VendorDashboard />
          </VendorLayout>
        )}
        roles={["vendor"]}
      />
      <ProtectedRoute
        path="/admin"
        component={() => (
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        )}
        roles={["admin"]}
      />
      <ProtectedRoute
        path="/users"
        component={() => (
          <AdminLayout>
            <AdminUsersDashboard/>
          </AdminLayout>
        )}
        roles={["admin"]}
      />
      <ProtectedRoute
        path="/organizer"
        component={() => (
          <OrganizerLayout>
            <OrganizerDashboard />
          </OrganizerLayout>
        )}
        roles={["organizer"]}
      />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;