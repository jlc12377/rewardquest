import { supabase } from './supabase.js'

/* ============================================================
   data layer — every async function returns { data, error }
   ============================================================ */

/* ---- auth ---- */
export async function signUp(email, password, inviteCode) {
  const opts = {}
  if (inviteCode) {
    opts.data = { pending_invite_code: inviteCode.trim().toUpperCase() }
  }
  return await supabase.auth.signUp({ email, password, options: opts })
}
export async function signIn(email, password) {
  return await supabase.auth.signInWithPassword({ email, password })
}
export async function signOut() {
  return await supabase.auth.signOut()
}
export async function getSession() {
  return await supabase.auth.getSession()
}

/* ---- family bootstrap ----
   The first user to sign up becomes the family parent and creates
   the family row with default tasks/decisions/rewards. Subsequent
   users join that family as the kid. Family <-> user mapping is
   stored in the user's auth metadata. */

const DEFAULT_TASKS = [
  { label: 'Make your bed', points: 5, sort_order: 1 },
  { label: 'Clear your dishes', points: 5, sort_order: 2 },
  { label: 'Finish homework', points: 10, sort_order: 3 },
  { label: 'Tidy your room', points: 8, sort_order: 4 },
  { label: 'Feed / walk the pet', points: 6, sort_order: 5 },
  { label: 'Put away laundry', points: 7, sort_order: 6 },
]
const DEFAULT_DECISIONS = [
  { label: 'Told the truth even though it was hard', points: 40, sort_order: 1 },
  { label: 'Helped someone without being asked', points: 35, sort_order: 2 },
  { label: 'Stayed calm through a frustrating moment', points: 40, sort_order: 3 },
  { label: 'Included someone who was left out', points: 35, sort_order: 4 },
  { label: 'Made my own choice under peer pressure', points: 50, sort_order: 5 },
  { label: 'Owned a mistake and fixed it', points: 45, sort_order: 6 },
]
const DEFAULT_REWARDS = [
  { label: "Pick tonight's dessert", tier: 'Small', cost: 50, emoji: '🍦', sort_order: 1 },
  { label: 'Choose family movie night', tier: 'Small', cost: 80, emoji: '🎬', sort_order: 2 },
  { label: '$15 gift card', tier: 'Medium', cost: 250, emoji: '💳', sort_order: 3 },
  { label: 'Special outing with a parent', tier: 'Medium', cost: 350, emoji: '🎡', sort_order: 4 },
  { label: '$50 gift card to her favorite store', tier: 'Large', cost: 700, emoji: '🛍️', sort_order: 5 },
  { label: 'The big-ticket wish item', tier: 'Large', cost: 1500, emoji: '⭐', sort_order: 6 },
]

/* find an existing family OR create a new one and claim parent role */
/* generate a 6-char family invite code like "RQ-4F2K" (no ambiguous chars) */
function generateInviteCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I/L
  let code = ''
  for (let i = 0; i < 4; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)]
  return 'RQ-' + code
}

export async function joinOrCreateFamily(user) {
  // already linked via metadata? Use that.
  const existing = user.user_metadata && user.user_metadata.family_id
  if (existing) {
    // double-check the family still exists (paranoia)
    const { data: famRow } = await supabase.from('families').select('id').eq('id', existing).maybeSingle()
    if (famRow) {
      return { familyId: existing, role: user.user_metadata.role || 'parent', error: null }
    }
    // Family was deleted — fall through and create a new one
  }

  // Did this user sign up with a pending invite code?
  const pendingCode = user.user_metadata && user.user_metadata.pending_invite_code
  if (pendingCode) {
    const { data: famRow, error: lookupErr } = await supabase
      .from('families')
      .select('id')
      .eq('invite_code', pendingCode)
      .maybeSingle()

    if (lookupErr) return { familyId: null, role: null, error: lookupErr }
    if (!famRow) {
      return {
        familyId: null,
        role: null,
        error: { message: `Family code "${pendingCode}" not found. Ask the parent to double-check the code in their app.` },
      }
    }

    // Link this user as a kid in that family
    const { error: updErr } = await supabase.auth.updateUser({
      data: { family_id: famRow.id, role: 'kid', pending_invite_code: null },
    })
    if (updErr) return { familyId: null, role: null, error: updErr }
    return { familyId: famRow.id, role: 'kid', error: null }
  }

  // No metadata, no invite code → create a new family with this user as the parent
  const inviteCode = generateInviteCode()
  const { data: famRow, error: createErr } = await supabase
    .from('families')
    .insert({
      name: 'My family',
      points: 0, lifetime_points: 0, streak: 1,
      last_active: new Date().toISOString().slice(0, 10),
      invite_code: inviteCode,
    })
    .select().single()
  if (createErr) return { familyId: null, role: null, error: createErr }
  const familyId = famRow.id

  await supabase.from('tasks').insert(DEFAULT_TASKS.map(t => ({ ...t, family_id: familyId })))
  await supabase.from('decisions').insert(DEFAULT_DECISIONS.map(d => ({ ...d, family_id: familyId })))
  await supabase.from('rewards').insert(DEFAULT_REWARDS.map(r => ({ ...r, family_id: familyId })))

  const { error: updErr } = await supabase.auth.updateUser({
    data: { family_id: familyId, role: 'parent' },
  })
  if (updErr) return { familyId: null, role: null, error: updErr }
  return { familyId, role: 'parent', error: null }
}

