import { supabase } from './supabase.js'

/* ============================================================
   data layer — every async function returns { data, error }
   ============================================================ */

/* ---- auth ---- */
export async function signUp(email, password) {
  return await supabase.auth.signUp({ email, password })
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
export async function joinOrCreateFamily(user) {
  // already linked via metadata?
  const existing = user.user_metadata && user.user_metadata.family_id
  if (existing) {
    return { familyId: existing, role: user.user_metadata.role || 'kid', error: null }
  }

  // Any family exists yet? If yes → join as kid. If no → become parent.
  const { data: fams, error: famErr } = await supabase
    .from('families').select('id').limit(1)
  if (famErr) return { familyId: null, role: null, error: famErr }

  if (fams && fams.length > 0) {
    const familyId = fams[0].id
    const { error: updErr } = await supabase.auth.updateUser({
      data: { family_id: familyId, role: 'kid' },
    })
    if (updErr) return { familyId: null, role: null, error: updErr }
    return { familyId, role: 'kid', error: null }
  }

  // create new family + defaults
  const { data: famRow, error: createErr } = await supabase
    .from('families')
    .insert({ name: 'My family', points: 0, lifetime_points: 0, streak: 1,
              last_active: new Date().toISOString().slice(0, 10) })
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
