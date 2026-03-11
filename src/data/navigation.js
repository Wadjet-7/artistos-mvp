import {
  LayoutDashboard, Image, FileText, Calendar, DollarSign,
  BarChart3, Sparkles, ShoppingBag, MessageSquare, Users, Settings
} from "lucide-react"

export const navSections = [
  {
    label: "Overview",
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "Business Hub",
    items: [
      { to: "/portfolio", icon: Image, label: "Portfolio" },
      { to: "/contracts", icon: FileText, label: "Contracts" },
      { to: "/social", icon: Calendar, label: "Social Scheduler" },
      { to: "/finances", icon: DollarSign, label: "Finances" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { to: "/analytics", icon: BarChart3, label: "Market Analytics" },
      { to: "/emerging", icon: Sparkles, label: "Emerging Artists" },
    ],
  },
  {
    label: "Marketplace",
    items: [
      { to: "/marketplace", icon: ShoppingBag, label: "Discover Artists" },
      { to: "/commissions", icon: Users, label: "Commissions", badge: 3 },
      { to: "/messages", icon: MessageSquare, label: "Messages", badge: 2 },
    ],
  },
]
