import { useState } from "react"
import { activeCommissions, pendingCommissions } from "../data/mockData"

const tabs = [
  { key: "active", label: "Active", count: 3 },
  { key: "pending", label: "Pending", count: 2 },
  { key: "completed", label: "Completed", count: 8 },
]

export default function Commissions() {
  const [activeTab, setActiveTab] = useState("active")

  return (
    <div className="space-y-5">
      {/* Tab Bar */}
      <div
        style={{
          display: "inline-flex",
          gap: 2,
          background: "#F2EDE6",
          padding: 4,
          borderRadius: 10,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "8px 20px",
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              border: "none",
              transition: "all 0.15s",
              fontFamily: "'DM Sans', sans-serif",
              background:
                activeTab === tab.key ? "white" : "transparent",
              boxShadow:
                activeTab === tab.key
                  ? "0 1px 3px rgba(0,0,0,0.08)"
                  : "none",
              color:
                activeTab === tab.key ? "#0E0C0A" : "#A89F94",
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Active Tab */}
      {activeTab === "active" && (
        <div className="card" style={{ overflow: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Description</th>
                <th>Timeline</th>
                <th>Value</th>
                <th>Status</th>
                <th>Milestone</th>
              </tr>
            </thead>
            <tbody>
              {activeCommissions.map((c) => (
                <tr key={c.id}>
                  {/* Client */}
                  <td>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13.5,
                        color: "#0E0C0A",
                      }}
                    >
                      {c.client}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "#A89F94",
                        marginTop: 2,
                      }}
                    >
                      {c.email}
                    </div>
                  </td>

                  {/* Description */}
                  <td>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13.5,
                        color: "#0E0C0A",
                      }}
                    >
                      {c.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "#A89F94",
                        marginTop: 2,
                      }}
                    >
                      {c.desc}
                    </div>
                  </td>

                  {/* Timeline */}
                  <td>
                    <span
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 12.5,
                        color: "#0E0C0A",
                      }}
                    >
                      Due {c.due}
                    </span>
                  </td>

                  {/* Value */}
                  <td>
                    <span
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#0E0C0A",
                      }}
                    >
                      {c.value}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={c.statusColor}>{c.status}</span>
                  </td>

                  {/* Milestone */}
                  <td>
                    <div style={{ fontSize: 12.5, color: "#0E0C0A" }}>
                      {c.milestone}
                    </div>
                    <div className="progress-bar" style={{ width: 120 }}>
                      <div
                        className="progress-fill"
                        style={{ width: c.progress + "%" }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pending Tab */}
      {activeTab === "pending" && (
        <div className="card">
          <div
            className="card-body"
            style={{ paddingBottom: 0 }}
          >
            <div
              style={{
                fontSize: 13,
                color: "#A89F94",
                marginBottom: 14,
              }}
            >
              <strong style={{ color: "#0E0C0A" }}>2</strong> new commission
              requests
            </div>
          </div>
          <div style={{ overflow: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Collector</th>
                  <th>Request</th>
                  <th>Budget</th>
                  <th>Received</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingCommissions.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: 13.5,
                          color: "#0E0C0A",
                        }}
                      >
                        {p.collector}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 13,
                          color: "#0E0C0A",
                        }}
                      >
                        {p.request}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 12.5,
                          color: "#0E0C0A",
                        }}
                      >
                        {p.budget}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 12.5,
                          color: "#A89F94",
                        }}
                      >
                        {p.received}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-copper"
                        style={{
                          fontSize: 12,
                          padding: "6px 14px",
                        }}
                      >
                        Send Quote
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Completed Tab */}
      {activeTab === "completed" && (
        <div className="card">
          <div className="card-body">
            <div
              style={{
                textAlign: "center",
                padding: "32px 20px",
              }}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#0E0C0A",
                  marginBottom: 8,
                }}
              >
                8 completed commissions
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "#A89F94",
                  lineHeight: 1.8,
                }}
              >
                $32,400 total earned &middot; &#11088; 4.9 avg. rating
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
