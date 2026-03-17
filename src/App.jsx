import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Layout from "./components/Layout"
import ErrorBoundary from "./components/ErrorBoundary"

const Landing = lazy(() => import("./pages/Landing"))
const Login = lazy(() => import("./pages/Login"))
const Signup = lazy(() => import("./pages/Signup"))
const Dashboard = lazy(() => import("./pages/Dashboard"))
const Portfolio = lazy(() => import("./pages/Portfolio"))
const Contracts = lazy(() => import("./pages/Contracts"))
const SocialScheduler = lazy(() => import("./pages/SocialScheduler"))
const Finances = lazy(() => import("./pages/Finances"))
const Analytics = lazy(() => import("./pages/Analytics"))
const EmergingArtists = lazy(() => import("./pages/EmergingArtists"))
const Marketplace = lazy(() => import("./pages/Marketplace"))
const Commissions = lazy(() => import("./pages/Commissions"))
const Messages = lazy(() => import("./pages/Messages"))
const Consignments = lazy(() => import("./pages/Consignments"))
const Exhibitions = lazy(() => import("./pages/Exhibitions"))
const Settings = lazy(() => import("./pages/Settings"))
const ArtistProfile = lazy(() => import("./pages/ArtistProfile"))
const DiscoverArtists = lazy(() => import("./pages/DiscoverArtists"))
const ViewingRooms = lazy(() => import("./pages/ViewingRooms"))
const ViewingRoom = lazy(() => import("./pages/ViewingRoom"))
const Contacts = lazy(() => import("./pages/Contacts"))
const ArtistCV = lazy(() => import("./pages/ArtistCV"))
const ArtworkDetail = lazy(() => import("./pages/ArtworkDetail"))
const PublicCV = lazy(() => import("./pages/PublicCV"))
const Upgrade = lazy(() => import("./pages/Upgrade"))
const Onboarding = lazy(() => import("./pages/Onboarding"))
const UpgradeSuccess = lazy(() => import("./pages/UpgradeSuccess"))
const Legal = lazy(() => import("./pages/Legal"))
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"))
const WebsiteBuilder = lazy(() => import("./pages/WebsiteBuilder"))
const AdminPanel = lazy(() => import("./pages/AdminPanel"))
const InvoicePaymentSuccess = lazy(() => import("./pages/InvoicePaymentSuccess"))
const InvoicePaymentCancelled = lazy(() => import("./pages/InvoicePaymentCancelled"))
const NotFound = lazy(() => import("./pages/NotFound"))

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!user.is_admin) return <Navigate to="/dashboard" replace />
  return children
}

function GuestRoute({ children }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF8F5" }}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 rounded-full border-t-transparent animate-spin mx-auto mb-3"
          style={{ borderColor: "#E8E2DA", borderTopColor: "#B5651D" }} />
        <p className="text-sm" style={{ color: "#A89F94" }}>Loading...</p>
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/artist/:userId" element={<ArtistProfile />} />
        <Route path="/artist/:userId/cv" element={<PublicCV />} />
        <Route path="/artists" element={<DiscoverArtists />} />
        <Route path="/artwork/:id" element={<ArtworkDetail />} />
        <Route path="/view/:slug" element={<ViewingRoom />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/terms" element={<Legal />} />
        <Route path="/privacy" element={<Legal />} />
        <Route path="/invoice/success" element={<InvoicePaymentSuccess />} />
        <Route path="/invoice/cancelled" element={<InvoicePaymentCancelled />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/upgrade/success" element={<ProtectedRoute><UpgradeSuccess /></ProtectedRoute>} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/viewing-rooms" element={<ViewingRooms />} />
          <Route path="/social" element={<SocialScheduler />} />
          <Route path="/finances" element={<Finances />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/emerging" element={<EmergingArtists />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/commissions" element={<Commissions />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/cv" element={<ArtistCV />} />
          <Route path="/consignments" element={<Consignments />} />
          <Route path="/exhibitions" element={<Exhibitions />} />
          <Route path="/website" element={<WebsiteBuilder />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0E0C0A',
              color: '#FAF8F5',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontFamily: "'DM Sans', sans-serif",
              padding: '12px 16px',
              border: '1px solid rgba(255,255,255,0.08)',
            },
            success: {
              iconTheme: { primary: '#D4854A', secondary: '#FAF8F5' },
            },
            error: {
              iconTheme: { primary: '#C4705A', secondary: '#FAF8F5' },
              duration: 4000,
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
    </ErrorBoundary>
  )
}
