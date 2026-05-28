import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Sparkles, Star, Gift, CheckCircle2, Circle, Camera, Lock, Trophy, Heart,
  ChevronRight, X, ShieldCheck, RotateCcw, Image as ImageIcon, Clock,
  Pencil, Plus, Trash2, Check, LogOut, Film, Play, Palette, Sun,
} from 'lucide-react'
import {
  signUp, signIn, signOut, getSession,
  joinOrCreateFamily, getFamily, updateFamily, ensureInviteCode,
  getTasks, getDecisions, getRewards, addRow, updateRow, deleteRow,
  getPendingClaims, submitClaim, resolveClaim,
  getVideos, addVideo, getRedemptions, addRedemption, markRedemptionFulfilled,
  uploadProof, subscribeFamily,
  countApprovedClaims, countVideos, countRedemptions, countApprovedToday,
} from './data.js'
import { supabase } from './supabase.js'
import {
  CSS, S, TIERS, TIER_COLORS, EMOJI_CHOICES, VIDEO_PROMPTS, VIDEO_PTS, todayKey,
  AVATAR_CHOICES, THEMES, evaluateBadges, todayLine,
} from './styles.js'

/* ============================================================
   Top-level App: handles auth + role routing
   ============================================================ */
export default function App() {
  const [session, setSession] = useState(null)
  const [bootstrap, setBootstrap] = useState(null) // { familyId, role }
  const [bootErr, setBootErr] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    (async () => {
      const { data } = await getSession()
      setSession(data.session || null)
      setReady(true)
    })()
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess || null)
      setBootstrap(null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) { setBootstrap(null); return }
    (async () => {
      const res = await joinOrCreateFamily(session.user)
      if (res.error) { setBootErr(res.error.message || 'Could not load family'); return }
      setBootstrap({ familyId: res.familyId, role: res.role })
    })()
  }, [session])

  if (!ready) return <Splash />
  if (!session) return <AuthScreen />
  if (bootErr) return <ErrorScreen msg={bootErr} />
  if (!bootstrap) return <Splash msg="Setting up your family…" />

  return (
    <>
      <style>{CSS}</style>
      {bootstrap.role === 'parent'
        ? <ParentApp familyId={bootstrap.familyId} user={session.user} />
        : <KidApp familyId={bootstrap.familyId} user={session.user} />}
    </>
  )
}

function Splash({ msg = 'Loading…' }) {
  return (
    <div style={S.app}>
      <style>{CSS}</style>
      <div style={S.loading}>
        <Sparkles size={28} style={{ opacity: 0.6 }} />
        <span style={{ marginTop: 10 }}>{msg}</span>
      </div>
    </div>
  )
}
function ErrorScreen({ msg }) {
  return (
    <div style={S.app}>
      <style>{CSS}</style>
      <div style={S.loading}>
        <span style={{ marginTop: 10, color: '#B5503A', padding: 20, textAlign: 'center' }}>
          {msg}
        </span>
        <button onClick={() => signOut()} style={{ ...S.exitBtn, marginTop: 20 }}>
          Sign out and try again
        </button>
      </div>
    </div>
  )
}

/* ============================================================
   Auth screen — sign up or sign in
   ============================================================ */
function AuthScreen() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setErr(null)
    if (!email || !password) { setErr('Enter both email and password'); return }
    if (password.length < 6) { setErr('Password must be at least 6 characters'); return }
    setBusy(true)
    let result
    if (mode === 'signup') {
      result = await signUp(email.trim(), password, inviteCode.trim() || null)
    } else {
      result = await signIn(email.trim(), password)
    }
    setBusy(false)
    if (result.error) setErr(result.error.message || 'Something went wrong')
  }

  return (
    <div style={S.app}>
      <style>{CSS}</style>
      <div style={S.authWrap} className="rq-fade">
        <div style={S.authBrand}>
          <span style={S.brandWord}>reward<span style={S.brandDot}></span>quest</span>
        </div>
        <h1 style={S.authH1}>
          {mode === 'signup'
            ? <>Welcome <span style={S.authH1Italic}>in.</span></>
            : <>Welcome <span style={S.authH1Italic}>back.</span></>}
        </h1>
        <p style={S.authSub}>
          {mode === 'signup'
            ? "Joining as a kid? Enter your family code below. Otherwise leave it blank to start a new family."
            : 'Sign in to your family.'}
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
          <input style={S.authInput} type="email" autoComplete="email"
            placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input style={S.authInput} type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} />
          {mode === 'signup' && (
            <input style={S.authInput} type="text"
              placeholder="Family code (optional)" value={inviteCode}
              autoCapitalize="characters"
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())} />
          )}
          {err && <div style={{ ...S.authErr, marginTop: 16 }}>{err}</div>}
          <button type="submit" style={{ ...S.primaryBtn, marginTop: 28 }} className="rq-press" disabled={busy}>
            {busy ? '…' : (mode === 'signup' ? 'Create account' : 'Sign in')}
          </button>
        </form>

        <button type="button" style={S.authToggle}
          onClick={() => { setErr(null); setMode(mode === 'signup' ? 'signin' : 'signup') }}>
          {mode === 'signup' ? 'Have an account? Sign in' : 'New here? Create one'}
        </button>

        {mode === 'signup' && (
          <div style={S.authInfo}>
            <strong>Parent:</strong> leave the family code blank. After signing in, you&rsquo;ll see a code to give your kid.<br/>
            <strong>Kid:</strong> enter the family code your parent gives you (looks like <em>RQ-XXXX</em>).
          </div>
        )}
      </div>
    </div>
  )
}

/* ============================================================
   Shared bits: proof picker, thumbnail, header
   ============================================================ */
