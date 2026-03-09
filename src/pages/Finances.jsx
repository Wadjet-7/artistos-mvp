import { invoices } from "../data/mockData"

const stats = [
  { label: "Revenue YTD", value: "$24.8K", delta: "↑ 18% vs last year", up: true, icon: "◈", variant: "copper" },
  { label: "In Escrow", value: "$4,200", delta: "2 active commissions", up: true, icon: "◷", variant: "forest" },
  { label: "Outstanding", value: "$1,600", delta: "1 overdue invoice", up: false, icon: "◻", variant: "rose" },
  { label: "Expenses YTD", value: "$3,240", delta: "↓ 8% vs last year", up: true, icon: "◬", variant: "gold" },
]

export default function Finances() {
  return (
    <div className="space-y-5">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`stat-card ${s.variant}`}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className={`stat-delta ${s.up ? "up" : "down"}`}>{s.delta}</div>
            <div className="stat-icon">{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Recent Invoices */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Recent Invoices</div>
          <button className="btn-secondary" style={{ fontSize: "12px", padding: "6px 14px" }}>
            + New Invoice
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{inv.client}</td>
                    <td style={{ color: "#A89F94" }}>{inv.description}</td>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500, whiteSpace: "nowrap" }}>
                      {inv.amount}
                    </td>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", whiteSpace: "nowrap", color: "#A89F94" }}>
                      {inv.date}
                    </td>
                    <td>
                      <span className={`badge ${inv.statusColor}`}>{inv.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
