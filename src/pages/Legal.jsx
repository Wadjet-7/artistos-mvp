import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Shield, FileText } from "lucide-react"

const LAST_UPDATED = "March 12, 2026"

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="font-serif text-lg font-semibold mb-3" style={{ color: "#0E0C0A" }}>{title}</h2>
      <div className="text-sm leading-relaxed space-y-3" style={{ color: "#4A4540" }}>
        {children}
      </div>
    </div>
  )
}

/* ================================================================ */
/*  Terms of Service                                                 */
/* ================================================================ */
function TermsContent() {
  return (
    <>
      <Section title="1. Acceptance of Terms">
        <p>By creating an account or using ArtistOS ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Service.</p>
      </Section>

      <Section title="2. Description of Service">
        <p>ArtistOS is a software-as-a-service platform that provides artists with tools for portfolio management, financial tracking, commission management, AI-powered tools, analytics, and marketplace connections.</p>
      </Section>

      <Section title="3. Account Registration">
        <p>You must provide accurate and complete information when creating your account. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account.</p>
      </Section>

      <Section title="4. Subscription Plans & Billing">
        <p>ArtistOS offers free and paid subscription tiers. Paid subscriptions are billed monthly through Stripe. You may cancel at any time through your account settings. Cancellations take effect at the end of the current billing period.</p>
        <p>We reserve the right to change pricing with 30 days advance notice to active subscribers.</p>
      </Section>

      <Section title="5. Your Content">
        <p>You retain all ownership rights to the artwork, images, and content you upload to ArtistOS. By uploading content, you grant us a limited license to store, display, and process your content solely to provide the Service.</p>
        <p>You represent that you have all necessary rights to any content you upload and that your content does not infringe any third party's intellectual property rights.</p>
      </Section>

      <Section title="6. AI-Powered Features">
        <p>ArtistOS uses third-party AI services (such as OpenAI) to generate artwork descriptions, price suggestions, and artist bios. AI-generated content is provided as suggestions only and should be reviewed before use. We do not guarantee the accuracy of AI outputs.</p>
      </Section>

      <Section title="7. Acceptable Use">
        <p>You agree not to: (a) use the Service for unlawful purposes; (b) upload content that is fraudulent, defamatory, or infringes third-party rights; (c) attempt to reverse engineer or exploit the Service; (d) use automated systems to access the Service beyond normal usage.</p>
      </Section>

      <Section title="8. Limitation of Liability">
        <p>ArtistOS is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the preceding 12 months.</p>
      </Section>

      <Section title="9. Termination">
        <p>We may suspend or terminate your account for violation of these terms. You may delete your account at any time. Upon termination, we will make your data available for export for 30 days.</p>
      </Section>

      <Section title="10. Changes to Terms">
        <p>We may update these terms periodically. Material changes will be communicated via email or in-app notification at least 14 days before taking effect.</p>
      </Section>

      <Section title="11. Contact">
        <p>For questions about these terms, contact us at <a href="mailto:legal@artistos.app" className="underline" style={{ color: "#B5651D" }}>legal@artistos.app</a>.</p>
      </Section>
    </>
  )
}