/* ---- family snapshot ---- */
export async function getFamily(familyId) {
  return await supabase.from('families').select('*').eq('id', familyId).single()
}
export async function updateFamily(familyId, fields) {
  return await supabase.from('families').update(fields).eq('id', familyId)
}

/* If a family was created before invite codes existed, generate one now. Idempotent. */
export async function ensureInviteCode(family) {
  if (family.invite_code) return family.invite_code
  const code = generateInviteCode()
  const { error } = await supabase.from('families')
    .update({ invite_code: code })
    .eq('id', family.id)
  if (error) {
    console.error('ensureInviteCode failed', error)
    return null
  }
  return code
}

/* ---- lists ---- */
export async function getTasks(familyId) {
  return await supabase.from('tasks').select('*').eq('family_id', familyId).order('sort_order')
}
export async function getDecisions(familyId) {
  return await supabase.from('decisions').select('*').eq('family_id', familyId).order('sort_order')
}
export async function getRewards(familyId) {
  return await supabase.from('rewards').select('*').eq('family_id', familyId).order('sort_order')
}
export async function addRow(table, row) {
  return await supabase.from(table).insert(row).select().single()
}
export async function updateRow(table, id, fields) {
  return await supabase.from(table).update(fields).eq('id', id)
}
export async function deleteRow(table, id) {
  return await supabase.from(table).delete().eq('id', id)
}

/* ---- counts (for badges + today line) ---- */
export async function countApprovedClaims(familyId, kind = null) {
  let q = supabase.from('claims').select('id', { count: 'exact', head: true })
    .eq('family_id', familyId).eq('status', 'approved')
  if (kind) q = q.eq('kind', kind)
  return await q
}
export async function countVideos(familyId) {
  return await supabase.from('videos').select('id', { count: 'exact', head: true })
    .eq('family_id', familyId)
}
export async function countRedemptions(familyId) {
  return await supabase.from('redemptions').select('id', { count: 'exact', head: true })
    .eq('family_id', familyId)
}
export async function countApprovedToday(familyId) {
  const today = new Date().toISOString().slice(0, 10)
  return await supabase.from('claims').select('id', { count: 'exact', head: true })
    .eq('family_id', familyId).eq('status', 'approved').eq('claim_date', today)
}

/* ---- claims ---- */
export async function getPendingClaims(familyId) {
  return await supabase.from('claims').select('*')
    .eq('family_id', familyId).eq('status', 'pending')
    .order('created_at', { ascending: false })
}
export async function getApprovedToday(familyId) {
  const today = new Date().toISOString().slice(0, 10)
  return await supabase.from('claims').select('*')
    .eq('family_id', familyId).eq('status', 'approved').eq('claim_date', today)
}
export async function submitClaim(familyId, claim) {
  return await supabase.from('claims').insert({ ...claim, family_id: familyId }).select().single()
}
export async function resolveClaim(claimId, status) {
  return await supabase.from('claims').update({
    status, resolved_at: new Date().toISOString(),
  }).eq('id', claimId)
}

/* ---- videos ---- */
export async function getVideos(familyId, limit = 50) {
  return await supabase.from('videos').select('*')
    .eq('family_id', familyId).order('created_at', { ascending: false }).limit(limit)
}
export async function addVideo(familyId, prompt, mediaUrl, mediaType) {
  return await supabase.from('videos').insert({
    family_id: familyId, prompt, media_url: mediaUrl, media_type: mediaType,
  }).select().single()
}

/* ---- redemptions ---- */
export async function getRedemptions(familyId, limit = 30) {
  return await supabase.from('redemptions').select('*')
    .eq('family_id', familyId).order('created_at', { ascending: false }).limit(limit)
}
export async function addRedemption(familyId, reward) {
  return await supabase.from('redemptions').insert({
    family_id: familyId, reward_label: reward.label, cost: reward.cost, emoji: reward.emoji,
  })
}
export async function markRedemptionFulfilled(redemptionId) {
  return await supabase.from('redemptions').update({ fulfilled: true }).eq('id', redemptionId)
}

/* ---- file uploads ---- */
export async function uploadProof(file, kind = 'proof') {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
  const path = `${kind}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from('proofs').upload(path, file, {
    cacheControl: '3600', upsert: false,
  })
  if (error) return { url: null, error }
  const { data: pub } = supabase.storage.from('proofs').getPublicUrl(path)
  return { url: pub.publicUrl, path, error: null }
}

/* ---- realtime subscription helper ---- */
export function subscribeFamily(familyId, onChange) {
  const ch = supabase.channel(`family-${familyId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'claims',
        filter: `family_id=eq.${familyId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'families',
        filter: `id=eq.${familyId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'videos',
        filter: `family_id=eq.${familyId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'redemptions',
        filter: `family_id=eq.${familyId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks',
        filter: `family_id=eq.${familyId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'decisions',
        filter: `family_id=eq.${familyId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rewards',
        filter: `family_id=eq.${familyId}` }, onChange)
    .subscribe()
  return () => { supabase.removeChannel(ch) }
}
