export const MISSIONS = {
  m1: {
    id: "m1",
    title: "Add your first artwork",
    description: "Upload a piece to your portfolio",
    time: "2 min",
    plans: "all",
    doneCheck: (counts) => counts.artworks >= 1,
    steps: [
      { id: "m1-nav", route: "/dashboard", target: '[data-tour="nav-portfolio"], a[href="/portfolio"]', title: "Open your Portfolio", body: "Everything starts with your work.", advanceOn: "route:/portfolio" },
      { id: "m1-add", route: "/portfolio", target: '[data-tour="add-artwork"], button:has(.lucide-plus)', title: "Add a piece", body: "A phone photo is fine.", advanceOn: "click" },
      { id: "m1-title", route: "/portfolio", target: '[data-tour="artwork-title"], input[placeholder*="Solstice"]', title: "Give it a title", body: "Upload a photo and name your work.", advanceOn: "next" },
      { id: "m1-save", route: "/portfolio", target: '[data-tour="artwork-save"], button:contains("Add Artwork")', title: "Save it", body: "Save it to your portfolio.", advanceOn: "event:artwork_saved" },
    ],
  },
  m2: {
    id: "m2",
    title: "Share your work",
    description: "Get your art in front of collectors",
    time: "1 min",
    plans: "all",
    doneCheck: (counts) => counts.viewingRooms >= 1,
    steps: [
      { id: "m2-nav", route: "/portfolio", target: 'a[href="/viewing-rooms"]', title: "Open Viewing Rooms", body: "Create a curated selection for a collector or gallery.", advanceOn: "route:/viewing-rooms" },
      { id: "m2-new", route: "/viewing-rooms", target: 'button:has(.lucide-plus)', title: "Create a room", body: "Add a title, pick your best pieces, and share the link.", advanceOn: "click" },
    ],
  },
  m3: {
    id: "m3",
    title: "Get paid",
    description: "Add a contact and send an invoice",
    time: "2 min",
    plans: "all",
    doneCheck: (counts) => counts.contacts >= 1 && counts.invoices >= 1,
    steps: [
      { id: "m3-contacts", route: "/dashboard", target: 'a[href="/contacts"]', title: "Add a contact", body: "Keep track of collectors, galleries, and collaborators.", advanceOn: "route:/contacts" },
      { id: "m3-add-contact", route: "/contacts", target: 'button:has(.lucide-plus)', title: "Add your first contact", body: "Name, email, and type — that's all you need.", advanceOn: "click" },
      { id: "m3-finances", route: "/contacts", target: 'a[href="/finances"]', title: "Now create an invoice", body: "Get paid for your work.", advanceOn: "route:/finances" },
    ],
  },
  m4: {
    id: "m4",
    title: "Look professional",
    description: "Complete your profile and CV",
    time: "2 min",
    plans: "all",
    doneCheck: (counts) => counts.hasBio || counts.hasAvatar,
    steps: [
      { id: "m4-settings", route: "/dashboard", target: 'a[href="/settings"]', title: "Update your profile", body: "Add a photo and bio so collectors know who you are.", advanceOn: "route:/settings" },
      { id: "m4-cv", route: "/settings", target: 'a[href="/cv"]', title: "Build your CV", body: "Add your exhibitions, education, and awards.", advanceOn: "route:/cv" },
    ],
  },
  m5: {
    id: "m5",
    title: "Find grants & residencies",
    description: "Get matched to funding opportunities",
    time: "1 min",
    plans: "studio",
    doneCheck: (counts) => counts.savedMatches >= 1,
    steps: [
      { id: "m5-opps", route: "/dashboard", target: 'a[href="/opportunities"]', title: "Open Opportunities", body: "Find grants, residencies, and fellowships that fit your work.", advanceOn: "route:/opportunities" },
      { id: "m5-refresh", route: "/opportunities", target: 'button:contains("Refresh")', title: "Get matched", body: "We'll match you to open opportunities based on your profile.", advanceOn: "click" },
    ],
  },
}

export const MISSION_ORDER = ["m1", "m2", "m3", "m4", "m5"]
