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
import VendorEventNew from "./pages/vendor/events/new";
import VendorEventEdit from "./pages/vendor/events/[id]/edit";
import VendorStallNew from "./pages/vendor/stalls/new/[eventId]";
import VendorStallEdit from "./pages/vendor/stalls/[id]/edit";
import VendorProductNew from "./pages/vendor/products/new/[stallId]";
import VendorProductEdit from "./pages/vendor/products/[id]/edit";
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
// import ProductPage from "./pages/product-page";
import ProductDetails from "@/pages/products/[id]";
import AllProducts from "./pages/all-products";
import EventsPage from "@/pages/events";
import SearchPage from "./pages/search-page";
import EventDetailsCityPage from "./pages/event/[city]";
import AdminArchives from "./pages/admin-archives";

function Router() {
  return (
    <Switch>
      <Route path="/" component={
        () => (
          <DefaultLayout transparentHeader>
            <HomePage />
          </DefaultLayout>
        )
      } />
      <Route path="/auth" component={
        () => (
          <DefaultLayout>
            <AuthPage />
          </DefaultLayout>
        )
      } />
      <Route path="/products" component={
        () => (
          <DefaultLayout>
            <AllProducts />
          </DefaultLayout>
        )
      } />
      <Route path="/products/:id" component={
        () => (
          <DefaultLayout>
            {/* <ProductPage /> */}
            <ProductDetails />
          </DefaultLayout>
        )
      } />
      <Route path="/events" component={
        () => (
          <DefaultLayout>
            <EventsPage />
          </DefaultLayout>
        )
      } />
      <Route path="/event/:id" component={
        () => (
          <DefaultLayout>
            <EventDetailsPage />
          </DefaultLayout>
        )
      } />
      <Route path="/event/city/:city" component={
        () => (
          <DefaultLayout>
            <EventDetailsCityPage />
          </DefaultLayout>
        )
      } />
      <Route path="/search" component={
        () => (
          <DefaultLayout>
            <SearchPage />
          </DefaultLayout>
        )
      } />
      <ProtectedRoute
        path="/admin/archives"
        component={() => (
          <DefaultLayout>
            <AdminArchives />
          </DefaultLayout>
        )}
        roles={["admin"]}
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
        path="/vendor/events/new"
        component={() => (
          <VendorLayout>
            <VendorEventNew />
          </VendorLayout>
        )}
        roles={["vendor", "organizer"]}
      />
      <ProtectedRoute
        path="/vendor/events/:id/edit"
        component={() => (
          <VendorLayout>
            <VendorEventEdit />
          </VendorLayout>
        )}
        roles={["vendor", "organizer"]}
      />
      <ProtectedRoute
        path="/vendor/stalls/new/:eventId"
        component={() => (
          <VendorLayout>
            <VendorStallNew />
          </VendorLayout>
        )}
        roles={["vendor", "organizer"]}
      />
      <ProtectedRoute
        path="/vendor/stalls/:id/edit"
        component={() => (
          <VendorLayout>
            <VendorStallEdit />
          </VendorLayout>
        )}
        roles={["vendor", "organizer"]}
      />
      <ProtectedRoute
        path="/vendor/products/new/:stallId"
        component={() => (
          <VendorLayout>
            <VendorProductNew />
          </VendorLayout>
        )}
        roles={["vendor", "organizer"]}
      />
      <ProtectedRoute
        path="/vendor/products/:id/edit"
        component={() => (
          <VendorLayout>
            <VendorProductEdit />
          </VendorLayout>
        )}
        roles={["vendor", "organizer"]}
      />
      <ProtectedRoute
        path="/vendor/events/new"
        component={() => (
          <VendorLayout>
            {(() => { const Page = require("./pages/vendor/events/new").default; return <Page/>; })()}
          </VendorLayout>
        )}
        roles={["vendor"]}
      />
      <ProtectedRoute
        path="/vendor/events/:id/edit"
        component={() => (
          <VendorLayout>
            {(() => { const Page = require("./pages/vendor/events/[id]/edit").default; return <Page/>; })()}
          </VendorLayout>
        )}
        roles={["vendor"]}
      />
      <ProtectedRoute
        path="/vendor/stalls/new/:eventId"
        component={() => (
          <VendorLayout>
            {(() => { const Page = require("./pages/vendor/stalls/new/[eventId]").default; return <Page/>; })()}
          </VendorLayout>
        )}
        roles={["vendor"]}
      />
      <ProtectedRoute
        path="/vendor/stalls/:id/edit"
        component={() => (
          <VendorLayout>
            {(() => { const Page = require("./pages/vendor/stalls/[id]/edit").default; return <Page/>; })()}
          </VendorLayout>
        )}
        roles={["vendor"]}
      />
      <ProtectedRoute
        path="/vendor/products/new/:stallId"
        component={() => (
          <VendorLayout>
            {(() => { const Page = require("./pages/vendor/products/new/[stallId]").default; return <Page/>; })()}
          </VendorLayout>
        )}
        roles={["vendor"]}
      />
      <ProtectedRoute
        path="/vendor/products/:id/edit"
        component={() => (
          <VendorLayout>
            {(() => { const Page = require("./pages/vendor/products/[id]/edit").default; return <Page/>; })()}
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