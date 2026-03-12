import Modal from "./Modal"

/* ------------------------------------------------------------------ */
/*  QR Code Modal — generates a printable QR code for any artwork     */
/*  Uses the free QR Server API: https://goqr.me/api/                 */
/* ------------------------------------------------------------------ */
export default function QRCodeModal({ open, onClose, artwork }) {
  if (!artwork) return null

  const artworkUrl = `${window.location.origin}/artwork/${artwork.id}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(artworkUrl)}`

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=500,height=700")
    if (!win) return
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code — ${artwork.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@400;500&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'DM Sans', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: white; }
          .card {
            text-align: center; padding: 48px 40px; border: 2px solid #E8E2DA; border-radius: 16px;
            max-width: 380px; width: 100%;
          }
          .title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600; color: #0E0C0A; margin-bottom: 4px; }
          .meta { font-size: 12px; color: #A89F94; margin-bottom: 20px; }
          .qr { margin: 0 auto 20px; }
          .qr img { width: 200px; height: 200px; }
          .label { font-size: 11px; color: #A89F94; margin-top: 16px; }
          .url { font-size: 10px; color: #C5BDB3; word-break: break-all; margin-top: 4px; }
          .brand { font-size: 10px; color: #B5651D; margin-top: 16px; letter-spacing: 1px; text-transform: uppercase; }
          @media print { body { background: white; } .card { border: none; } }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="title">${artwork.title}</div>
          <div class="meta">${artwork.medium || ""}${artwork.dimensions ? " · " + artwork.dimensions : ""}</div>
          <div class="qr"><img src="${qrUrl}" alt="QR Code" /></div>
          <div class="label">Scan to view this artwork online</div>
          <div class="url">${artworkUrl}</div>
          <div class="brand">ArtistOS</div>
        </div>
        <script>window.onload = () => window.print()</script>
      </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <Modal open={open} onClose={onClose} title="Artwork QR Code">
      <div className="text-center space-y-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "#0E0C0A" }}>{artwork.title}</h3>
          <p className="text-xs mt-0.5" style={{ color: "#A89F94" }}>
            {artwork.medium}{artwork.dimensions ? ` · ${artwork.dimensions}` : ""}
          </p>
        </div>

        <div className="flex justify-center">
          <div className="p-4 rounded-xl" style={{ background: "#FAF8F5", border: "1px solid #E8E2DA" }}>
            <img src={qrUrl} alt="QR Code" style={{ width: 200, height: 200 }} />
          </div>
        </div>

        <p className="text-xs" style={{ color: "#A89F94" }}>
          Scan this code to view the artwork detail page. Perfect for gallery labels, business cards, or portfolio prints.
        </p>

        <div className="text-[10px] px-3 py-1.5 rounded-lg inline-block" style={{ background: "#F2EDE6", color: "#A89F94", wordBreak: "break-all" }}>
          {artworkUrl}
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={handlePrint} className="btn-copper flex-1" style={{ fontSize: 13, padding: "8px 20px" }}>
            Print QR Code
          </button>
          <button onClick={onClose} className="btn-secondary flex-1" style={{ fontSize: 13, padding: "8px 16px" }}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}
