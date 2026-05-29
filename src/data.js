import { supabase } from './supabase.js'

/* ============================================================
   data layer — every async function returns { data, error }
   ============================================================ */

/* ---- auth ---- */
export async function signUp(email, password, inviteCode) {
  // If a family code was provided, validate it BEFORE creating the auth user.
  // This prevents the "orphan account" bug where a typo'd code would still
  // create the Supabase user but leave them unlinked to any family.
  if (inviteCode) {
    const cleanCode = inviteCode.trim().toUpperCase()
    const { data: famRow, error: lookupErr } = await supabase
      .from('families')
      .select('id')
      .eq('invite_code', cleanCode)
      .maybeSingle()
    if (lookupErr) {
      return { data: null, error: { message: `Couldn't check that code: ${lookupErr.message}` } }
    }
    if (!famRow) {
      return {
        data: null,
        error: { message: `Family code "${cleanCode}" not found. Ask the parent to double-check the code in their app.` },
      }
    }
    // Code is valid — proceed to create the auth user, stashing the validated code
    return await supabase.auth.signUp({
      email, password,
      options: { data: { pending_invite_code: cleanCode } },
    })
  }
  // No invite code → starting a new family as a parent
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
/* generate a 6-char family invite code like "RQ-4F2K" (no ambiguous chars) */
function generateInviteCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I/L
  let code = ''
  for (let i = 0; i < 4; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)]
  return 'RQ-' + code
}

/* Phase 3: Returns { familyId, role, kidId, error }.
   - For parents: kidId is null (parents don't have a kid record of their own).
   - For kids: kidId is the row in the `kids` table that holds their points etc.
   - For new kid signups: if the family was migrated and has a placeholder
     empty kid (0 points, no name set), we re-use it instead of creating a duplicate.
     For any subsequent kid in the same family, we create a fresh kid row.
*/
export async function joinOrCreateFamily(user) {
  const meta = user.user_metadata || {}
  const existingFamilyId = meta.family_id
  const existingRole = meta.role
  const existingKidId = meta.kid_id

  // Path 1: User is already linked AND has a kid_id (or is parent). Just verify and use.
  if (existingFamilyId && existingRole) {
    const { data: famRow } = await supabase.from('families').select('id').eq('id', existingFamilyId).maybeSingle()
    if (famRow) {
      // For parents, kidId is null and that's fine
      if (existingRole === 'parent') {
        return { familyId: existingFamilyId, role: 'parent', kidId: null, error: null }
      }
      // For kids: if we have a kid_id, verify it still exists
      if (existingKidId) {
        const { data: kidRow } = await supabase.from('kids').select('id').eq('id', existingKidId).maybeSingle()
        if (kidRow) {
          return { familyId: existingFamilyId, role: 'kid', kidId: existingKidId, error: null }
        }
        // Kid record was deleted — fall through to claim a new one
      }
      // Kid linked to family but no kid_id yet (migrated user) — find or claim a kid row
      const kidId = await claimKidRowForUser(existingFamilyId)
      if (kidId) {
        await supabase.auth.updateUser({ data: { ...meta, kid_id: kidId } })
        return { familyId: existingFamilyId, role: 'kid', kidId, error: null }
      }
    }
    // Family was deleted — fall through and create new
  }

  // Path 2: User has a pending invite code → join as kid
  const pendingCode = meta.pending_invite_code
  if (pendingCode) {
    const { data: famRow, error: lookupErr } = await supabase
      .from('families').select('id').eq('invite_code', pendingCode).maybeSingle()

    if (lookupErr) return { familyId: null, role: null, kidId: null, error: lookupErr }
    if (!famRow) {
      return {
        familyId: null, role: null, kidId: null,
        error: { message: `Family code "${pendingCode}" not found. Sign out and try again with the correct code.` },
      }
    }

    // Claim a kid row (re-use placeholder if available, else create fresh)
    const kidId = await claimKidRowForUser(famRow.id)
    if (!kidId) {
      return { familyId: null, role: null, kidId: null, error: { message: 'Could not create kid record.' } }
    }

    const { error: updErr } = await supabase.auth.updateUser({
      data: { family_id: famRow.id, role: 'kid', kid_id: kidId, pending_invite_code: null },
    })
    if (updErr) return { familyId: null, role: null, kidId: null, error: updErr }
    return { familyId: famRow.id, role: 'kid', kidId, error: null }
  }

  // Path 3: No metadata, no code → create new family as parent
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
  if (createErr) return { familyId: null, role: null, kidId: null, error: createErr }
  const familyId = famRow.id

  // Seed defaults (without kid_id — these are family-level defaults that get claimed
  // by the first kid via claimKidRowForUser, which also reassigns them).
  await supabase.from('tasks').insert(DEFAULT_TASKS.map(t => ({ ...t, family_id: familyId })))
  await supabase.from('decisions').insert(DEFAULT_DECISIONS.map(d => ({ ...d, family_id: familyId })))
  await supabase.from('rewards').insert(DEFAULT_REWARDS.map(r => ({ ...r, family_id: familyId })))

  const { error: updErr } = await supabase.auth.updateUser({
    data: { family_id: familyId, role: 'parent' },
  })
  if (updErr) return { familyId: null, role: null, kidId: null, error: updErr }
  return { familyId, role: 'parent', kidId: null, error: null }
}

