import { useState } from "react"
import { Plus, Edit2, Eye, DollarSign, CheckCircle, Clock, AlertCircle, FileText, Trash2 } from "lucide-react"
import { artworks as initialArtworks, invoices as initialInvoices } from "../data/mockData"
import Modal from "../components/Modal"

const tabs = ["Portfolio", "Invoices", "Calendar"]
const statusBadge = { Available: "badge-green", Sold: "badge-slate", Commission: "badge-violet" }
const invoiceStatusBadge = { Paid: "badge-green", Pending: "badge-amber", Overdue: "badge-red", Draft: "badge-slate" }
const invoiceStatusIcon = { Paid: CheckCircle, Pending: Clock, Overdue: AlertCircle, Draft: FileText }

const initialEvents = [
  { id: 1, date: "2024-02-26", title: "Client call - James Chen", type: "call", time: "10:00 AM" },
  { id: 2, date: "2024-02-28", title: "Invoice INV-002 due", type: "invoice", time: "Due date" },
  { id: 3, date: "2024-03-01", title: "Digital Character Art deadline", type: "deadline", time: "All day" },
  { id: 4, date: "2024-03-05", title: "Gallery submission - Spring Show", type: "event", time: "5:00 PM" },
  { id: 5, date: "2024-03-10", title: "Commission review - Abstract Landscape", type: "call", time: "2:00 PM" },
  { id: 6, date: "2024-03-14", title: "Invoice INV-005 due", type: "invoice", time: "Due date" },
  { id: 7, date: "2024-03-20", title: "Pet Portrait delivery", type: "deadline", time: "All day" },
]

const eventColor = {
  call: "bg-purple-100 text-purple-700 border-l-4 border-l-purple-500",
  invoice: "bg-amber-50 text-amber-700 border-l-4 border-l-amber-400",
  deadline: "bg-rose-50 text-rose-700 border-l-4 border-l-rose-400",
  event: "bg-emerald-50 text-emerald-700 border-l-4 border-l-emerald-400",
}

const gradients = [
  "from-slate-700 to-slate-900", "from-violet-500 to-pink-500", "from-emerald-600 to-teal-800",
  "from-amber-500 to-orange-600", "from-blue-800 to-indigo-900", "from-rose-500 to-purple-700",
  "from-cyan-500 to-blue-600", "from-pink-500 to-fuchsia-700",
]

const emptyArtwork = { title: "", medium: "Oil on Canvas", year: 2024, price: "", status: "Available", dimensions: "" }
const emptyInvoice = { client: "", artwork: "", amount: "", status: "Draft", due: "" }
const emptyEvent = { title: "", type: "call", date: "", time: "" }

