import toast from "react-hot-toast"

/* ------------------------------------------------------------------ */
/*  Appraisal & Insurance Report PDF — opens print dialog              */
/*  Phase 23b                                                          */
/* ------------------------------------------------------------------ */
export function generateAppraisalPDF(artist, artworks, mode = "portfolio") {
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    toast.error("Please allow pop-ups to generate appraisal PDF")
    return
  }

  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const fmt = (v) =>
    parseFloat(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })

  const extractYear = (dateStr) => {
    if (!dateStr) return "N/A"
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? "N/A" : d.getFullYear()
  }

  /* ---- Build artwork rows ---- */
  const items = mode === "single" ? artworks.slice(0, 1) : artworks

  const artworkRows = items
    .map(
      (a, i) => `
      <tr>
        <td class="row-num">${i + 1}</td>
        <td>
          <div class="artwork-title">${a.title || "Untitled"}</div>
          <div class="artwork-meta">${[a.medium, a.dimensions].filter(Boolean).join(" | ")}</div>
        </td>
        <td class="year-col">${extractYear(a.created_at)}</td>
        <td class="value-col">$${fmt(a.appraised_value || a.price)}</td>
      </tr>`
    )
    .join("")

  const totalValue = items.reduce(
    (sum, a) => sum + (parseFloat(a.appraised_value || a.price) || 0),
    0
  )

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Appraisal Report — ${artist.name || "Artist"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500&family=DM+Mono&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'DM Sans', sans-serif;
      max-width: 680px;
      margin: 50px auto;
      padding: 0 32px;
      color: #0E0C0A;
      font-size: 13px;
      background: #fff;
    }

    /* ---- Header ---- */
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #B5651D;
    }
    .header h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 700;
      color: #0E0C0A;
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    .header .subtitle {
      font-size: 12px;
      color: #A89F94;
      margin-top: 6px;
    }

    /* ---- Artist block ---- */
    .artist-block {
      margin-bottom: 32px;
      padding: 16px;
      background: #FAF8F5;
      border-radius: 8px;
    }
    .artist-block h3 {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #A89F94;
      margin-bottom: 8px;
    }
    .artist-block .name {
      font-size: 15px;
      font-weight: 600;
      color: #0E0C0A;
      margin-bottom: 2px;
    }
    .artist-block .detail {
      font-size: 12px;
      color: #777;
    }

    /* ---- Table ---- */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      text-align: left;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #A89F94;
      padding: 10px 0;
      border-bottom: 1px solid #E8E2DA;
    }
    th.value-col, td.value-col {
      text-align: right;
    }
    th.year-col, td.year-col {
      text-align: center;
      width: 60px;
    }
    td {
      padding: 14px 0;
      border-bottom: 1px solid #F2EDE6;
      font-size: 13px;
      vertical-align: top;
    }
    td.row-num {
      width: 30px;
      color: #A89F94;
      font-size: 11px;
    }
    .artwork-title {
      font-weight: 500;
      color: #0E0C0A;
    }
    .artwork-meta {
      font-size: 11px;
      color: #A89F94;
      margin-top: 2px;
    }
    .value-col {
      font-family: 'DM Mono', monospace;
      font-weight: 500;
    }

    /* ---- Total ---- */
    .total-row {
      display: flex;
      justify-content: flex-end;
      padding: 16px 0;
      border-top: 2px solid #0E0C0A;
      margin-top: 8px;
    }
    .total-row .label {
      font-size: 14px;
      font-weight: 600;
      color: #0E0C0A;
      margin-right: 40px;
    }
    .total-row .amount {
      font-family: 'DM Mono', monospace;
      font-size: 20px;
      font-weight: 700;
      color: #B5651D;
    }

    /* ---- Disclaimer ---- */
    .disclaimer {
      margin-top: 40px;
      padding: 16px;
      background: #FAF8F5;
      border-left: 3px solid #B5651D;
      border-radius: 4px;
      font-size: 11px;
      color: #777;
      line-height: 1.7;
    }

    /* ---- Footer ---- */
    .footer {
      margin-top: 48px;
      text-align: center;
      font-size: 10px;
      color: #C5BDB3;
    }

    @media print { body { margin: 30px auto; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Appraisal &amp; Insurance Valuation</h1>
    <div class="subtitle">${artist.name || "Artist"} &middot; ${generatedDate}</div>
  </div>

  <div class="artist-block">
    <h3>Artist</h3>
    <div class="name">${artist.name || "Artist"}</div>
    ${artist.location ? `<div class="detail">${artist.location}</div>` : ""}
    ${artist.email ? `<div class="detail">${artist.email}</div>` : ""}
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Artwork</th>
        <th class="year-col">Year</th>
        <th class="value-col">Appraised Value</th>
      </tr>
    </thead>
    <tbody>
      ${artworkRows}
    </tbody>
  </table>

  <div class="total-row">
    <span class="label">Total Appraised Value</span>
    <span class="amount">$${fmt(totalValue)}</span>
  </div>

  <div class="disclaimer">
    This document is a self-prepared inventory valuation for insurance and record-keeping purposes. It is not a certified independent appraisal. For insurance claims or estate purposes, consult a qualified appraiser.
  </div>

  <div class="footer">Generated with ArtistOS</div>
</body>
</html>`)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => printWindow.print(), 400)
}
