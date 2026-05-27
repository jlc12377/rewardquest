export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
body, button, input, select, textarea {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: -0.005em;
}
.rq-fade { animation: rqFade .35s ease both; }
@keyframes rqFade { from { opacity:0; transform: translateY(8px);} to {opacity:1; transform:none;} }
.rq-press { transition: transform .12s ease; cursor: pointer; }
.rq-press:active { transform: scale(.96); }
.rq-toast { animation: rqToast .3s ease both; }
@keyframes rqToast { from { opacity:0; transform: translate(-50%, 12px);} to {opacity:1; transform: translate(-50%,0);} }
::-webkit-scrollbar { width: 0; }

/* confetti */
.rq-confetti-piece {
  position: fixed; top: 35%; left: 50%; width: 9px; height: 14px;
  border-radius: 2px; pointer-events: none; z-index: 200;
  animation: rqConfetti 1.4s cubic-bezier(.2,.6,.4,1) forwards;
}
@keyframes rqConfetti {
  0%   { transform: translate(-50%,-50%) rotate(0) scale(.5); opacity: 1; }
  100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(var(--rot)) scale(1); opacity: 0; }
}
/* points number bump */
.rq-bump { animation: rqBump .6s ease both; }
@keyframes rqBump {
  0% { transform: scale(1); }
  35% { transform: scale(1.35); color: var(--mint); }
  100% { transform: scale(1); }
}
/* badge unlock card */
.rq-badge-pop {
  position: fixed; top: 30%; left: 50%; transform: translateX(-50%);
  background: linear-gradient(135deg, var(--gold), #FFA800);
  color: var(--ink); padding: 20px 26px; border-radius: 22px;
  font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; text-align: center;
  box-shadow: 0 16px 38px rgba(0,0,0,.28); z-index: 180;
  animation: rqBadgePop .55s cubic-bezier(.2,1.3,.6,1) both, rqBadgeOut .4s ease 2.3s both;
  max-width: 84%;
}
@keyframes rqBadgePop {
  0% { opacity: 0; transform: translateX(-50%) scale(.5) rotate(-8deg); }
  100% { opacity: 1; transform: translateX(-50%) scale(1) rotate(0); }
}
@keyframes rqBadgeOut {
  to { opacity: 0; transform: translateX(-50%) translateY(-30px) scale(.95); }
}
.rq-spark { animation: rqSpark 2s linear infinite; }
@keyframes rqSpark { 50% { transform: rotate(180deg) scale(1.1); } }
`

export const S = {
  app: {
    "--bg": "#F4EFE9", "--card": "#FFFFFF", "--ink": "#1A1426",
    "--mute": "#7E7488", "--line": "#E5DDD3", "--mint": "#3FCFA0",
    "--gold": "#FF9F1C", "--coral": "#FF5C4D", "--lav": "#9D6FE8",
    "--peach": "#FF9466", "--berry": "#E04891", "--sky": "#3FA3F0",
    "--soft": "#FAF6F0",
    maxWidth: 480, margin: "0 auto", minHeight: "100vh",
    background: "var(--bg)", color: "var(--ink)",
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    display: "flex", flexDirection: "column",
    position: "relative",
    paddingBottom: "calc(78px + env(safe-area-inset-bottom))",
    paddingTop: "env(safe-area-inset-top)",
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
  brandName: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22, color: "var(--ink)", letterSpacing: "-0.02em" },
  whoami: { fontSize: 12, color: "var(--mute)", display: "flex", alignItems: "center", gap: 5, marginTop: 4, fontWeight: 600 },
  pointsBadge: {
    display: "flex", alignItems: "center", gap: 4,
    background: "linear-gradient(135deg, var(--gold) 0%, var(--coral) 100%)",
    color: "#fff",
    padding: "10px 15px", borderRadius: 18,
    boxShadow: "0 5px 0 rgba(255,107,71,.4)",
  },
  pointsNum: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 20, color: "#fff" },
  pointsLabel: { fontSize: 12, fontWeight: 800, color: "#fff", opacity: 0.9 },
  main: { flex: 1, padding: "4px 20px 20px" },
  h2: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, fontWeight: 800, margin: "8px 0 16px", letterSpacing: "-0.025em" },
  h3: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 800, margin: "24px 0 10px", color: "var(--ink)", letterSpacing: "-0.01em", textTransform: "uppercase", opacity: 0.55 },

  heroCard: {
    background: "linear-gradient(135deg, #FF5C4D 0%, #E04891 50%, #9D6FE8 100%)",
    borderRadius: 26, padding: 24, color: "#fff",
    boxShadow: "0 14px 36px rgba(224,72,145,.35), inset 0 1px 0 rgba(255,255,255,.2)",
    position: "relative", overflow: "hidden",
  },
  heroTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  heroLabel: { fontSize: 12, fontWeight: 700, opacity: 0.85, letterSpacing: 0.5, textTransform: "uppercase" },
  heroEmoji: { fontSize: 26 },
  heroReward: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 21, margin: "6px 0 14px" },
  progressTrack: { background: "rgba(255,255,255,.32)", height: 12, borderRadius: 8, overflow: "hidden" },
  progressFill: { height: "100%", background: "var(--gold)", borderRadius: 8, transition: "width .5s ease" },
  heroFoot: { fontSize: 13, fontWeight: 700, marginTop: 9, opacity: 0.95 },

  statRow: { display: "flex", gap: 10, marginTop: 14 },
  statCard: {
    flex: 1, background: "var(--card)", borderRadius: 16, padding: "13px 6px",
    textAlign: "center", border: "1px solid var(--line)",
  },
  statNum: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 21, color: "var(--ink)" },
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
  shortcutTitle: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15.5 },
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
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14.5, marginBottom: 3,
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
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "var(--ink)",
    background: "#EAF5EE", padding: "5px 11px", borderRadius: 9, flexShrink: 0,
  },
  proofBtn: {
    display: "flex", alignItems: "center", gap: 5, background: "var(--mint)",
    color: "var(--ink)", border: "none", borderRadius: 11, padding: "9px 12px",
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 13,
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
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, color: "var(--ink)",
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
  promptText: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 17, margin: "7px 0 12px", lineHeight: 1.35 },
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
    padding: "15px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15.5, fontWeight: 600,
    boxShadow: "0 5px 0 #271C36", width: "100%",
  },
  ghostBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
    background: "var(--card)", color: "var(--ink)", border: "1.5px solid var(--line)",
    borderRadius: 15, padding: "15px 18px", fontFamily: "'Plus Jakarta Sans', sans-serif",
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
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 13.5,
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
    padding: "10px 8px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 12.5,
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
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 13,
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
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "var(--ink)",
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
  authH1: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, margin: "8px 0 4px" },
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

  /* today panel */
  todayPanel: {
    background: "var(--card)", border: "1.5px solid var(--gold)",
    borderRadius: 16, padding: "12px 14px", marginTop: 14,
    display: "flex", alignItems: "center", gap: 11,
  },
  todayEmoji: {
    fontSize: 22, background: "#FFF1DC",
    width: 38, height: 38, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  todayLine: { fontSize: 13.5, fontWeight: 700, lineHeight: 1.35 },
  todaySub: { fontSize: 11.5, color: "var(--mute)", fontWeight: 700, marginTop: 2 },

  /* avatar in header */
  avatarChip: {
    width: 36, height: 36, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, flexShrink: 0, marginRight: 9,
    border: "2px solid #fff", boxShadow: "0 3px 0 rgba(0,0,0,.08)",
  },

  /* personalize page */
  personalizeRow: {
    display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8,
    marginBottom: 14,
  },
  personalizeBtn: {
    aspectRatio: "1 / 1", borderRadius: 14, border: "1.5px solid var(--line)",
    background: "var(--card)", fontSize: 22, display: "flex",
    alignItems: "center", justifyContent: "center", padding: 0, cursor: "pointer",
  },
  personalizeActive: {
    borderColor: "var(--ink)", borderWidth: 2.5,
    boxShadow: "0 4px 0 rgba(58,42,77,.15)",
  },
  themeSwatch: {
    aspectRatio: "1 / 1", borderRadius: 14, border: "2.5px solid #fff",
    cursor: "pointer", boxShadow: "0 0 0 1.5px var(--line)",
  },
  themeSwatchActive: { boxShadow: "0 0 0 3px var(--ink)" },

  /* mini badge inline */
  miniBadge: {
    display: "inline-flex", alignItems: "center", gap: 5,
    background: "#FFF1DC", color: "#8A6B2E", fontWeight: 800,
    fontSize: 11, padding: "3px 8px", borderRadius: 8,
  },

  /* ===== Parent Home (the new warm landing) ===== */
  parentGreeting: {
    background: "linear-gradient(135deg, #FF9F1C 0%, #FF5C4D 55%, #E04891 110%)",
    borderRadius: 28, padding: "24px 22px 28px", color: "#fff",
    boxShadow: "0 16px 38px rgba(255,92,77,.32), inset 0 1px 0 rgba(255,255,255,.22)",
    position: "relative", overflow: "hidden",
  },
  parentGreetDate: {
    fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase",
    opacity: 0.9, marginBottom: 6,
  },
  parentGreetH: {
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 28,
    lineHeight: 1.1, letterSpacing: "-0.025em", margin: "2px 0 10px",
  },
  parentGreetSub: { fontSize: 14.5, fontWeight: 600, opacity: 0.95, lineHeight: 1.45 },

  weekBand: {
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9,
    marginTop: 16, marginBottom: 16,
  },
  weekCard: {
    background: "var(--card)", borderRadius: 20, padding: "14px 8px",
    border: "1px solid var(--line)", textAlign: "center",
    boxShadow: "0 2px 0 var(--line), 0 4px 16px rgba(0,0,0,.03)",
  },
  weekCardEmoji: { fontSize: 22, marginBottom: 4 },
  weekCardNum: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22, color: "var(--ink)", letterSpacing: "-0.02em" },
  weekCardLabel: { fontSize: 10.5, color: "var(--mute)", fontWeight: 700, marginTop: 1, letterSpacing: 0.3 },

  blockTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 13.5,
    margin: "24px 0 12px", display: "flex", alignItems: "center", gap: 8,
    textTransform: "uppercase", letterSpacing: 0.8, color: "var(--mute)",
  },

  /* latest video preview card */
  latestVideoCard: {
    display: "flex", alignItems: "center", gap: 12, background: "var(--card)",
    border: "1.5px solid var(--berry)", borderRadius: 18, padding: 12,
    textDecoration: "none", color: "inherit",
    boxShadow: "0 4px 0 rgba(228,91,160,.18)",
  },
  latestVideoThumb: {
    width: 64, height: 80, borderRadius: 12, objectFit: "cover",
    background: "#2B2238", flexShrink: 0,
  },
  latestVideoTag: {
    fontSize: 10, fontWeight: 800, letterSpacing: 0.6, color: "var(--berry)",
    textTransform: "uppercase",
  },
  latestVideoPrompt: { fontSize: 13.5, fontWeight: 700, lineHeight: 1.3, marginTop: 4 },
  latestVideoDate: { fontSize: 11, color: "var(--mute)", fontWeight: 700, marginTop: 5 },

  /* reward progress card on parent home */
  rewardProgressCard: {
    background: "var(--card)", border: "1.5px solid var(--gold)", borderRadius: 18,
    padding: 14, boxShadow: "0 4px 0 rgba(255,182,39,.22)",
  },
  rewardProgressTop: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  rewardProgressEmoji: { fontSize: 30 },
  rewardProgressLabel: { fontWeight: 800, fontSize: 14.5, lineHeight: 1.25 },
  rewardProgressSub: { fontSize: 11.5, color: "var(--mute)", fontWeight: 700, marginTop: 2 },
  miniProgress: { background: "#FBE6BE", height: 10, borderRadius: 6, overflow: "hidden" },
  miniProgressFill: {
    height: "100%", background: "linear-gradient(90deg, var(--gold), var(--coral))",
    borderRadius: 6, transition: "width .5s ease",
  },

  /* Lately feed item */
  latelyRow: {
    display: "flex", alignItems: "center", gap: 11, background: "var(--card)",
    border: "1px solid var(--line)", borderRadius: 15, padding: 11, marginBottom: 8,
  },
  latelyText: { flex: 1, minWidth: 0 },
  latelyLabel: { fontWeight: 700, fontSize: 13.5, lineHeight: 1.3 },
  latelyMeta: { fontSize: 11, color: "var(--mute)", fontWeight: 700, marginTop: 3 },
  latelyPts: {
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "var(--ink)",
    background: "linear-gradient(135deg, var(--mint), #88E5C2)", padding: "5px 11px",
    borderRadius: 10, flexShrink: 0, fontWeight: 600,
  },
  latelyPtsDeclined: {
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#B5503A",
    background: "#FFE6E0", padding: "5px 11px", borderRadius: 10, flexShrink: 0, fontWeight: 600,
  },

  /* kid "on a roll" banner */
  onARoll: {
    background: "linear-gradient(135deg, var(--mint), var(--sky))",
    color: "#fff", borderRadius: 18, padding: "13px 16px",
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14,
    display: "flex", alignItems: "center", gap: 10, marginTop: 14,
    boxShadow: "0 8px 22px rgba(93,211,171,.32)",
  },

  /* nicer shortcut tile (bigger emoji-vibe icon, more pop) */
  shortcutBright: {
    width: "100%", display: "flex", alignItems: "center", gap: 14,
    background: "var(--card)", border: "1px solid var(--line)",
    borderRadius: 22, padding: 15, marginBottom: 10,
    boxShadow: "0 2px 0 var(--line), 0 6px 20px rgba(0,0,0,.04)",
  },
  shortcutBrightIcon: {
    width: 48, height: 48, borderRadius: 16, display: "flex",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
    boxShadow: "0 4px 12px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.25)",
  },

  toast: {
    position: "fixed", bottom: 92, left: "50%", transform: "translateX(-50%)",
    background: "var(--ink)", color: "#fff", padding: "11px 18px", borderRadius: 14,
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 600,
    boxShadow: "0 8px 24px rgba(0,0,0,.25)", zIndex: 50, whiteSpace: "nowrap",
    maxWidth: "90%",
  },
  nav: {
    position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
    width: "100%", maxWidth: 480, background: "rgba(255,255,255,.92)",
    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    borderTop: "1px solid var(--line)", display: "flex",
    padding: "10px 6px calc(12px + env(safe-area-inset-bottom))",
    justifyContent: "space-around", zIndex: 40,
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
export const EMOJI_CHOICES = [
  "💄","💅","🌸","💎","👛","🎀","💍","👜","🕶️","💖","🎧","🎮",
  "📚","🎨","🍕","🍦","🎬","💳","🎡","🛍️","⭐","🧸","🛹","🎁","✨"
]
export const VIDEO_PROMPTS = [
  "Heyyy — tell us about a good choice you made today and why.",
  "What's your game plan for something tricky coming up?",
  "Describe a moment you were proud of yourself this week.",
  "Something didn't go your way — how did you handle it?",
  "Teach us one thing you learned about making good choices.",
]
export const VIDEO_PTS = 25
export const todayKey = () => new Date().toISOString().slice(0, 10)

/* avatar emoji choices for the kid to pick */
export const AVATAR_CHOICES = [
  "🦄","🌸","🌈","⭐","🦋","🌻","🍓","🐱","🐰","🦊","🐼","🐻",
  "🐢","🦔","🌙","☀️","💫","✨","🎀","🪐","🍑","🍉"
]

/* theme presets: each sets the --gold (accent) + --lav (hero gradient) vars */
export const THEMES = [
  { id: "sunset",  label: "Sunset",   gold: "#FFC95C", goldDark: "#E0A93F", lav: "#C9B6F0", lavDark: "#B49BE8" },
  { id: "coral",   label: "Coral",    gold: "#FF8E72", goldDark: "#D9745A", lav: "#FFB5A7", lavDark: "#FF8E72" },
  { id: "mint",    label: "Mint",     gold: "#7FD9B8", goldDark: "#59BD98", lav: "#A8E6CF", lavDark: "#7FD9B8" },
  { id: "berry",   label: "Berry",    gold: "#E879A6", goldDark: "#C45F8A", lav: "#D9A0E6", lavDark: "#B07FCB" },
  { id: "sky",     label: "Sky",      gold: "#7FB8E8", goldDark: "#5A95C9", lav: "#A8C8F0", lavDark: "#7FB8E8" },
  { id: "sunny",   label: "Sunny",    gold: "#FFD93D", goldDark: "#E0BC1F", lav: "#FFE680", lavDark: "#FFD93D" },
]

/* badges — pure functions of family + counts. Returns array of {id, label, emoji, hit}. */
export function evaluateBadges({ family, claimsCount, videosCount, redemptionsCount, choreApprovedCount }) {
  const lifetime = family.lifetime_points || 0
  const streak = family.streak || 1
  return [
    { id: "first_quest",  emoji: "🎯", label: "First quest done!",          hit: choreApprovedCount >= 1 || claimsCount >= 1 },
    { id: "first_video",  emoji: "🎥", label: "First video reflection!",    hit: videosCount >= 1 },
    { id: "first_redeem", emoji: "🎁", label: "First reward redeemed!",     hit: redemptionsCount >= 1 },
    { id: "pts_100",      emoji: "💯", label: "100 points earned!",         hit: lifetime >= 100 },
    { id: "pts_500",      emoji: "🌟", label: "500 points!",                hit: lifetime >= 500 },
    { id: "pts_1000",     emoji: "👑", label: "1,000 points — wow!",        hit: lifetime >= 1000 },
    { id: "streak_3",     emoji: "🔥", label: "3-day streak!",              hit: streak >= 3 },
    { id: "streak_7",     emoji: "⚡", label: "7-day streak — on fire!",    hit: streak >= 7 },
    { id: "ten_quests",   emoji: "🏆", label: "10 quests approved!",        hit: choreApprovedCount >= 10 },
  ]
}

/* daily-changing today-line copy */
export function todayLine(family, approvedTodayCount) {
  const lines = [
    `${approvedTodayCount > 0 ? approvedTodayCount + ' down today — keep going!' : 'Fresh day, fresh quests.'}`,
    `Pick one easy win to start the day strong.`,
    `Today's a great day to record a reflection (+${VIDEO_PTS} pts).`,
    `You've earned ${family.lifetime_points || 0} pts so far. ✨`,
    `${family.streak || 1}-day streak. Don't break the chain.`,
  ]
  const idx = new Date().getDate() % lines.length
  return lines[idx]
}