export default function BusinessTools() {
  const [activeTab, setActiveTab] = useState("Portfolio")
  const [artworkList, setArtworkList] = useState(initialArtworks)
  const [invoiceList, setInvoiceList] = useState(initialInvoices)
  const [eventList, setEventList] = useState(initialEvents)

  const [artModal, setArtModal] = useState(false)
  const [artForm, setArtForm] = useState(emptyArtwork)
  const [editingArtId, setEditingArtId] = useState(null)
  const [viewArt, setViewArt] = useState(null)

  const [invModal, setInvModal] = useState(false)
  const [invForm, setInvForm] = useState(emptyInvoice)
  const [viewInv, setViewInv] = useState(null)

  const [evtModal, setEvtModal] = useState(false)
  const [evtForm, setEvtForm] = useState(emptyEvent)

  const openAddArtwork = () => { setArtForm(emptyArtwork); setEditingArtId(null); setArtModal(true) }
  const openEditArtwork = (art) => { setArtForm({ title: art.title, medium: art.medium, year: art.year, price: art.price, status: art.status, dimensions: art.dimensions }); setEditingArtId(art.id); setArtModal(true) }
  const saveArtwork = () => {
    if (!artForm.title || !artForm.price) return
    if (editingArtId) {
      setArtworkList(prev => prev.map(a => a.id === editingArtId ? { ...a, ...artForm, price: Number(artForm.price) } : a))
    } else {
      const newId = Math.max(...artworkList.map(a => a.id), 0) + 1
      setArtworkList(prev => [...prev, { ...artForm, id: newId, price: Number(artForm.price), gradient: gradients[newId % gradients.length] }])
    }
    setArtModal(false)
  }
  const deleteArtwork = (id) => setArtworkList(prev => prev.filter(a => a.id !== id))

  const openAddInvoice = () => { setInvForm(emptyInvoice); setInvModal(true) }
  const saveInvoice = () => {
    if (!invForm.client || !invForm.amount) return
    const count = invoiceList.length + 1
    const newInv = { ...invForm, id: `INV-${String(count).padStart(3, "0")}`, amount: Number(invForm.amount), date: new Date().toISOString().split("T")[0] }
    setInvoiceList(prev => [...prev, newInv])
    setInvModal(false)
  }

  const openAddEvent = () => { setEvtForm(emptyEvent); setEvtModal(true) }
  const saveEvent = () => {
    if (!evtForm.title || !evtForm.date) return
    const newId = Math.max(...eventList.map(e => e.id), 0) + 1
    setEventList(prev => [...prev, { ...evtForm, id: newId }])
    setEvtModal(false)
  }
  const deleteEvent = (id) => setEventList(prev => prev.filter(e => e.id !== id))

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00")
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const paidTotal = invoiceList.filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0)
  const pendingTotal = invoiceList.filter(i => i.status === "Pending").reduce((s, i) => s + i.amount, 0)
  const overdueTotal = invoiceList.filter(i => i.status === "Overdue").reduce((s, i) => s + i.amount, 0)
  const totalInvoiced = invoiceList.reduce((s, i) => s + i.amount, 0)

  return (
    <div className="space-y-6">
      <div className="card p-1 flex gap-1 w-fit">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={"px-5 py-2 rounded-lg text-sm font-medium transition-colors " + (activeTab === tab ? "bg-purple-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50")}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Portfolio" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">My Portfolio</h2>
              <p className="text-sm text-slate-500 mt-0.5">{artworkList.length} artworks</p>
            </div>
            <button onClick={openAddArtwork} className="btn-primary flex items-center gap-2"><Plus size={15} /> Add Artwork</button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {artworkList.map((art) => (
              <div key={art.id} className="card overflow-hidden group hover:shadow-md transition-shadow">
                <div className={"h-44 bg-gradient-to-br relative " + art.gradient}>
                  <div className="absolute inset-0 flex items-end p-3 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-2 ml-auto">
                      <button onClick={() => setViewArt(art)} className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white"><Eye size={13} className="text-slate-700" /></button>
                      <button onClick={() => openEditArtwork(art)} className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white"><Edit2 size={13} className="text-slate-700" /></button>
                      <button onClick={() => deleteArtwork(art.id)} className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-red-100"><Trash2 size={13} className="text-red-500" /></button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">{art.title}</h3>
                    <span className={statusBadge[art.status]}>{art.status}</span>
                  </div>
                  <p className="text-xs text-slate-500">{art.medium} · {art.year}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{art.dimensions}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="text-sm font-bold text-slate-900">${art.price.toLocaleString()}</span>
                    <button onClick={() => openEditArtwork(art)} className="text-xs text-purple-600 font-medium hover:underline">Edit</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Invoices" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Invoiced", value: "$" + totalInvoiced.toLocaleString(), icon: DollarSign, color: "text-purple-600 bg-purple-50" },
              { label: "Paid", value: "$" + paidTotal.toLocaleString(), icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
              { label: "Pending", value: "$" + pendingTotal.toLocaleString(), icon: Clock, color: "text-amber-600 bg-amber-50" },
              { label: "Overdue", value: "$" + overdueTotal.toLocaleString(), icon: AlertCircle, color: "text-red-600 bg-red-50" },
            ].map((s) => (
              <div key={s.label} className="stat-card flex items-center gap-3">
                <div className={"w-9 h-9 rounded-lg flex items-center justify-center " + s.color}><s.icon size={17} /></div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Invoices</h2>
            <button onClick={openAddInvoice} className="btn-primary flex items-center gap-2"><Plus size={15} /> New Invoice</button>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{["Invoice","Client","Artwork","Amount","Status","Due Date",""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoiceList.map((inv) => {
                  const StatusIcon = invoiceStatusIcon[inv.status] || FileText
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{inv.id}</td>
                      <td className="px-5 py-3.5 font-medium text-slate-900">{inv.client}</td>
                      <td className="px-5 py-3.5 text-slate-500">{inv.artwork}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">${inv.amount.toLocaleString()}</td>
                      <td className="px-5 py-3.5"><span className={"flex items-center gap-1.5 w-fit " + (invoiceStatusBadge[inv.status] || "badge-slate")}><StatusIcon size={11} />{inv.status}</span></td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">{inv.due}</td>
                      <td className="px-5 py-3.5"><button onClick={() => setViewInv(inv)} className="text-xs text-purple-600 font-medium hover:underline">View</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Calendar" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Schedule</h2>
            <button onClick={openAddEvent} className="btn-primary flex items-center gap-2"><Plus size={15} /> Add Event</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">Upcoming Events</h3>
              <div className="space-y-3">
                {eventList.map((ev) => (
                  <div key={ev.id} className={"flex items-center gap-4 p-3 rounded-lg group " + eventColor[ev.type]}>
                    <div className="text-center flex-shrink-0 w-12">
                      <p className="text-xs font-bold">{formatDate(ev.date).split(" ")[0]}</p>
                      <p className="text-lg font-extrabold leading-none">{formatDate(ev.date).split(" ")[1]}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ev.title}</p>
                      <p className="text-xs opacity-70 mt-0.5">{ev.time}</p>
                    </div>
                    <button onClick={() => deleteEvent(ev.id)} className="opacity-0 group-hover:opacity-100 text-current hover:text-red-600 transition-opacity">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {eventList.length === 0 && <p className="text-sm text-slate-500 text-center py-6">No upcoming events</p>}
              </div>
            </div>
            <div className="space-y-4">
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">This Month</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Client calls", value: eventList.filter(e => e.type === "call").length, color: "bg-purple-50 text-purple-700" },
                    { label: "Invoices due", value: eventList.filter(e => e.type === "invoice").length, color: "bg-amber-50 text-amber-700" },
                    { label: "Deadlines", value: eventList.filter(e => e.type === "deadline").length, color: "bg-rose-50 text-rose-700" },
                    { label: "Art events", value: eventList.filter(e => e.type === "event").length, color: "bg-emerald-50 text-emerald-700" },
                  ].map((t) => (
                    <div key={t.label} className={"rounded-lg p-3 text-center " + t.color}>
                      <p className="text-2xl font-bold">{t.value}</p>
                      <p className="text-xs mt-0.5">{t.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal open={artModal} onClose={() => setArtModal(false)} title={editingArtId ? "Edit Artwork" : "Add Artwork"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
            <input value={artForm.title} onChange={e => setArtForm({...artForm, title: e.target.value})} placeholder="e.g. Urban Solitude"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Medium</label>
              <select value={artForm.medium} onChange={e => setArtForm({...artForm, medium: e.target.value})}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white">
                {["Oil on Canvas","Acrylic","Watercolor","Digital","Mixed Media","Photography","Sculpture"].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Year</label>
              <input type="number" value={artForm.year} onChange={e => setArtForm({...artForm, year: Number(e.target.value)})}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Price ($) *</label>
              <input type="number" value={artForm.price} onChange={e => setArtForm({...artForm, price: e.target.value})} placeholder="1200"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select value={artForm.status} onChange={e => setArtForm({...artForm, status: e.target.value})}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white">
                {["Available","Sold","Commission"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Dimensions</label>
            <input value={artForm.dimensions} onChange={e => setArtForm({...artForm, dimensions: e.target.value})} placeholder="24x36 in"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={saveArtwork} className="btn-primary flex-1">{editingArtId ? "Save Changes" : "Add Artwork"}</button>
            <button onClick={() => setArtModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!viewArt} onClose={() => setViewArt(null)} title="Artwork Details">
        {viewArt && (
          <div className="space-y-4">
            <div className={"h-48 rounded-xl bg-gradient-to-br " + viewArt.gradient} />
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{viewArt.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{viewArt.medium} · {viewArt.year}</p>
              </div>
              <span className={statusBadge[viewArt.status]}>{viewArt.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4">
              <div><p className="text-xs text-slate-500">Price</p><p className="text-lg font-bold text-slate-900">${viewArt.price.toLocaleString()}</p></div>
              <div><p className="text-xs text-slate-500">Dimensions</p><p className="text-lg font-bold text-slate-900">{viewArt.dimensions || "N/A"}</p></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setViewArt(null); openEditArtwork(viewArt) }} className="btn-primary flex-1">Edit Artwork</button>
              <button onClick={() => setViewArt(null)} className="btn-secondary flex-1">Close</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={invModal} onClose={() => setInvModal(false)} title="New Invoice">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Client name *</label>
            <input value={invForm.client} onChange={e => setInvForm({...invForm, client: e.target.value})} placeholder="Sarah Mitchell"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Artwork / Description</label>
            <input value={invForm.artwork} onChange={e => setInvForm({...invForm, artwork: e.target.value})} placeholder="Commission for portrait"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount ($) *</label>
              <input type="number" value={invForm.amount} onChange={e => setInvForm({...invForm, amount: e.target.value})} placeholder="1500"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select value={invForm.status} onChange={e => setInvForm({...invForm, status: e.target.value})}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white">
                {["Draft","Pending","Paid","Overdue"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Due date</label>
            <input type="date" value={invForm.due} onChange={e => setInvForm({...invForm, due: e.target.value})}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={saveInvoice} className="btn-primary flex-1">Create Invoice</button>
            <button onClick={() => setInvModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!viewInv} onClose={() => setViewInv(null)} title="Invoice Details" wide>
        {viewInv && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 font-mono">{viewInv.id}</p>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{viewInv.artwork}</h3>
                <p className="text-sm text-slate-500 mt-0.5">Client: {viewInv.client}</p>
              </div>
              <span className={invoiceStatusBadge[viewInv.status]}>{viewInv.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 bg-slate-50 rounded-xl p-5">
              <div><p className="text-xs text-slate-500">Amount</p><p className="text-xl font-bold text-slate-900">${viewInv.amount.toLocaleString()}</p></div>
              <div><p className="text-xs text-slate-500">Issue Date</p><p className="text-sm font-semibold text-slate-900">{viewInv.date}</p></div>
              <div><p className="text-xs text-slate-500">Due Date</p><p className="text-sm font-semibold text-slate-900">{viewInv.due}</p></div>
            </div>
            <button onClick={() => setViewInv(null)} className="btn-secondary w-full">Close</button>
          </div>
        )}
      </Modal>

      <Modal open={evtModal} onClose={() => setEvtModal(false)} title="Add Event">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Event title *</label>
            <input value={evtForm.title} onChange={e => setEvtForm({...evtForm, title: e.target.value})} placeholder="Client call - John Doe"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Date *</label>
              <input type="date" value={evtForm.date} onChange={e => setEvtForm({...evtForm, date: e.target.value})}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Time</label>
              <input value={evtForm.time} onChange={e => setEvtForm({...evtForm, time: e.target.value})} placeholder="10:00 AM"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
            <select value={evtForm.type} onChange={e => setEvtForm({...evtForm, type: e.target.value})}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white">
              <option value="call">Client Call</option>
              <option value="invoice">Invoice Due</option>
              <option value="deadline">Deadline</option>
              <option value="event">Art Event</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={saveEvent} className="btn-primary flex-1">Add Event</button>
            <button onClick={() => setEvtModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
