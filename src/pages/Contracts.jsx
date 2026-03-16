import { useState, useEffect, useCallback, useRef } from "react"
import { FileText, Send, Eye, Loader2, Trash2, Upload, Download, File, X } from "lucide-react"
import toast from "react-hot-toast"
import { supabase, logActivity } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import ConfirmModal from "../components/ConfirmModal"

/* ------------------------------------------------------------------ */
/*  Contract Generator — tabs: Create Contract | My Templates          */
/* ------------------------------------------------------------------ */
const templateOptions = [
  "Commission Agreement",
  "Consignment Agreement",
  "Licensing Agreement",
  "Direct Sale Agreement",
  "Exhibition Loan Agreement",
  "Mural / Public Art Agreement",
]

const paymentOptions = [
  "50% deposit, 50% on completion",
  "Full payment upfront",
  "3 equal installments",
  "Net 30 upon delivery",
]

const categoryOptions = ["General", "Commission", "Consignment", "Licensing", "Sale", "Exhibition", "Public Art"]

const defaultForm = {
  template: "Commission Agreement",
  clientName: "",
  clientEmail: "",
  artworkTitle: "",
  price: "",
  paymentTerms: "50% deposit, 50% on completion",
  completionDate: "",
  // Commission-specific
  revisionsIncluded: "2",
  killFeePercent: "50",
  // Consignment-specific
  galleryName: "",
  commissionRate: "50",
  consignmentDuration: "6 months",
  insuranceResponsibility: "Gallery",
  // Licensing-specific
  licenseType: "Non-Exclusive",
  usageScope: "",
  licenseDuration: "12 months",
  royaltyRate: "",
  // Exhibition Loan-specific
  venueName: "",
  exhibitionTitle: "",
  loanStartDate: "",
  loanEndDate: "",
  insuranceValue: "",
  // Mural / Public Art-specific
  siteName: "",
  siteAddress: "",
  wallDimensions: "",
  maintenanceResponsibility: "Client",
}

const defaultTemplateForm = {
  name: "",
  category: "General",
  description: "",
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / 1048576).toFixed(1) + " MB"
}

