import {
  LayoutDashboard, Image, FileText, Calendar, DollarSign,
  BarChart3, Sparkles, ShoppingBag, MessageSquare, Users, Settings,
  Eye, UserCircle, ScrollText, Package, CalendarDays, Shield, Globe, Award
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
      { to: "/viewing-rooms", icon: Eye, label: "Viewing Rooms" },
      { to: "/social", icon: Calendar, label: "Social Scheduler" },
      { to: "/finances", icon: DollarSign, label: "Finances" },
      { to: "/consignments", icon: Package, label: "Consignments" },
      { to: "/exhibitions", icon: CalendarDays, label: "Exhibitions" },
      { to: "/website", icon: Globe, label: "My Website" },
    ],
  },
  {
    label: "Relationships",
    items: [
      { to: "/contacts", icon: UserCircle, label: "Contacts" },
      { to: "/commissions", icon: Users, label: "Commissions", badgeKey: "commissions" },
      { to: "/messages", icon: MessageSquare, label: "Messages", badgeKey: "messages" },
      { to: "/room/founders", icon: Users, label: "Founders' Room", founderOnly: true },
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
    ],
  },
  {
    label: "Career",
    items: [
      { to: "/opportunities", icon: Award, label: "Opportunities", badgeKey: "opportunities" },
    ],
  },
  {
    label: "Tools",
    items: [
      { to: "/cv", icon: ScrollText, label: "Artist CV" },
    ],
  },
  {
    label: "Admin",
    adminOnly: true,
    items: [
      { to: "/admin", icon: Shield, label: "Admin Panel" },
    ],
  },
]
