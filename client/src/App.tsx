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
import { VendorLayout } from "./components/layouts/VendorLayout";
import { AdminLayout } from "./components/layouts/AdminLayout";
import { DefaultLayout } from "./components/layouts/DefaultLayout";
import ProfilePage from "@/pages/profile-page";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      {/* <Route path="/" component={HomePage} /> */}
      <ProtectedRoute
        path="/"
        component={() => (
          <DefaultLayout>
            <HomePage />
          </DefaultLayout>
        )}
        roles={["admin", "vendor", "customer"]}
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
        roles={["admin", "vendor", "customer"]}
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