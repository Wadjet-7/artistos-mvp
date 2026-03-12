import { useState } from "react"
import Modal from "./Modal"
import { Download, Award } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Certificate of Authenticity Generator                              */
/* ------------------------------------------------------------------ */
export default function CertificateModal({ open, onClose, artwork, artistName }) {
  const [edition, setEdition] = useState("")
  const [notes, setNotes] = useState("")

  // Generate a deterministic certificate number from artwork id
  const certNumber = artwork
    ? `COA-${new Date(artwork.created_at || Date.now()).getFullYear()}-${(artwork.id || "").slice(0, 8).toUpperCase()}`
    : ""

  const year = artwork?.created_at
    ? new Date(artwork.created_at).getFullYear()
    : new Date().getFullYear()

  const handleDownload = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Certificate of Authenticity — ${artwork?.title || "Artwork"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'DM Sans', sans-serif;
      max-width: 680px;
      margin: 60px auto;
      padding: 0 40px;
      color: #333;
    }
    .border-frame {
      border: 2px solid #B5651D;
      padding: 48px 40px;
      position: relative;
    }
    .border-frame::before {
      content: '';
      position: absolute;
      inset: 4px;
      border: 1px solid #E8E2DA;
      pointer-events: none;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .header .icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;
      border: 2px solid #B5651D;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      color: #B5651D;
    }
    .header h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #0E0C0A;
      margin-bottom: 4px;
    }
    .header .subtitle {
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #A89F94;
    }
    .divider {
      height: 2px;
      background: linear-gradient(to right, transparent, #B5651D, transparent);
      margin: 24px 0;
    }
    .artwork-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 26px;
      font-weight: 600;
      text-align: center;
      color: #0E0C0A;
      margin-bottom: 8px;
      font-style: italic;
    }
    .artwork-meta {
      text-align: center;
      font-size: 13px;
      color: #A89F94;
      margin-bottom: 32px;
    }
    .details {
      margin-bottom: 32px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #F2EDE6;
      font-size: 13px;
    }
    .detail-row .label {
      color: #A89F94;
      font-weight: 500;
    }
    .detail-row .value {
      color: #0E0C0A;
      font-weight: 500;
      text-align: right;
    }
    .cert-body {
      font-size: 13px;
      line-height: 1.8;
      color: #555;
      text-align: center;
      margin-bottom: 32px;
    }
    ${notes ? `.notes {
      font-size: 12px;
      line-height: 1.6;
      color: #777;
      padding: 16px;
      background: #FAF8F5;
      border-radius: 8px;
      margin-bottom: 32px;
      font-style: italic;
    }` : ""}
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 60px;
    }
    .sig-block {
      text-align: center;
      width: 45%;
    }
    .sig-line {
      border-top: 1px solid #999;
      padding-top: 8px;
      font-size: 12px;
      color: #666;
      margin-top: 48px;
    }
    .sig-date {
      font-size: 10px;
      color: #A89F94;
      margin-top: 4px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      font-size: 10px;
      color: #C5BDB3;
      letter-spacing: 1px;
    }
    @media print {
      body { margin: 40px auto; }
    }
  </style>
</head>
<body>
  <div class="border-frame">
    <div class="header">
      <div class="icon">\u2605</div>
      <h1>Certificate of Authenticity</h1>
      <div class="subtitle">Original Artwork Certification</div>
    </div>

    <div class="divider"></div>

    <div class="artwork-title">${artwork?.title || "Untitled"}</div>
    <div class="artwork-meta">
      ${artwork?.medium || ""}${artwork?.dimensions ? ` \u00B7 ${artwork.dimensions}` : ""}${year ? ` \u00B7 ${year}` : ""}
    </div>

    <div class="details">
      <div class="detail-row">
        <span class="label">Certificate Number</span>
        <span class="value">${certNumber}</span>
      </div>
      ${edition ? `<div class="detail-row">
        <span class="label">Edition</span>
        <span class="value">${edition}</span>
      </div>` : ""}
      <div class="detail-row">
        <span class="label">Artist</span>
        <span class="value">${artistName || "Artist"}</span>
      </div>
      ${artwork?.medium ? `<div class="detail-row">
        <span class="label">Medium</span>
        <span class="value">${artwork.medium}</span>
      </div>` : ""}
      ${artwork?.dimensions ? `<div class="detail-row">
        <span class="label">Dimensions</span>
        <span class="value">${artwork.dimensions}</span>
      </div>` : ""}
      <div class="detail-row">
        <span class="label">Date of Certification</span>
        <span class="value">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
      </div>
    </div>

    <div class="cert-body">
      This certifies that the above-described work is an original creation by
      <strong>${artistName || "the artist"}</strong>.
      The artist warrants that this work is authentic, original, and was created solely by the artist.
      This certificate accompanies the work and should be retained for provenance documentation.
    </div>

    ${notes ? `<div class="notes"><strong>Notes / Provenance:</strong><br/>${notes.replace(/\n/g, "<br/>")}</div>` : ""}

    <div class="signatures">
      <div class="sig-block">
        <div class="sig-line">Artist Signature</div>
        <div class="sig-date">${artistName || ""}</div>
      </div>
      <div class="sig-block">
        <div class="sig-line">Date</div>
        <div class="sig-date">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
      </div>
    </div>

    <div class="footer">Generated with ArtistOS</div>
  </div>
</body>
</html>`)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 400)
  }

  if (!artwork) return null

  return (
    <Modal open={open} onClose={onClose} title="Certificate of Authenticity" wide>
      <div className="space-y-4">
        {/* Preview banner */}
        <div className="rounded-xl p-4 text-center" style={{ background: "#0E0C0A" }}>
          <Award size={28} className="mx-auto mb-2" style={{ color: "#B5651D" }} />
          <h3 className="font-serif text-lg font-semibold mb-1" style={{ color: "#FAF8F5" }}>{artwork.title}</h3>
          <p className="text-xs" style={{ color: "#A89F94" }}>
            {artwork.medium}{artwork.dimensions ? ` · ${artwork.dimensions}` : ""}
          </p>
        </div>

        {/* Certificate details */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Certificate Number</label>
            <input type="text" value={certNumber} readOnly
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ borderColor: "#E8E2DA", background: "#FAF8F5", color: "#A89F94" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Edition (optional)</label>
            <input type="text" value={edition} onChange={e => setEdition(e.target.value)}
              placeholder="e.g. 1 of 10, Artist Proof"
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ borderColor: "#E8E2DA" }} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Additional Notes / Provenance</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Provenance, exhibition history, special materials used..."
            rows={3} className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
            style={{ borderColor: "#E8E2DA" }} />
        </div>

        {/* Info */}
        <div className="text-xs rounded-lg p-3" style={{ background: "#FAF8F5", color: "#A89F94" }}>
          The certificate will include artwork details, your name as the certifying artist, signature lines, and today's date.
          A print dialog will open for you to save as PDF or print.
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary" style={{ fontSize: 13, padding: "8px 16px" }}>Cancel</button>
          <button onClick={handleDownload} className="btn-copper flex items-center gap-2" style={{ fontSize: 13, padding: "8px 20px" }}>
            <Download size={15} /> Download PDF
          </button>
        </div>
      </div>
    </Modal>
  )
}
