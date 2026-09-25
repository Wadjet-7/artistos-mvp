# ArtistOS help guide (knowledge base for "Ask ArtistOS")

<!--
This is the ground truth the AI help agent answers from. Button names are copied from the app, so keep them exact.
Written Sept 25, 2026 from the code at commit 43afafd. Update this file whenever a label, plan limit or behaviour changes.
Sections marked "Heads-up" describe current limitations. The agent must say these plainly and never promise more than the app does.
Each "##" heading is one retrieval section. Keep sections short and self-contained.
-->

## About ArtistOS
ArtistOS is business software for working visual artists. It keeps your artwork inventory, pricing, contracts, invoices, collectors, viewing rooms, CV, public artist page and a grant finder in one place. It was built in New Orleans by founder Larry Jones. The main menu is the sidebar on the left. On a phone, tap the menu icon at the top left. To jump to any page, press **Ctrl+K** (Windows) or **Cmd+K** (Mac) and type the page name.

## Plans and prices
- **Starter: Free.** Up to 25 artworks, 3 viewing rooms, 20 contacts and 10 invoices. Includes the contract generator, invoices, commissions, messages, Artist CV, contacts and your public artist page.
- **Pro: $29/month or $290/year.** 14-day free trial on monthly. Up to 200 artworks, 25 viewing rooms, 500 contacts and 100 invoices. Adds the AI tools (AI Describe, AI Suggest Price, AI Generate Bio), Analytics, Social Scheduler, Exhibitions, Consignments, catalog export and My Website.
- **Studio: $120/month or $1,200/year.** Unlimited everything. Adds the grant and residency finder (Opportunities), provenance records, appraisal and insurance reports, career analytics and the consignment map ("Where is Everything").
- **Students:** a .edu email gets 50% off Pro. It's applied automatically at checkout.
- **Founding Artists** have Studio free for life. Never suggest upgrades to them.
- **What locked features look like:** the page appears blurred with "Upgrade to {Plan}" and an **Upgrade** button. When you hit a limit, a banner says "You've reached the … limit" with an **Upgrade** button.

## How to upgrade, change or cancel a plan
- **To upgrade:** go to Settings (click your name at the bottom of the sidebar), open the **Billing** tab, then click **Upgrade Plan**. You can also go straight to the Upgrade page, choose **Monthly** or **Annual** (annual is selected by default and saves 2 months), and click **Start 14-Day Free Trial** (Pro, monthly) or **Upgrade to {Plan}**.
- **To change or cancel a paid plan:** Settings → **Billing** → **Manage Subscription**. This opens the secure Stripe billing portal, where you can switch plans, update your card or cancel. The **Downgrade** button on the Upgrade page is disabled; use Manage Subscription instead.
- **Promo codes** are entered at signup in the field **"Promo code (optional)"**, or come in automatically from a link with `?code=`. The Upgrade page has no promo-code box. If someone already has an account and has a code, send them to the team (talk_to_team).
- Billing disputes, refunds and invoices for your subscription always go to the team.

## Getting started (first steps)
The Dashboard shows a **"Get set up in minutes"** card with four steps:
1. **Add your first 3 artworks** (takes you to Portfolio)
2. **Create an invoice or contract** (takes you to Finances)
3. **Add a photo or bio to your profile** (takes you to Settings)
4. **Share your public artist page**, which copies your link

The card hides when you finish, or when you click the X. The **Quick Actions** on the Dashboard are shortcuts: "Upload Artwork", "Viewing Rooms", "Generate Contract", "Manage Contacts", "Artist CV" and "View Commissions".

## Dashboard
The Dashboard is your overview. It has the stat cards "Total Artworks", "Active Commissions", "Revenue" and "Portfolio Value", the **Revenue Overview** chart ("Last 6 months" / "Last year" / "All time"), "Active Commissions", "Recent Activity" and **Portfolio Intelligence**.
- **Heads-up:** "Revenue" counts paid invoices only. "Portfolio Value" adds up the prices of all your artworks, including sold ones.

## Add an artwork (Portfolio)
1. Open **Portfolio** in the sidebar and click **Add Artwork**. On an empty portfolio the button is **Upload First Artwork**.
2. Fill in **Artwork Title**, **Medium**, **Price (USD)**, **Dimensions** and **Description**, and set **Status** (Available / Sold / Reserved).
3. Under **Image**, click or drag a photo in (JPG, PNG, TIFF or WebP, up to 25MB). A clear phone photo is fine.
4. Click **Add Artwork** to save.

Starter can hold up to 25 artworks. When you reach the limit, saving is blocked until you upgrade.