/* ================================================================ */
/*  Privacy Policy                                                   */
/* ================================================================ */
function PrivacyContent() {
  return (
    <>
      <Section title="1. Information We Collect">
        <p><strong>Account Information:</strong> Name, email address, password (hashed), and optional profile details (bio, website, location, medium, style).</p>
        <p><strong>Content:</strong> Artwork images, descriptions, commission details, invoices, contracts, and other content you create within the Service.</p>
        <p><strong>Usage Data:</strong> Activity logs, feature usage patterns, and interactions within the platform to improve your experience.</p>
        <p><strong>Payment Information:</strong> Processed securely by Stripe. We do not store your full credit card number on our servers.</p>
      </Section>

      <Section title="2. How We Use Your Information">
        <p>We use your information to: (a) provide and maintain the Service; (b) process payments; (c) send important account notifications; (d) improve the Service through analytics; (e) provide AI-powered features by sending relevant data to our AI providers.</p>
      </Section>

      <Section title="3. Data Sharing">
        <p>We do not sell your personal data. We share data only with:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Service providers:</strong> Supabase (hosting/database), Stripe (payments), OpenAI (AI features), Resend (email)</li>
          <li><strong>Public profiles:</strong> Information you choose to make public (artist profile, portfolio) is visible to anyone</li>
          <li><strong>Legal requirements:</strong> If required by law or to protect rights and safety</li>
        </ul>
      </Section>

      <Section title="4. Data Storage & Security">
        <p>Your data is stored on Supabase (powered by PostgreSQL) with row-level security policies. Images are stored in encrypted cloud storage. All data transmission uses HTTPS/TLS encryption.</p>
      </Section>

      <Section title="5. Your Rights">
        <p>You have the right to: (a) access your personal data; (b) correct inaccurate data; (c) delete your account and data; (d) export your data; (e) withdraw consent for optional processing.</p>
        <p>To exercise these rights, contact us at <a href="mailto:privacy@artistos.app" className="underline" style={{ color: "#B5651D" }}>privacy@artistos.app</a>.</p>
      </Section>

      <Section title="6. Cookies & Analytics">
        <p>We use essential cookies for authentication and session management. We do not use third-party advertising cookies. Analytics data is collected in aggregate form to improve the Service.</p>
      </Section>

      <Section title="7. Data Retention">
        <p>We retain your data for as long as your account is active. After account deletion, we remove personal data within 30 days, except where required by law.</p>
      </Section>

      <Section title="8. Children's Privacy">
        <p>ArtistOS is not intended for users under 16 years of age. We do not knowingly collect data from children.</p>
      </Section>

      <Section title="9. Changes to This Policy">
        <p>We may update this policy periodically. Material changes will be communicated via email or in-app notification.</p>
      </Section>

      <Section title="10. Contact">
        <p>For privacy inquiries, contact us at <a href="mailto:privacy@artistos.app" className="underline" style={{ color: "#B5651D" }}>privacy@artistos.app</a>.</p>
      </Section>
    </>
  )
}

/* ================================================================ */
/*  Main Legal Page                                                  */
/* ================================================================ */
export default function Legal() {
  const [tab, setTab] = useState("terms")

  return (
    <div className="min-h-screen" style={{ background: "#FAF8F5" }}>
      {/* Header */}
      <header className="py-6 px-6 flex items-center gap-4" style={{ borderBottom: "1px solid #E8E2DA" }}>
        <Link to="/" className="p-2 rounded-lg transition-colors" style={{ color: "#A89F94" }}
          onMouseEnter={e => e.currentTarget.style.color = "#0E0C0A"}
          onMouseLeave={e => e.currentTarget.style.color = "#A89F94"}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-serif text-xl font-semibold" style={{ color: "#0E0C0A" }}>Legal</h1>
          <p className="text-xs" style={{ color: "#A89F94" }}>Last updated: {LAST_UPDATED}</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Tab switcher */}
        <div className="flex gap-1 p-1 rounded-xl w-fit mb-8" style={{ background: "#F2EDE6" }}>
          <button onClick={() => setTab("terms")}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            style={{
              background: tab === "terms" ? "white" : "transparent",
              color: tab === "terms" ? "#0E0C0A" : "#A89F94",
              boxShadow: tab === "terms" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}>
            <FileText size={14} /> Terms of Service
          </button>
          <button onClick={() => setTab("privacy")}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            style={{
              background: tab === "privacy" ? "white" : "transparent",
              color: tab === "privacy" ? "#0E0C0A" : "#A89F94",
              boxShadow: tab === "privacy" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}>
            <Shield size={14} /> Privacy Policy
          </button>
        </div>

        {/* Content */}
        <div className="card p-8">
          <h1 className="font-serif text-2xl font-semibold mb-1" style={{ color: "#0E0C0A" }}>
            {tab === "terms" ? "Terms of Service" : "Privacy Policy"}
          </h1>
          <p className="text-xs mb-8" style={{ color: "#A89F94" }}>
            Effective date: {LAST_UPDATED}
          </p>
          {tab === "terms" ? <TermsContent /> : <PrivacyContent />}
        </div>
      </div>
    </div>
  )
}
