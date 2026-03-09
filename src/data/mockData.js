export const revenueData = [
  { month: "Sep", revenue: 3800 },
  { month: "Oct", revenue: 4200 },
  { month: "Nov", revenue: 3900 },
  { month: "Dec", revenue: 5200 },
  { month: "Jan", revenue: 5800 },
  { month: "Feb", revenue: 6840 },
]

export const artworks = [
  { id: 1, title: "Solstice No. 3", medium: "Oil on Canvas", tag: "Oil", price: 2400, status: "Available", dimensions: '36×48"', seed: 17 },
  { id: 2, title: "Forest Dreams", medium: "Acrylic", tag: "Acrylic", price: 1800, status: "Sold", dimensions: '24×30"', seed: 34 },
  { id: 3, title: "Urban Rhythm", medium: "Mixed Media", tag: "Mixed Media", price: 3200, status: "Available", dimensions: '40×50"', seed: 51 },
  { id: 4, title: "Golden Hour", medium: "Photography", tag: "Photography", price: 950, status: "Available", dimensions: '20×30"', seed: 68 },
  { id: 5, title: "Silent Echo", medium: "Sculpture", tag: "Sculpture", price: 4500, status: "Available", dimensions: "Unique", seed: 85 },
]

export const dashboardCommissions = [
  { id: 1, client: "David K.", title: "Abstract Triptych", desc: '60×40" each panel · Oil on canvas', amount: "$4,200", status: "In Progress", statusColor: "badge-gold", emoji: "🎨", bg: "#F5E6D8" },
  { id: 2, client: "Sarah M.", title: "Portrait Commission", desc: '18×24" · Mixed media', amount: "$1,800", status: "Review", statusColor: "badge-copper", emoji: "🖼️", bg: "#E8F2EA" },
  { id: 3, client: "The Meridian Hotel", title: "Lobby Art", desc: "Large format · Acrylic", amount: "$12,500", status: "Quoted", statusColor: "badge-forest", emoji: "🌿", bg: "#F5E2DC" },
]

export const recentActivity = [
  { type: "commission", text: "Contract signed — Alex Rivera", time: "2 hours ago", dotColor: "#4A7A57" },
  { type: "commission", text: "New commission request from The Meridian Hotel", time: "5 hours ago", dotColor: "#B5651D" },
  { type: "social", text: '"Solstice No. 3" liked 14 times on Instagram', time: "Yesterday", dotColor: "#C9A84C" },
  { type: "invoice", text: "Payment received — $1,260 deposit from David K.", time: "2 days ago", dotColor: "#C4705A" },
  { type: "analytics", text: "Your abstract style is trending — +23% this quarter", time: "3 days ago", dotColor: "#A89F94" },
]

export const recentContracts = [
  { client: "Alex Rivera", type: "Commission", status: "Signed", statusColor: "badge-forest", amount: "$3,200" },
  { client: "Gallery Nord", type: "Consignment", status: "Pending", statusColor: "badge-gold", amount: "—" },
  { client: "James Wu", type: "Direct Sale", status: "Signed", statusColor: "badge-forest", amount: "$1,800" },
]

export const scheduledPosts = [
  { id: 1, artwork: "Solstice No. 3", caption: "Finding stillness in movement... #abstractart #oilpainting", platform: "Instagram", platformColor: "badge-copper", scheduled: "Feb 23 · 7:00 PM", status: "Today", statusColor: "badge-gold" },
  { id: 2, artwork: "Urban Rhythm", caption: "The city breathes differently at dusk #mixedmedia", platform: "Instagram", platformColor: "badge-copper", scheduled: "Feb 24 · 6:00 PM", status: "Scheduled", statusColor: "badge-grey" },
  { id: 3, artwork: "New Work WIP", caption: "Process shot — studio visit this weekend!", platform: "Facebook", platformColor: "badge-forest", scheduled: "Feb 27 · 3:00 PM", status: "Scheduled", statusColor: "badge-grey" },
]

export const platformStats = [
  { name: "📷 Instagram", followers: "12.4K", percentage: 78, color: "#B5651D" },
  { name: "𝕏 Twitter/X", followers: "3,210", percentage: 42, color: "#2D4A35" },
  { name: "📘 Facebook", followers: "2,840", percentage: 35, color: "#C4705A" },
]

