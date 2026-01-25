import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { AuthProvider } from "@/components/AuthProvider";
import { LanguageProvider } from "@/i18n";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProfileDetails from "./pages/profile/ProfileDetails";
import ProfileBookings from "./pages/profile/ProfileBookings";
import ProfileSaved from "./pages/profile/ProfileSaved";
import ProfileSpiritual from "./pages/profile/ProfileSpiritual";
import Booking from "./pages/Booking";
import GiftPooja from "./pages/GiftPooja";
import Dashachara from "./pages/pooja/Dashachara";
import Vamachara from "./pages/pooja/Vamachara";
import Events from "./pages/community/Events";
import About from "./pages/community/About";
import Contact from "./pages/Contact";
import Panchang from "./pages/Panchang";
import Kundali from "./pages/Kundali";
import KundaliMatching from "./pages/KundaliMatching";
import Temples from "./pages/Temples";
import TempleDetails from "./pages/TempleDetails";
import Pundits from "./pages/Pundits";
import RitualDetails from "./pages/RitualDetails";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminServices from "./pages/admin/Services";
import AdminBookings from "./pages/admin/Bookings";
import AdminUsers from "./pages/admin/Users";
import AdminTemples from "./pages/admin/Temples";
import AdminPundits from "./pages/admin/Pundits";
import AdminApprovals from "./pages/admin/Approvals";
import AdminEvents from "./pages/admin/Events";
import AdminGiftBookings from "./pages/admin/GiftBookings";
import AdminSettings from "./pages/admin/Settings";
import AdminReports from "./pages/admin/Reports";
import AdminLogin from "./pages/admin/Login";
import GiftConfirmation from "./pages/GiftConfirmation";
import PunditDashboard from "./pages/pundit/Dashboard";
import PunditBookings from "./pages/pundit/Bookings";
import PunditProfile from "./pages/pundit/Profile";
import PunditEarnings from "./pages/pundit/Earnings";
import PoojaDetails from "./pages/PoojaDetails";
import PaymentSuccess from "./pages/PaymentSuccess";
import Payment from "./pages/Payment";
import FestivalCalendar from "./pages/FestivalCalendar";
import Remedies from "./pages/Remedies";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<Services />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfileDetails />
                </ProtectedRoute>
              } />
              <Route path="/profile/bookings" element={
                <ProtectedRoute>
                  <ProfileBookings />
                </ProtectedRoute>
              } />
              <Route path="/profile/saved" element={
                <ProtectedRoute>
                  <ProfileSaved />
                </ProtectedRoute>
              } />
              <Route path="/profile/spiritual" element={
                <ProtectedRoute>
                  <ProfileSpiritual />
                </ProtectedRoute>
              } />
              <Route path="/booking" element={<Booking />} />
              <Route path="/booking/:serviceId" element={<Booking />} />
              
              {/* New Pages */}
              <Route path="/gift-pooja" element={<GiftPooja />} />
              <Route path="/gift/:id" element={<GiftConfirmation />} />
              <Route path="/pooja/dashachara" element={<Dashachara />} />
              <Route path="/pooja/vamachara" element={<Vamachara />} />
              <Route path="/pooja/:id" element={<PoojaDetails />} />
              <Route path="/panchang" element={<Panchang />} />
              <Route path="/kundali" element={<Kundali />} />
              <Route path="/kundali-matching" element={<KundaliMatching />} />
              <Route path="/festivals" element={<FestivalCalendar />} />
              <Route path="/remedies" element={<Remedies />} />
              <Route path="/temples" element={<Temples />} />
              <Route path="/temple/:id" element={<TempleDetails />} />
              <Route path="/ritual/:id" element={<RitualDetails />} />
              <Route path="/pundits" element={<Pundits />} />
              <Route path="/community/events" element={<Events />} />
              <Route path="/community/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment" element={<Payment />} />
              
              {/* Pundit Routes */}
              <Route path="/pundit" element={
                <ProtectedRoute>
                  <PunditDashboard />
                </ProtectedRoute>
              } />
              <Route path="/pundit/bookings" element={
                <ProtectedRoute>
                  <PunditBookings />
                </ProtectedRoute>
              } />
              <Route path="/pundit/profile" element={
                <ProtectedRoute>
                  <PunditProfile />
                </ProtectedRoute>
              } />
              <Route path="/pundit/earnings" element={
                <ProtectedRoute>
                  <PunditEarnings />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/services" element={
                <ProtectedRoute requireAdmin>
                  <AdminServices />
                </ProtectedRoute>
              } />
              <Route path="/admin/bookings" element={
                <ProtectedRoute requireAdmin>
                  <AdminBookings />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requireAdmin>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/temples" element={
                <ProtectedRoute requireAdmin>
                  <AdminTemples />
                </ProtectedRoute>
              } />
              <Route path="/admin/pundits" element={
                <ProtectedRoute requireAdmin>
                  <AdminPundits />
                </ProtectedRoute>
              } />
              <Route path="/admin/approvals" element={
                <ProtectedRoute requireAdmin>
                  <AdminApprovals />
                </ProtectedRoute>
              } />
              <Route path="/admin/events" element={
                <ProtectedRoute requireAdmin>
                  <AdminEvents />
                </ProtectedRoute>
              } />
              <Route path="/admin/gift-bookings" element={
                <ProtectedRoute requireAdmin>
                  <AdminGiftBookings />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute requireAdmin>
                  <AdminSettings />
                </ProtectedRoute>
              } />
              <Route path="/admin/reports" element={
                <ProtectedRoute requireAdmin>
                  <AdminReports />
                </ProtectedRoute>
              } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <WhatsAppButton phoneNumber="919876543210" />
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;