import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Layout from "./components/Layout"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import Portfolio from "./pages/Portfolio"
import Contracts from "./pages/Contracts"
import SocialScheduler from "./pages/SocialScheduler"
import Finances from "./pages/Finances"
import Analytics from "./pages/Analytics"
import EmergingArtists from "./pages/EmergingArtists"
import Marketplace from "./pages/Marketplace"
import Commissions from "./pages/Commissions"
import Messages from "./pages/Messages"
import Settings from "./pages/Settings"

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function GuestRoute({ children }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/social" element={<SocialScheduler />} />
        <Route path="/finances" element={<Finances />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/emerging" element={<EmergingArtists />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/commissions" element={<Commissions />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
