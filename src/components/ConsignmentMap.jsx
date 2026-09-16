import { useState, useEffect, useCallback } from "react"
import { supabase } from "../lib/supabase"
import toast from "react-hot-toast"
import {
  Loader2, Home, Building2, CalendarDays, User, Archive, Truck,
  MapPin, Image, ChevronDown, ChevronUp, DollarSign
} from "lucide-react"
import PageError from "./PageError"

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const locationTypeIcons = {
  studio:     Home,
  gallery:    Building2,
  exhibition: CalendarDays,
  collector:  User,
  storage:    Archive,
  in_transit: Truck,
}

const locationTypeLabels = {
  studio:     "Studio",
  gallery:    "Gallery",
  exhibition: "Exhibition",
  collector:  "Collector",
  storage:    "Storage",
  in_transit: "In Transit",
}

function getLocationIcon(type) {
  return locationTypeIcons[type] || MapPin
}

function formatCurrency(value) {
  if (!value && value !== 0) return "$0"
  return "$" + Number(value).toLocaleString()
}

/* ------------------------------------------------------------------ */
/*  Location Card                                                      */
/* ------------------------------------------------------------------ */
function LocationCard({ location, type, artworks }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = getLocationIcon(type)
  const totalValue = artworks.reduce((sum, a) => sum + (parseFloat(a.price) || 0), 0)

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E8E2DA" }}>
      {/* Card header — clickable */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="w-full flex items-center gap-3 p-4 text-left transition-colors"
        style={{ background: expanded ? "#FAF8F5" : "white" }}
      >
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "#F2EDE6" }}>
          <Icon size={18} style={{ color: "#B5651D" }} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold truncate" style={{ color: "#0E0C0A" }}>
            {location || "Unknown Location"}
          </h4>
          <p className="text-xs mt-0.5" style={{ color: "#A89F94" }}>
            {locationTypeLabels[type] || "Other"} &middot; {artworks.length} piece{artworks.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="text-right flex-shrink-0 mr-2">
          <p className="text-sm font-semibold" style={{ color: "#0E0C0A" }}>
            {formatCurrency(totalValue)}
          </p>
        </div>

        {expanded
          ? <ChevronUp size={16} style={{ color: "#A89F94" }} />
          : <ChevronDown size={16} style={{ color: "#A89F94" }} />
        }
      </button>

      {/* Expanded artwork list */}
      {expanded && (
        <div className="px-4 pb-4 space-y-2" style={{ borderTop: "1px solid #E8E2DA" }}>
          {artworks.map(a => (
            <div key={a.id} className="flex items-center gap-3 py-2">
              {/* Thumbnail */}
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                style={{ background: "#F2EDE6", border: "1px solid #E8E2DA" }}>
                {a.image_url ? (
                  <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                ) : (
                  <Image size={16} style={{ color: "#C5BDB3" }} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "#0E0C0A" }}>{a.title}</p>
                <p className="text-[11px] truncate" style={{ color: "#A89F94" }}>{a.medium || "No medium"}</p>
              </div>

              {/* Price + status */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-medium" style={{ color: "#0E0C0A" }}>
                  {formatCurrency(a.price)}
                </p>
                {a.status && (
                  <span className="text-[10px]" style={{ color: "#A89F94", textTransform: "capitalize" }}>
                    {a.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function ConsignmentMap({ userId }) {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  const fetchArtworks = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setFetchError(false)
    try {
      const { data, error } = await supabase
        .from("artworks")
        .select("id, title, medium, price, status, image_url, current_location, current_location_type")
        .eq("user_id", userId)
        .order("title")
      if (error) throw error
      setArtworks(data || [])
    } catch (err) {
      console.error("[ConsignmentMap] fetch error:", err)
      toast.error("Could not load artwork locations")
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchArtworks() }, [fetchArtworks])

  /* ---- group by location ---- */
  const grouped = {}
  artworks.forEach(a => {
    const loc = a.current_location || "Unspecified"
    if (!grouped[loc]) grouped[loc] = { type: a.current_location_type || "studio", items: [] }
    grouped[loc].items.push(a)
  })

  /* ---- summary counts ---- */
  const studioCount    = artworks.filter(a => a.current_location_type === "studio").length
  const galleryCount   = artworks.filter(a => a.current_location_type === "gallery").length
  const exhibCount     = artworks.filter(a => a.current_location_type === "exhibition").length
  const soldCount      = artworks.filter(a => (a.status || "").toLowerCase() === "sold").length
  const totalValue     = artworks.reduce((s, a) => s + (parseFloat(a.price) || 0), 0)

  const locationEntries = Object.entries(grouped).sort((a, b) => b[1].items.length - a[1].items.length)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold" style={{ color: "#0E0C0A" }}>Where Is Everything</h2>
        <p className="text-xs mt-1" style={{ color: "#A89F94" }}>
          Artworks grouped by their current location
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="stat-card copper">
          <div className="stat-label">In Studio</div>
          <div className="stat-value">{studioCount}</div>
          <div className="stat-icon"><Home size={18} /></div>
        </div>
        <div className="stat-card forest">
          <div className="stat-label">On Consignment</div>
          <div className="stat-value">{galleryCount}</div>
          <div className="stat-icon"><Building2 size={18} /></div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">In Exhibitions</div>
          <div className="stat-value">{exhibCount}</div>
          <div className="stat-icon"><CalendarDays size={18} /></div>
        </div>
        <div className="stat-card rose">
          <div className="stat-label">Sold</div>
          <div className="stat-value">{soldCount}</div>
          <div className="stat-icon"><User size={18} /></div>
        </div>
        <div className="stat-card" style={{ gridColumn: "span 2" }}>
          <div className="stat-label">Total Portfolio Value</div>
          <div className="stat-value">{formatCurrency(totalValue)}</div>
          <div className="stat-icon"><DollarSign size={18} /></div>
        </div>
      </div>

      {/* Error state */}
      {fetchError && !loading && (
        <PageError message="Could not load artwork locations. Please check your connection and try again." onRetry={fetchArtworks} />
      )}

      {/* Loading state */}
      {!fetchError && loading && (
        <div className="text-center py-16">
          <Loader2 size={28} className="animate-spin mx-auto mb-3" style={{ color: "#B5651D" }} />
          <p className="text-sm" style={{ color: "#A89F94" }}>Loading locations...</p>
        </div>
      )}

      {/* Empty state */}
      {!fetchError && !loading && artworks.length === 0 && (
        <div className="text-center py-16 rounded-xl" style={{ background: "white", border: "1px solid #E8E2DA" }}>
          <MapPin size={36} className="mx-auto mb-3" style={{ color: "#E8E2DA" }} />
          <h3 className="font-serif text-lg font-semibold mb-1" style={{ color: "#0E0C0A" }}>
            No artworks yet
          </h3>
          <p className="text-sm" style={{ color: "#A89F94" }}>
            Add artworks to your portfolio to see where everything is.
          </p>
        </div>
      )}

      {/* Location cards */}
      {!fetchError && !loading && artworks.length > 0 && (
        <div className="space-y-3">
          {locationEntries.map(([location, { type, items }]) => (
            <LocationCard
              key={location}
              location={location}
              type={type}
              artworks={items}
            />
          ))}
        </div>
      )}
    </div>
  )
}
