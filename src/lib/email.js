/* ================================================================ */
/*  Email Helper Functions                                         */
/*  Client-side wrappers for the send-email edge function          */
/* ================================================================ */

import { supabase } from "./supabase"

/**
 * Send an email via the send-email edge function
 * @param {object} options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} [options.type] - Template type: welcome, viewing_room_shared, invoice_reminder, commission_received
 * @param {object} [options.data] - Template-specific data
 * @param {string} [options.subject] - Custom subject (for type="custom" or no type)
 * @param {string} [options.html] - Custom HTML body (for type="custom" or no type)
 * @returns {Promise<{ success: boolean, id: string }>}
 */
export async function sendEmail({ to, type, data, subject, html }) {
  const { data: result, error } = await supabase.functions.invoke("send-email", {
    body: { to, type, data, subject, html },
  })

  if (error) throw error
  if (result?.error) throw new Error(result.error)
  return result
}

/**
 * Send a welcome email to a new user
 * @param {string} email - User's email address
 */
export async function sendWelcomeEmail(email) {
  return sendEmail({
    to: email,
    type: "welcome",
  })
}

/**
 * Send a viewing room invitation email
 * @param {object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.artistName - Artist's name
 * @param {string} options.roomTitle - Viewing room title
 * @param {string} options.roomUrl - Full URL to the viewing room
 * @param {string} [options.message] - Optional personal message
 */
export async function sendViewingRoomEmail({ to, artistName, roomTitle, roomUrl, message }) {
  return sendEmail({
    to,
    type: "viewing_room_shared",
    data: { artistName, roomTitle, roomUrl, message },
  })
}

/**
 * Send an invoice reminder email
 * @param {object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.artistName - Artist's name
 * @param {string} options.description - Invoice description
 * @param {string} options.amount - Invoice amount
 * @param {string} [options.dueDate] - Due date string
 */
export async function sendInvoiceReminder({ to, artistName, description, amount, dueDate }) {
  return sendEmail({
    to,
    type: "invoice_reminder",
    data: { artistName, description, amount, dueDate },
  })
}

/**
 * Send a commission received notification
 * @param {object} options
 * @param {string} options.to - Artist's email
 * @param {string} options.clientName - Client name
 * @param {string} [options.clientEmail] - Client email
 * @param {string} [options.budget] - Budget amount
 * @param {string} [options.description] - Commission description
 */
export async function sendCommissionNotification({ to, clientName, clientEmail, budget, description }) {
  return sendEmail({
    to,
    type: "commission_received",
    data: { clientName, clientEmail, budget, description },
  })
}