export const invoices = [
  { id: 1, client: "David Kim", description: "Commission Deposit — Abstract Triptych", amount: "$1,260", date: "Feb 20", status: "Paid", statusColor: "badge-forest" },
  { id: 2, client: "Alex Rivera", description: "Final Payment — Portrait", amount: "$1,600", date: "Feb 18", status: "Overdue", statusColor: "badge-rose" },
  { id: 3, client: "Gallery Nord", description: 'Consignment Sale — "Solstice No. 1"', amount: "$1,800", date: "Feb 10", status: "Paid", statusColor: "badge-forest" },
  { id: 4, client: "Sarah M.", description: "Commission Balance — Portrait", amount: "$900", date: "Feb 5", status: "Pending", statusColor: "badge-gold" },
]

export const styleMarketTrends = [
  { style: "Abstract", change: "+23%", percentage: 85, color: "#B5651D", positive: true },
  { style: "Portrait", change: "+14%", percentage: 62, color: "#2D4A35", positive: true },
  { style: "Landscape", change: "−5%", percentage: 38, color: "#C4705A", positive: false },
  { style: "Digital Art", change: "+41%", percentage: 95, color: "#C9A84C", positive: true },
]

export const emergingArtists = [
  { id: 1, rank: 1, name: "Elena Voss", style: "Abstract Expressionism · Berlin", growth: "+245%", match: "98%", seed: 138 },
  { id: 2, rank: 2, name: "Marcus Chen", style: "Neo-Figurative · New York", growth: "+189%", match: "94%", seed: 161 },
  { id: 3, rank: 3, name: "Sofia Reyes", style: "Sculpture & Installation · Mexico City", growth: "+156%", match: "91%", seed: 184 },
  { id: 4, rank: 4, name: "Kai Tanaka", style: "Digital Abstraction · Tokyo", growth: "+132%", match: "87%", seed: 207 },
  { id: 5, rank: 5, name: "Amara Osei", style: "Mixed Media & Textile · Accra", growth: "+118%", match: "85%", seed: 230 },
]

export const marketplaceArtists = [
  { id: 1, name: "Maya Chen", style: "Abstract · Oil & Mixed Media", rating: 4.9, reviews: 24, priceRange: "$1,800–6,000", tags: ["Abstract", "Oil", "NYC"], status: "Accepting", statusColor: "badge-forest", gradient: "linear-gradient(135deg,#B5651D,#C4705A)", initial: "M", seed: 62 },
  { id: 2, name: "James Wu", style: "Portrait · Charcoal & Pastel", rating: 4.8, reviews: 18, priceRange: "$800–3,500", tags: ["Portrait", "Figurative", "SF"], status: "Accepting", statusColor: "badge-forest", gradient: "linear-gradient(135deg,#2D4A35,#4A7A57)", initial: "J", seed: 93 },
  { id: 3, name: "Elena Voss", style: "Abstract Expressionism · Sculpture", rating: 5.0, reviews: 12, priceRange: "$3,000–15,000", tags: ["Abstract", "Sculpture", "Berlin"], status: "Waitlist 2mo", statusColor: "badge-gold", gradient: "linear-gradient(135deg,#C4705A,#D4854A)", initial: "E", seed: 124 },
  { id: 4, name: "Amara Osei", style: "Textile & Mixed Media", rating: 4.7, reviews: 8, priceRange: "$1,200–8,000", tags: ["Textile", "Mixed", "Accra"], status: "Accepting", statusColor: "badge-forest", gradient: "linear-gradient(135deg,#6B4A10,#B5651D)", initial: "A", seed: 155 },
  { id: 5, name: "Kai Tanaka", style: "Digital Abstraction · Prints", rating: 4.9, reviews: 31, priceRange: "$400–2,500", tags: ["Digital", "Print", "Tokyo"], status: "Accepting", statusColor: "badge-forest", gradient: "linear-gradient(135deg,#1A2E20,#2D4A35)", initial: "K", seed: 186 },
  { id: 6, name: "Sofia Reyes", style: "Installation & Sculpture", rating: 4.8, reviews: 15, priceRange: "$5,000–30,000", tags: ["Sculpture", "Site-specific"], status: "Not Accepting", statusColor: "badge-rose", gradient: "linear-gradient(135deg,#8A4A3A,#C4705A)", initial: "S", seed: 217 },
]