## AI description and AI price suggestion (Pro and Studio)
In the **Add Artwork** window:
- **AI Describe** (next to Description) writes a gallery-ready description. Enter the title first. Edit the result so it sounds like you.
- The small **AI** button next to Price (tooltip "AI Suggest Price") suggests a price from your medium, size and your past prices. It fills in a middle price and shows the range, like "Suggested: $1,200 – $1,800". Choose Medium first.
- On Starter these buttons don't appear. The window says "Upgrade to Pro for AI-powered descriptions and pricing". Pro has a 14-day free trial.
- AI suggestions are a starting point, not an appraisal. Adjust for your market, sales history and venue.

## How to price artwork
The common formulas are:
- **Square inch:** width × height × a rate. Emerging painters often use $1–$5 per square inch.
- **Linear inch:** (width + height) × a rate.

Add framing and materials, stay consistent across venues, and raise prices after steady sales. There's a free calculator at artistosapp.com/how-to-price-artwork. On Pro and Studio, the **AI** price button in Add Artwork gives a suggested range.

## QR codes, certificates of authenticity and catalogs
Hover over an artwork card in Portfolio:
- **QR icon ("QR Code"):** shows a QR code that links to the artwork's page. Click **Print QR Code** to print it.
- **Award icon ("Certificate of Authenticity"):** fill in **Edition (optional)** and **Additional Notes / Provenance**, then click **Download PDF**. It opens the print dialog; choose "Save as PDF". Each certificate gets a number like COA-2026-XXXXXXXX.
- **Export Catalog** (Portfolio header): name it under **Catalog Title**, choose **Include prices**, click **Select All** (or pick pieces), then click **Export PDF Catalog**.
- **Appraisal Report** (Studio, Portfolio header) opens a printable "Appraisal & Insurance Valuation".
- **Heads-up:** the appraisal fields in Add Artwork (Studio) don't save yet, so the report uses list prices. Tell the user the team is fixing this.

## Provenance (Studio)
Provenance lives on each artwork's own page (the page the QR code opens). On the **Provenance** tab, click **Add Event**, choose the **Event Type** (Created, Exhibited, Published, Sold, Consigned, Loaned, Condition Report, Restored, Appraised), and add the date, **Party / Person**, **Location** and **Notes**.
- **Heads-up:** artwork cards in Portfolio don't open this page yet. The way in is the artwork's QR code link. Editions tracking isn't switchable on from the app yet.

## Share your work: your public artist page
Every artist has a public page at artistosapp.com/artist/{your-id}. Visitors see your photo, bio, statement, available and past works, a **View CV** link and a **Request Commission** button.
- **To copy your link:** use **Share your public artist page** on the Dashboard card. On Pro, you can also go to **My Website** and use **Preview site**, or copy the link under "Your public profile".
- **Heads-up:** if you've dismissed the Dashboard card on Starter, there's no copy button right now. Offer talk_to_team, or tell them the link format above.
- A complete profile (photo, bio, medium, location) and a few artworks make the page look professional and help it show up on Google.

## Viewing rooms (private curated selections)
1. Open **Viewing Rooms** and click **New Room** (or **Create Your First Room**).
2. Fill in **Room Title**, **Recipient Name**, **Recipient Email** and **Description**, and pick artworks under **Select Artworks**. You need artworks in Portfolio first.
3. Click **Create Room**. New rooms start as a Draft.
4. Click **Publish**. Then use **Copy Link**, **Send** (emails the recipient) or **Preview**.

Links only work while the room is published. **Unpublish** hides it again. Starter includes 3 rooms and Pro includes 25.

## Contracts
1. Open **Contracts**. On the **Create Contract** tab, choose a **Template**: Commission Agreement, Consignment Agreement, Licensing Agreement, Direct Sale Agreement, Exhibition Loan Agreement, or Mural / Public Art Agreement.
2. Fill in the client or gallery name, **Contact Email**, artwork, price, **Payment Terms** and dates. The fields change with each template.
3. Check the **Contract Preview** on the right, then click **Preview PDF** to download or print.

- **Heads-up:** **Send for Signing** currently saves the contract as a draft only. It does not email the client or collect an e-signature. Send the PDF yourself.
- The **My Templates** tab stores your own contract files (PDF, DOCX or TXT). They can't be filled in by the generator.
- ArtistOS contracts are templates, not legal advice. For high-value or unusual deals, have a lawyer review.

