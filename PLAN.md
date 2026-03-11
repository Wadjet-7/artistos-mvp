# ArtistOS Phase 2: Full Sprint Plan

## Overview
Connect ALL remaining pages to real Supabase data. After this phase, only Marketplace and Emerging Artists will use mock data (multi-user features that need real users to populate).

## Step 1: SQL Schema (7 new tables)
Run all SQL in Supabase SQL Editor at once:
- `invoices` - client_name, description, amount, status, due_date, paid_date
- `contracts` - client_name, project_title, contract_type, value, status, terms_text
- `commissions` - client_name, title, medium, budget, deadline, status, progress
- `conversations` - participant_name, last_message, unread_count
- `messages` - conversation_id, sender (me/them), content
- `scheduled_posts` - platform, content, scheduled_date, status
- `activity_log` - activity_type, description, metadata (JSONB)

All tables have: UUID PK, user_id FK, created_at, RLS policies (users see only their own data).

## Step 2: Storage + Helpers
- Create `avatars` storage bucket (public read, user-scoped upload)
- Add `logActivity()` helper to supabase.js

## Step 3: Page-by-Page Implementation (in order)

### 3a. Finances (CRUD) - Invoices
- Fetch/create/edit/delete invoices from Supabase
- Compute stats dynamically (total revenue, pending, overdue)
- Add Modal form for create/edit
- Mark as Paid shortcut button

### 3b. Commissions (CRUD)
- Fetch/create/edit/delete commissions
- Tab filtering (Active/Pending/Completed) from real data
- Progress tracking with status updates
- Accept/decline pending commissions

### 3c. Contracts (CRUD)
- Save generated contracts to Supabase
- Replace static recent contracts table with real data
- Delete contracts, status badges

### 3d. Messages (persistence)
- Persist conversations and messages to Supabase
- Send message -> save to DB -> update conversation
- New Conversation modal
- Fetch messages when selecting a conversation

### 3e. Social Scheduler (CRUD)
- Fetch/create/edit/delete scheduled posts
- Calendar dots from real scheduled dates
- Platform stats stay static (would need social API integration)

### 3f. Dashboard (aggregation)
- Fetch real counts from artworks, commissions, invoices tables
- Compute stats dynamically (artwork count, portfolio value, active commissions, revenue)
- Show real recent commissions
- Activity feed from activity_log table
- Revenue chart: latest month from paid invoices, rest illustrative

### 3g. Layout notifications
- Notification bell reads from activity_log instead of mockData

### 3h. Analytics (computed)
- Compute avg sale price, portfolio stats from real artworks
- Style trends stay static (market-wide data)

### 3i. Settings avatar upload
- Wire "Change photo" to file input
- Upload to avatars bucket, save URL to profile
- Display avatar image instead of initials when available

## What Stays Mock
- Marketplace.jsx (needs multi-user data)
- Emerging Artists.jsx (needs multi-user data)
- contractTemplates in mockData (static reference data)
- Platform stats in Social Scheduler (needs social API)
- Historical revenue chart data (needs time to accumulate)

## Implementation Pattern
Every page follows the Portfolio.jsx pattern:
1. Import supabase, useAuth, Modal, Loader2
2. State: list, loading, modalOpen, editingId, form, submitting
3. fetchData() with .from().select().eq("user_id").order()
4. handleSave() for create/update
5. handleDelete() with confirmation
6. Loading spinner while fetching
7. Empty state when no data
8. Modal form for CRUD

## Estimated Effort: ~5 hours total