/* Claim a kid row in a family for the current signing-up user.
   Strategy:
   1. If the family has an "empty placeholder" kid (0 lifetime pts, no claims/videos
      attached to it), re-use it. This covers migrated families where the auto-created
      placeholder is waiting for the real kid.
   2. Otherwise, create a new fresh kid row and link existing unassigned data to it
      (but only if no other kid in the family is using that data already).

   Returns the kid_id, or null on failure.
*/
async function claimKidRowForUser(familyId) {
  // Look for a placeholder: kid in this family with 0 lifetime pts and no claims/videos
  const { data: candidates } = await supabase.from('kids')
    .select('id, lifetime_points')
    .eq('family_id', familyId)
    .order('created_at', { ascending: true })

  if (candidates && candidates.length > 0) {
    // Find the first candidate that's truly empty (no claims, no videos attached)
    for (const k of candidates) {
      const { count: claimCount } = await supabase.from('claims')
        .select('*', { count: 'exact', head: true })
        .eq('kid_id', k.id)
      const { count: videoCount } = await supabase.from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('kid_id', k.id)
      if ((claimCount || 0) === 0 && (videoCount || 0) === 0 && (k.lifetime_points || 0) === 0) {
        return k.id
      }
    }
  }

  // No placeholder available → create a fresh kid row
  const { data: newKid, error } = await supabase.from('kids')
    .insert({
      family_id: familyId,
      name: 'Kid',
      avatar_emoji: '✨',
      theme: 'magenta',
      points: 0, lifetime_points: 0, streak: 1,
      last_active: new Date().toISOString().slice(0, 10),
    })
    .select().single()
  if (error) {
    console.error('Failed to create kid row:', error)
    return null
  }
  return newKid.id
}

