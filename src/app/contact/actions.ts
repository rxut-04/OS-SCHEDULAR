'use server'

import { createServerClient } from '@/lib/supabase/server'

export interface FeedbackPayload {
  name: string
  email: string
  subject: string
  message: string
  type: 'general' | 'bug' | 'suggestion' | 'academic'
  rating: number | null
}

export interface ActionResult {
  success: boolean
  error?: string
}

export async function submitFeedback(payload: FeedbackPayload): Promise<ActionResult> {
  // Basic server-side validation
  if (!payload.name.trim() || payload.name.trim().length < 2) {
    return { success: false, error: 'Please enter your full name (at least 2 characters).' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(payload.email)) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  if (!payload.message.trim() || payload.message.trim().length < 10) {
    return { success: false, error: 'Message must be at least 10 characters long.' }
  }

  const supabase = createServerClient()

  if (!supabase) {
    // Supabase not configured — still show success to the user (graceful degradation)
    console.warn('Supabase not configured. Feedback not persisted.')
    return { success: true }
  }

  const { error } = await supabase.from('feedback').insert({
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    subject: payload.subject.trim() || null,
    message: payload.message.trim(),
    type: payload.type,
    rating: payload.rating,
    // created_at is set by Supabase default (now())
  })

  if (error) {
    console.error('Supabase insert error:', error.message)
    return { success: false, error: 'Could not save your feedback. Please try again shortly.' }
  }

  return { success: true }
}