function ProofInput({ onPicked, children, style, className, busy }) {
  const cameraRef = useRef(null)
  const libraryRef = useRef(null)
  const [open, setOpen] = useState(false)

  const handle = (e) => {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    setOpen(false)
    if (!file) return
    onPicked(file)
  }

  return (
    <>
      {/* Camera: rear camera, photo or video. The `capture` attr tells the phone
          to open the camera directly instead of the file browser. */}
      <input ref={cameraRef} type="file" accept="image/*,video/*" capture="environment"
        onChange={handle} style={{ display: 'none' }} />
      {/* Library: no capture attr → opens photo library / camera roll. */}
      <input ref={libraryRef} type="file" accept="image/*,video/*"
        onChange={handle} style={{ display: 'none' }} />

      <button onClick={() => !busy && setOpen(true)}
        style={style} className={className} disabled={busy}>
        {children}
      </button>

      {open && (
        <div style={S.sheetBackdrop} onClick={() => setOpen(false)}>
          <div style={S.sheet} onClick={(e) => e.stopPropagation()} className="rq-fade">
            <div style={S.sheetTitle}>Add your proof</div>
            <button style={S.sheetBtn} className="rq-press"
              onClick={() => cameraRef.current && cameraRef.current.click()}>
              <Camera size={22} style={{ color: 'var(--accent)' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={S.sheetBtnTitle}>Take a photo or video</div>
                <div style={S.sheetBtnSub}>Open the camera now</div>
              </div>
            </button>
            <button style={S.sheetBtn} className="rq-press"
              onClick={() => libraryRef.current && libraryRef.current.click()}>
              <ImageIcon size={22} style={{ color: 'var(--accent)' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={S.sheetBtnTitle}>Choose from photos</div>
                <div style={S.sheetBtnSub}>Pick something you already have</div>
              </div>
            </button>
            <button style={S.sheetCancel} className="rq-press" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function Thumb({ url, type, size = 44 }) {
  if (!url) return <div style={{ ...S.thumbEmpty, width: size, height: size }}><ImageIcon size={16} /></div>
  return type === 'video'
    ? <video src={url} muted playsInline style={{ ...S.thumb, width: size, height: size }} />
    : <img src={url} alt="proof" style={{ ...S.thumb, width: size, height: size }} />
}

function AppHeader({ family, role, onSignOut }) {
  return (
    <header style={S.header}>
      <div>
        <div style={S.brand}>
          <Sparkles size={20} style={{ color: 'var(--gold)' }} />
          <span style={S.brandWord}>RewardQuest</span>
        </div>
        <div style={S.whoami}>
          <Heart size={12} style={{ color: 'var(--gum)' }} />
          {role === 'parent' ? 'Parent dashboard' : `${family.streak || 1} day${(family.streak || 1) !== 1 ? 's' : ''} in a row — keep glowing`}
        </div>
      </div>
      <div style={S.pointsBadge}>
        <Star size={16} style={{ color: '#fff' }} />
        <span style={S.pointsNum}>{family.points || 0}</span>
        <span style={S.pointsLabel}>pts</span>
      </div>
    </header>
  )
}

/* ============================================================
   KID APP
   ============================================================ */
function KidApp({ familyId, user }) {
  const [tab, setTab] = useState('home')
  const [toast, setToast] = useState(null)
  const [family, setFamily] = useState(null)
  const [tasks, setTasks] = useState([])
  const [decisions, setDecisions] = useState([])
  const [rewards, setRewards] = useState([])
  const [pending, setPending] = useState([])
  const [videos, setVideos] = useState([])
  /* counts for badges + today line */
  const [counts, setCounts] = useState({ approved: 0, chores: 0, videos: 0, redemptions: 0, today: 0 })
  /* visual effects */
  const [confettiKey, setConfettiKey] = useState(0)
  const [pointsBump, setPointsBump] = useState(false)
  const [badgePop, setBadgePop] = useState(null)
  const seenBadgesRef = useRef(null)
  const lastPointsRef = useRef(null)

  const reload = useCallback(async () => {
    const [f, t, d, r, p, v, ca, cc, cv, cr, ct] = await Promise.all([
      getFamily(familyId), getTasks(familyId), getDecisions(familyId),
      getRewards(familyId), getPendingClaims(familyId), getVideos(familyId, 10),
      countApprovedClaims(familyId), countApprovedClaims(familyId, 'chore'),
      countVideos(familyId), countRedemptions(familyId), countApprovedToday(familyId),
    ])
    if (f.data) setFamily(f.data)
    if (t.data) setTasks(t.data)
    if (d.data) setDecisions(d.data)
    if (r.data) setRewards(r.data)
    if (p.data) setPending(p.data)
    if (v.data) setVideos(v.data)
    setCounts({
      approved: ca.count || 0, chores: cc.count || 0,
      videos: cv.count || 0, redemptions: cr.count || 0, today: ct.count || 0,
    })
  }, [familyId])

  useEffect(() => { reload() }, [reload])
  useEffect(() => subscribeFamily(familyId, reload), [familyId, reload])

  /* detect newly unlocked badges + point increases → celebrate */
  useEffect(() => {
    if (!family) return
    const badges = evaluateBadges({
      family, claimsCount: counts.approved, videosCount: counts.videos,
      redemptionsCount: counts.redemptions, choreApprovedCount: counts.chores,
    })
    const hitIds = badges.filter(b => b.hit).map(b => b.id)
    const seen = seenBadgesRef.current
    if (seen === null) {
      // first load — record current state, don't celebrate retroactively
      seenBadgesRef.current = new Set(hitIds)
      lastPointsRef.current = family.points || 0
      return
    }
    // new badges since last render
    const newly = hitIds.filter(id => !seen.has(id))
    if (newly.length > 0) {
      const badge = badges.find(b => b.id === newly[0])
      setBadgePop(badge)
      setTimeout(() => setBadgePop(null), 3000)
      newly.forEach(id => seen.add(id))
    }
    // point increase → confetti
    if ((family.points || 0) > (lastPointsRef.current || 0)) {
      setConfettiKey(k => k + 1)
      setPointsBump(true)
      setTimeout(() => setPointsBump(false), 700)
    }
    lastPointsRef.current = family.points || 0
  }, [family, counts])

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600) }

  const onSubmitClaim = async (kind, item, file) => {
    flash('Uploading…')
    const { url, error: upErr } = await uploadProof(file, kind)
    if (upErr) { flash('Upload failed — try again'); return }
    const mediaType = file.type.startsWith('video') ? 'video' : 'photo'
    const { error } = await submitClaim(familyId, {
      kind, label: item.label, points: item.points,
      media_url: url, media_type: mediaType, status: 'pending',
      claim_date: todayKey(),
    })
    if (error) { flash('Could not submit — try again'); return }
    flash(kind === 'chore' ? 'Sent! Waiting for parent ✓' : 'Smart choice sent 🌟')
    reload()
  }

  const onSaveVideo = async (prompt, file) => {
    flash('Uploading video…')
    const { url, error: upErr } = await uploadProof(file, 'video')
    if (upErr) { flash('Upload failed — try again'); return }
    const mediaType = file.type.startsWith('video') ? 'video' : 'photo'
    await addVideo(familyId, prompt, url, mediaType)
    await submitClaim(familyId, {
      kind: 'choice', label: 'Video reflection: ' + prompt,
      points: VIDEO_PTS, media_url: url, media_type: mediaType,
      status: 'pending', claim_date: todayKey(),
    })
    flash('Video sent for parent to confirm 🎥')
    reload()
  }

  const onRedeem = async (reward) => {
    if ((family.points || 0) < reward.cost) return
    await updateFamily(familyId, { points: family.points - reward.cost })
    await addRedemption(familyId, reward)
    flash(`Redeemed: ${reward.label}! 🎉`)
    reload()
  }

  const onSavePersonalize = async ({ avatar, theme }) => {
    await updateFamily(familyId, { avatar_emoji: avatar, theme })
    flash('Looking good ✨')
    reload()
  }

  if (!family) return <Splash msg="Loading your quest…" />

  /* apply theme + base palette */
  const theme = THEMES.find(t => t.id === family.theme) || THEMES[0]
  const themedApp = {
    ...S.app,
    "--gold": theme.gold,
    "--lav": theme.lav,
  }

  return (
    <div style={themedApp}>
      <KidHeader family={family} pointsBump={pointsBump} />
      <main style={S.main}>
        {tab === 'home' && (
          <KidHome family={family} rewards={rewards} pending={pending}
            counts={counts} setTab={setTab} />
        )}
        {tab === 'tasks' && (
          <KidTasks family={family} tasks={tasks} decisions={decisions}
            pending={pending} onSubmit={onSubmitClaim} />
        )}
        {tab === 'video' && <KidVideo onSave={onSaveVideo} videos={videos} />}
        {tab === 'store' && <KidStore family={family} rewards={rewards} onRedeem={onRedeem} />}
        {tab === 'me'    && <KidMe family={family} onSave={onSavePersonalize} />}
      </main>

      {toast && <div style={S.toast} className="rq-toast">{toast}</div>}
      {confettiKey > 0 && <Confetti k={confettiKey} themeGold={theme.gold} />}
      {badgePop && <BadgePop badge={badgePop} />}

      <nav style={S.nav}>
        <NavBtn icon={Trophy} label="Home" active={tab === 'home'} onClick={() => setTab('home')} />
        <NavBtn icon={CheckCircle2} label="Quests" active={tab === 'tasks'} onClick={() => setTab('tasks')} />
        <NavBtn icon={Camera} label="Video" active={tab === 'video'} onClick={() => setTab('video')} />
        <NavBtn icon={Gift} label="Rewards" active={tab === 'store'} onClick={() => setTab('store')} />
        <NavBtn icon={Palette} label="Me" active={tab === 'me'} onClick={() => setTab('me')} />
      </nav>
    </div>
  )
}

/* kid header — wordmark, soft subtitle, points number */
function KidHeader({ family, pointsBump }) {
  const streak = family.streak || 1
  return (
    <header style={S.header}>
      <div>
        <div style={S.brand}>
          <span style={S.brandWord}>reward<span style={S.brandDot}></span>quest</span>
        </div>
        <div style={S.whoami}>
          <span style={S.miniStreakChip}>{streak}-day streak</span>
        </div>
      </div>
      <div style={S.pointsBadge}>
        <span style={S.pointsNum} className={pointsBump ? 'rq-bump' : ''}>{family.points || 0}</span>
        <span style={S.pointsLabel}>pts</span>
      </div>
    </header>
  )
}

function KidHome({ family, rewards, pending, counts, setTab }) {
  const sorted = [...rewards].sort((a, b) => a.cost - b.cost)
  const next = sorted.find((r) => r.cost > (family.points || 0)) || sorted[sorted.length - 1]
  const pct = next ? Math.min(100, Math.round((family.points / next.cost) * 100)) : 0
  const tLine = todayLine(family, counts.today)

  const firstName = (family.name || '').split(' ')[0] || ''

  return (
    <div className="rq-fade">
      {/* editorial intro */}
      <div style={S.introBlock}>
        <div style={S.introKicker}>your balance</div>
        <div style={S.megaPointsWrap}>
          <span style={S.megaPointsNum}>{family.points || 0}</span>
          <span style={S.megaPointsTrail}>pts</span>
        </div>
        <div style={S.megaPointsLine}>
          {tLine.split('.').map((part, i, arr) => part.trim() ? (
            <span key={i}>
              {i === 0 ? <span style={S.megaPointsLineAccent}>{part.trim()}.</span> : ` ${part.trim()}${i < arr.length - 1 ? '.' : ''}`}
            </span>
          ) : null)}
        </div>
      </div>

      {/* quiet ticker tape */}
      <div style={S.tickerWrap}>
        <div className="rq-marquee">
          {[
            `${family.lifetime_points || 0} lifetime`,
            `${family.streak || 1}-day streak`,
            `${counts.videos || 0} reflections`,
            `${counts.today || 0} today`,
            `${pending.length} pending`,
          ].concat([
            `${family.lifetime_points || 0} lifetime`,
            `${family.streak || 1}-day streak`,
            `${counts.videos || 0} reflections`,
            `${counts.today || 0} today`,
            `${pending.length} pending`,
          ]).map((t, i) => (
            <span key={i} style={S.tickerItem}>
              <span style={S.tickerDot} />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* next reward — full-bleed feature, the editorial moment */}
      {next && (
        <div style={S.feature}>
          <div style={S.featureKicker}>Next reward</div>
          <span style={S.featureEmoji}>{next.emoji}</span>
          <div style={S.featureLabel}>{next.label}</div>
          <div style={S.featureProgressTrack}>
            <div style={{ ...S.featureProgressFill, width: `${pct}%` }} />
          </div>
          <div style={S.featureProgressFoot}>
            <span>{family.points || 0} / {next.cost}</span>
            <span>{pct}%</span>
          </div>
        </div>
      )}

      {/* stats — hairline divided */}
      <div style={S.statRow}>
        <div style={S.statCell}>
          <div style={S.statNum}>{pending.length}</div>
          <div style={S.statLabel}>Pending</div>
        </div>
        <div style={{ ...S.statCell, ...S.statCellMid }}>
          <div style={S.statNum}>{family.lifetime_points || 0}</div>
          <div style={S.statLabel}>Lifetime</div>
        </div>
        <div style={S.statCellLast}>
          <div style={S.statNum}>{family.streak || 1}</div>
          <div style={S.statLabel}>Streak</div>
        </div>
      </div>

      <div style={S.eyebrow}>
        <span style={S.eyebrowNum}>01</span>
        <span>What's next</span>
      </div>

      <button onClick={() => setTab('tasks')} style={S.shortcutBright} className="rq-press">
        <div style={{ ...S.shortcutBrightIcon, background: 'var(--shelf)' }}>
          <CheckCircle2 size={20} style={{ color: 'var(--ink)' }} />
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={S.shortcutTitle}>Log a quest</div>
          <div style={S.shortcutSub}>Snap proof · earn points</div>
        </div>
        <ChevronRight size={16} style={{ color: 'var(--mute2)' }} />
      </button>
      <button onClick={() => setTab('video')} style={S.shortcutBright} className="rq-press">
        <div style={{ ...S.shortcutBrightIcon, background: 'var(--accentSoft)' }}>
          <Camera size={20} style={{ color: 'var(--accent)' }} />
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={S.shortcutTitle}>Record a reflection</div>
          <div style={S.shortcutSub}>Worth {VIDEO_PTS} pts · 90 seconds</div>
        </div>
        <ChevronRight size={16} style={{ color: 'var(--mute2)' }} />
      </button>
      <button onClick={() => setTab('store')} style={S.shortcutBright} className="rq-press">
        <div style={{ ...S.shortcutBrightIcon, background: 'var(--shelf)' }}>
          <Gift size={20} style={{ color: 'var(--ink)' }} />
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={S.shortcutTitle}>The reward shelf</div>
          <div style={S.shortcutSub}>Redeem or save</div>
        </div>
        <ChevronRight size={16} style={{ color: 'var(--mute2)' }} />
      </button>

      {pending.length > 0 && (
        <div style={S.pendingNote}>
          <Clock size={14} />
          {pending.length} {pending.length !== 1 ? 'items' : 'item'} pending approval
        </div>
      )}
    </div>
  )
}

function KidTasks({ family, tasks, decisions, pending, onSubmit }) {
  const today = todayKey()
  const choreStatus = (taskId) => {
    if (pending.some((p) => p.kind === 'chore' && p.label === tasks.find(t => t.id === taskId)?.label && p.claim_date === today)) return 'pending'
    return 'open'
  }
  return (
    <div className="rq-fade">
      <h2 style={S.h2}>Quests</h2>
      <div style={S.proofBanner}>
        <Camera size={15} />
        Snap a photo or video. A parent confirms it — then points land.
      </div>

      <div style={S.sectionTag}>
        <Circle size={13} style={{ color: 'var(--slime)' }} />
        Daily tasks · small points
      </div>
      <p style={S.sectionHint}>Everyday stuff. Resets fresh each day.</p>
      {tasks.length === 0 && <p style={S.sectionHint}>No tasks yet — a parent can add some.</p>}
      {tasks.map((t) => {
        const status = choreStatus(t.id)
        const pendingItem = pending.find((p) => p.kind === 'chore' && p.label === t.label && p.claim_date === today)
        return (
          <div key={t.id} style={{
            ...S.taskRow,
            ...(status === 'pending' ? S.taskRowPending : {}),
          }}>
            {status === 'pending' ? (
              <Thumb url={pendingItem.media_url} type={pendingItem.media_type} size={40} />
            ) : (
              <Circle size={22} style={{ color: 'var(--line)', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span style={S.taskLabel}>{t.label}</span>
              {status === 'pending' && <span style={S.pendingTag}>Waiting for parent ✓</span>}
            </div>
            {status === 'open' ? (
              <ProofInput onPicked={(file) => onSubmit('chore', t, file)}
                style={S.proofBtn} className="rq-press">
                <Camera size={14} /> +{t.points}
              </ProofInput>
            ) : (
              <span style={S.taskPts}>+{t.points}</span>
            )}
          </div>
        )
      })}

      <div style={{ ...S.sectionTag, marginTop: 26 }}>
        <Star size={13} style={{ color: 'var(--gold)' }} />
        Smart choices · big points
      </div>
      <p style={S.sectionHint}>
        These show real character. Add proof — a parent confirms before points land.
      </p>
      {decisions.length === 0 && <p style={S.sectionHint}>No smart choices yet — a parent can add some.</p>}
      {decisions.map((d) => {
        const pendingItem = pending.find((p) => p.kind === 'choice' && p.label === d.label)
        const isPending = !!pendingItem
        return (
          <div key={d.id} style={{ ...S.decisionRow, ...(isPending ? S.decisionPending : {}) }}>
            {isPending && <Thumb url={pendingItem.media_url} type={pendingItem.media_type} size={40} />}
            <div style={S.decisionMain}>
              <span style={S.decisionLabel}>{d.label}</span>
              {isPending && <span style={S.pendingTag}>Proof sent · waiting for parent ✓</span>}
            </div>
            {isPending ? (
              <span style={S.decisionPts}>+{d.points}</span>
            ) : (
              <ProofInput onPicked={(file) => onSubmit('choice', d, file)}
                style={{ ...S.proofBtn, background: 'var(--gold)', boxShadow: '0 3px 0 #E0A93F' }}
                className="rq-press">
                <Camera size={14} /> +{d.points}
              </ProofInput>
            )}
          </div>
        )
      })}
    </div>
  )
}

function KidVideo({ onSave, videos }) {
  const [prompt, setPrompt] = useState(VIDEO_PROMPTS[0])
  const [pendingFile, setPendingFile] = useState(null)
  const [pendingUrl, setPendingUrl] = useState(null)
  const [pendingType, setPendingType] = useState(null)

  const newPrompt = () => {
    const others = VIDEO_PROMPTS.filter((p) => p !== prompt)
    setPrompt(others[Math.floor(Math.random() * others.length)])
  }
  const pick = (file) => {
    setPendingFile(file)
    setPendingUrl(URL.createObjectURL(file))
    setPendingType(file.type.startsWith('video') ? 'video' : 'photo')
  }
  const keepIt = () => {
    if (!pendingFile) return
    onSave(prompt, pendingFile)
    setPendingFile(null); setPendingUrl(null); setPendingType(null)
    newPrompt()
  }

  return (
    <div className="rq-fade">
      <h2 style={S.h2}>Video reflection</h2>
      <div style={S.promptCard}>
        <span style={S.promptKicker}>Your prompt</span>
        <p style={S.promptText}>{prompt}</p>
        <button onClick={newPrompt} style={S.promptSwap} className="rq-press">
          <RotateCcw size={13} /> Different prompt
        </button>
      </div>
      <div style={S.stage}>
        {pendingUrl ? (
          pendingType === 'video'
            ? <video src={pendingUrl} controls playsInline style={S.videoEl} />
            : <img src={pendingUrl} alt="reflection" style={S.videoEl} />
        ) : (
          <div style={S.stagePlaceholder}>
            <Camera size={34} style={{ opacity: 0.5 }} />
            <span>Record on your iPhone, then pick it here</span>
          </div>
        )}
      </div>
      {!pendingFile ? (
        <ProofInput onPicked={pick} style={S.primaryBtn} className="rq-press">
          <Camera size={18} /> Record or choose a video
        </ProofInput>
      ) : (
        <div style={{ display: 'flex', gap: 10 }}>
          <ProofInput onPicked={pick} style={S.ghostBtn} className="rq-press">
            <RotateCcw size={16} /> Redo
          </ProofInput>
          <button onClick={keepIt} style={S.primaryBtn} className="rq-press">
            <CheckCircle2 size={18} /> Send it · +{VIDEO_PTS}
          </button>
        </div>
      )}
      <p style={S.videoNote}>
        Your reflections now live in the cloud — a parent can scroll back through them anytime.
      </p>
      {videos.length > 0 && (
        <>
          <h3 style={S.h3}>Recent reflections</h3>
          {videos.map((v) => (
            <div key={v.id} style={S.videoLogRow}>
              <Thumb url={v.media_url} type={v.media_type} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={S.videoLogPrompt}>{v.prompt}</div>
                <div style={S.videoLogDate}>
                  {new Date(v.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

function KidStore({ family, rewards, onRedeem }) {
  return (
    <div className="rq-fade">
      <h2 style={S.h2}>Reward store</h2>
      <p style={S.sectionHint}>Spend points now — or save up for something bigger. Your call.</p>
      {TIERS.map((tier) => {
        const items = rewards.filter((r) => r.tier === tier)
        if (items.length === 0) return null
        return (
          <div key={tier}>
            <div style={{ ...S.sectionTag, marginTop: 18 }}>
              <span style={{ ...S.tierDot, background: TIER_COLORS[tier] }} />
              {tier} rewards
            </div>
            {items.map((r) => {
              const afford = (family.points || 0) >= r.cost
              return (
                <div key={r.id} style={S.rewardRow}>
                  <span style={S.rewardEmoji}>{r.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={S.rewardLabel}>{r.label}</div>
                    <div style={S.rewardCost}>{r.cost} pts</div>
                  </div>
                  <button onClick={() => onRedeem(r)} disabled={!afford}
                    style={{ ...S.redeemBtn, ...(afford ? {} : S.redeemLocked) }}
                    className="rq-press">
                    {afford ? 'Redeem' : <Lock size={14} />}
                  </button>
                </div>
              )
            })}
          </div>
        )
      })}
      <p style={{ ...S.sectionHint, marginTop: 20 }}>
        A parent gives you the real reward — the app keeps the tally.
      </p>
    </div>
  )
}

/* ============================================================
   PARENT APP — dashboard with approvals, editors, video archive
   ============================================================ */
function ParentApp({ familyId, user }) {
  const [tab, setTab] = useState('home')
  const [toast, setToast] = useState(null)
  const [family, setFamily] = useState(null)
  const [tasks, setTasks] = useState([])
  const [decisions, setDecisions] = useState([])
  const [rewards, setRewards] = useState([])
  const [pending, setPending] = useState([])
  const [videos, setVideos] = useState([])
  const [redemptions, setRedemptions] = useState([])
  const [recentClaims, setRecentClaims] = useState([])
  const [counts, setCounts] = useState({ weekPts: 0, weekClaims: 0, weekVideos: 0 })
  const [confettiKey, setConfettiKey] = useState(0)
  const [pointsBump, setPointsBump] = useState(false)

  const reload = useCallback(async () => {
    const [f, t, d, r, p, v, red] = await Promise.all([
      getFamily(familyId), getTasks(familyId), getDecisions(familyId),
      getRewards(familyId), getPendingClaims(familyId), getVideos(familyId, 50),
      getRedemptions(familyId, 20),
    ])
    if (f.data) setFamily(f.data)
    if (t.data) setTasks(t.data)
    if (d.data) setDecisions(d.data)
    if (r.data) setRewards(r.data)
    if (p.data) setPending(p.data)
    if (v.data) setVideos(v.data)
    if (red.data) setRedemptions(red.data)

    /* recent claims (any status) for the Lately feed */
    const { data: rc } = await supabase.from('claims')
      .select('*').eq('family_id', familyId)
      .neq('status', 'pending')
      .order('resolved_at', { ascending: false, nullsFirst: false })
      .limit(8)
    if (rc) setRecentClaims(rc)

    /* this-week stats */
    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString()
    const { data: weekRows } = await supabase.from('claims')
      .select('points,kind,created_at,status')
      .eq('family_id', familyId).eq('status', 'approved')
      .gte('created_at', weekAgo)
    const { data: vidRows } = await supabase.from('videos')
      .select('id,created_at').eq('family_id', familyId).gte('created_at', weekAgo)
    setCounts({
      weekPts: (weekRows || []).reduce((s, r) => s + (r.points || 0), 0),
      weekClaims: (weekRows || []).length,
      weekVideos: (vidRows || []).length,
    })
  }, [familyId])

  useEffect(() => { reload() }, [reload])
  useEffect(() => subscribeFamily(familyId, reload), [familyId, reload])

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600) }

  const onApprove = async (claim) => {
    await resolveClaim(claim.id, 'approved')
    await updateFamily(familyId, {
      points: (family.points || 0) + claim.points,
      lifetime_points: (family.lifetime_points || 0) + claim.points,
    })
    flash(`+${claim.points} approved 🎉`)
    setConfettiKey(k => k + 1)
    setPointsBump(true)
    setTimeout(() => setPointsBump(false), 700)
    reload()
  }
  const onDecline = async (claim) => {
    await resolveClaim(claim.id, 'declined')
    flash('Declined')
    reload()
  }
  const onFulfill = async (id) => {
    await markRedemptionFulfilled(id)
    flash('Marked as given')
    reload()
  }

  if (!family) return <Splash msg="Loading dashboard…" />

  const theme = THEMES.find(t => t.id === family.theme) || THEMES[0]
  const themedApp = { ...S.app, "--gold": theme.gold, "--lav": theme.lav }

  return (
    <div style={themedApp}>
      <ParentHeader family={family} pointsBump={pointsBump} />
      <main style={S.main}>
        <div style={S.modeRow}>
          <button onClick={() => setTab('home')}
            style={{ ...S.modeBtn, ...(tab === 'home' ? S.modeActive : {}) }}
            className="rq-press">
            Home
          </button>
          <button onClick={() => setTab('approvals')}
            style={{ ...S.modeBtn, ...(tab === 'approvals' ? S.modeActive : {}) }}
            className="rq-press">
            Approvals
            {pending.length > 0 && <span style={S.navBadge}>{pending.length}</span>}
          </button>
          <button onClick={() => setTab('videos')}
            style={{ ...S.modeBtn, ...(tab === 'videos' ? S.modeActive : {}) }}
            className="rq-press">
            Videos
          </button>
          <button onClick={() => setTab('rewards')}
            style={{ ...S.modeBtn, ...(tab === 'rewards' ? S.modeActive : {}) }}
            className="rq-press">
            Rewards
          </button>
          <button onClick={() => setTab('edit')}
            style={{ ...S.modeBtn, ...(tab === 'edit' ? S.modeActive : {}) }}
            className="rq-press">
            Edit
          </button>
        </div>

        {tab === 'home' && (
          <ParentHome family={family} pending={pending} videos={videos}
            rewards={rewards} redemptions={redemptions} recentClaims={recentClaims}
            counts={counts} setTab={setTab} />
        )}
        {tab === 'approvals' && (
          <ParentApprovals pending={pending} onApprove={onApprove} onDecline={onDecline} />
        )}
        {tab === 'videos' && <ParentVideos videos={videos} />}
        {tab === 'rewards' && (
          <ParentRewards redemptions={redemptions} onFulfill={onFulfill} />
        )}
        {tab === 'edit' && (
          <ParentEdit
            family={family}
            tasks={tasks} decisions={decisions} rewards={rewards}
            familyId={familyId} flash={flash} reload={reload}
          />
        )}

        <button onClick={signOut} style={S.signOutBtn} className="rq-press">
          <LogOut size={14} /> Sign out ({user.email})
        </button>
      </main>
      {toast && <div style={S.toast} className="rq-toast">{toast}</div>}
      {confettiKey > 0 && <Confetti k={confettiKey} themeGold={theme.gold} />}
    </div>
  )
}

/* parent-view header */
function ParentHeader({ family, pointsBump }) {
  return (
    <header style={S.header}>
      <div>
        <div style={S.brand}>
          <span style={S.brandWord}>reward<span style={S.brandDot}></span>quest</span>
        </div>
        <div style={S.whoami}>
          <span>Parent</span>
        </div>
      </div>
      <div style={S.pointsBadge}>
        <span style={S.pointsNum} className={pointsBump ? 'rq-bump' : ''}>{family.points || 0}</span>
        <span style={S.pointsLabel}>pts</span>
      </div>
    </header>
  )
}

function ParentHome({ family, pending, videos, rewards, redemptions, recentClaims, counts, setTab }) {
  const dayName = new Date().toLocaleDateString(undefined, { weekday: 'long' })
  const dateStr = new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
  const latestVideo = videos[0]
  const sorted = [...rewards].sort((a, b) => a.cost - b.cost)
  const nextReward = sorted.find((r) => r.cost > (family.points || 0)) || sorted[sorted.length - 1]
  const pct = nextReward ? Math.min(100, Math.round((family.points / nextReward.cost) * 100)) : 0
  const unfilledRedemptions = redemptions.filter((r) => !r.fulfilled).length

  /* warm greeting line that adapts */
  let greetSub
  if (counts.weekPts >= 200) greetSub = `She's been crushing it — ${counts.weekPts} points this week. 🌟`
  else if (counts.weekClaims >= 5) greetSub = `${counts.weekClaims} approved this week. She's on a roll.`
  else if (counts.weekClaims >= 1) greetSub = `${counts.weekClaims} approved this week. Keep encouraging her.`
  else if (pending.length > 0) greetSub = `${pending.length} thing${pending.length !== 1 ? 's' : ''} waiting for you below.`
  else greetSub = `Quiet week so far — a nudge might help today.`

  return (
    <div className="rq-fade">
      <div style={S.parentGreeting}>
        <div style={S.parentGreetDate}>{dayName} · {dateStr}</div>
        <div style={S.parentGreetH}>How's she doing.</div>
        <div style={S.parentGreetSub}>{greetSub}</div>
      </div>

      <div style={S.weekBand}>
        <div style={S.weekCell}>
          <div style={S.weekCellNum}>{counts.weekPts}</div>
          <div style={S.weekCellLabel}>Pts / week</div>
        </div>
        <div style={S.weekCell}>
          <div style={S.weekCellNum}>{counts.weekClaims}</div>
          <div style={S.weekCellLabel}>Approved</div>
        </div>
        <div style={{ ...S.weekCell, ...S.weekCellLast }}>
          <div style={S.weekCellNum}>{counts.weekVideos}</div>
          <div style={S.weekCellLabel}>Videos</div>
        </div>
      </div>

      {pending.length > 0 && (
        <button onClick={() => setTab('approvals')}
          style={{ ...S.shortcutBright, marginBottom: 14, borderColor: 'var(--gum)' }}
          className="rq-press">
          <div style={{ ...S.shortcutBrightIcon, background: 'var(--gum)' }}>
            <Clock size={22} style={{ color: '#fff' }} />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={S.shortcutTitle}>{pending.length} waiting for your approval</div>
            <div style={S.shortcutSub}>Tap to review proof and confirm</div>
          </div>
          <ChevronRight size={20} style={{ color: 'var(--gum)' }} />
        </button>
      )}

      {unfilledRedemptions > 0 && (
        <button onClick={() => setTab('rewards')}
          style={{ ...S.shortcutBright, marginBottom: 14, borderColor: 'var(--gold)' }}
          className="rq-press">
          <div style={{ ...S.shortcutBrightIcon, background: 'var(--gold)' }}>
            <Gift size={22} style={{ color: '#fff' }} />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={S.shortcutTitle}>{unfilledRedemptions} reward{unfilledRedemptions !== 1 ? 's' : ''} to give</div>
            <div style={S.shortcutSub}>She redeemed — don't forget to deliver</div>
          </div>
          <ChevronRight size={20} style={{ color: 'var(--gold)' }} />
        </button>
      )}

      {nextReward && (
        <>
          <div style={S.blockTitle}>
            <Star size={16} style={{ color: 'var(--gold)' }} />
            She's working toward
          </div>
          <div style={S.rewardProgressCard}>
            <div style={S.rewardProgressTop}>
              <span style={S.rewardProgressEmoji}>{nextReward.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={S.rewardProgressLabel}>{nextReward.label}</div>
                <div style={S.rewardProgressSub}>
                  {family.points || 0} / {nextReward.cost} pts · {pct}% there
                </div>
              </div>
            </div>
            <div style={S.miniProgress}>
              <div style={{ ...S.miniProgressFill, width: `${pct}%` }} />
            </div>
          </div>
        </>
      )}

      {latestVideo && (
        <>
          <div style={S.blockTitle}>
            <Film size={16} style={{ color: 'var(--gum)' }} />
            Her latest reflection
          </div>
          <a href={latestVideo.media_url} target="_blank" rel="noreferrer" style={S.latestVideoCard}>
            <video src={latestVideo.media_url} muted playsInline style={S.latestVideoThumb} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={S.latestVideoTag}>NEW · TAP TO WATCH</div>
              <div style={S.latestVideoPrompt}>{latestVideo.prompt}</div>
              <div style={S.latestVideoDate}>
                {new Date(latestVideo.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            </div>
            <Play size={22} style={{ color: 'var(--gum)' }} />
          </a>
        </>
      )}

      {recentClaims.length > 0 && (
        <>
          <div style={S.blockTitle}>
            <Sparkles size={16} style={{ color: 'var(--gum)' }} />
            Lately
          </div>
          {recentClaims.map((c) => (
            <div key={c.id} style={S.latelyRow}>
              <Thumb url={c.media_url} type={c.media_type} size={44} />
              <div style={S.latelyText}>
                <div style={S.latelyLabel}>{c.label}</div>
                <div style={S.latelyMeta}>
                  {c.status === 'approved' ? 'Approved' : 'Declined'} ·{' '}
                  {new Date(c.resolved_at || c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              </div>
              <span style={c.status === 'approved' ? S.latelyPts : S.latelyPtsDeclined}>
                {c.status === 'approved' ? `+${c.points}` : '—'}
              </span>
            </div>
          ))}
        </>
      )}

      {recentClaims.length === 0 && pending.length === 0 && (
        <div style={{ ...S.emptyBox, marginTop: 20 }}>
          <Sparkles size={26} style={{ color: 'var(--gold)' }} />
          <span>Once she starts logging, you'll see her progress here.</span>
        </div>
      )}
    </div>
  )
}

function ParentApprovals({ pending, onApprove, onDecline }) {
  const chores = pending.filter((p) => p.kind === 'chore')
  const choices = pending.filter((p) => p.kind === 'choice')

  const Card = (d) => (
    <div key={d.id} style={S.approvalCard}>
      <Thumb url={d.media_url} type={d.media_type} size={56} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={S.decisionLabel}>{d.label}</div>
        <div style={S.rewardCost}>
          +{d.points} pts · {d.media_type || 'photo'} ·{' '}
          {new Date(d.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
        </div>
        {d.media_url && (
          <a href={d.media_url} target="_blank" rel="noreferrer"
            style={{ fontSize: 11, color: 'var(--gum)', fontWeight: 800, textDecoration: 'none' }}>
            Open full
          </a>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onDecline(d)} style={S.declineBtn} className="rq-press">
          <X size={16} />
        </button>
        <button onClick={() => onApprove(d)} style={S.approveBtn} className="rq-press">
          <CheckCircle2 size={16} />
        </button>
      </div>
    </div>
  )

  return (
    <div className="rq-fade">
      <h2 style={S.h2}>Approvals</h2>
      {pending.length === 0 && (
        <div style={S.emptyBox}>
          <CheckCircle2 size={26} style={{ color: 'var(--slime)' }} />
          <span>Nothing waiting — all caught up.</span>
        </div>
      )}
      {chores.length > 0 && (
        <>
          <div style={S.sectionTag}>
            <Circle size={13} style={{ color: 'var(--slime)' }} />
            Daily tasks ({chores.length})
          </div>
          {chores.map(Card)}
        </>
      )}
      {choices.length > 0 && (
        <>
          <div style={{ ...S.sectionTag, marginTop: 18 }}>
            <Star size={13} style={{ color: 'var(--gold)' }} />
            Smart choices &amp; videos ({choices.length})
          </div>
          {choices.map(Card)}
        </>
      )}
    </div>
  )
}

function ParentVideos({ videos }) {
  return (
    <div className="rq-fade">
      <h2 style={S.h2}>Video archive</h2>
      <p style={S.sectionHint}>
        Every reflection she's recorded. Tap to watch. They live in the cloud — your keepsake.
      </p>
      {videos.length === 0 ? (
        <div style={S.emptyBox}>
          <Film size={26} style={{ color: 'var(--lav)' }} />
          <span>No videos yet.</span>
        </div>
      ) : (
        videos.map((v) => (
          <a key={v.id} href={v.media_url} target="_blank" rel="noreferrer"
            style={{ ...S.videoLogRow, textDecoration: 'none', color: 'inherit' }}>
            <Thumb url={v.media_url} type={v.media_type} size={56} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...S.videoLogPrompt, whiteSpace: 'normal' }}>{v.prompt}</div>
              <div style={S.videoLogDate}>
                {new Date(v.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <Play size={18} style={{ color: 'var(--gum)' }} />
          </a>
        ))
      )}
    </div>
  )
}

function ParentRewards({ redemptions, onFulfill }) {
  const unfilled = redemptions.filter((r) => !r.fulfilled)
  const fulfilled = redemptions.filter((r) => r.fulfilled)
  return (
    <div className="rq-fade">
      <h2 style={S.h2}>Reward redemptions</h2>
      <p style={S.sectionHint}>
        When she redeems a reward, it shows up here so you remember to give it.
      </p>
      {unfilled.length === 0 && fulfilled.length === 0 && (
        <div style={S.emptyBox}>
          <Gift size={26} style={{ color: 'var(--gold)' }} />
          <span>No redemptions yet.</span>
        </div>
      )}
      {unfilled.length > 0 && (
        <>
          <div style={S.sectionTag}>
            <Clock size={13} style={{ color: 'var(--gum)' }} />
            To give ({unfilled.length})
          </div>
          {unfilled.map((r) => (
            <div key={r.id} style={S.approvalCard}>
              <span style={{ fontSize: 30 }}>{r.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={S.decisionLabel}>{r.reward_label}</div>
                <div style={S.rewardCost}>{r.cost} pts · {new Date(r.created_at).toLocaleDateString()}</div>
              </div>
              <button onClick={() => onFulfill(r.id)} style={S.approveBtn} className="rq-press">
                <Check size={16} /> Given
              </button>
            </div>
          ))}
        </>
      )}
      {fulfilled.length > 0 && (
        <>
          <h3 style={S.h3}>Already given</h3>
          {fulfilled.map((r) => (
            <div key={r.id} style={S.redeemedRow}>
              <span>{r.emoji}</span>
              <span style={{ flex: 1 }}>{r.reward_label}</span>
              <span style={S.redeemedDate}>{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

function ParentEdit({ family, tasks, decisions, rewards, familyId, flash, reload }) {
  return (
    <div className="rq-fade">
      <InvitePanel family={family} flash={flash} reload={reload} />
      <h2 style={S.h2}>Edit lists</h2>
      <ListEditor title="Daily tasks" hint="Small-point everyday chores."
        color="var(--slime)" items={tasks} table="tasks"
        familyId={familyId} defaultPts={5} flash={flash} reload={reload} />
      <ListEditor title="Smart choices" hint="Big-point good decisions."
        color="var(--gold)" items={decisions} table="decisions"
        familyId={familyId} defaultPts={40} flash={flash} reload={reload} />
      <RewardEditor rewards={rewards} familyId={familyId} flash={flash} reload={reload} />
    </div>
  )
}

function InvitePanel({ family, flash, reload }) {
  const [code, setCode] = useState(family.invite_code || null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!family.invite_code) {
      setBusy(true)
      ensureInviteCode(family).then((c) => {
        setBusy(false)
        if (c) { setCode(c); reload() }
      })
    } else {
      setCode(family.invite_code)
    }
  }, [family.id, family.invite_code])

  const copy = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      flash('Code copied')
    } catch {
      flash('Couldn\u2019t copy — read it out instead')
    }
  }

  return (
    <div style={{ ...S.feature, marginTop: 8, marginBottom: 28 }}>
      <div style={S.featureKicker}>Add your kid</div>
      <div style={{
        fontFamily: "'Fraunces', serif", fontSize: 48, fontWeight: 400,
        letterSpacing: '-0.04em', lineHeight: 1, color: '#fff',
        margin: '4px 0 16px', fontVariationSettings: "'opsz' 144",
      }}>
        {busy ? '…' : (code || 'RQ-????')}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', lineHeight: 1.5, marginBottom: 18 }}>
        On your kid&rsquo;s phone, open <strong style={{ color: '#fff' }}>www.myrewardquest.com</strong> in Safari,
        tap &ldquo;New here? Create one,&rdquo; and enter this code as the <strong style={{ color: '#fff' }}>Family code</strong>.
        Then add the app to her home screen.
      </div>
      <button onClick={copy} className="rq-press" disabled={!code || busy}
        style={{
          background: 'var(--accent)', color: '#fff', border: 'none',
          borderRadius: 999, padding: '12px 22px',
          fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12,
          letterSpacing: 0.5, textTransform: 'uppercase',
        }}>
        Copy code
      </button>
    </div>
  )
}

function ListEditor({ title, hint, color, items, table, familyId, defaultPts, flash, reload }) {
  const [label, setLabel] = useState('')
  const [pts, setPts] = useState(defaultPts)
  const [editId, setEditId] = useState(null)
  const [editLabel, setEditLabel] = useState('')
  const [editPts, setEditPts] = useState(0)

  const add = async () => {
    const text = label.trim()
    if (!text) { flash('Add a name first'); return }
    const n = Math.max(1, parseInt(pts, 10) || defaultPts)
    const { error } = await addRow(table, { family_id: familyId, label: text, points: n, sort_order: items.length + 1 })
    if (error) { flash('Save failed'); return }
    setLabel(''); setPts(defaultPts); flash(`Added to ${title}`); reload()
  }
  const remove = async (id) => { await deleteRow(table, id); reload() }
  const beginEdit = (i) => { setEditId(i.id); setEditLabel(i.label); setEditPts(i.points) }
  const commitEdit = async () => {
    const text = editLabel.trim()
    if (!text) { flash('Name can\'t be empty'); return }
    const n = Math.max(1, parseInt(editPts, 10) || 1)
    await updateRow(table, editId, { label: text, points: n })
    setEditId(null); flash('Saved'); reload()
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={S.sectionTag}>
        <span style={{ ...S.tierDot, background: color }} />
        {title}
      </div>
      <p style={S.sectionHint}>{hint}</p>
      {items.map((i) => editId === i.id ? (
        <div key={i.id} style={S.editRow}>
          <input value={editLabel} onChange={(e) => setEditLabel(e.target.value)}
            style={S.editInput} placeholder="Name" />
          <input value={editPts} onChange={(e) => setEditPts(e.target.value)}
            style={S.editPts} type="number" inputMode="numeric" />
          <button onClick={commitEdit} style={S.iconBtnGo} className="rq-press">
            <Check size={15} />
          </button>
        </div>
      ) : (
        <div key={i.id} style={S.itemRow}>
          <span style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>{i.label}</span>
          <span style={S.itemPts}>+{i.points}</span>
          <button onClick={() => beginEdit(i)} style={S.iconBtn} className="rq-press">
            <Pencil size={14} />
          </button>
          <button onClick={() => remove(i.id)} style={S.iconBtnDanger} className="rq-press">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <div style={S.addRow}>
        <input value={label} onChange={(e) => setLabel(e.target.value)}
          style={S.editInput} placeholder={`New ${title.toLowerCase().replace(/s$/, '')}`} />
        <input value={pts} onChange={(e) => setPts(e.target.value)}
          style={S.editPts} type="number" inputMode="numeric" />
        <button onClick={add} style={S.iconBtnGo} className="rq-press">
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}

function RewardEditor({ rewards, familyId, flash, reload }) {
  const [label, setLabel] = useState('')
  const [tier, setTier] = useState('Small')
  const [cost, setCost] = useState(50)
  const [emoji, setEmoji] = useState('🎁')
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState({})

  const add = async () => {
    const text = label.trim()
    if (!text) { flash('Add a name first'); return }
    const c = Math.max(1, parseInt(cost, 10) || 50)
    await addRow('rewards', {
      family_id: familyId, label: text, tier, cost: c, emoji, sort_order: rewards.length + 1,
    })
    setLabel(''); setCost(50); setEmoji('🎁'); setTier('Small')
    flash('Reward added'); reload()
  }
  const remove = async (id) => { await deleteRow('rewards', id); reload() }
  const beginEdit = (r) => { setEditId(r.id); setDraft({ ...r }) }
  const commitEdit = async () => {
    const text = (draft.label || '').trim()
    if (!text) { flash('Name can\'t be empty'); return }
    const c = Math.max(1, parseInt(draft.cost, 10) || 1)
    await updateRow('rewards', editId, {
      label: text, cost: c, tier: draft.tier, emoji: draft.emoji,
    })
    setEditId(null); flash('Saved'); reload()
  }

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={S.sectionTag}>
        <Gift size={13} style={{ color: 'var(--gum)' }} />
        Rewards
      </div>
      <p style={S.sectionHint}>
        The menu she earns toward. You give the real reward when she redeems.
      </p>
      {rewards.map((r) => editId === r.id ? (
        <div key={r.id} style={S.rewardEditCard}>
          <div style={S.emojiPickRow}>
            {EMOJI_CHOICES.map((e) => (
              <button key={e} onClick={() => setDraft({ ...draft, emoji: e })}
                style={{ ...S.emojiBtn, ...(draft.emoji === e ? S.emojiActive : {}) }}
                className="rq-press">{e}</button>
            ))}
          </div>
          <input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            style={{ ...S.editInput, width: '100%', marginBottom: 8 }} placeholder="Reward name" />
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={draft.tier} onChange={(e) => setDraft({ ...draft, tier: e.target.value })}
              style={S.select}>
              {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input value={draft.cost} onChange={(e) => setDraft({ ...draft, cost: e.target.value })}
              style={S.editPts} type="number" inputMode="numeric" />
            <button onClick={commitEdit} style={S.iconBtnGo} className="rq-press">
              <Check size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div key={r.id} style={S.itemRow}>
          <span style={{ fontSize: 18 }}>{r.emoji}</span>
          <span style={{ flex: 1, fontWeight: 700, fontSize: 13.5 }}>{r.label}</span>
          <span style={{ ...S.tierBadge, background: TIER_COLORS[r.tier] }}>{r.tier}</span>
          <span style={S.itemPts}>{r.cost}</span>
          <button onClick={() => beginEdit(r)} style={S.iconBtn} className="rq-press">
            <Pencil size={14} />
          </button>
          <button onClick={() => remove(r.id)} style={S.iconBtnDanger} className="rq-press">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <div style={S.rewardEditCard}>
        <div style={S.emojiPickRow}>
          {EMOJI_CHOICES.map((e) => (
            <button key={e} onClick={() => setEmoji(e)}
              style={{ ...S.emojiBtn, ...(emoji === e ? S.emojiActive : {}) }}
              className="rq-press">{e}</button>
          ))}
        </div>
        <input value={label} onChange={(e) => setLabel(e.target.value)}
          style={{ ...S.editInput, width: '100%', marginBottom: 8 }} placeholder="New reward name" />
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={tier} onChange={(e) => setTier(e.target.value)} style={S.select}>
            {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input value={cost} onChange={(e) => setCost(e.target.value)}
            style={S.editPts} type="number" inputMode="numeric" />
          <button onClick={add} style={S.iconBtnGo} className="rq-press">
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   Visual effects: confetti, badge pop
   ============================================================ */
function Confetti({ k, themeGold }) {
  const pieces = Array.from({ length: 22 })
  const palette = [themeGold || '#FFC95C', '#FF8E72', '#7FD9B8', '#C9B6F0', '#FFD93D']
  return (
    <div key={k} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 200 }}>
      {pieces.map((_, i) => {
        const angle = (Math.PI * 2 * i) / pieces.length + (Math.random() - 0.5) * 0.6
        const dist = 120 + Math.random() * 180
        const dx = Math.cos(angle) * dist
        const dy = Math.sin(angle) * dist + 80 /* slight gravity */
        const rot = (Math.random() * 720 - 360) + 'deg'
        const bg = palette[i % palette.length]
        return (
          <span key={i} className="rq-confetti-piece"
            style={{ '--dx': dx + 'px', '--dy': dy + 'px', '--rot': rot, background: bg }} />
        )
      })}
    </div>
  )
}

function BadgePop({ badge }) {
  return (
    <div className="rq-badge-pop">
      <div style={{ fontSize: 44, marginBottom: 6 }} className="rq-spark">{badge.emoji}</div>
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', opacity: 0.7 }}>
        Badge unlocked
      </div>
      <div style={{ fontSize: 18, marginTop: 4 }}>{badge.label}</div>
    </div>
  )
}

/* ============================================================
   Personalize ("Me") page — avatar + theme
   ============================================================ */
function KidMe({ family, onSave }) {
  const [avatar, setAvatar] = useState(family.avatar_emoji || AVATAR_CHOICES[0])
  const [theme, setTheme] = useState(family.theme || THEMES[0].id)

  const save = () => onSave({ avatar, theme })

  return (
    <div className="rq-fade">
      <h2 style={S.h2}>Make it yours</h2>
      <p style={S.sectionHint}>Pick your avatar and color theme. Changes save when you tap Save.</p>

      <div style={S.sectionTag}>
        <Sparkles size={13} style={{ color: 'var(--gum)' }} />
        Your avatar
      </div>
      <div style={{ ...S.personalizeRow, marginTop: 8 }}>
        {AVATAR_CHOICES.map((e) => (
          <button key={e} onClick={() => setAvatar(e)}
            style={{ ...S.personalizeBtn, ...(avatar === e ? S.personalizeActive : {}) }}
            className="rq-press">{e}</button>
        ))}
      </div>

      <div style={{ ...S.sectionTag, marginTop: 18 }}>
        <Palette size={13} style={{ color: 'var(--gold)' }} />
        Color theme
      </div>
      <div style={{ ...S.personalizeRow, gridTemplateColumns: 'repeat(6, 1fr)', marginTop: 8 }}>
        {THEMES.map((t) => (
          <button key={t.id} onClick={() => setTheme(t.id)}
            title={t.label}
            style={{
              ...S.themeSwatch,
              background: `linear-gradient(135deg, ${t.gold}, ${t.lav})`,
              ...(theme === t.id ? S.themeSwatchActive : {}),
            }}
            className="rq-press" />
        ))}
      </div>
      <p style={S.sectionHint}>
        {THEMES.find(t => t.id === theme)?.label || 'Pick a vibe'}
      </p>

      <button onClick={save} style={{ ...S.primaryBtn, marginTop: 18 }} className="rq-press">
        <Check size={18} /> Save
      </button>
    </div>
  )
}

/* small components */
function NavBtn({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{ ...S.navBtn, ...(active ? S.navActive : {}) }}>
      <div style={{ position: 'relative' }}>
        <Icon size={21} />
        {badge > 0 && <span style={S.navBadge}>{badge}</span>}
      </div>
      <span style={S.navLabel}>{label}</span>
    </button>
  )
}
function Stat({ n, label }) {
  return (
    <div style={S.statCard}>
      <div style={S.statNum}>{n}</div>
      <div style={S.statLabel}>{label}</div>
    </div>
  )
}
function Shortcut({ color, icon: Icon, title, sub, onClick }) {
  return (
    <button onClick={onClick} style={S.shortcut} className="rq-press">
      <div style={{ ...S.shortcutIcon, background: color }}>
        <Icon size={20} style={{ color: 'var(--ink)' }} />
      </div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={S.shortcutTitle}>{title}</div>
        <div style={S.shortcutSub}>{sub}</div>
      </div>
      <ChevronRight size={18} style={{ color: 'var(--line)' }} />
    </button>
  )
}