/* ---- family snapshot ---- */
export async function getFamily(familyId) {
  return await supabase.from('families').select('*').eq('id', familyId).single()
}
export async function updateFamily(familyId, fields) {
  return await supabase.from('families').update(fields).eq('id', familyId)
}
export async function getKid(kidId) {
  return await supabase.from('kids').select('*').eq('id', kidId).single()
}
export async function updateKid(kidId, fields) {
  return await supabase.from('kids').update(fields).eq('id', kidId)
}
/* List all kids in a family, ordered by creation (kid #1 first) */
export async function getKidsForFamily(familyId) {
  return await supabase.from('kids').select('*').eq('family_id', familyId).order('created_at', { ascending: true })
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
export async function getTasks(familyId, kidId) {
  let q = supabase.from('tasks').select('*').eq('family_id', familyId)
  if (kidId) q = q.eq('kid_id', kidId)
  return await q.order('sort_order')
}
export async function getDecisions(familyId, kidId) {
  let q = supabase.from('decisions').select('*').eq('family_id', familyId)
  if (kidId) q = q.eq('kid_id', kidId)
  return await q.order('sort_order')
}
export async function getRewards(familyId, kidId) {
  let q = supabase.from('rewards').select('*').eq('family_id', familyId)
  if (kidId) q = q.eq('kid_id', kidId)
  return await q.order('sort_order')
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
export async function countApprovedClaims(familyId, kind = null, kidId) {
  let q = supabase.from('claims').select('id', { count: 'exact', head: true })
    .eq('family_id', familyId).eq('status', 'approved')
  if (kind) q = q.eq('kind', kind)
  if (kidId) q = q.eq('kid_id', kidId)
  return await q
}
export async function countVideos(familyId, kidId) {
  let q = supabase.from('videos').select('id', { count: 'exact', head: true })
    .eq('family_id', familyId)
  if (kidId) q = q.eq('kid_id', kidId)
  return await q
}
export async function countRedemptions(familyId, kidId) {
  let q = supabase.from('redemptions').select('id', { count: 'exact', head: true })
    .eq('family_id', familyId)
  if (kidId) q = q.eq('kid_id', kidId)
  return await q
}
export async function countApprovedToday(familyId, kidId) {
  const today = new Date().toISOString().slice(0, 10)
  let q = supabase.from('claims').select('id', { count: 'exact', head: true })
    .eq('family_id', familyId).eq('status', 'approved').eq('claim_date', today)
  if (kidId) q = q.eq('kid_id', kidId)
  return await q
}

/* ---- claims ---- */
export async function getPendingClaims(familyId, kidId) {
  let q = supabase.from('claims').select('*').eq('family_id', familyId).eq('status', 'pending')
  if (kidId) q = q.eq('kid_id', kidId)
  return await q.order('created_at', { ascending: false })
}
export async function getApprovedToday(familyId, kidId) {
  const today = new Date().toISOString().slice(0, 10)
  let q = supabase.from('claims').select('*')
    .eq('family_id', familyId).eq('status', 'approved').eq('claim_date', today)
  if (kidId) q = q.eq('kid_id', kidId)
  return await q
}
export async function submitClaim(familyId, claim, kidId) {
  const row = { ...claim, family_id: familyId }
  if (kidId) row.kid_id = kidId
  return await supabase.from('claims').insert(row).select().single()
}
export async function resolveClaim(claimId, status) {
  return await supabase.from('claims').update({
    status, resolved_at: new Date().toISOString(),
  }).eq('id', claimId)
}

/* ---- videos ---- */
export async function getVideos(familyId, limit = 50, kidId) {
  let q = supabase.from('videos').select('*').eq('family_id', familyId)
  if (kidId) q = q.eq('kid_id', kidId)
  return await q.order('created_at', { ascending: false }).limit(limit)
}
export async function addVideo(familyId, prompt, mediaUrl, mediaType, kidId) {
  const row = { family_id: familyId, prompt, media_url: mediaUrl, media_type: mediaType }
  if (kidId) row.kid_id = kidId
  return await supabase.from('videos').insert(row).select().single()
}

/* ---- redemptions ---- */
export async function getRedemptions(familyId, limit = 30, kidId) {
  let q = supabase.from('redemptions').select('*').eq('family_id', familyId)
  if (kidId) q = q.eq('kid_id', kidId)
  return await q.order('created_at', { ascending: false }).limit(limit)
}
export async function addRedemption(familyId, reward, kidId) {
  const row = { family_id: familyId, reward_label: reward.label, cost: reward.cost, emoji: reward.emoji }
  if (kidId) row.kid_id = kidId
  return await supabase.from('redemptions').insert(row)
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
    .on('postgres_changes', { event: '*', schema: 'public', table: 'kids',
        filter: `family_id=eq.${familyId}` }, onChange)
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