function formatDate(dateStr) {
  if (!dateStr) return "--"
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function fmtDate(dateStr) {
  if (!dateStr) return "___________"
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

function fileExtension(filename) {
  return filename?.split(".").pop()?.toLowerCase() || ""
}

/* ================================================================ */
/*  CONTRACT TEXT BUILDERS — Industry-standard clauses per type      */
/* ================================================================ */

function buildCommissionText(form, artistName) {
  const price = form.price ? `$${Number(form.price).toLocaleString()}` : "$___"
  const p = Number(form.price) || 0
  const revisions = form.revisionsIncluded || "2"
  const killFee = form.killFeePercent || "50"
  const client = form.clientName || "___________"
  const artwork = form.artworkTitle || "___________"
  const date = fmtDate(form.completionDate)

  let depositDetail = ""
  if (form.paymentTerms.startsWith("50%")) depositDetail = `A deposit of $${(p * 0.5).toLocaleString()} is due upon execution of this Agreement. The remaining balance of $${(p * 0.5).toLocaleString()} is due upon completion and delivery of the Work.`
  else if (form.paymentTerms.startsWith("Full")) depositDetail = `The full amount of ${price} is due upon execution of this Agreement before work commences.`
  else if (form.paymentTerms.startsWith("3 equal")) depositDetail = `Payment shall be made in three (3) equal installments of $${Math.round(p / 3).toLocaleString()} each: the first upon execution, the second at the midpoint, and the third upon completion.`
  else depositDetail = `The full amount of ${price} is due within thirty (30) days of delivery of the completed Work.`

  const sections = [
    { title: "Parties", text: `This Commission Agreement ("Agreement") is entered into as of ${fmtDate(new Date().toISOString().split("T")[0])} by and between ${client} ("Client") and ${artistName} ("Artist"), collectively referred to as the "Parties."` },
    { title: "Scope of Work", text: `The Artist agrees to create an original artwork titled "${artwork}" (the "Work") in accordance with specifications discussed between the Parties. The Work shall be an original creation by the Artist. Any preliminary sketches, studies, or maquettes created during the process remain the property of the Artist.` },
    { title: "Timeline and Milestones", text: `The Artist shall deliver the completed Work on or before ${date}. The Artist will provide progress updates at reasonable intervals. If the Artist anticipates a delay, the Artist shall notify the Client promptly and the Parties shall agree on a revised timeline in writing.` },
    { title: "Compensation and Payment Terms", text: `The total compensation for the Work shall be ${price}. ${depositDetail} All payments shall be made via the method agreed upon by the Parties. Late payments shall accrue interest at a rate of 1.5% per month.` },
    { title: "Revisions and Modifications", text: `The Artist shall provide up to ${revisions} round(s) of revisions at no additional charge based on Client feedback. Additional revisions beyond the included rounds shall be billed at an hourly rate agreed upon by both Parties. Revisions must be requested within fourteen (14) days of receiving progress images or the delivered Work.` },
    { title: "Cancellation and Kill Fee", text: `Either Party may terminate this Agreement with written notice. If the Client cancels after work has commenced, the Client shall pay a kill fee of ${killFee}% of the total compensation (${price}), in addition to retaining any deposits already paid. If the Artist cancels, the Artist shall refund all payments received, less a reasonable amount for work already completed.` },
    { title: "Copyright and Reproduction Rights", text: `The Artist retains full copyright and reproduction rights to the Work and all related sketches, studies, and photographs. Upon receipt of full payment, the Client receives the right to display the physical Work in private and public settings. The Client may not reproduce, distribute, or create derivative works without the Artist's prior written consent. The Artist retains the right to photograph and reproduce images of the Work for portfolio, exhibition, and promotional purposes.` },
    { title: "Approval and Acceptance", text: `Upon delivery, the Client shall have fourteen (14) days to inspect the Work and request any final revisions within the included revision rounds. If no response is received within this period, the Work shall be deemed accepted. Once accepted, the Client assumes all responsibility for the care and preservation of the Work.` },
  ]

  return buildFormattedText("Commission Agreement", sections, form.clientEmail)
}

function buildConsignmentText(form, artistName) {
  const price = form.price ? `$${Number(form.price).toLocaleString()}` : "$___"
  const client = form.clientName || "___________"
  const artwork = form.artworkTitle || "___________"
  const gallery = form.galleryName || "___________"
  const rate = form.commissionRate || "50"
  const artistShare = 100 - Number(rate)
  const duration = form.consignmentDuration || "6 months"
  const insurance = form.insuranceResponsibility || "Gallery"

  const sections = [
    { title: "Parties", text: `This Consignment Agreement ("Agreement") is entered into as of ${fmtDate(new Date().toISOString().split("T")[0])} by and between ${artistName} ("Artist") and ${gallery}, represented by ${client} ("Gallery"), collectively referred to as the "Parties."` },
    { title: "Artworks Consigned", text: `The Artist hereby consigns to the Gallery the following artwork(s) for the purpose of exhibition and sale: "${artwork}" with a retail price of ${price}. A detailed inventory list with descriptions, dimensions, medium, and photographs shall be attached as Exhibit A and signed by both Parties upon delivery.` },
    { title: "Duration", text: `This Agreement shall be effective for a period of ${duration} from the date of execution. The Agreement shall automatically renew for successive periods of equal length unless either Party provides written notice of non-renewal at least thirty (30) days prior to the expiration of the current term.` },
    { title: "Pricing and Commission Split", text: `The Gallery shall receive a commission of ${rate}% of the sale price of each Work sold. The Artist shall receive ${artistShare}% of the sale price. The Gallery shall not alter the agreed-upon retail price without the Artist's prior written consent. Any discounts offered by the Gallery shall be deducted from the Gallery's commission, not the Artist's share, unless otherwise agreed in writing.` },
    { title: "Payment to Artist", text: `The Gallery shall remit the Artist's share of proceeds within thirty (30) days of the sale of any consigned Work. Payment shall be accompanied by a written statement identifying the Work sold, the sale price, and the amounts due. The Gallery shall maintain accurate records of all transactions related to the consigned Works.` },
    { title: "Insurance and Liability", text: `${insurance === "Gallery" ? "The Gallery" : insurance === "Artist" ? "The Artist" : "Both Parties shall share responsibility to"} shall maintain adequate insurance covering the full retail value of the consigned Works against loss, theft, damage, and destruction while in the Gallery's possession, including during transit. The Gallery shall be liable for any damage to the Works occurring while in its care, custody, or control. In the event of loss or damage, the Gallery shall compensate the Artist at the agreed retail price.` },
    { title: "Display and Storage", text: `The Gallery agrees to display and store all consigned Works in a professional manner consistent with museum standards. Works shall be kept in climate-controlled conditions and protected from direct sunlight, excessive humidity, and other environmental hazards. The Gallery shall not alter, modify, frame, or unframe any Work without the Artist's prior written consent.` },
    { title: "Exclusivity", text: `This Agreement is non-exclusive unless otherwise specified. The Artist retains the right to sell the same or similar works through other galleries, at art fairs, from their studio, or through online platforms, unless a separate exclusivity agreement is executed in writing.` },
    { title: "Return of Artworks", text: `Upon expiration or termination of this Agreement, the Gallery shall return all unsold consigned Works to the Artist in the same condition as received, at the Gallery's expense, within thirty (30) days. The Artist may request the return of specific Works at any time with fourteen (14) days written notice.` },
    { title: "Termination", text: `Either Party may terminate this Agreement with thirty (30) days written notice. Upon termination, the Gallery shall settle all outstanding accounts, return all unsold Works, and provide a final accounting within thirty (30) days. The Gallery's obligation to pay for any Works sold during the term shall survive termination.` },
  ]

  return buildFormattedText("Consignment Agreement", sections, form.clientEmail)
}

function buildLicensingText(form, artistName) {
  const price = form.price ? `$${Number(form.price).toLocaleString()}` : "$___"
  const client = form.clientName || "___________"
  const artwork = form.artworkTitle || "___________"
  const licenseType = form.licenseType || "Non-Exclusive"
  const scope = form.usageScope || "___________"
  const duration = form.licenseDuration || "12 months"
  const royalty = form.royaltyRate ? `${form.royaltyRate}%` : "____%"

  const sections = [
    { title: "Parties", text: `This Licensing Agreement ("Agreement") is entered into as of ${fmtDate(new Date().toISOString().split("T")[0])} by and between ${artistName} ("Licensor") and ${client} ("Licensee"), collectively referred to as the "Parties."` },
    { title: "Grant of License", text: `The Licensor hereby grants to the Licensee a ${licenseType.toLowerCase()} license to use the artwork titled "${artwork}" (the "Work") subject to the terms and conditions set forth in this Agreement. ${licenseType === "Exclusive" ? "During the term of this Agreement, the Licensor shall not grant any other party the right to use the Work for the same purposes and within the same territory." : "The Licensor retains the right to license the Work to other parties for similar or different uses."}` },
    { title: "Scope of Use", text: `The Licensee is authorized to use the Work for the following purposes only: ${scope}. Any use beyond the scope defined herein requires the Licensor's prior written consent and may be subject to additional fees. The Licensee shall not modify, distort, or alter the Work in any way that would be prejudicial to the Licensor's reputation.` },
    { title: "Duration", text: `This license shall be effective for a period of ${duration} from the date of execution. Upon expiration, the Licensee shall cease all use of the Work and destroy or return any reproductions, unless the Parties agree to renew the license in writing.` },
    { title: "Compensation", text: `In consideration of the license granted herein, the Licensee shall pay the Licensor ${form.royaltyRate ? `a royalty of ${royalty} of net revenues derived from use of the Work, payable quarterly` : `a flat licensing fee of ${price}, payable upon execution of this Agreement`}. The Licensee shall maintain accurate records and provide quarterly statements of revenues if royalties apply. The Licensor reserves the right to audit such records upon reasonable notice.` },
    { title: "Attribution and Credit", text: `The Licensee shall credit the Licensor as the creator of the Work in all reproductions, displays, and publications. Credit shall read: "Artwork by ${artistName}" or as otherwise specified by the Licensor. Failure to provide proper attribution shall constitute a material breach of this Agreement.` },
    { title: "Moral Rights", text: `The Licensor retains all moral rights in the Work, including the right to be identified as the creator and the right to object to any distortion, mutilation, or other modification that would be prejudicial to the Licensor's honor or reputation. Nothing in this Agreement shall be construed as a waiver of the Licensor's moral rights.` },
    { title: "Sublicensing", text: `The Licensee may not sublicense, assign, or transfer the rights granted herein to any third party without the Licensor's prior written consent. Any unauthorized sublicensing shall constitute a material breach of this Agreement and result in immediate termination.` },
    { title: "Termination", text: `Either Party may terminate this Agreement for material breach upon thirty (30) days written notice, provided the breaching Party fails to cure the breach within the notice period. Upon termination, the Licensee shall immediately cease all use of the Work, destroy or return all reproductions, and provide a final accounting of any royalties due.` },
  ]

  return buildFormattedText("Licensing Agreement", sections, form.clientEmail)
}

function buildDirectSaleText(form, artistName) {
  const price = form.price ? `$${Number(form.price).toLocaleString()}` : "$___"
  const p = Number(form.price) || 0
  const client = form.clientName || "___________"
  const artwork = form.artworkTitle || "___________"

  let depositDetail = ""
  if (form.paymentTerms.startsWith("50%")) depositDetail = `A deposit of $${(p * 0.5).toLocaleString()} is due upon execution of this Agreement. The remaining balance of $${(p * 0.5).toLocaleString()} is due prior to delivery.`
  else if (form.paymentTerms.startsWith("Full")) depositDetail = `The full purchase price of ${price} is due upon execution of this Agreement.`
  else if (form.paymentTerms.startsWith("3 equal")) depositDetail = `Payment shall be made in three (3) equal installments of $${Math.round(p / 3).toLocaleString()}, with the first due upon execution, the second within 15 days, and the final prior to delivery.`
  else depositDetail = `The full purchase price of ${price} is due within thirty (30) days of execution of this Agreement.`

  const sections = [
    { title: "Parties", text: `This Bill of Sale and Purchase Agreement ("Agreement") is entered into as of ${fmtDate(new Date().toISOString().split("T")[0])} by and between ${artistName} ("Seller/Artist") and ${client} ("Buyer"), collectively referred to as the "Parties."` },
    { title: "Artwork Description", text: `The Seller agrees to sell and the Buyer agrees to purchase the following original artwork: "${artwork}." The Seller warrants that the Work is an original creation, free from any liens or encumbrances, and that the Seller has full authority to transfer title.` },
    { title: "Purchase Price and Payment", text: `The total purchase price for the Work is ${price}. ${depositDetail} All payments shall be made via the method agreed upon by the Parties. Title shall not transfer until full payment has been received.` },
    { title: "Certificate of Authenticity", text: `The Seller shall provide a signed Certificate of Authenticity with the Work, including: the title, date of creation, medium, dimensions, and a photograph of the Work. The Certificate shall be signed and dated by the Artist and constitutes a guarantee of authenticity.` },
    { title: "Transfer of Title", text: `Upon receipt of full payment, title to the Work shall transfer from the Seller to the Buyer. The Buyer shall thereafter be the sole owner of the physical Work. The risk of loss shall transfer to the Buyer upon delivery and acceptance of the Work.` },
    { title: "Delivery and Shipping", text: `The Seller shall arrange delivery of the Work by ${fmtDate(form.completionDate)}. Shipping costs shall be the responsibility of the Buyer unless otherwise agreed. The Seller shall package the Work using professional art shipping standards. The Seller shall insure the Work for its full purchase price during transit. The Buyer shall inspect the Work within 48 hours of delivery and notify the Seller of any damage immediately.` },
    { title: "Artist's Retained Rights", text: `The Artist retains full copyright and all reproduction rights to the Work. The Buyer may not reproduce, photograph for commercial purposes, or create derivative works without the Artist's prior written consent. The Artist retains the right to photograph and reproduce images of the Work for portfolio, exhibition, and promotional purposes. In jurisdictions where resale royalty rights (droit de suite) apply, the Buyer acknowledges the Artist's right to a percentage of proceeds from any future resale.` },
  ]

  return buildFormattedText("Bill of Sale / Direct Sale Agreement", sections, form.clientEmail)
}

function buildExhibitionLoanText(form, artistName) {
  const client = form.clientName || "___________"
  const artwork = form.artworkTitle || "___________"
  const venue = form.venueName || "___________"
  const exhibition = form.exhibitionTitle || "___________"
  const loanStart = fmtDate(form.loanStartDate)
  const loanEnd = fmtDate(form.loanEndDate)
  const insValue = form.insuranceValue ? `$${Number(form.insuranceValue).toLocaleString()}` : "$___"

  const sections = [
    { title: "Parties", text: `This Exhibition Loan Agreement ("Agreement") is entered into as of ${fmtDate(new Date().toISOString().split("T")[0])} by and between ${artistName} ("Lender") and ${venue}, represented by ${client} ("Borrower"), collectively referred to as the "Parties."` },
    { title: "Artwork Description", text: `The Lender agrees to loan the following artwork to the Borrower: "${artwork}." A detailed condition report including photographs shall be completed and signed by both Parties prior to the transfer of the Work. This condition report shall be attached as Exhibit A.` },
    { title: "Loan Period", text: `The loan shall commence on ${loanStart} and terminate on ${loanEnd}. The Borrower shall return the Work to the Lender within fourteen (14) days following the end of the loan period. Any extension of the loan period must be agreed upon in writing by both Parties.` },
    { title: "Purpose", text: `The Work is loaned solely for the purpose of public exhibition in "${exhibition}" at ${venue}. The Borrower shall not use the Work for any other purpose, including but not limited to sale, auction, or private display, without the Lender's prior written consent.` },
    { title: "Insurance", text: `The Borrower shall maintain wall-to-wall fine arts insurance coverage for the Work at an agreed value of ${insValue} from the time the Work leaves the Lender's possession until it is returned. The insurance policy shall cover all risks including, but not limited to, damage, loss, theft, fire, flood, and transit. The Borrower shall provide proof of insurance to the Lender prior to the transfer of the Work. The Lender shall be named as an additional insured on the policy.` },
    { title: "Care and Handling", text: `The Borrower shall handle the Work with the highest professional standards consistent with museum practices. The Work shall be displayed in climate-controlled conditions and protected from direct sunlight, excessive humidity, vibration, and environmental hazards. The Borrower shall not clean, restore, alter, or repair the Work without the Lender's prior written consent. Only trained art handlers shall move or install the Work.` },
    { title: "Credit and Reproduction", text: `The Borrower shall credit the Lender/Artist in all exhibition materials, labels, catalogs, and publicity as follows: "${artwork}" by ${artistName}. The Borrower may photograph and reproduce images of the Work solely for purposes of exhibition publicity, catalog, and educational materials related to the exhibition. Any other reproduction requires the Lender's prior written consent.` },
    { title: "Return of Artwork", text: `The Borrower shall return the Work to the Lender in the same condition as documented in the condition report (Exhibit A). Return shipping shall be at the Borrower's expense using professional fine art transport. A condition report shall be completed upon return. The Borrower shall be liable for any damage that occurs while the Work is in the Borrower's care, custody, or control.` },
  ]

  return buildFormattedText("Exhibition Loan Agreement", sections, form.clientEmail)
}

function buildMuralText(form, artistName) {
  const price = form.price ? `$${Number(form.price).toLocaleString()}` : "$___"
  const p = Number(form.price) || 0
  const client = form.clientName || "___________"
  const artwork = form.artworkTitle || "___________"
  const site = form.siteName || "___________"
  const address = form.siteAddress || "___________"
  const dimensions = form.wallDimensions || "___________"
  const maintenance = form.maintenanceResponsibility || "Client"
  const date = fmtDate(form.completionDate)

  const sections = [
    { title: "Parties", text: `This Mural / Public Art Agreement ("Agreement") is entered into as of ${fmtDate(new Date().toISOString().split("T")[0])} by and between ${artistName} ("Artist") and ${client} ("Commissioner/Property Owner"), collectively referred to as the "Parties."` },
    { title: "Scope of Work", text: `The Artist agrees to design and execute a mural artwork titled "${artwork}" (the "Work") at ${site}, located at ${address}. The wall/surface dimensions are approximately ${dimensions}. The Artist shall submit a detailed design proposal including sketches, color palette, and material specifications for the Commissioner's approval prior to commencing work. The final design must be approved in writing before installation begins.` },
    { title: "Timeline and Access", text: `The Artist shall complete the Work on or before ${date}. The Commissioner shall provide the Artist with reasonable access to the site during agreed-upon hours for the duration of the project. The Commissioner shall ensure the surface is properly prepared and in suitable condition prior to the Artist's start date. Weather delays and other force majeure events shall extend the completion deadline by a corresponding period.` },
    { title: "Compensation and Payment Schedule", text: `The total compensation for the Work shall be ${price}. Payment shall be made in milestones: 33% ($${Math.round(p * 0.33).toLocaleString()}) upon execution of this Agreement, 33% ($${Math.round(p * 0.33).toLocaleString()}) at the midpoint of installation, and 34% ($${Math.round(p * 0.34).toLocaleString()}) upon completion and final approval. Late payments shall accrue interest at 1.5% per month.` },
    { title: "Materials and Expenses", text: `The Artist shall be responsible for providing all materials necessary for the creation of the Work, including but not limited to paint, primers, sealants, and protective coatings. The cost of materials is included in the total compensation unless otherwise agreed. The Commissioner shall provide access to water, electricity, and any necessary scaffolding or lift equipment at no cost to the Artist.` },
    { title: "Maintenance and Preservation", text: `${maintenance === "Client" ? "The Commissioner" : maintenance === "Artist" ? "The Artist" : "Both Parties"} shall be responsible for the ongoing maintenance and preservation of the Work for a minimum period of five (5) years following completion. Maintenance includes protection from graffiti, weather damage, and structural deterioration. The Commissioner shall consult with the Artist before undertaking any restoration or repair work. The Artist shall have the right of first refusal for any restoration or repair commissions.` },
    { title: "Copyright and Moral Rights", text: `The Artist retains full copyright and all reproduction rights to the Work, including the right to photograph and reproduce images for portfolio, exhibition, and promotional purposes. Under the Visual Artists Rights Act (VARA) and applicable moral rights legislation, the Artist retains the right to claim authorship and to prevent any intentional distortion, mutilation, or other modification of the Work that would be prejudicial to the Artist's honor or reputation. The Commissioner shall not alter, modify, or paint over the Work without the Artist's prior written consent.` },
    { title: "Removal or Destruction", text: `If the Commissioner intends to remove, destroy, or significantly alter the Work, the Commissioner shall provide the Artist with ninety (90) days written notice. During this notice period, the Artist shall have the right to document the Work through photography and video. If feasible, the Artist shall have the opportunity to remove the Work at the Artist's expense. If removal is not feasible, the Commissioner shall allow the Artist reasonable access to document the Work before any alteration or destruction.` },
    { title: "Attribution", text: `The Commissioner shall install a permanent plaque or sign near the Work identifying the Artist as the creator. The plaque shall include the Artist's name, the title of the Work, and the year of completion. The Commissioner shall credit the Artist in all publicity, press materials, and publications relating to the Work.` },
  ]

  return buildFormattedText("Mural / Public Art Agreement", sections, form.clientEmail)
}

/* Helper: format sections into plain text for storage */
function buildFormattedText(title, sections, clientEmail) {
  let text = `${title}\n\n`
  sections.forEach((s, i) => {
    text += `${i + 1}. ${s.title}. ${s.text}\n\n`
  })
  text += `IN WITNESS WHEREOF, the Parties have executed this Agreement as of the date first written above.`
  if (clientEmail) {
    text += `\n\nA copy of this agreement will be sent to ${clientEmail} for electronic signature.`
  }
  return text
}

/* Map template name to builder */
const CONTRACT_BUILDERS = {
  "Commission Agreement": buildCommissionText,
  "Consignment Agreement": buildConsignmentText,
  "Licensing Agreement": buildLicensingText,
  "Direct Sale Agreement": buildDirectSaleText,
  "Exhibition Loan Agreement": buildExhibitionLoanText,
  "Mural / Public Art Agreement": buildMuralText,
}

export default function Contracts() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("create")

  /* ---------- Create Contract state ---------- */
  const [form, setForm] = useState(defaultForm)
  const [contractList, setContractList] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState(null)

  /* ---------- My Templates state ---------- */
  const [templates, setTemplates] = useState([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [templateFile, setTemplateFile] = useState(null)
  const [templateForm, setTemplateForm] = useState(defaultTemplateForm)
  const [uploadingTemplate, setUploadingTemplate] = useState(false)
  const [confirmTemplateTarget, setConfirmTemplateTarget] = useState(null)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef(null)

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  /* ---- Build the preview text (reused for saving + PDF) ---- */
  const buildPreviewText = () => {
    const builder = CONTRACT_BUILDERS[form.template] || buildCommissionText
    return builder(form, user?.name || "Artist")
  }

  /* ---- Parse preview text into sections for rendering ---- */
  const getPreviewSections = () => {
    const text = buildPreviewText()
    const lines = text.split("\n\n")
    const title = lines[0]
    const sections = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const match = line.match(/^(\d+)\.\s+(.+?)\.\s+(.+)/)
      if (match) {
        sections.push({ num: match[1], title: match[2], text: match[3] })
      } else {
        sections.push({ num: null, title: null, text: line })
      }
    }
    return { title, sections }
  }

  /* ================================================================ */
  /*  DATA FETCHING                                                    */
  /* ================================================================ */

  /* ---- Fetch contracts ---- */
  const fetchContracts = useCallback(async () => {
    if (!user?.id) return
    setLoadingData(true)
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      if (error) throw error
      setContractList(data || [])
    } catch (err) {
      console.error("Failed to fetch contracts:", err)
    } finally {
      setLoadingData(false)
    }
  }, [user?.id])

  /* ---- Fetch templates ---- */
  const fetchTemplates = useCallback(async () => {
    if (!user?.id) return
    setLoadingTemplates(true)
    try {
      const { data, error } = await supabase
        .from("contract_templates")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        // Table may not exist yet — silently ignore
        setTemplates([])
        return
      }
      setTemplates(data || [])
    } catch (err) {
      setTemplates([])
    } finally {
      setLoadingTemplates(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchContracts()
    fetchTemplates()
  }, [fetchContracts, fetchTemplates])

  /* ================================================================ */
  /*  CONTRACT CRUD                                                    */
  /* ================================================================ */

  const handleSave = async () => {
    if (!user?.id) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from("contracts").insert({
        user_id: user.id,
        client_name: form.clientName,
        client_email: form.clientEmail,
        project_title: form.artworkTitle,
        contract_type: form.template,
        end_date: form.completionDate || null,
        value: form.price ? Number(form.price) : null,
        status: "draft",
        payment_terms: form.paymentTerms,
        terms_text: buildPreviewText(),
      })
      if (error) throw error
      await fetchContracts()
      setForm(defaultForm)
      await logActivity(user.id, "contract_created", `Created ${form.template} for ${form.clientName}`)
      toast.success("Contract created!")
    } catch (err) {
      console.error("Failed to save contract:", err)
      toast.error("Failed to save contract: " + (err.message || "Unknown error"))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (contract) => setConfirmTarget(contract)

  const handleConfirmDelete = async () => {
    const contract = confirmTarget
    setConfirmTarget(null)
    try {
      const { error } = await supabase.from("contracts").delete().eq("id", contract.id)
      if (error) throw error
      await fetchContracts()
      await logActivity(user.id, "contract_deleted", `Deleted contract ${contract.id}`)
      toast.success("Contract deleted")
    } catch (err) {
      console.error("Failed to delete contract:", err)
      toast.error("Failed to delete: " + (err.message || "Unknown error"))
    }
  }

  /* ================================================================ */
  /*  PDF EXPORT                                                       */
  /* ================================================================ */

  const handlePreviewPDF = () => {
    const { title, sections } = getPreviewSections()
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      toast.error("Please allow pop-ups to preview PDF")
      return
    }

    const sigLabel1 = form.template === "Consignment Agreement"
      ? (form.galleryName || "Gallery")
      : form.template === "Exhibition Loan Agreement"
      ? (form.venueName || "Borrower")
      : form.template === "Mural / Public Art Agreement"
      ? (form.clientName || "Commissioner")
      : (form.clientName || "Client")

    const sigLabel2 = form.template === "Licensing Agreement" ? "Licensor" : "Artist"

    const sectionsHtml = sections.map(s => {
      if (s.num && s.title) {
        return `<div class="clause"><p><strong>${s.num}. ${s.title}.</strong> ${s.text}</p></div>`
      }
      return `<p class="closing">${s.text}</p>`
    }).join("")

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${form.template} — ${form.clientName || "Contract"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@400;500&display=swap');
    body { font-family: 'DM Sans', Georgia, serif; max-width: 680px; margin: 50px auto; padding: 0 24px; color: #333; line-height: 1.85; font-size: 13.5px; }
    h1 { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 600; border-bottom: 2px solid #B5651D; padding-bottom: 10px; color: #0E0C0A; margin-bottom: 24px; }
    .header-meta { font-size: 12px; color: #A89F94; margin-bottom: 24px; }
    .clause { margin: 18px 0; page-break-inside: avoid; }
    .clause p { margin: 0; }
    .clause strong { color: #0E0C0A; }
    .closing { margin-top: 32px; font-style: italic; color: #555; }
    .footer { margin-top: 80px; display: flex; justify-content: space-between; }
    .sig-block { text-align: center; }
    .sig-line { border-top: 1px solid #999; width: 220px; padding-top: 6px; font-size: 12px; color: #666; margin-top: 40px; }
    .date-line { font-size: 11px; color: #999; margin-top: 4px; }
    @media print { body { margin: 30px auto; } .clause { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="header-meta">Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
  ${sectionsHtml}
  <div class="footer">
    <div class="sig-block">
      <div class="sig-line">${sigLabel1}: ___________</div>
      <div class="date-line">Date: ___________</div>
    </div>
    <div class="sig-block">
      <div class="sig-line">${sigLabel2}: ${user?.name || "___________"}</div>
      <div class="date-line">Date: ___________</div>
    </div>
  </div>
</body>
</html>`)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 400)
  }

  /* ================================================================ */
  /*  TEMPLATE UPLOAD                                                  */
  /* ================================================================ */

  const handleFileSelect = (file) => {
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|docx?|txt)$/i)) {
      toast.error("Please upload a PDF, DOCX, or TXT file")
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File must be under 10 MB")
      return
    }
    setTemplateFile(file)
    // Auto-fill name from filename if empty
    if (!templateForm.name) {
      const nameWithoutExt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ")
      setTemplateForm(prev => ({ ...prev, name: nameWithoutExt }))
    }
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    handleFileSelect(file)
  }

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files?.[0])
    e.target.value = ""
  }

  const handleTemplateUpload = async () => {
    if (!user?.id || !templateFile || !templateForm.name.trim()) return
    setUploadingTemplate(true)

    try {
      const ext = fileExtension(templateFile.name)
      const fileName = `${user.id}/${Date.now()}.${ext}`

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("templates")
        .upload(fileName, templateFile, { contentType: templateFile.type })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("templates")
        .getPublicUrl(fileName)

      // Insert metadata
      const { error: dbError } = await supabase.from("contract_templates").insert({
        user_id: user.id,
        name: templateForm.name.trim(),
        category: templateForm.category,
        description: templateForm.description.trim() || null,
        file_url: urlData.publicUrl,
        file_type: ext.toUpperCase(),
        file_size: formatFileSize(templateFile.size),
      })

      if (dbError) throw dbError

      await fetchTemplates()
      setTemplateFile(null)
      setTemplateForm(defaultTemplateForm)
      await logActivity(user.id, "template_uploaded", `Uploaded template: ${templateForm.name}`)
      toast.success("Template uploaded!")
    } catch (err) {
      console.error("Failed to upload template:", err)
      toast.error("Upload failed: " + (err.message || "Unknown error"))
    } finally {
      setUploadingTemplate(false)
    }
  }

  const handleTemplateDelete = (tmpl) => setConfirmTemplateTarget(tmpl)

  const handleConfirmTemplateDelete = async () => {
    const tmpl = confirmTemplateTarget
    setConfirmTemplateTarget(null)
    try {
      // Delete from storage
      if (tmpl.file_url) {
        const path = tmpl.file_url.split("/templates/").pop()
        if (path) await supabase.storage.from("templates").remove([path])
      }
      // Delete from database
      const { error } = await supabase.from("contract_templates").delete().eq("id", tmpl.id)
      if (error) throw error
      await fetchTemplates()
      await logActivity(user.id, "template_deleted", `Deleted template: ${tmpl.name}`)
      toast.success("Template deleted")
    } catch (err) {
      console.error("Failed to delete template:", err)
      toast.error("Failed to delete: " + (err.message || "Unknown error"))
    }
  }

  /* ================================================================ */
  /*  HELPERS                                                          */
  /* ================================================================ */

  const statusBadge = (status) => {
    switch (status) {
      case "signed":    return "badge badge-forest"
      case "draft":     return "badge badge-grey"
      case "active":    return "badge badge-gold"
      case "completed": return "badge badge-copper"
      case "cancelled": return "badge badge-rose"
      default:          return "badge badge-grey"
    }
  }

  const categoryBadge = (cat) => {
    switch (cat) {
      case "Commission":  return "badge badge-copper"
      case "Consignment": return "badge badge-forest"
      case "Licensing":   return "badge badge-gold"
      case "Sale":        return "badge badge-rose"
      case "Exhibition":  return "badge badge-grey"
      case "Public Art":  return "badge badge-copper"
      default:            return "badge badge-grey"
    }
  }

  const formatAmount = (value) => {
    if (value == null || value === "") return "\u2014"
    return `$${Number(value).toLocaleString()}`
  }

  const t = form.template // shorthand for conditionals

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  const { title: previewTitle, sections: previewSections } = getPreviewSections()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: "#0E0C0A" }}>Contract Generator</h1>
        <p style={{ fontSize: 13, color: "#A89F94", marginTop: 2 }}>Create, preview, and manage your contract templates</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#F2EDE6", width: "fit-content" }}>
        {[
          { key: "create", label: "Create Contract" },
          { key: "templates", label: "My Templates" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
            style={{
              background: activeTab === tab.key ? "white" : "transparent",
              color: activeTab === tab.key ? "#0E0C0A" : "#A89F94",
              boxShadow: activeTab === tab.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/*  TAB 1: CREATE CONTRACT                                       */}
      {/* ============================================================ */}
      {activeTab === "create" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Create Contract Form */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <FileText size={16} style={{ color: "#B5651D" }} />
                <span className="card-title">Create Contract</span>
              </div>
            </div>
            <div className="card-body space-y-5">
              {/* Template */}
              <div>
                <label className="form-label">Template</label>
                <select className="form-select" value={form.template} onChange={set("template")}>
                  {templateOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Client / Contact Name */}
              <div>
                <label className="form-label">
                  {t === "Consignment Agreement" ? "Gallery Contact Name" : t === "Exhibition Loan Agreement" ? "Venue Contact Name" : t === "Mural / Public Art Agreement" ? "Commissioner / Property Owner" : "Client Full Name"}
                </label>
                <input className="form-input" placeholder="Full name" value={form.clientName} onChange={set("clientName")} />
              </div>

              {/* Client Email */}
              <div>
                <label className="form-label">Contact Email</label>
                <input className="form-input" type="email" placeholder="contact@example.com" value={form.clientEmail} onChange={set("clientEmail")} />
              </div>

              {/* ---- Consignment-specific fields ---- */}
              {t === "Consignment Agreement" && (
                <>
                  <div>
                    <label className="form-label">Gallery Name</label>
                    <input className="form-input" placeholder="e.g. Whitfield Gallery" value={form.galleryName} onChange={set("galleryName")} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Gallery Commission (%)</label>
                      <input className="form-input" type="number" placeholder="50" value={form.commissionRate} onChange={set("commissionRate")} />
                    </div>
                    <div>
                      <label className="form-label">Duration</label>
                      <input className="form-input" placeholder="e.g. 6 months" value={form.consignmentDuration} onChange={set("consignmentDuration")} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Insurance Responsibility</label>
                    <select className="form-select" value={form.insuranceResponsibility} onChange={set("insuranceResponsibility")}>
                      <option value="Gallery">Gallery</option>
                      <option value="Artist">Artist</option>
                      <option value="Shared">Shared</option>
                    </select>
                  </div>
                </>
              )}

              {/* ---- Exhibition Loan-specific fields ---- */}
              {t === "Exhibition Loan Agreement" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Venue Name</label>
                      <input className="form-input" placeholder="e.g. MoMA PS1" value={form.venueName} onChange={set("venueName")} />
                    </div>
                    <div>
                      <label className="form-label">Exhibition Title</label>
                      <input className="form-input" placeholder="e.g. Spring Group Show" value={form.exhibitionTitle} onChange={set("exhibitionTitle")} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Loan Start Date</label>
                      <input className="form-input" type="date" value={form.loanStartDate} onChange={set("loanStartDate")} />
                    </div>
                    <div>
                      <label className="form-label">Loan End Date</label>
                      <input className="form-input" type="date" value={form.loanEndDate} onChange={set("loanEndDate")} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Insurance Value (USD)</label>
                    <input className="form-input" type="number" placeholder="10,000" value={form.insuranceValue} onChange={set("insuranceValue")} />
                  </div>
                </>
              )}

              {/* ---- Mural / Public Art-specific fields ---- */}
              {t === "Mural / Public Art Agreement" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Site Name</label>
                      <input className="form-input" placeholder="e.g. City Hall" value={form.siteName} onChange={set("siteName")} />
                    </div>
                    <div>
                      <label className="form-label">Wall Dimensions</label>
                      <input className="form-input" placeholder="e.g. 20ft x 12ft" value={form.wallDimensions} onChange={set("wallDimensions")} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Site Address</label>
                    <input className="form-input" placeholder="Full address" value={form.siteAddress} onChange={set("siteAddress")} />
                  </div>
                  <div>
                    <label className="form-label">Maintenance Responsibility</label>
                    <select className="form-select" value={form.maintenanceResponsibility} onChange={set("maintenanceResponsibility")}>
                      <option value="Client">Commissioner / Property Owner</option>
                      <option value="Artist">Artist</option>
                      <option value="Shared">Shared</option>
                    </select>
                  </div>
                </>
              )}

              {/* ---- Licensing-specific fields ---- */}
              {t === "Licensing Agreement" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">License Type</label>
                      <select className="form-select" value={form.licenseType} onChange={set("licenseType")}>
                        <option value="Exclusive">Exclusive</option>
                        <option value="Non-Exclusive">Non-Exclusive</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">License Duration</label>
                      <input className="form-input" placeholder="e.g. 12 months" value={form.licenseDuration} onChange={set("licenseDuration")} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Scope of Use</label>
                    <input className="form-input" placeholder="e.g. Print merchandise, North America" value={form.usageScope} onChange={set("usageScope")} />
                  </div>
                  <div>
                    <label className="form-label">Royalty Rate (% of revenue, leave blank for flat fee)</label>
                    <input className="form-input" type="number" placeholder="e.g. 10" value={form.royaltyRate} onChange={set("royaltyRate")} />
                  </div>
                </>
              )}

              {/* Artwork + Price side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Artwork Title</label>
                  <input className="form-input" placeholder="e.g. Solstice No. 3" value={form.artworkTitle} onChange={set("artworkTitle")} />
                </div>
                {t !== "Exhibition Loan Agreement" && (
                  <div>
                    <label className="form-label">{t === "Consignment Agreement" ? "Retail Price (USD)" : "Price (USD)"}</label>
                    <input className="form-input" type="number" placeholder="2,400" value={form.price} onChange={set("price")} />
                  </div>
                )}
              </div>

              {/* Commission-specific: Revisions + Kill Fee */}
              {t === "Commission Agreement" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Revisions Included</label>
                    <input className="form-input" type="number" placeholder="2" value={form.revisionsIncluded} onChange={set("revisionsIncluded")} />
                  </div>
                  <div>
                    <label className="form-label">Kill Fee (%)</label>
                    <input className="form-input" type="number" placeholder="50" value={form.killFeePercent} onChange={set("killFeePercent")} />
                  </div>
                </div>
              )}

              {/* Payment Terms — not for Exhibition Loan or Consignment */}
              {t !== "Exhibition Loan Agreement" && t !== "Consignment Agreement" && (
                <div>
                  <label className="form-label">Payment Terms</label>
                  <select className="form-select" value={form.paymentTerms} onChange={set("paymentTerms")}>
                    {paymentOptions.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Completion Date — not for Exhibition Loan (has its own dates) */}
              {t !== "Exhibition Loan Agreement" && (
                <div>
                  <label className="form-label">{t === "Mural / Public Art Agreement" ? "Completion Deadline" : "Completion / Delivery Date"}</label>
                  <input className="form-input" type="date" value={form.completionDate} onChange={set("completionDate")} />
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button className="btn-secondary flex-1 justify-center" onClick={handlePreviewPDF}>
                  <Eye size={15} />
                  Preview PDF
                </button>
                <button
                  className="btn-copper flex-1 justify-center"
                  onClick={handleSave}
                  disabled={submitting}
                >
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  {submitting ? "Saving..." : "Send for Signing"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Contract Preview */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-2">
                  <Eye size={16} style={{ color: "#B5651D" }} />
                  <span className="card-title">Contract Preview</span>
                </div>
                <span className="badge badge-copper" style={{ fontSize: 10 }}>Live</span>
              </div>
              <div className="card-body">
                <div className="contract-preview" style={{ maxHeight: 480 }}>
                  <h4>{previewTitle}</h4>
                  {previewSections.map((s, i) => (
                    <p key={i} style={{ marginTop: 10 }}>
                      {s.num && s.title ? (
                        <>
                          <strong>{s.num}. {s.title}.</strong> {s.text}
                        </>
                      ) : (
                        <em style={{ color: "#A89F94" }}>{s.text}</em>
                      )}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Contracts */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Recent Contracts</span>
                <span style={{ fontSize: 12, color: "#A89F94", cursor: "pointer" }}>View all</span>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {loadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={20} className="animate-spin" style={{ color: "#B5651D" }} />
                    <span style={{ marginLeft: 8, fontSize: 13, color: "#A89F94" }}>Loading contracts...</span>
                  </div>
                ) : contractList.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <span style={{ fontSize: 13, color: "#A89F94" }}>No contracts yet. Create one above.</span>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Amount</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contractList.map((c) => (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 500 }}>{c.client_name}</td>
                          <td>{c.contract_type}</td>
                          <td><span className={statusBadge(c.status)}>{c.status}</span></td>
                          <td style={{ textAlign: "right", fontWeight: 600 }}>{formatAmount(c.value)}</td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              onClick={() => handleDelete(c)}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                              title="Delete contract"
                            >
                              <Trash2 size={15} style={{ color: "#C27C7C" }} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  TAB 2: MY TEMPLATES                                          */}
      {/* ============================================================ */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Upload Template */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Upload size={16} style={{ color: "#B5651D" }} />
                <span className="card-title">Upload Template</span>
              </div>
            </div>
            <div className="card-body space-y-5">
              {/* Drag & Drop Zone */}
              <div
                className="relative rounded-xl p-6 text-center cursor-pointer transition-colors"
                style={{
                  border: `2px dashed ${dragging ? "#B5651D" : "#E8E2DA"}`,
                  background: dragging ? "rgba(181,101,29,0.04)" : "#FAFAF8",
                }}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                {templateFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <File size={24} style={{ color: "#B5651D" }} />
                    <div className="text-left">
                      <p className="text-[13px] font-medium" style={{ color: "#0E0C0A" }}>{templateFile.name}</p>
                      <p className="text-[11px]" style={{ color: "#A89F94" }}>{formatFileSize(templateFile.size)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setTemplateFile(null) }}
                      className="p-1 rounded-full transition-colors"
                      style={{ color: "#A89F94" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#C4705A"}
                      onMouseLeave={e => e.currentTarget.style.color = "#A89F94"}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={28} style={{ color: "#A89F94", margin: "0 auto 8px" }} />
                    <p className="text-[13px] font-medium" style={{ color: "#0E0C0A" }}>
                      Drop a file here or <span style={{ color: "#B5651D" }}>browse</span>
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: "#A89F94" }}>
                      PDF, DOCX, or TXT — max 10 MB
                    </p>
                  </>
                )}
              </div>

              {/* Template Name */}
              <div>
                <label className="form-label">Template Name</label>
                <input
                  className="form-input"
                  placeholder="e.g. Standard Commission Agreement"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              {/* Category */}
              <div>
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={templateForm.category}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  {categoryOptions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="form-label">Description (optional)</label>
                <input
                  className="form-input"
                  placeholder="Brief description of this template"
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Upload Button */}
              <button
                className="btn-copper w-full justify-center"
                onClick={handleTemplateUpload}
                disabled={uploadingTemplate || !templateFile || !templateForm.name.trim()}
                style={{ opacity: (!templateFile || !templateForm.name.trim()) ? 0.5 : 1 }}
              >
                {uploadingTemplate ? (
                  <><Loader2 size={15} className="animate-spin" /> Uploading...</>
                ) : (
                  <><Upload size={15} /> Upload Template</>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT: Template Library */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <FileText size={16} style={{ color: "#B5651D" }} />
                <span className="card-title">Template Library</span>
              </div>
              <span className="text-[12px]" style={{ color: "#A89F94" }}>
                {templates.length} template{templates.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {loadingTemplates ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={20} className="animate-spin" style={{ color: "#B5651D" }} />
                  <span style={{ marginLeft: 8, fontSize: 13, color: "#A89F94" }}>Loading templates...</span>
                </div>
              ) : templates.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 24px" }}>
                  <FileText size={32} style={{ color: "#E8E2DA", margin: "0 auto 12px" }} />
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#0E0C0A" }}>No templates yet</p>
                  <p style={{ fontSize: 13, color: "#A89F94", marginTop: 4 }}>
                    Upload your first contract template to get started
                  </p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "#F2EDE6" }}>
                  {templates.map(tmpl => (
                    <div key={tmpl.id} className="flex items-center gap-3 px-4 py-3.5 transition-colors"
                      style={{ borderBottom: "1px solid #F2EDE6" }}
                    >
                      {/* File icon */}
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "#F2EDE6" }}>
                        <File size={16} style={{ color: "#B5651D" }} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate" style={{ color: "#0E0C0A" }}>
                          {tmpl.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={categoryBadge(tmpl.category)} style={{ fontSize: 10 }}>
                            {tmpl.category}
                          </span>
                          <span className="text-[10px] font-mono" style={{ color: "#A89F94" }}>
                            {tmpl.file_type} · {tmpl.file_size}
                          </span>
                        </div>
                        {tmpl.description && (
                          <p className="text-[11px] mt-1 truncate" style={{ color: "#A89F94" }}>{tmpl.description}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <a
                          href={tmpl.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg transition-colors"
                          title="Download"
                          style={{ color: "#A89F94" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#B5651D"}
                          onMouseLeave={e => e.currentTarget.style.color = "#A89F94"}
                        >
                          <Download size={15} />
                        </a>
                        <button
                          onClick={() => handleTemplateDelete(tmpl)}
                          className="p-1.5 rounded-lg transition-colors"
                          title="Delete"
                          style={{ color: "#A89F94" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#C4705A"}
                          onMouseLeave={e => e.currentTarget.style.color = "#A89F94"}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contract delete confirmation */}
      <ConfirmModal
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Contract?"
        message={`Are you sure you want to delete this contract for "${confirmTarget?.client_name}"? This cannot be undone.`}
      />

      {/* Template delete confirmation */}
      <ConfirmModal
        open={!!confirmTemplateTarget}
        onClose={() => setConfirmTemplateTarget(null)}
        onConfirm={handleConfirmTemplateDelete}
        title="Delete Template?"
        message={`Are you sure you want to delete "${confirmTemplateTarget?.name}"? The file will be permanently removed.`}
      />
    </div>
  )
}
