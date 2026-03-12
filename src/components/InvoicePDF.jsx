import toast from "react-hot-toast"

/* ------------------------------------------------------------------ */
/*  Invoice PDF Generator — opens print dialog                        */
/* ------------------------------------------------------------------ */
export function generateInvoicePDF({ invoice, artistName, artistLocation, artistEmail }) {
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    toast.error("Please allow pop-ups to generate invoice PDF")
    return
  }

  const invNumber = `INV-${new Date(invoice.created_at || Date.now()).getFullYear()}-${(invoice.id || "").slice(0, 8).toUpperCase()}`
  const issueDate = new Date(invoice.created_at || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  const dueDate = invoice.due_date
    ? new Date(invoice.due_date + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "Upon receipt"

  const amount = parseFloat(invoice.amount) || 0

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Invoice ${invNumber} — ${invoice.client_name || "Client"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500&family=DM+Mono&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'DM Sans', sans-serif;
      max-width: 680px;
      margin: 50px auto;
      padding: 0 32px;
      color: #333;
      font-size: 13px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #B5651D;
    }
    .header .brand {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 700;
      color: #0E0C0A;
    }
    .header .brand-sub {
      font-size: 11px;
      color: #A89F94;
      margin-top: 4px;
    }
    .header .inv-label {
      text-align: right;
    }
    .header .inv-label h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 32px;
      font-weight: 700;
      color: #B5651D;
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    .header .inv-label .inv-number {
      font-family: 'DM Mono', monospace;
      font-size: 12px;
      color: #A89F94;
      margin-top: 4px;
    }
    .parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 32px;
    }
    .party h3 {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #A89F94;
      margin-bottom: 8px;
    }
    .party .name {
      font-size: 15px;
      font-weight: 600;
      color: #0E0C0A;
      margin-bottom: 2px;
    }
    .party .detail {
      font-size: 12px;
      color: #777;
    }
    .dates {
      display: flex;
      gap: 40px;
      margin-bottom: 32px;
      padding: 16px;
      background: #FAF8F5;
      border-radius: 8px;
    }
    .dates .item {
      font-size: 12px;
    }
    .dates .item .label {
      color: #A89F94;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .dates .item .value {
      font-weight: 500;
      color: #0E0C0A;
    }
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
    th:last-child, td:last-child {
      text-align: right;
    }
    td {
      padding: 14px 0;
      border-bottom: 1px solid #F2EDE6;
      font-size: 13px;
    }
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
    .status-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-paid { background: #E8F5E9; color: #2D4A35; }
    .status-pending { background: #FBF2DC; color: #8A6A1A; }
    .status-overdue { background: #F5E2DC; color: #C4705A; }
    .status-draft { background: #F2EDE6; color: #A89F94; }
    .notes {
      margin-top: 32px;
      padding: 16px;
      background: #FAF8F5;
      border-radius: 8px;
      font-size: 12px;
      color: #777;
      line-height: 1.6;
    }
    .notes strong { color: #0E0C0A; }
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
    <div>
      <div class="brand">${artistName || "Artist"}</div>
      <div class="brand-sub">${[artistLocation, artistEmail].filter(Boolean).join(" · ")}</div>
    </div>
    <div class="inv-label">
      <h1>Invoice</h1>
      <div class="inv-number">${invNumber}</div>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>From</h3>
      <div class="name">${artistName || "Artist"}</div>
      ${artistLocation ? `<div class="detail">${artistLocation}</div>` : ""}
    </div>
    <div class="party" style="text-align: right;">
      <h3>Bill To</h3>
      <div class="name">${invoice.client_name || "Client"}</div>
    </div>
  </div>

  <div class="dates">
    <div class="item">
      <div class="label">Issue Date</div>
      <div class="value">${issueDate}</div>
    </div>
    <div class="item">
      <div class="label">Due Date</div>
      <div class="value">${dueDate}</div>
    </div>
    <div class="item">
      <div class="label">Status</div>
      <div class="value">
        <span class="status-badge status-${invoice.status || "draft"}">${invoice.status || "Draft"}</span>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${invoice.description || "Art services"}</td>
        <td style="font-family: 'DM Mono', monospace; font-weight: 500;">$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
      </tr>
    </tbody>
  </table>

  <div class="total-row">
    <span class="label">Total Due</span>
    <span class="amount">$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
  </div>

  <div class="notes">
    <strong>Payment Terms:</strong> Payment is due by the date specified above. Please include the invoice number (${invNumber}) with your payment.
  </div>

  <div class="footer">Generated with ArtistOS</div>
</body>
</html>`)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => printWindow.print(), 400)
}
