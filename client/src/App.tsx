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
import EventDetailsPage from "./pages/event/[id]";
import ThankYouPage from "./pages/thank-you/[id]";
import ProductPage from "./pages/product-page";
import AllProducts from "./pages/all-products";
import EventsPage from "@/pages/events";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/" component={
        () => (
          <DefaultLayout>
            <HomePage />
          </DefaultLayout>
        )
      } />
      {/* <ProtectedRoute
        path="/"
        component={() => (
          <DefaultLayout>
            <HomePage />
          </DefaultLayout>
        )}
        roles={["admin", "vendor", "customer", "organizer"]}
      /> */}
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
      path="/event/:id"
      component={()=>(
        <DefaultLayout>
          <EventDetailsPage/>
        </DefaultLayout>
      )}
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
      <ProtectedRoute
        path="/thank-you/:id"
        component={() => (
          <DefaultLayout>
            <ThankYouPage />
          </DefaultLayout>
        )}
        roles={["admin", "vendor", "customer", "organizer"]}
      />
      <ProtectedRoute
        path="/products/:id"
        component={() => (
          <DefaultLayout>
            <ProductPage />
          </DefaultLayout>
        )}
        roles={["admin", "vendor", "customer", "organizer"]}
      />
      <ProtectedRoute
        path="/products"
        component={() => (
          <DefaultLayout>
            <AllProducts/>
          </DefaultLayout>
        )}
        roles={["admin", "vendor", "customer", "organizer"]}
      />
      <ProtectedRoute
        path="/events"
        component={() => (
          <DefaultLayout>
            <EventsPage/>
          </DefaultLayout>
        )}
        roles={["admin", "vendor", "customer", "organizer"]}
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