export const activeCommissions = [
  { id: 1, client: "David Kim", email: "david.k@example.com", title: "Abstract Triptych", desc: '3× 60×40" · Oil on canvas', due: "Apr 15", value: "$4,200", status: "In Progress", statusColor: "badge-gold", milestone: "Sketches approved", progress: 45 },
  { id: 2, client: "Sarah M.", email: "sarah.m@example.com", title: "Portrait Commission", desc: '18×24" · Mixed media', due: "Mar 1", value: "$1,800", status: "Review", statusColor: "badge-copper", milestone: "Awaiting approval", progress: 85 },
  { id: 3, client: "Meridian Hotel", email: "art@meridian.com", title: "Lobby Installation", desc: "Large format · Acrylic", due: "Jun 30", value: "$12,500", status: "Quoted", statusColor: "badge-forest", milestone: "Contract pending", progress: 10 },
]

export const pendingCommissions = [
  { id: 1, collector: "Rebecca T.", request: 'Abstract piece, blues & golds, 36×48"', budget: "$2–5K", received: "Feb 22" },
  { id: 2, collector: "Thomas N.", request: "Family portrait, 5 people, outdoors", budget: "$1–2K", received: "Feb 21" },
]

export const conversations = [
  {
    id: "david", name: "David Kim", initial: "D", gradient: "linear-gradient(135deg,#B5651D,#C4705A)",
    preview: "Can we schedule a call to discuss the third panel?", time: "2h ago", unread: 2, online: true,
    messages: [
      { from: "them", text: "Hey Maya! The first two panels look incredible. Can we discuss the color palette for the third?", time: "10:24 AM" },
      { from: "me", text: "Absolutely! I was thinking we lean into warmer golds to balance the cooler blues in panels 1 and 2. I'll send some reference swatches.", time: "11:02 AM" },
      { from: "them", text: "That sounds perfect. Can we schedule a call to discuss the third panel in more detail?", time: "2:18 PM" },
    ],
  },
  {
    id: "sarah", name: "Sarah M.", initial: "S", gradient: "linear-gradient(135deg,#2D4A35,#4A7A57)",
    preview: "Looks amazing! Just one small...", time: "1d ago", unread: 0, online: false,
    messages: [
      { from: "me", text: "Hi Sarah! Here's the latest progress shot of the portrait. Let me know your thoughts.", time: "Yesterday 3:15 PM" },
      { from: "them", text: "Looks amazing! Just one small change — could the background be a bit warmer?", time: "Yesterday 5:40 PM" },
    ],
  },
  {
    id: "gallery", name: "Gallery Nord", initial: "G", gradient: "linear-gradient(135deg,#6B4A10,#B5651D)",
    preview: "Please review the consignment terms", time: "3d ago", unread: 0, online: false,
    messages: [
      { from: "them", text: "Hi Maya, we'd love to feature 3 of your pieces in our spring exhibition. Please review the consignment terms attached.", time: "3 days ago" },
    ],
  },
]

export const contractTemplates = [
  { id: 1, name: "Commission Agreement", category: "Commission", description: "Standard agreement for commissioned artwork including payment terms, timeline, and usage rights.", fileType: "PDF", fileSize: "42 KB", uploadDate: "2024-01-15", downloads: 24, favorite: true, author: "ArtistOS" },
  { id: 2, name: "Art Licensing Agreement", category: "Licensing", description: "Template for licensing artwork for reproduction, prints, or commercial use with royalty terms.", fileType: "PDF", fileSize: "38 KB", uploadDate: "2024-01-20", downloads: 18, favorite: false, author: "ArtistOS" },
  { id: 3, name: "Non-Disclosure Agreement", category: "NDA", description: "Protect confidential project details when discussing commissions with new clients.", fileType: "DOCX", fileSize: "28 KB", uploadDate: "2024-02-01", downloads: 31, favorite: true, author: "ArtistOS" },
  { id: 4, name: "Work for Hire Contract", category: "Work for Hire", description: "Agreement where client retains full ownership of the commissioned work upon completion.", fileType: "PDF", fileSize: "45 KB", uploadDate: "2024-02-05", downloads: 12, favorite: false, author: "ArtistOS" },
  { id: 5, name: "Gallery Consignment Agreement", category: "Gallery", description: "Terms for consigning artwork to a gallery including commission rates, insurance, and display period.", fileType: "PDF", fileSize: "51 KB", uploadDate: "2024-02-10", downloads: 9, favorite: false, author: "ArtistOS" },
  { id: 6, name: "Invoice Payment Terms", category: "Invoice", description: "Standard payment terms template to attach to invoices covering late fees and payment methods.", fileType: "DOCX", fileSize: "18 KB", uploadDate: "2024-02-14", downloads: 15, favorite: true, author: "Maya Chen" },
]
