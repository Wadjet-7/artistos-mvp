import { supabase } from "./supabase"

export async function fetchMyThreads(userId) {
  const { data, error } = await supabase
    .from("support_threads")
    .select("*")
    .eq("user_id", userId)
    .order("last_message_at", { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchThreadMessages(threadId) {
  const { data, error } = await supabase
    .from("support_messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })
  if (error) throw error
  return data || []
}

export async function createThread(userId, subject, body, source = "user") {
  const { data: thread, error: threadErr } = await supabase
    .from("support_threads")
    .insert({ user_id: userId, subject, source })
    .select()
    .single()
  if (threadErr) throw threadErr

  const { error: msgErr } = await supabase
    .from("support_messages")
    .insert({ thread_id: thread.id, sender_role: source === "admin" ? "admin" : "user", sender_id: userId, body })
  if (msgErr) throw msgErr

  return thread
}

export async function sendMessage(threadId, senderId, body, role = "user") {
  const { error } = await supabase
    .from("support_messages")
    .insert({ thread_id: threadId, sender_role: role, sender_id: senderId, body })
  if (error) throw error
}

export async function markThreadRead(threadId) {
  const { error } = await supabase
    .from("support_threads")
    .update({ unread_for_user: 0 })
    .eq("id", threadId)
  if (error) throw error
}

export async function closeThread(threadId) {
  const { error } = await supabase
    .from("support_threads")
    .update({ status: "closed" })
    .eq("id", threadId)
  if (error) throw error
}

export async function fetchAnnouncements(plan, isFounder) {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(20)
  if (error) throw error

  const filtered = (data || []).filter(a => {
    if (a.audience === "all") return true
    if (a.audience === "founders") return isFounder
    return a.audience === plan
  })
  return filtered
}

export async function markAnnouncementRead(announcementId, userId) {
  const { error } = await supabase
    .from("announcement_reads")
    .upsert({ announcement_id: announcementId, user_id: userId })
  if (error) throw error
}

export async function fetchReadAnnouncements(userId) {
  const { data, error } = await supabase
    .from("announcement_reads")
    .select("announcement_id")
    .eq("user_id", userId)
  if (error) throw error
  return new Set((data || []).map(r => r.announcement_id))
}

export async function fetchAppSettings() {
  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value")
  if (error) throw error
  const settings = {}
  ;(data || []).forEach(r => { settings[r.key] = r.value })
  return settings
}
