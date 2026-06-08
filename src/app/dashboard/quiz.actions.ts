'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_index: number
  explanation: string
  category: string
  difficulty: string
  points_value: number
}

export interface UserPoints {
  total_points: number
  total_correct: number
  total_attempted: number
  streak_days: number
  last_quiz_date: string | null
  level: string
}

export interface TrustedContact {
  id: string
  name: string
  number: string
  relation: string
  created_at: string
}

// ── fetch 3 random questions user has NOT answered today ──────────────────────
export async function fetchDailyQuizQuestions(): Promise<QuizQuestion[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const today = new Date().toISOString().split('T')[0]
  const { data: attempted } = await supabase
    .from('quiz_attempts')
    .select('question_id')
    .eq('user_id', user.id)
    .gte('attempted_at', `${today}T00:00:00.000Z`)

  const attemptedIds = (attempted ?? []).map((a: { question_id: string }) => a.question_id)

  let query = supabase
    .from('quiz_questions')
    .select('id, question, options, correct_index, explanation, category, difficulty, points_value')
    .eq('active', true)
    .limit(50)

  if (attemptedIds.length > 0) {
    query = query.not('id', 'in', `(${attemptedIds.join(',')})`)
  }

  const { data: questions } = await query

  if (!questions || questions.length === 0) {
    const { data: fallback } = await supabase
      .from('quiz_questions')
      .select('id, question, options, correct_index, explanation, category, difficulty, points_value')
      .eq('active', true)
      .limit(50)
    return shuffleAndPick(fallback ?? [], 3)
  }

  return shuffleAndPick(questions, 3)
}

// ── submit one answer ─────────────────────────────────────────────────────────
export async function submitQuizAnswer(
  questionId: string,
  selectedIdx: number,
  isCorrect: boolean,
  pointsValue: number,
): Promise<{ success: boolean; newPoints?: UserPoints }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }

  await supabase.from('quiz_attempts').insert({
    user_id: user.id,
    question_id: questionId,
    selected_idx: selectedIdx,
    is_correct: isCorrect,
    points_earned: isCorrect ? pointsValue : 0,
  })

  await supabase.rpc('award_quiz_points', {
    p_user_id: user.id,
    p_points: pointsValue,
    p_is_correct: isCorrect,
  })

  const { data: pts } = await supabase
    .from('user_points')
    .select('total_points, total_correct, total_attempted, streak_days, last_quiz_date, level')
    .eq('user_id', user.id)
    .single()

  revalidatePath('/dashboard')
  return { success: true, newPoints: pts ?? undefined }
}

// ── fetch user points ─────────────────────────────────────────────────────────
export async function fetchUserPoints(): Promise<UserPoints | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('user_points')
    .select('total_points, total_correct, total_attempted, streak_days, last_quiz_date, level')
    .eq('user_id', user.id)
    .single()

  return data ?? null
}

// ── fetch trusted contacts ────────────────────────────────────────────────────
export async function fetchTrustedContacts(): Promise<TrustedContact[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('trusted_contacts')
    .select('id, name, number, relation, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  return data ?? []
}

// ── add trusted contact ───────────────────────────────────────────────────────
export async function addTrustedContact(
  name: string,
  number: string,
  relation: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  if (!name.trim() || !number.trim())
    return { success: false, error: 'Name and number are required.' }

  const { error } = await supabase.from('trusted_contacts').insert({
    user_id: user.id,
    name: name.trim(),
    number: number.trim(),
    relation: relation || 'Family',
  })

  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

// ── delete trusted contact ────────────────────────────────────────────────────
export async function deleteTrustedContact(
  contactId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('trusted_contacts')
    .delete()
    .eq('id', contactId)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

// ── util ──────────────────────────────────────────────────────────────────────
function shuffleAndPick<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}
