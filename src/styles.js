export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap');
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
.rq-fade { animation: rqFade .35s ease both; }
@keyframes rqFade { from { opacity:0; transform: translateY(8px);} to {opacity:1; transform:none;} }
.rq-press { transition: transform .12s ease; cursor: pointer; }
.rq-press:active { transform: scale(.96); }
.rq-toast { animation: rqToast .3s ease both; }
@keyframes rqToast { from { opacity:0; transform: translate(-50%, 12px);} to {opacity:1; transform: translate(-50%,0);} }
input, select, textarea { font-family: 'Nunito', sans-serif; }
::-webkit-scrollbar { width: 0; }
`

export const S = {
  app: {
    "--bg": "#FFF6EE", "--card": "#FFFFFF", "--ink": "#3A2A4D",
    "--mute": "#9C8FA8", "--line": "#E9DDD2", "--mint": "#7FD9B8",
    "--gold": "#FFC95C", "--coral": "#FF8E72", "--lav": "#C9B6F0",
    maxWidth: 460, margin: "0 auto", minHeight: "100vh",
    background: "var(--bg)", color: "var(--ink)",
    fontFamily: "'Nunito', sans-serif", display: "flex", flexDirection: "column",
    position: "relative", paddingBottom: 78,
  },
  loading: {
    minHeight: "60vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    fontFamily: "'Nunito', sans-serif", color: "#9C8FA8",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "20px 20px 14px",
  },
  brand: { display: "flex", alignItems: "center", gap: 7 },
  brandName: { fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 21, color: "var(--ink)" },
  whoami: { fontSize: 12, color: "var(--mute)", display: "flex", alignItems: "center", gap: 5, marginTop: 4, fontWeight: 600 },
  pointsBadge: {
    display: "flex", alignItems: "center", gap: 4,
    background: "var(--gold)", padding: "9px 14px", borderRadius: 16,
    boxShadow: "0 4px 0 #E0A93F",
  },
  pointsNum: { fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 19 },
  pointsLabel: { fontSize: 12, fontWeight: 700, opacity: 0.7 },
  main: { flex: 1, padding: "4px 20px 20px" },
  h2: { fontFamily: "'Fredoka', sans-serif", fontSize: 24, margin: "8px 0 16px" },
  h3: { fontFamily: "'Fredoka', sans-serif", fontSize: 16, margin: "24px 0 10px", color: "var(--ink)" },

  heroCard: {
    background: "linear-gradient(135deg, var(--lav), #B49BE8)",
    borderRadius: 22, padding: 20, color: "#fff",
    boxShadow: "0 8px 22px rgba(150,120,210,.32)",
  },
  heroTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  heroLabel: { fontSize: 12, fontWeight: 700, opacity: 0.85, letterSpacing: 0.5, textTransform: "uppercase" },
  heroEmoji: { fontSize: 26 },
  heroReward: { fontFamily: "'Fredoka', sans-serif", fontSize: 21, margin: "6px 0 14px" },
  progressTrack: { background: "rgba(255,255,255,.32)", height: 12, borderRadius: 8, overflow: "hidden" },
  progressFill: { height: "100%", background: "var(--gold)", borderRadius: 8, transition: "width .5s ease" },
  heroFoot: { fontSize: 13, fontWeight: 700, marginTop: 9, opacity: 0.95 },

  statRow: { display: "flex", gap: 10, marginTop: 14 },
  statCard: {
    flex: 1, background: "var(--card)", borderRadius: 16, padding: "13px 6px",
    textAlign: "center", border: "1px solid var(--line)",
  },
  statNum: { fontFamily: "'Fredoka', sans-serif", fontSize: 21, color: "var(--ink)" },
  statLabel: { fontSize: 10, color: "var(--mute)", fontWeight: 700, marginTop: 2 },

  shortcut: {
    width: "100%", display: "flex", alignItems: "center", gap: 13,
    background: "var(--card)", border: "1px solid var(--line)",
    borderRadius: 18, padding: 13, marginBottom: 10,
  },
  shortcutIcon: {
    width: 42, height: 42, borderRadius: 13, display: "flex",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  shortcutTitle: { fontFamily: "'Fredoka', sans-serif", fontSize: 15.5 },
  shortcutSub: { fontSize: 12, color: "var(--mute)", fontWeight: 600 },

  pendingNote: {
    marginTop: 16, background: "#FFF1DC", border: "1px dashed var(--gold)",
    borderRadius: 14, padding: "11px 13px", fontSize: 13, fontWeight: 600,
    display: "flex", alignItems: "center", gap: 8, color: "#8A6B2E",
  },
  proofBanner: {
    background: "var(--ink)", color: "#fff", borderRadius: 13,
    padding: "10px 13px", fontSize: 12.5, fontWeight: 700,
    display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
  },

  sectionTag: {
    display: "flex", alignItems: "center", gap: 7,
    fontFamily: "'Fredoka', sans-serif", fontSize: 14.5, marginBottom: 3,
  },
  sectionHint: { fontSize: 12.5, color: "var(--mute)", fontWeight: 600, margin: "0 0 12px" },
  tierDot: { width: 11, height: 11, borderRadius: 4, display: "inline-block" },

  taskRow: {
    width: "100%", display: "flex", alignItems: "center", gap: 11,
    background: "var(--card)", border: "1px solid var(--line)",
    borderRadius: 15, padding: "11px 12px", marginBottom: 8,
  },
  taskRowDone: { background: "#F1FBF6", borderColor: "#CBEEDF" },
  taskRowPending: { background: "#FBF7F1", borderColor: "var(--gold)" },
  taskLabel: { fontWeight: 700, fontSize: 14.5 },
  strike: { textDecoration: "line-through", color: "var(--mute)" },
  taskPts: {
    fontFamily: "'Fredoka', sans-serif", fontSize: 14, color: "var(--ink)",
    background: "#EAF5EE", padding: "5px 11px", borderRadius: 9, flexShrink: 0,
  },
  proofBtn: {
    display: "flex", alignItems: "center", gap: 5, background: "var(--mint)",
    color: "var(--ink)", border: "none", borderRadius: 11, padding: "9px 12px",
    fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 13,
    boxShadow: "0 3px 0 #59BD98", flexShrink: 0,
  },
  decisionRow: {
    width: "100%", display: "flex", alignItems: "center", gap: 11,
    background: "var(--card)", border: "1.5px solid var(--gold)",
    borderRadius: 15, padding: "12px", marginBottom: 8,
  },
  decisionPending: { borderColor: "var(--line)", background: "#FBF7F1" },
  decisionMain: { flex: 1, textAlign: "left" },
  decisionLabel: { fontWeight: 700, fontSize: 14.5 },
  decisionPts: {
    fontFamily: "'Fredoka', sans-serif", fontSize: 15, color: "var(--ink)",
    background: "var(--gold)", padding: "5px 12px", borderRadius: 10, flexShrink: 0,
  },
  pendingTag: { fontSize: 11.5, color: "var(--mute)", fontWeight: 700, marginTop: 3, display: "block" },

  thumb: { borderRadius: 9, objectFit: "cover", flexShrink: 0, background: "#2B2238" },
  thumbEmpty: {
    borderRadius: 9, background: "var(--line)", display: "flex",
    alignItems: "center", justifyContent: "center", color: "var(--mute)", flexShrink: 0,
  },

  promptCard: {
    background: "var(--card)", border: "1px solid var(--line)",
    borderRadius: 18, padding: 16, marginBottom: 14,
  },
  promptKicker: { fontSize: 11, fontWeight: 800, color: "var(--coral)", letterSpacing: 0.6, textTransform: "uppercase" },
  promptText: { fontFamily: "'Fredoka', sans-serif", fontSize: 17, margin: "7px 0 12px", lineHeight: 1.35 },
  promptSwap: {
    display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700,
    background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 10,
    padding: "6px 10px", color: "var(--mute)",
  },
  stage: {
    position: "relative", background: "#2B2238", borderRadius: 18,
    overflow: "hidden", aspectRatio: "3/4", display: "flex",
    alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  videoEl: { width: "100%", height: "100%", objectFit: "cover" },
  stagePlaceholder: {
    position: "absolute", display: "flex", flexDirection: "column",
    alignItems: "center", gap: 8, color: "#fff", fontSize: 13, fontWeight: 600,
    textAlign: "center", padding: 20,
  },
  primaryBtn: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    background: "var(--ink)", color: "#fff", border: "none", borderRadius: 15,
    padding: "15px", fontFamily: "'Fredoka', sans-serif", fontSize: 15.5, fontWeight: 600,
    boxShadow: "0 5px 0 #271C36", width: "100%",
  },
  ghostBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
    background: "var(--card)", color: "var(--ink)", border: "1.5px solid var(--line)",
    borderRadius: 15, padding: "15px 18px", fontFamily: "'Fredoka', sans-serif",
    fontSize: 14.5, fontWeight: 600,
  },
  videoNote: {
    fontSize: 12, color: "var(--mute)", fontWeight: 600, marginTop: 12,
    background: "#FFF1DC", borderRadius: 12, padding: "10px 12px", lineHeight: 1.45,
  },
  videoLogRow: {
    display: "flex", alignItems: "center", gap: 11, background: "var(--card)",
    border: "1px solid var(--line)", borderRadius: 14, padding: 10, marginBottom: 8,
  },
  videoLogPrompt: {
    fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
    overflow: "hidden", textOverflow: "ellipsis",
  },
  videoLogDate: { fontSize: 11, color: "var(--mute)", fontWeight: 600, marginTop: 2 },

  rewardRow: {
    display: "flex", alignItems: "center", gap: 12, background: "var(--card)",
    border: "1px solid var(--line)", borderRadius: 15, padding: 13, marginBottom: 8,
  },
  rewardEmoji: { fontSize: 26 },
  rewardLabel: { fontWeight: 800, fontSize: 14.5 },
  rewardCost: { fontSize: 12.5, color: "var(--mute)", fontWeight: 700, marginTop: 1 },
  redeemBtn: {
    background: "var(--mint)", color: "var(--ink)", border: "none",
    fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 13.5,
    padding: "10px 16px", borderRadius: 12, boxShadow: "0 4px 0 #59BD98",
  },
  redeemLocked: { background: "var(--line)", boxShadow: "0 4px 0 #D6C8BB", color: "var(--mute)" },
  redeemedRow: {
    display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, fontWeight: 700,
    padding: "10px 12px", background: "var(--card)", border: "1px solid var(--line)",
    borderRadius: 12, marginBottom: 7,
  },
  redeemedDate: { fontSize: 12, color: "var(--mute)", fontWeight: 700 },

  parentHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  exitBtn: {
    display: "flex", alignItems: "center", gap: 5, background: "var(--card)",
    border: "1px solid var(--line)", borderRadius: 11, padding: "8px 12px",
    fontWeight: 800, fontSize: 12.5, color: "var(--ink)",
  },
  modeRow: { display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" },
  modeBtn: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    background: "var(--card)", border: "1.5px solid var(--line)", borderRadius: 12,
    padding: "10px 8px", fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 12.5,
    color: "var(--mute)", minWidth: 100,
  },
  modeActive: { background: "var(--ink)", color: "#fff", borderColor: "var(--ink)" },

  approvalCard: {
    display: "flex", alignItems: "center", gap: 11, background: "var(--card)",
    border: "1.5px solid var(--gold)", borderRadius: 15, padding: 12, marginBottom: 9,
  },
  approveBtn: {
    display: "flex", alignItems: "center", gap: 5, background: "var(--mint)",
    color: "var(--ink)", border: "none", borderRadius: 11, padding: "11px 13px",
    fontFamily: "'Fredoka', sans-serif", fontWeight: 600, fontSize: 13,
    boxShadow: "0 4px 0 #59BD98",
  },
  declineBtn: {
    background: "#FFE6E0", color: "#B5503A", border: "none", borderRadius: 11,
    padding: "11px 12px", display: "flex", alignItems: "center",
  },
  emptyBox: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
    padding: "30px 20px", color: "var(--mute)", fontSize: 13.5, fontWeight: 700,
    background: "var(--card)", border: "1px dashed var(--line)", borderRadius: 16,
  },
  signOutBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    width: "100%", marginTop: 24, background: "transparent", border: "1px solid var(--line)",
    color: "var(--mute)", borderRadius: 12, padding: "11px", fontWeight: 700, fontSize: 12.5,
  },

  itemRow: {
    display: "flex", alignItems: "center", gap: 8, background: "var(--card)",
    border: "1px solid var(--line)", borderRadius: 12, padding: "9px 11px", marginBottom: 7,
  },
  itemPts: {
    fontFamily: "'Fredoka', sans-serif", fontSize: 13, color: "var(--ink)",
    background: "var(--bg)", padding: "3px 8px", borderRadius: 8, flexShrink: 0,
  },
  tierBadge: {
    fontSize: 10, fontWeight: 800, color: "var(--ink)", padding: "3px 7px",
    borderRadius: 7, flexShrink: 0,
  },
  iconBtn: {
    background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 9,
    padding: "7px", display: "flex", color: "var(--ink)", flexShrink: 0,
  },
  iconBtnDanger: {
    background: "#FFE6E0", border: "none", borderRadius: 9,
    padding: "7px", display: "flex", color: "#B5503A", flexShrink: 0,
  },
  iconBtnGo: {
    background: "var(--mint)", border: "none", borderRadius: 9,
    padding: "8px", display: "flex", color: "var(--ink)", flexShrink: 0,
    boxShadow: "0 3px 0 #59BD98",
  },
  editRow: {
    display: "flex", alignItems: "center", gap: 7, marginBottom: 7,
    background: "#FBF7F1", border: "1.5px solid var(--gold)",
    borderRadius: 12, padding: "8px 9px",
  },
  addRow: {
    display: "flex", alignItems: "center", gap: 7, marginTop: 4,
    background: "var(--card)", border: "1px dashed var(--line)",
    borderRadius: 12, padding: "8px 9px",
  },
  editInput: {
    flex: 1, minWidth: 0, border: "1px solid var(--line)", borderRadius: 9,
    padding: "9px 10px", fontSize: 13.5, fontWeight: 600, color: "var(--ink)",
    background: "#fff", outline: "none",
  },
  editPts: {
    width: 58, border: "1px solid var(--line)", borderRadius: 9,
    padding: "9px 6px", fontSize: 13.5, fontWeight: 700, color: "var(--ink)",
    background: "#fff", outline: "none", textAlign: "center", flexShrink: 0,
  },
  rewardEditCard: {
    background: "var(--card)", border: "1px solid var(--line)", borderRadius: 13,
    padding: 11, marginBottom: 8,
  },
  emojiPickRow: { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 9 },
  emojiBtn: {
    width: 32, height: 32, borderRadius: 8, border: "1px solid var(--line)",
    background: "#fff", fontSize: 15, display: "flex", alignItems: "center",
    justifyContent: "center", padding: 0,
  },
  emojiActive: { borderColor: "var(--coral)", background: "#FFEDE7", borderWidth: 2 },
  select: {
    border: "1px solid var(--line)", borderRadius: 9, padding: "9px 8px",
    fontSize: 13, fontWeight: 700, color: "var(--ink)", background: "#fff",
    outline: "none", flex: 1,
  },

  /* auth */
  authWrap: {
    padding: "30px 22px", display: "flex", flexDirection: "column", gap: 14,
  },
  authBrand: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
  authH1: { fontFamily: "'Fredoka', sans-serif", fontSize: 28, margin: "8px 0 4px" },
  authSub: { fontSize: 13.5, color: "var(--mute)", fontWeight: 600, marginBottom: 10 },
  authInput: {
    width: "100%", border: "1.5px solid var(--line)", borderRadius: 12,
    padding: "14px 14px", fontSize: 15, fontWeight: 600, color: "var(--ink)",
    background: "#fff", outline: "none",
  },
  authToggle: {
    background: "none", border: "none", color: "var(--mute)", fontSize: 13,
    fontWeight: 700, textDecoration: "underline", marginTop: 6, alignSelf: "center",
  },
  authErr: {
    background: "#FFE6E0", color: "#B5503A", fontSize: 13, fontWeight: 700,
    borderRadius: 11, padding: "10px 12px",
  },
  authInfo: {
    background: "#FFF1DC", color: "#8A6B2E", fontSize: 12.5, fontWeight: 600,
    borderRadius: 11, padding: "10px 12px", lineHeight: 1.45,
  },

  toast: {
    position: "fixed", bottom: 92, left: "50%", transform: "translateX(-50%)",
    background: "var(--ink)", color: "#fff", padding: "11px 18px", borderRadius: 14,
    fontFamily: "'Fredoka', sans-serif", fontSize: 14, fontWeight: 600,
    boxShadow: "0 8px 24px rgba(0,0,0,.25)", zIndex: 50, whiteSpace: "nowrap",
    maxWidth: "90%",
  },
  nav: {
    position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
    width: "100%", maxWidth: 460, background: "var(--card)",
    borderTop: "1px solid var(--line)", display: "flex",
    padding: "8px 6px 10px", justifyContent: "space-around", zIndex: 40,
  },
  navBtn: {
    background: "none", border: "none", display: "flex", flexDirection: "column",
    alignItems: "center", gap: 3, color: "var(--mute)", padding: "4px 8px", cursor: "pointer",
  },
  navActive: { color: "var(--ink)" },
  navLabel: { fontSize: 10.5, fontWeight: 800 },
  navBadge: {
    position: "absolute", top: -5, right: -8, background: "var(--coral)",
    color: "#fff", fontSize: 10, fontWeight: 800, minWidth: 16, height: 16,
    borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px",
  },
}

export const TIERS = ["Small", "Medium", "Large"]
export const TIER_COLORS = { Small: "var(--mint)", Medium: "var(--gold)", Large: "var(--coral)" }
export const EMOJI_CHOICES = ["🍦","🎬","💳","🎡","🛍️","⭐","🎮","📚","🎨","🍕","🧸","🎧","💅","🛹","🎁","✨"]
export const VIDEO_PROMPTS = [
  "Heyyy — tell us about a good choice you made today and why.",
  "What's your game plan for something tricky coming up?",
  "Describe a moment you were proud of yourself this week.",
  "Something didn't go your way — how did you handle it?",
  "Teach us one thing you learned about making good choices.",
]
export const VIDEO_PTS = 25
export const todayKey = () => new Date().toISOString().slice(0, 10)