## Invoices and getting paid online
1. **Set up payments once:** go to Settings → **Billing** → **Payment Account** → **Connect Stripe Account** and finish Stripe's setup. When done, it shows "Stripe Account Connected". Payments go directly to your account, and ArtistOS takes a 5% platform fee.
2. Open **Finances** and click **New Invoice**. Fill in **Client Name**, **Client Email (for reminders)**, **Description**, **Amount (USD)** and **Due Date**, then click **Create Invoice**.
3. In the invoice's row, click **Send Invoice with Payment Link** (the email goes to the client) or **Copy Payment Link** (paste it anywhere). Collectors pay by card on a secure Stripe page.
4. Other row actions: **Download PDF**, **Edit**, **Mark as Paid** (for cash or check payments) and **Delete**.
5. If invoices are overdue, a banner offers **Send Reminders**. Use **Export CSV** for your records.

- **Important:** always connect Stripe (step 1) before sending payment links. If someone isn't sure whether they're connected, point them to Settings → Billing.
- Starter includes 10 invoices and Pro includes 100.

## Expenses
In **Finances**, open the **Expenses** tab and click **Add Expense**. Fill in **Description**, **Amount (USD)**, **Date**, **Category** (Materials, Studio, Shipping, Marketing, Travel, Equipment, Insurance, Fees, Other) and **Notes**. The **Expense Breakdown** card and **Export CSV** help at tax time. ArtistOS doesn't give tax advice; check with a tax professional.

## Contacts (collectors, galleries, press)
Open **Contacts** and click **Add Contact**. Fill in **Name**, **Type** (Collector / Gallery / Advisor / Collaborator / Press / Other), **Email**, **Phone**, **Company**, **Total Purchases ($)**, **Follow-up Date**, **Notes** and **Tags** (type a tag and press Enter). Filter using the pills at the top, or search. When a follow-up date passes, the contact shows "Overdue". Starter includes 20 contacts.

## Commissions
- **Collectors can request a commission** from your public artist page with the **Request Commission** button. Requests appear in **Commissions** under the **Pending** tab.
- Click **Accept** to move a request to Active, or **Decline**. Heads-up: Decline deletes the request permanently.
- To add one yourself, click **New Commission** and fill in client, **Commission Title**, **Budget (USD)**, **Deadline**, **Status**, **Progress (%)** and **Milestone**.
- **Heads-up:** accepted commissions can't be edited or marked complete from the Active tab yet. There are also no automatic emails, so reply to the collector by email.
- Requests show up in Commissions → Pending, but right now they don't also appear in Messages, and you don't get an email about them. Check the Pending tab regularly.
- If an artist says a collector's request never arrived, send them to the team.

## Messages
**Messages** is a notebook for your conversations with collectors and collaborators. Click **New**, then fill in **Participant Name** and click **Start Conversation**. Commission requests from your public page are meant to appear here as well. For now, check Commissions → Pending instead.
- **Heads-up:** messages you type here are **not delivered** to the other person, because they don't have an ArtistOS login. Use email or text to reply. To reach the ArtistOS team, use Help & messages → **Messages from the team**, not this page.

## Artist CV
1. Open **Artist CV**. Write your **Artist Statement**, then click **Add Entry** in each section: Solo Exhibitions, Group Exhibitions, Education, Collections, Awards & Grants, Residencies, Publications.
2. Each entry has **Title / Degree**, **Venue / Institution**, **Location** and **Year**.
3. Click **Save CV**. It doesn't save automatically, so save before leaving the page.
4. **Export PDF** opens a print window; choose "Save as PDF". If nothing opens, allow pop-ups.

Your public CV is at artistosapp.com/artist/{your-id}/cv. It's linked from your public page with **View CV**. Newest items go first in each section. Self-taught artists can list workshops and mentorships under Education. There's a guide at artistosapp.com/artist-cv-template.
- **Heads-up:** the statement here appears on your CV. The statement on your public artist page is set separately in **My Website** (Pro). Paste the same text in both.

## Artist statement tips
Write in the first person, 150–300 words: what you make, how you make it, and why. Use concrete materials and subjects, and avoid jargon. Keep a 100-word version for applications. Full guide: artistosapp.com/how-to-write-an-artist-statement.

## Profile, photo and bio (Settings)
Click your name at the bottom of the sidebar, or your avatar at the top right, to open **Settings**. On the **Profile** tab:
- **Change photo**
- **Full name**, **Bio**, **Primary medium**, **Style**, **Website**, **Location**
- **Save changes**

On Pro and Studio, **AI Generate Bio** drafts a bio for you. Review it, then save. Your photo, bio, medium and location appear on your public page, and they are also used by the grant finder.
- **Heads-up:** changing **Email** here doesn't change your login email. For that, contact the team.

