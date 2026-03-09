import { scheduledPosts, platformStats } from "../data/mockData"

const hasPostDays = [3, 6, 10, 14, 19, 23, 24, 27]

export default function SocialScheduler() {
  // February 2026 starts on Sunday (day 0), 28 days
  const daysInMonth = 28
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="space-y-5">
      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        {/* Left: Content Calendar */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Content Calendar</div>
              <div className="card-subtitle">February 2026</div>
            </div>
            <button className="btn-copper" style={{ fontSize: "12px", padding: "6px 14px" }}>
              + New Post
            </button>
          </div>
          <div className="card-body">
            {/* Day labels */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "4px" }}>
              {dayLabels.map(d => (
                <div
                  key={d}
                  style={{
                    textAlign: "center",
                    fontSize: "10px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "#A89F94",
                    padding: "6px 0",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const isToday = day === 23
                const hasPost = hasPostDays.includes(day)
                const classes = ["cal-day", isToday && "today", hasPost && "has-post"]
                  .filter(Boolean)
                  .join(" ")
                return (
                  <div key={day} className={classes}>
                    {day}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginTop: "16px",
                paddingTop: "14px",
                borderTop: "1px solid #F2EDE6",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#A89F94" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#B5651D", display: "inline-block" }} />
                Scheduled post
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#A89F94" }}>
                <span
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "4px",
                    background: "#0E0C0A",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "9px",
                    fontWeight: 600,
                  }}
                >
                  23
                </span>
                Today
              </div>
            </div>
          </div>
        </div>

        {/* Right: Platform Stats */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Platform Stats</div>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {platformStats.map(p => (
                <div key={p.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                    <span style={{ fontSize: "13.5px", fontWeight: 500 }}>{p.name}</span>
                    <span style={{ fontSize: "12px", fontFamily: "'DM Mono', monospace", color: "#A89F94" }}>
                      {p.followers}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${p.percentage}%`, background: p.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Divider + summary stats */}
            <div
              style={{
                borderTop: "1px solid #F2EDE6",
                marginTop: "20px",
                paddingTop: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {[
                { label: "Avg. reach", value: "2,840/post" },
                { label: "Avg. engagement", value: "4.2%" },
                { label: "Best time", value: "Tue 7pm" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                  <span style={{ color: "#A89F94" }}>{s.label}</span>
                  <span style={{ fontWeight: 600 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Scheduled Posts */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Upcoming Scheduled Posts</div>
          <span className="badge-grey">{scheduledPosts.length} posts</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Artwork</th>
                  <th>Caption</th>
                  <th>Platform</th>
                  <th>Scheduled</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {scheduledPosts.map(post => (
                  <tr key={post.id}>
                    <td style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{post.artwork}</td>
                    <td>
                      <span
                        style={{
                          display: "block",
                          maxWidth: "240px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: "#A89F94",
                        }}
                      >
                        {post.caption}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${post.platformColor}`}>{post.platform}</span>
                    </td>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", whiteSpace: "nowrap" }}>
                      {post.scheduled}
                    </td>
                    <td>
                      <span className={`badge ${post.statusColor}`}>{post.status}</span>
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
