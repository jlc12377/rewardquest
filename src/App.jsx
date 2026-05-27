import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Sparkles, Star, Gift, CheckCircle2, Circle, Camera, Lock, Trophy, Heart,
  ChevronRight, X, ShieldCheck, RotateCcw, Image as ImageIcon, Clock,
  Pencil, Plus, Trash2, Check, LogOut, Film, Play,
} from 'lucide-react'
import {
  signUp, signIn, signOut, getSession,
  joinOrCreateFamily, getFamily, updateFamily,
  getTasks, getDecisions, getRewards, addRow, updateRow, deleteRow,
  getPendingClaims, submitClaim, resolveClaim,
  getVideos, addVideo, getRedemptions, addRedemption, markRedemptionFulfilled,
  uploadProof, subscribeFamily,
} from './data.js'
import { supabase } from './supabase.js'
import {
  CSS, S, TIERS, TIER_COLORS, EMOJI_CHOICES, VIDEO_PROMPTS, VIDEO_PTS, todayKey,
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
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setErr(null)
    if (!email || !password) { setErr('Enter both email and password'); return }
    if (password.length < 6) { setErr('Password must be at least 6 characters'); return }
    setBusy(true)
    const fn = mode === 'signup' ? signUp : signIn
    const { error } = await fn(email.trim(), password)
    setBusy(false)
    if (error) setErr(error.message || 'Something went wrong')
  }

  return (
    <div style={S.app}>
      <style>{CSS}</style>
      <div style={S.authWrap} className="rq-fade">
        <div style={S.authBrand}>
          <Sparkles size={22} style={{ color: 'var(--gold)' }} />
          <span style={{ ...S.brandName, fontSize: 22 }}>RewardQuest</span>
        </div>
        <h1 style={S.authH1}>
          {mode === 'signup' ? 'Create account' : 'Welcome back'}
        </h1>
        <p style={S.authSub}>
          {mode === 'signup'
            ? "The first account in a family becomes the parent. Add the kid's account next."
            : 'Sign in to your family.'}
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input style={S.authInput} type="email" autoComplete="email"
            placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input style={S.authInput} type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            placeholder="Password (6+ characters)" value={password}
            onChange={(e) => setPassword(e.target.value)} />
          {err && <div style={S.authErr}>{err}</div>}
          <button type="submit" style={S.primaryBtn} className="rq-press" disabled={busy}>
            {busy ? '…' : (mode === 'signup' ? 'Create account' : 'Sign in')}
          </button>
        </form>

        <button type="button" style={S.authToggle}
          onClick={() => { setErr(null); setMode(mode === 'signup' ? 'signin' : 'signup') }}>
          {mode === 'signup' ? 'Have an account? Sign in' : 'New here? Create an account'}
        </button>

        {mode === 'signup' && (
          <div style={S.authInfo}>
            Tip: parent creates their account first, then has the kid sign up with their own email.
            Both accounts will share the same family data.
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
  const ref = useRef(null)
  const handle = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    onPicked(file)
    e.target.value = ''
  }
  return (
    <>
      <input ref={ref} type="file" accept="image/*,video/*" capture="user"
        onChange={handle} style={{ display: 'none' }} />
      <button onClick={() => !busy && ref.current && ref.current.click()}
        style={style} className={className} disabled={busy}>
        {children}
      </button>
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
          <span style={S.brandName}>RewardQuest</span>
        </div>
        <div style={S.whoami}>
          <Heart size={12} style={{ color: 'var(--coral)' }} />
          {role === 'parent' ? 'Parent dashboard' : `${family.streak || 1} day${(family.streak || 1) !== 1 ? 's' : ''} in a row — keep glowing`}
        </div>
      </div>
      <div style={S.pointsBadge}>
        <Star size={16} style={{ color: 'var(--ink)' }} />
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

  const reload = useCallback(async () => {
    const [f, t, d, r, p, v] = await Promise.all([
      getFamily(familyId), getTasks(familyId), getDecisions(familyId),
      getRewards(familyId), getPendingClaims(familyId), getVideos(familyId, 10),
    ])
    if (f.data) setFamily(f.data)
    if (t.data) setTasks(t.data)
    if (d.data) setDecisions(d.data)
    if (r.data) setRewards(r.data)
    if (p.data) setPending(p.data)
    if (v.data) setVideos(v.data)
  }, [familyId])

  useEffect(() => { reload() }, [reload])
  useEffect(() => subscribeFamily(familyId, reload), [familyId, reload])

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

  if (!family) return <Splash msg="Loading your quest…" />

  return (
    <div style={S.app}>
      <AppHeader family={family} role="kid" />
      <main style={S.main}>
        {tab === 'home' && <KidHome family={family} rewards={rewards} pending={pending} setTab={setTab} />}
        {tab === 'tasks' && (
          <KidTasks family={family} tasks={tasks} decisions={decisions}
            pending={pending} onSubmit={onSubmitClaim} />
        )}
        {tab === 'video' && <KidVideo onSave={onSaveVideo} videos={videos} />}
        {tab === 'store' && <KidStore family={family} rewards={rewards} onRedeem={onRedeem} />}
      </main>

      {toast && <div style={S.toast} className="rq-toast">{toast}</div>}

      <nav style={S.nav}>
        <NavBtn icon={Trophy} label="Home" active={tab === 'home'} onClick={() => setTab('home')} />
        <NavBtn icon={CheckCircle2} label="Quests" active={tab === 'tasks'} onClick={() => setTab('tasks')} />
        <NavBtn icon={Camera} label="Video" active={tab === 'video'} onClick={() => setTab('video')} />
        <NavBtn icon={Gift} label="Rewards" active={tab === 'store'} onClick={() => setTab('store')} />
      </nav>
    </div>
  )
}

function KidHome({ family, rewards, pending, setTab }) {
  const sorted = [...rewards].sort((a, b) => a.cost - b.cost)
  const next = sorted.find((r) => r.cost > (family.points || 0)) || sorted[sorted.length - 1]
  const pct = next ? Math.min(100, Math.round((family.points / next.cost) * 100)) : 0

  return (
    <div className="rq-fade">
      <h2 style={S.h2}>Today's quest</h2>
      {next && (
        <div style={S.heroCard}>
          <div style={S.heroTop}>
            <span style={S.heroLabel}>Next reward</span>
            <span style={S.heroEmoji}>{next.emoji}</span>
          </div>
          <div style={S.heroReward}>{next.label}</div>
          <div style={S.progressTrack}>
            <div style={{ ...S.progressFill, width: `${pct}%` }} />
          </div>
          <div style={S.heroFoot}>
            {family.points || 0} / {next.cost} pts &nbsp;·&nbsp; {pct}% there
          </div>
        </div>
      )}
      <div style={S.statRow}>
        <Stat n={pending.length} label="Awaiting OK" />
        <Stat n={family.lifetime_points || 0} label="Total earned" />
        <Stat n={family.streak || 1} label="Day streak" />
      </div>
      <h3 style={S.h3}>Jump in</h3>
      <Shortcut color="var(--mint)" icon={CheckCircle2} title="Log a quest"
        sub="Snap proof · parent confirms" onClick={() => setTab('tasks')} />
      <Shortcut color="var(--coral)" icon={Camera} title="Record a reflection"
        sub={`Tell us your story — worth ${VIDEO_PTS} pts`} onClick={() => setTab('video')} />
      <Shortcut color="var(--gold)" icon={Gift} title="Visit the reward store"
        sub="Spend points or save up" onClick={() => setTab('store')} />
      {pending.length > 0 && (
        <div style={S.pendingNote}>
          <Clock size={14} />
          {pending.length} thing{pending.length !== 1 ? 's' : ''} waiting for a parent to confirm.
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
        <Circle size={13} style={{ color: 'var(--mint)' }} />
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
  const [tab, setTab] = useState('approvals')
  const [toast, setToast] = useState(null)
  const [family, setFamily] = useState(null)
  const [tasks, setTasks] = useState([])
  const [decisions, setDecisions] = useState([])
  const [rewards, setRewards] = useState([])
  const [pending, setPending] = useState([])
  const [videos, setVideos] = useState([])
  const [redemptions, setRedemptions] = useState([])

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
    flash(`+${claim.points} approved`)
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

  return (
    <div style={S.app}>
      <AppHeader family={family} role="parent" />
      <main style={S.main}>
        <div style={S.modeRow}>
          <button onClick={() => setTab('approvals')}
            style={{ ...S.modeBtn, ...(tab === 'approvals' ? S.modeActive : {}) }}
            className="rq-press">
            <CheckCircle2 size={14} /> Approvals
            {pending.length > 0 && <span style={S.navBadge}>{pending.length}</span>}
          </button>
          <button onClick={() => setTab('videos')}
            style={{ ...S.modeBtn, ...(tab === 'videos' ? S.modeActive : {}) }}
            className="rq-press">
            <Film size={14} /> Videos
          </button>
          <button onClick={() => setTab('rewards')}
            style={{ ...S.modeBtn, ...(tab === 'rewards' ? S.modeActive : {}) }}
            className="rq-press">
            <Gift size={14} /> Rewards
          </button>
          <button onClick={() => setTab('edit')}
            style={{ ...S.modeBtn, ...(tab === 'edit' ? S.modeActive : {}) }}
            className="rq-press">
            <Pencil size={14} /> Edit lists
          </button>
        </div>

        {tab === 'approvals' && (
          <ParentApprovals pending={pending} onApprove={onApprove} onDecline={onDecline} />
        )}
        {tab === 'videos' && <ParentVideos videos={videos} />}
        {tab === 'rewards' && (
          <ParentRewards redemptions={redemptions} onFulfill={onFulfill} />
        )}
        {tab === 'edit' && (
          <ParentEdit
            tasks={tasks} decisions={decisions} rewards={rewards}
            familyId={familyId} flash={flash} reload={reload}
          />
        )}

        <button onClick={signOut} style={S.signOutBtn} className="rq-press">
          <LogOut size={14} /> Sign out ({user.email})
        </button>
      </main>
      {toast && <div style={S.toast} className="rq-toast">{toast}</div>}
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
            style={{ fontSize: 11, color: 'var(--coral)', fontWeight: 800, textDecoration: 'none' }}>
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
          <CheckCircle2 size={26} style={{ color: 'var(--mint)' }} />
          <span>Nothing waiting — all caught up.</span>
        </div>
      )}
      {chores.length > 0 && (
        <>
          <div style={S.sectionTag}>
            <Circle size={13} style={{ color: 'var(--mint)' }} />
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
            <Play size={18} style={{ color: 'var(--coral)' }} />
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
            <Clock size={13} style={{ color: 'var(--coral)' }} />
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

function ParentEdit({ tasks, decisions, rewards, familyId, flash, reload }) {
  return (
    <div className="rq-fade">
      <h2 style={S.h2}>Edit lists</h2>
      <ListEditor title="Daily tasks" hint="Small-point everyday chores."
        color="var(--mint)" items={tasks} table="tasks"
        familyId={familyId} defaultPts={5} flash={flash} reload={reload} />
      <ListEditor title="Smart choices" hint="Big-point good decisions."
        color="var(--gold)" items={decisions} table="decisions"
        familyId={familyId} defaultPts={40} flash={flash} reload={reload} />
      <RewardEditor rewards={rewards} familyId={familyId} flash={flash} reload={reload} />
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
        <Gift size={13} style={{ color: 'var(--coral)' }} />
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