## My Website (Pro)
**My Website** controls how your public artist page looks:
- **Theme:** Gallery White, Dark Studio, Earth Tone, Monochrome, Warm Copper
- **Accent Color**
- **Artist Statement** (up to 2,000 characters)
- **Sections** toggles: About / Bio, Artist Statement, Available Works, Past Works, CV Link, Commission Form

Click **Save changes**, then **Preview site**. Preview shows the saved version.

## Consignments (Pro; map on Studio)
Open **Consignments** and click **New Consignment**. Fill in **Gallery / Dealer**, **Artwork**, contact details, **Start Date** / **End Date**, **Commission %**, **Status** (Active / Returned / Sold / Expired), **Terms** and **Notes**, then click **Create Consignment**. While a consignment is Active, the artwork's location is set to that gallery. On Studio, the **Where is Everything** view shows what's in the studio, on consignment, in exhibitions and sold. Always get consignment terms in writing; the Consignment Agreement template is under Contracts.

## Exhibitions (Pro)
Open **Exhibitions** and click **New Exhibition**. Fill in **Exhibition Title**, **Venue**, **Location**, dates and **Status**, pick artworks, and build a **Checklist** (type an item and press Enter). Click **Create Exhibition**. Click an exhibition's progress bar to tick off checklist items.

## Social Scheduler (Pro)
Open **Social Scheduler** and click **+ New Post**. Choose **Platform** and **Artwork**, pick a **Quick Template** or write a **Caption** (**Add Hashtags** is available), set **Scheduled Date**, then click **Schedule Post**.
- **Heads-up:** ArtistOS doesn't post for you. On the day, use **Copy Caption** and post it yourself, or use **Post Now** (which prefills text for X and LinkedIn only).

## Analytics (Pro; Career Analytics on Studio)
**Market Analytics** shows statistics about your own portfolio: Market Position Score, average price, sold vs. available, portfolio by medium, monthly additions and recent activity. Studio adds **Career Analytics** (Price Trajectory, Time to Sale). It doesn't include outside market or auction data.

## Grant and residency finder (Opportunities, Studio)
1. Complete your profile first (medium, style, location, bio in Settings) and your **Artist CV**. Matching uses these, and your exhibition count sets your career stage.
2. Open **Opportunities** and click **Refresh Matches** (once per hour).
3. Browse the **Matched**, **All Open**, **Saved** and **Applications** tabs. Each card shows the match %, days left, amount and why it matched.
4. Use **Save** to keep a match, **Dismiss** to hide it, and **View original** to read the official call. Always confirm eligibility and deadlines there.
5. Click **Draft Application**, choose up to 6 artworks, then click **Generate Draft**. Edit the four sections (Artist Statement, Project Description, Bio, Why This Opportunity), use **Copy**, and **Save Draft**.

- The listings are verified programs (updated Sept 2026). Some are rolling, or their next date hasn't been announced; these show once the app supports them.
- **Heads-up:** when drafting for a second opportunity, click **Regenerate** so you don't reuse the previous draft. Dismissals can't be undone yet.
- AI drafts are a starting point. Rewrite them in your own voice before submitting.

## Discover Artists and Emerging Artists
**Discover Artists** and **Emerging Artists** let you browse other artists on ArtistOS. Click a card to open their public page. The public directory is at artistosapp.com/artists.

## Notifications and search
- The **bell** at the top shows recent activity, such as new commission requests. **Mark all read** clears the count for now.
- **Ctrl+K** / **Cmd+K** opens page search.
- **Notification Preferences** are in Settings → **Notifications**.

## Account, sign out, deleting your account
Sign out is at the bottom of the sidebar, or in Settings → Profile → **Sign out**. To delete your account, change your login email, or get a copy of your data, contact the team (talk_to_team). There isn't a button for these yet.

## Contact Larry and the ArtistOS team
- **Start here:** open **Help & messages** (top bar). **Ask ArtistOS** answers most how-to questions right away.
- **If that doesn't solve it:** click **Talk to the team**. It opens **Messages from the team** with your question attached, and Larry (the founder) replies personally, usually within a day.
- **Email:** larry@synergysourceadvisors.com
- **Founding Artists and early members** have Larry's direct line: the **Message Larry** and **Text Larry** buttons are pinned at the top of the Help panel.

Use the team for billing, refunds, bugs, account changes, promo codes on existing accounts, partnership or press questions, or anything the help guide doesn't cover.

## What the help agent should never do
- Invent features, prices, deadlines or eligibility.
- Promise refunds or billing changes.
- Give definitive legal, tax or investment advice.
- Share anything about other users.

When unsure, say so and offer **Talk to the team**.
