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
  // No invite code → starting a new family as a parent.
  // Stamp a parental consent timestamp so we have a record of when they agreed
  // to the privacy policy and confirmed they're the parent/guardian.
  return await supabase.auth.signUp({
    email, password,
    options: {
      data: {
        parental_consent_at: new Date().toISOString(),
        parental_consent_version: '2026-05-30',
      },
    },
  })
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

  // Path 1: User is already linked to a family. Trust the metadata; only re-claim a kid
  // if absolutely necessary (their kid record was deleted).
  if (existingFamilyId && existingRole) {
    const { data: famRow } = await supabase.from('families').select('id').eq('id', existingFamilyId).maybeSingle()
    if (famRow) {
      // Parents don't have a kid record
      if (existingRole === 'parent') {
        return { familyId: existingFamilyId, role: 'parent', kidId: null, error: null }
      }

      // For kids: if we have a kid_id stored, verify it still exists
      if (existingKidId) {
        const { data: kidRow, error: kidErr } = await supabase
          .from('kids').select('id').eq('id', existingKidId).maybeSingle()
        // If the read succeeded AND the row exists, we're good — use it
        if (!kidErr && kidRow) {
          return { familyId: existingFamilyId, role: 'kid', kidId: existingKidId, error: null }
        }
        // If the read errored (network/auth blip), DON'T create a new kid — return the
        // stored kid_id anyway and let the page refresh resolve it. Creating new kids
        // here is the bug that produces duplicates.
        if (kidErr) {
          return { familyId: existingFamilyId, role: 'kid', kidId: existingKidId, error: null }
        }
        // Read returned null = kid row was actually deleted. Fall through to recover.
      }

      // Kid has no kid_id yet OR their old kid was actually deleted.
      // Look for an existing kid in this family they could legitimately claim.
      const recoveredKidId = await findOrClaimExistingKid(existingFamilyId)
      if (recoveredKidId) {
        await supabase.auth.updateUser({ data: { ...meta, kid_id: recoveredKidId } })
        return { familyId: existingFamilyId, role: 'kid', kidId: recoveredKidId, error: null }
      }
      // No kid exists in this family — create one as a last resort
      const newKidId = await createFreshKid(existingFamilyId)
      if (newKidId) {
        await supabase.auth.updateUser({ data: { ...meta, kid_id: newKidId } })
        return { familyId: existingFamilyId, role: 'kid', kidId: newKidId, error: null }
      }
      return { familyId: existingFamilyId, role: 'kid', kidId: null, error: { message: 'Could not create kid record' } }
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

    // First-time kid signup in this family. Re-use placeholder if any, else create fresh.
    const kidId = await findOrClaimExistingKid(famRow.id) || await createFreshKid(famRow.id)
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

  await supabase.from('tasks').insert(DEFAULT_TASKS.map(t => ({ ...t, family_id: familyId })))
  await supabase.from('decisions').insert(DEFAULT_DECISIONS.map(d => ({ ...d, family_id: familyId })))
  await supabase.from('rewards').insert(DEFAULT_REWARDS.map(r => ({ ...r, family_id: familyId })))

  const { error: updErr } = await supabase.auth.updateUser({
    data: { family_id: familyId, role: 'parent' },
  })
  if (updErr) return { familyId: null, role: null, kidId: null, error: updErr }
  return { familyId, role: 'parent', kidId: null, error: null }
}

/* Find an existing kid in this family that has no other user claiming it.
   Strategy:
   - If there's exactly ONE kid in the family, return it (they're the only kid).
   - If there are multiple, look for one with no auth user pointing to it (orphan from
     earlier migrations) and return that.
   - Otherwise return null. */
async function findOrClaimExistingKid(familyId) {
  const { data: kids } = await supabase.from('kids')
    .select('id, lifetime_points, created_at')
    .eq('family_id', familyId)
    .order('created_at', { ascending: true })
  if (!kids || kids.length === 0) return null

  // Single kid in this family → that's the one to claim
  if (kids.length === 1) return kids[0].id

  // Multiple kids exist. We can't easily check which are orphans from the client
  // (that requires reading auth.users which is admin-only). So just return the FIRST
  // (oldest) kid and let the user use that. If there are multiple kids needing
  // disambiguation, the parent can sort it out via the toggle UI in Phase 5.
  return kids[0].id
}

/* Create a brand new kid row in a family — only called when there is no existing
   kid to claim. */
async function createFreshKid(familyId) {
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

/* Legacy alias for compatibility */
async function claimKidRowForUser(familyId) {
  return await findOrClaimExistingKid(familyId) || await createFreshKid(familyId)
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

/* ============================================================
   LEVEL UP TOGETHER — shared weekly bonus mechanic
   Bonus fires when BOTH conditions are met the same week:
     Trigger A — kid hits weekly points goal AND parent hits wins goal
     Trigger B — kid AND parent each hit a 7-day streak this week
   Either trigger satisfies; we record which.
   ============================================================ */

/* Configurable defaults — could be promoted to per-family later */
export const LEVELUP_KID_POINTS_GOAL = 100
export const LEVELUP_PARENT_WINS_GOAL = 7
export const LEVELUP_STREAK_GOAL = 7
export const LEVELUP_KID_BONUS = 50
export const LEVELUP_PARENT_BONUS = 5

/* Compute Monday-of-this-week as YYYY-MM-DD (local time) */
export function getWeekStarting(d = new Date()) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  const day = date.getDay()  // 0 = Sunday, 1 = Monday, ...
  const diff = day === 0 ? -6 : 1 - day  // back up to most recent Monday
  date.setDate(date.getDate() + diff)
  return date.toISOString().slice(0, 10)
}

/* Sum a kid's approved points for the current week. */
export async function kidPointsThisWeek(familyId, kidId) {
  const monday = getWeekStarting()
  const mondayISO = new Date(monday + 'T00:00:00').toISOString()
  const { data } = await supabase.from('claims')
    .select('points')
    .eq('family_id', familyId)
    .eq('kid_id', kidId)
    .eq('status', 'approved')
    .gte('resolved_at', mondayISO)
  return (data || []).reduce((s, r) => s + (r.points || 0), 0)
}

/* Check if a level-up bonus was already awarded this week for this family+kid+parent. */
export async function getLevelUpBonusThisWeek(familyId, kidId, userId) {
  const monday = getWeekStarting()
  const { data } = await supabase.from('level_up_bonuses')
    .select('*')
    .eq('family_id', familyId)
    .eq('kid_id', kidId)
    .eq('user_id', userId)
    .eq('week_starting', monday)
    .maybeSingle()
  return data || null
}

/* Award the bonus for this week.
   Returns the inserted row, or null if already awarded (idempotent). */
export async function awardLevelUpBonus(familyId, kidId, userId, triggerKind) {
  const monday = getWeekStarting()
  const { data, error } = await supabase.from('level_up_bonuses').insert({
    family_id: familyId,
    kid_id: kidId,
    user_id: userId,
    week_starting: monday,
    trigger_kind: triggerKind,
    kid_bonus_points: LEVELUP_KID_BONUS,
    parent_bonus_wins: LEVELUP_PARENT_BONUS,
  }).select().single()
  if (error) {
    // Likely a duplicate (unique constraint violation) — bonus already awarded this week
    return null
  }
  return data
}

/* Add the bonus points to the kid's record. */
export async function applyKidBonusPoints(kidId, bonusPoints) {
  const { data: k } = await supabase.from('kids').select('points, lifetime_points').eq('id', kidId).single()
  if (!k) return
  await supabase.from('kids').update({
    points: (k.points || 0) + bonusPoints,
    lifetime_points: (k.lifetime_points || 0) + bonusPoints,
  }).eq('id', kidId)
}

/* Kid-side variant of getLevelUpStatus. The kid doesn't know the parent's userId,
   but we can compute the same numbers from the family-level data. We attribute ALL
   approved claims in the family to "the parent" for win-counting purposes (single-
   parent families are the common case; multi-parent split isn't shown to kids). */
export async function getLevelUpStatusForKid(familyId, kidId, kidStreak) {
  const monday = getWeekStarting()
  const mondayISO = new Date(monday + 'T00:00:00').toISOString()

  /* Kid's own approved points this week */
  const { data: kidClaims } = await supabase.from('claims')
    .select('points')
    .eq('family_id', familyId)
    .eq('kid_id', kidId)
    .eq('status', 'approved')
    .gte('resolved_at', mondayISO)
  const kidPts = (kidClaims || []).reduce((s, r) => s + (r.points || 0), 0)

  /* All approvals in the family this week — proxies for parent's wins */
  const { count: parentWins } = await supabase.from('claims')
    .select('id', { count: 'exact', head: true })
    .eq('family_id', familyId)
    .eq('status', 'approved')
    .gte('resolved_at', mondayISO)

  /* Did a bonus get awarded this week for this kid? */
  const { data: existing } = await supabase.from('level_up_bonuses')
    .select('*')
    .eq('family_id', familyId)
    .eq('kid_id', kidId)
    .eq('week_starting', monday)
    .maybeSingle()

  /* For parent's streak from kid's view, we can approximate: count distinct days
     of approvals across the family in the past 60 days. Not perfect, but good
     enough since the kid doesn't manage this directly. */
  const sixtyDaysAgo = new Date(Date.now() - 60 * 864e5).toISOString()
  const { data: recent } = await supabase.from('claims')
    .select('resolved_at')
    .eq('family_id', familyId)
    .eq('status', 'approved')
    .gte('resolved_at', sixtyDaysAgo)
    .order('resolved_at', { ascending: false })
  const dateSet = new Set((recent || []).map(r => (r.resolved_at || '').slice(0, 10)))
  let parentStreak = 0
  let cursor = new Date(); cursor.setHours(0, 0, 0, 0)
  const today = cursor.toISOString().slice(0, 10)
  if (!dateSet.has(today)) cursor.setDate(cursor.getDate() - 1)
  while (true) {
    const key = cursor.toISOString().slice(0, 10)
    if (dateSet.has(key)) { parentStreak++; cursor.setDate(cursor.getDate() - 1) }
    else break
  }

  const winsCount = parentWins || 0
  const thresholdsMet = kidPts >= LEVELUP_KID_POINTS_GOAL && winsCount >= LEVELUP_PARENT_WINS_GOAL
  const streaksMet = (kidStreak || 0) >= LEVELUP_STREAK_GOAL && parentStreak >= LEVELUP_STREAK_GOAL
  const eligible = thresholdsMet || streaksMet

  return {
    kidPts, kidGoal: LEVELUP_KID_POINTS_GOAL,
    parentWins: winsCount, parentGoal: LEVELUP_PARENT_WINS_GOAL,
    kidStreak: kidStreak || 0, parentStreak,
    streakGoal: LEVELUP_STREAK_GOAL,
    thresholdsMet, streaksMet, eligible,
    alreadyAwarded: !!existing, awardedBonus: existing,
    kidBonus: LEVELUP_KID_BONUS, parentBonus: LEVELUP_PARENT_BONUS,
  }
}

/* Monday-anchored parent win count — used by Level Up Together so the
   parent's "wins this week" lines up with the kid's Monday-reset points and
   the Monday-keyed bonus row. (The parent-rewards shelf intentionally keeps
   its own rolling-7-day count in countWinsThisWeek; this does not touch it.)
   Mirrors countWinsThisWeek's attribution: this parent + legacy-null. */
export async function parentWinsThisWeek(familyId, userId) {
  const monday = getWeekStarting()
  const mondayISO = new Date(monday + 'T00:00:00').toISOString()
  const { count: attributed } = await supabase.from('claims')
    .select('id', { count: 'exact', head: true })
    .eq('family_id', familyId)
    .eq('status', 'approved')
    .gte('resolved_at', mondayISO)
    .eq('approver_user_id', userId)
  const { count: legacy } = await supabase.from('claims')
    .select('id', { count: 'exact', head: true })
    .eq('family_id', familyId)
    .eq('status', 'approved')
    .gte('resolved_at', mondayISO)
    .is('approver_user_id', null)
  return (attributed || 0) + (legacy || 0)
}

/* Compute everything the UI needs to render the Level Up card. */
export async function getLevelUpStatus(familyId, kidId, userId, kidStreak) {
  const [kidPts, parentWins, existing] = await Promise.all([
    kidPointsThisWeek(familyId, kidId),
    parentWinsThisWeek(familyId, userId),
    getLevelUpBonusThisWeek(familyId, kidId, userId),
  ])
  const parentStreak = await getParentStreak(familyId, userId)

  const thresholdsMet = kidPts >= LEVELUP_KID_POINTS_GOAL && parentWins >= LEVELUP_PARENT_WINS_GOAL
  const streaksMet = (kidStreak || 0) >= LEVELUP_STREAK_GOAL && parentStreak >= LEVELUP_STREAK_GOAL
  const eligible = thresholdsMet || streaksMet

  return {
    kidPts, kidGoal: LEVELUP_KID_POINTS_GOAL,
    parentWins, parentGoal: LEVELUP_PARENT_WINS_GOAL,
    kidStreak: kidStreak || 0, parentStreak,
    streakGoal: LEVELUP_STREAK_GOAL,
    thresholdsMet, streaksMet, eligible,
    alreadyAwarded: !!existing, awardedBonus: existing,
    kidBonus: LEVELUP_KID_BONUS, parentBonus: LEVELUP_PARENT_BONUS,
  }
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
export async function resolveClaim(claimId, status, approverUserId) {
  const fields = { status, resolved_at: new Date().toISOString() }
  if (approverUserId) fields.approver_user_id = approverUserId
  return await supabase.from('claims').update(fields).eq('id', claimId)
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

/* ============================================================
   PARENT REWARDS — recurring unlocks based on weekly win count.
   "Wins" = number of claims this parent has approved in the past 7 days.
   Each reward has a `threshold` — when this week's wins >= threshold,
   the reward is "unlocked" for the week.
   ============================================================ */

export async function getParentRewards(userId) {
  return await supabase.from('parent_rewards')
    .select('*').eq('user_id', userId).order('sort_order')
}
export async function addParentReward(familyId, userId, reward) {
  return await supabase.from('parent_rewards').insert({
    family_id: familyId, user_id: userId, ...reward,
  }).select().single()
}
export async function updateParentReward(id, fields) {
  return await supabase.from('parent_rewards').update(fields).eq('id', id)
}
export async function deleteParentReward(id) {
  return await supabase.from('parent_rewards').delete().eq('id', id)
}

/* Add a celebration entry to parent's history when they unlock + redeem a reward */
export async function addParentClaim(familyId, userId, reward) {
  return await supabase.from('parent_claims').insert({
    family_id: familyId, user_id: userId,
    reward_id: reward.id, reward_label: reward.label, reward_emoji: reward.emoji,
  }).select().single()
}

/* List recent parent claims (for streak math + history view) */
export async function getParentClaims(userId, limit = 30) {
  return await supabase.from('parent_claims').select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false }).limit(limit)
}

/* ---- parent wins counters ----
   Counts claims this parent has approved within the given window.
   We attribute wins via `approver_user_id` going forward;
   for historical claims (before the column existed), we fall back to
   counting ALL approved claims in the family. That's fine for one-parent
   families and decent enough for now. */
export async function countWinsThisWeek(familyId, userId) {
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString()
  // First, count claims attributed to this approver
  const { count: attributed } = await supabase.from('claims')
    .select('id', { count: 'exact', head: true })
    .eq('family_id', familyId)
    .eq('status', 'approved')
    .gte('resolved_at', weekAgo)
    .eq('approver_user_id', userId)
  // Then count any approved claims with no approver attribution (legacy)
  // — we'll attribute them to "the parent" by default.
  const { count: legacy } = await supabase.from('claims')
    .select('id', { count: 'exact', head: true })
    .eq('family_id', familyId)
    .eq('status', 'approved')
    .gte('resolved_at', weekAgo)
    .is('approver_user_id', null)
  return (attributed || 0) + (legacy || 0)
}

/* ----------------------------------------------------------------
   KID STREAK — "one good choice a day," derived live (not stored).

   A day counts if the kid has at least one APPROVED good-choice claim
   credited to that day. Both kinds of good choice already land in the
   `claims` table as kind='choice', status flows pending -> approved:
     - a Smart Choice  -> label = the choice's label
     - a reflection    -> label = "Video reflection: ..."
   So both are counted here, and both are already parent-gated. We credit
   the day the choice was MADE (claim_date), not the day it was approved,
   so the streak doesn't swing on when the parent happens to tap approve.

   FREEZES: the streak survives up to 3 missed days. Walking backward, each
   gap day spends one freeze; once a 4th gap would be needed, the streak
   ends. Freezes are derived (no stored counter) and reset with the streak.
   Returns { streak, freezesRemaining, freezesUsed }.
---------------------------------------------------------------- */
export const KID_STREAK_MAX_FREEZES = 3

export async function getKidStreak(familyId, kidId) {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10)
  let q = supabase.from('claims')
    .select('claim_date')
    .eq('family_id', familyId)
    .eq('kind', 'choice')
    .eq('status', 'approved')
    .gte('claim_date', ninetyDaysAgo)
  if (kidId) q = q.eq('kid_id', kidId)
  const { data } = await q
  if (!data || data.length === 0) {
    return { streak: 0, freezesRemaining: KID_STREAK_MAX_FREEZES, freezesUsed: 0 }
  }

  // Set of YYYY-MM-DD dates that had at least one approved good choice.
  const dateSet = new Set(data.map(r => r.claim_date).filter(Boolean))

  let cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  // Today not yet active doesn't break the streak — start from yesterday.
  const today = cursor.toISOString().slice(0, 10)
  if (!dateSet.has(today)) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  let freezesUsed = 0
  let pendingGaps = 0  // gap days seen since the last active day; only "spent" if another active day follows
  while (true) {
    const key = cursor.toISOString().slice(0, 10)
    if (dateSet.has(key)) {
      streak++
      // Any gaps we walked through to reach this active day are now truly spent.
      freezesUsed += pendingGaps
      pendingGaps = 0
    } else {
      // A gap day. Tentatively hold it; it only costs a freeze if the streak
      // continues past it. Stop if bridging it would need a 4th freeze.
      if (freezesUsed + pendingGaps < KID_STREAK_MAX_FREEZES) {
        pendingGaps++
      } else {
        break  // out of freezes — the streak ends here
      }
    }
    cursor.setDate(cursor.getDate() - 1)
  }
  // Trailing pendingGaps (gaps older than the earliest active day) are NOT
  // spent — they don't protect anything — so they don't reduce freezes.

  return {
    streak,
    freezesRemaining: KID_STREAK_MAX_FREEZES - freezesUsed,
    freezesUsed,
  }
}

/* Compute the current "approved 1+ per day" streak for a parent.
   We pull resolved_at dates of approved claims and count consecutive
   days ending today (or yesterday if today hasn't seen activity yet). */
export async function getParentStreak(familyId, userId) {
  // Pull last 60 days of approval timestamps for this family
  const sixtyDaysAgo = new Date(Date.now() - 60 * 864e5).toISOString()
  const { data } = await supabase.from('claims')
    .select('resolved_at, approver_user_id')
    .eq('family_id', familyId)
    .eq('status', 'approved')
    .gte('resolved_at', sixtyDaysAgo)
    .order('resolved_at', { ascending: false })
  if (!data || data.length === 0) return 0

  // Filter to this parent OR legacy (null approver) — same logic as wins counter
  const myApprovals = data.filter(r =>
    r.approver_user_id === userId || r.approver_user_id === null
  )
  if (myApprovals.length === 0) return 0

  // Build a set of YYYY-MM-DD dates that had at least one approval
  const dateSet = new Set(
    myApprovals.map(r => r.resolved_at.slice(0, 10))
  )

  // Walk backward from today counting consecutive days
  let streak = 0
  let cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  // If today has no approval yet, the streak doesn't break — allow up to "yesterday"
  const today = cursor.toISOString().slice(0, 10)
  if (!dateSet.has(today)) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (true) {
    const key = cursor.toISOString().slice(0, 10)
    if (dateSet.has(key)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
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
    .on('postgres_changes', { event: '*', schema: 'public', table: 'parent_rewards',
        filter: `family_id=eq.${familyId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'parent_claims',
        filter: `family_id=eq.${familyId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'level_up_bonuses',
        filter: `family_id=eq.${familyId}` }, onChange)
    .subscribe()
  return () => { supabase.removeChannel(ch) }
}
