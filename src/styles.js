/* ============================================================
   RewardQuest — "Counter" design system
   Editorial beauty retail. Sephora-luxe meets Ulta-warmth.
   White-first, deep black ink, magenta accent. Restraint > decoration.
   ============================================================ */

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
body, button, input, select, textarea {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: -0.011em;
}
::-webkit-scrollbar { width: 0; }

.rq-fade { animation: rqFade .4s cubic-bezier(.2,.8,.3,1) both; }
@keyframes rqFade { from { opacity:0; transform: translateY(8px);} to {opacity:1; transform:none;} }

.rq-press { transition: opacity .15s ease, transform .15s ease; cursor: pointer; }
.rq-press:active { opacity: 0.7; transform: scale(.985); }

.rq-toast { animation: rqToast .35s ease both; }
@keyframes rqToast { from { opacity:0; transform: translate(-50%, 14px);} to {opacity:1; transform: translate(-50%,0);} }

/* number bump on point gain */
.rq-bump { animation: rqBump .85s cubic-bezier(.3,1.6,.5,1) both; }
@keyframes rqBump {
  0%   { transform: scale(1); }
  35%  { transform: scale(1.18); color: var(--accent); }
  100% { transform: scale(1); }
}

/* dot pulse — used in the wordmark */
.rq-pulse { animation: rqPulse 2.2s ease-in-out infinite; }
@keyframes rqPulse {
  0%,100% { opacity: 1; transform: scale(1); }
  50%     { opacity: 0.55; transform: scale(1.25); }
}

/* gentle marquee */
.rq-marquee {
  display: flex; gap: 36px; white-space: nowrap;
  animation: rqMarquee 35s linear infinite;
}
@keyframes rqMarquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* confetti — used sparingly */
.rq-confetti-piece {
  position: fixed; top: 35%; left: 50%; width: 8px; height: 14px;
  border-radius: 2px; pointer-events: none; z-index: 200;
  animation: rqConfetti 1.5s cubic-bezier(.2,.6,.4,1) forwards;
}
@keyframes rqConfetti {
  0%   { transform: translate(-50%,-50%) rotate(0) scale(.5); opacity: 1; }
  100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(var(--rot)) scale(1); opacity: 0; }
}

/* badge unlock — magazine card style */
.rq-badge-pop {
  position: fixed; top: 28%; left: 50%; transform: translateX(-50%);
  background: #FFFFFF; color: #0A0A0A;
  padding: 28px 32px; border-radius: 4px;
  font-family: 'Fraunces', serif; font-weight: 500; text-align: center;
  box-shadow: 0 24px 80px rgba(0,0,0,.22);
  z-index: 180; max-width: 84%; border: 1px solid #0A0A0A;
  animation: rqBadgePop .5s cubic-bezier(.2,1.3,.5,1) both, rqBadgeOut .4s ease 2.6s both;
}
@keyframes rqBadgePop {
  0% { opacity: 0; transform: translateX(-50%) scale(.85); }
  100% { opacity: 1; transform: translateX(-50%) scale(1); }
}
@keyframes rqBadgeOut {
  to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
}
`

/* ============================================================
   STYLES
   ============================================================ */
export const S = {
  app: {
    /* "counter" palette */
    "--bg":       "#FAFAF7",  /* slight warm off-white, like Sephora packaging */
    "--paper":    "#FFFFFF",  /* product cards / surface */
    "--shelf":    "#F2EFEA",  /* slightly darker grouping bg */
    "--ink":      "#0A0A0A",  /* deep black, not pure */
    "--inkSoft":  "#1A1A1A",
    "--mute":     "#6E6E6E",
    "--mute2":    "#9E9E9E",
    "--hair":     "#E5E2DC",  /* hairline divider */

    /* signature pink (Sephora–Ulta hybrid) */
    "--accent":     "#E91E63", /* the one color */
    "--accentSoft": "#FCE4EC",
    "--accentDark": "#B71C4A",

    /* tiny semantic accents (used sparingly) */
    "--ok":      "#1F8553",
    "--warn":    "#A36B00",
    "--err":     "#B5302E",

    maxWidth: 480, margin: "0 auto", minHeight: "100vh",
    background: "var(--bg)",
    color: "var(--ink)",
    fontFamily: "'Inter', sans-serif",
    display: "flex", flexDirection: "column",
    position: "relative",
    paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
    paddingTop: "env(safe-area-inset-top)",
    overflowX: "hidden",
  },

  loading: {
    minHeight: "60vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    color: "#6E6E6E", fontWeight: 500, gap: 12,
  },

  /* ===== header ===== */
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "22px 24px 10px",
  },
  /* wordmark: reward·quest  */
  brand: { display: "flex", alignItems: "baseline", gap: 1 },
  brandWord: {
    fontFamily: "'Inter', sans-serif", fontWeight: 800,
    fontSize: 19, letterSpacing: "-0.055em", color: "var(--ink)",
  },
  brandDot: {
    display: "inline-block", width: 5, height: 5, borderRadius: "50%",
    background: "var(--accent)", margin: "0 4px 1px",
    verticalAlign: "middle",
  },
  whoami: {
    fontSize: 11, color: "var(--mute)", display: "flex", alignItems: "center",
    gap: 6, marginTop: 4, fontWeight: 500, letterSpacing: 0.2,
    textTransform: "uppercase",
  },

  pointsBadge: {
    display: "flex", alignItems: "baseline", gap: 5,
    background: "transparent", padding: "4px 0",
    cursor: "default",
  },
  pointsNum: {
    fontFamily: "'Fraunces', serif", fontWeight: 500,
    fontSize: 22, color: "var(--ink)", letterSpacing: "-0.025em",
    fontVariationSettings: "'opsz' 60",
  },
  pointsLabel: { fontSize: 10, fontWeight: 600, color: "var(--mute)", letterSpacing: 1.2, textTransform: "uppercase" },

  main: { flex: 1, padding: "8px 24px 24px" },

  /* ===== editorial typography ===== */
  /* large display headline — serif, magazine feel */
  display: {
    fontFamily: "'Fraunces', serif", fontWeight: 400,
    fontSize: 44, lineHeight: 0.98, letterSpacing: "-0.035em",
    color: "var(--ink)", margin: "8px 0 16px",
    fontVariationSettings: "'opsz' 144",
  },
  displayItalic: {
    fontStyle: "italic", color: "var(--accent)",
    fontWeight: 400,
  },
  h2: {
    fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 30,
    color: "var(--ink)", margin: "10px 0 16px", letterSpacing: "-0.03em",
    lineHeight: 1, fontVariationSettings: "'opsz' 100",
  },
  /* section label: small caps tracking */
  eyebrow: {
    fontFamily: "'Inter', sans-serif", fontSize: 10.5, fontWeight: 600,
    color: "var(--mute)", textTransform: "uppercase", letterSpacing: 1.8,
    margin: "28px 0 12px", display: "flex", alignItems: "center", gap: 10,
  },
  eyebrowNum: {
    fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "var(--accent)",
    fontSize: 12, fontWeight: 500, textTransform: "none", letterSpacing: 0,
  },

  /* ===== KID HOME ===== */
  /* the editorial intro block */
  introBlock: {
    padding: "8px 0 8px",
  },
  introKicker: {
    fontFamily: "'Inter', sans-serif", fontSize: 10.5, fontWeight: 600,
    color: "var(--mute)", textTransform: "uppercase", letterSpacing: 2,
    marginBottom: 14,
  },
  /* the BIG point number — the magazine cover */
  megaPointsWrap: {
    paddingTop: 2, marginBottom: 6, position: "relative",
  },
  megaPointsNum: {
    fontFamily: "'Fraunces', serif", fontWeight: 400,
    fontSize: 120, lineHeight: 0.9, letterSpacing: "-0.06em",
    color: "var(--ink)", display: "inline-block",
    fontVariationSettings: "'opsz' 144",
  },
  megaPointsTrail: {
    display: "inline-block", verticalAlign: "baseline",
    marginLeft: 8, fontSize: 13, fontWeight: 500, color: "var(--mute)",
    letterSpacing: 1.6, textTransform: "uppercase",
  },
  megaPointsLine: {
    fontFamily: "'Fraunces', serif", fontStyle: "italic", fontWeight: 400,
    fontSize: 17, color: "var(--ink)", marginTop: 14, lineHeight: 1.35,
    letterSpacing: "-0.01em",
  },
  megaPointsLineAccent: { color: "var(--accent)" },

  /* hairline divider */
  rule: {
    border: "none", borderTop: "1px solid var(--hair)",
    margin: "28px 0",
  },

  /* mini marquee tape — quiet, monochrome */
  tickerWrap: {
    margin: "20px -24px 0", padding: "10px 0",
    borderTop: "1px solid var(--hair)",
    borderBottom: "1px solid var(--hair)",
    overflow: "hidden",
    background: "var(--bg)",
  },
  tickerItem: {
    fontFamily: "'Inter', sans-serif", fontSize: 10.5,
    fontWeight: 600, color: "var(--ink)", letterSpacing: 2.2,
    textTransform: "uppercase", display: "flex", alignItems: "center", gap: 12,
  },
  tickerDot: {
    width: 4, height: 4, borderRadius: "50%", background: "var(--accent)",
  },

  /* ===== next-reward feature — full bleed product-like card ===== */
  feature: {
    position: "relative", marginTop: 24,
    background: "var(--ink)", color: "#fff",
    borderRadius: 8, padding: "30px 24px 26px",
    overflow: "hidden",
  },
  featureKicker: {
    fontSize: 10, fontWeight: 600,
    letterSpacing: 2.2, textTransform: "uppercase",
    color: "var(--accent)", marginBottom: 18,
  },
  featureEmoji: {
    fontSize: 64, display: "block", marginBottom: 12, lineHeight: 1,
  },
  featureLabel: {
    fontFamily: "'Fraunces', serif", fontWeight: 400,
    fontSize: 28, color: "#fff", letterSpacing: "-0.03em",
    marginBottom: 22, lineHeight: 1.05,
    fontVariationSettings: "'opsz' 100",
  },
  featureProgressTrack: {
    height: 2, background: "rgba(255,255,255,.2)", overflow: "hidden",
    marginBottom: 12,
  },
  featureProgressFill: {
    height: "100%", background: "var(--accent)",
    transition: "width .6s cubic-bezier(.2,.8,.3,1)",
  },
  featureProgressFoot: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    color: "#fff", fontSize: 11, fontWeight: 500, letterSpacing: 1.4,
    textTransform: "uppercase", opacity: 0.85,
  },

  /* ===== stat row ===== */
  statRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", marginTop: 24, gap: 0 },
  statCell: {
    textAlign: "left", padding: "0 14px 0 0",
    borderRight: "1px solid var(--hair)",
  },
  statCellLast: { borderRight: "none", paddingLeft: 14 },
  statCellMid: { paddingLeft: 14 },
  statNum: {
    fontFamily: "'Fraunces', serif", fontWeight: 500,
    fontSize: 28, color: "var(--ink)", letterSpacing: "-0.03em",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 10, color: "var(--mute)", fontWeight: 600, marginTop: 6,
    letterSpacing: 1.4, textTransform: "uppercase",
  },

  /* ===== shortcut tiles — refined, no shadow ===== */
  shortcutBright: {
    width: "100%", display: "flex", alignItems: "center", gap: 16,
    background: "var(--paper)", border: "1px solid var(--hair)",
    borderRadius: 4, padding: "16px 18px", marginBottom: 8,
  },
  shortcutBrightIcon: {
    width: 44, height: 44, borderRadius: 4, display: "flex",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
    fontSize: 19,
  },
  shortcutTitle: {
    fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 500,
    color: "var(--ink)", letterSpacing: "-0.02em",
  },
  shortcutSub: { fontSize: 12, color: "var(--mute)", fontWeight: 500, marginTop: 2, letterSpacing: 0.1 },

  shortcut: {
    width: "100%", display: "flex", alignItems: "center", gap: 13,
    background: "var(--paper)", border: "1px solid var(--hair)",
    borderRadius: 4, padding: 14, marginBottom: 8,
  },
  shortcutIcon: {
    width: 40, height: 40, borderRadius: 4, display: "flex",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },

  /* ===== pending note ===== */
  pendingNote: {
    marginTop: 24,
    background: "var(--shelf)",
    borderRadius: 4, padding: "12px 14px",
    fontSize: 12.5, fontWeight: 500, color: "var(--ink)",
    display: "flex", alignItems: "center", gap: 8,
    letterSpacing: -0.005,
  },
  proofBanner: {
    background: "var(--shelf)", color: "var(--ink)", borderRadius: 4,
    padding: "12px 14px", fontSize: 12.5, fontWeight: 500,
    display: "flex", alignItems: "center", gap: 8, marginBottom: 20,
  },

  /* ===== section tag ===== */
  sectionTag: {
    display: "flex", alignItems: "center", gap: 8,
    fontFamily: "'Inter', sans-serif", fontSize: 10.5, fontWeight: 600,
    marginBottom: 4, color: "var(--mute)",
    textTransform: "uppercase", letterSpacing: 1.8,
  },
  sectionHint: { fontSize: 13, color: "var(--mute)", fontWeight: 400, margin: "0 0 16px", lineHeight: 1.5 },
  tierDot: { width: 8, height: 8, borderRadius: "50%", display: "inline-block" },

  /* ===== task rows ===== */
  taskRow: {
    width: "100%", display: "flex", alignItems: "center", gap: 14,
    background: "transparent",
    borderBottom: "1px solid var(--hair)",
    padding: "16px 0", marginBottom: 0,
  },
  taskRowDone: { opacity: 0.5 },
  taskRowPending: {},
  taskLabel: { fontWeight: 500, fontSize: 15, color: "var(--ink)", letterSpacing: "-0.005em" },
  strike: { textDecoration: "line-through", color: "var(--mute)" },
  taskPts: {
    fontFamily: "'Fraunces', serif", fontSize: 16, color: "var(--ink)",
    flexShrink: 0, fontWeight: 500, letterSpacing: "-0.02em",
    minWidth: 36, textAlign: "right",
  },
  proofBtn: {
    display: "flex", alignItems: "center", gap: 5,
    background: "var(--ink)",
    color: "#fff", border: "none", borderRadius: 999, padding: "9px 14px",
    fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12.5,
    flexShrink: 0, letterSpacing: -0.005,
  },

  decisionRow: {
    width: "100%", display: "flex", alignItems: "center", gap: 14,
    background: "transparent",
    borderBottom: "1px solid var(--hair)",
    padding: "16px 0", marginBottom: 0,
  },
  decisionPending: { opacity: 0.7 },
  decisionMain: { flex: 1, textAlign: "left" },
  decisionLabel: { fontWeight: 500, fontSize: 15, color: "var(--ink)", letterSpacing: "-0.005em", lineHeight: 1.35 },
  decisionPts: {
    fontFamily: "'Fraunces', serif", fontSize: 17, color: "var(--accent)",
    flexShrink: 0, fontWeight: 500, letterSpacing: "-0.02em",
  },
  pendingTag: { fontSize: 11, color: "var(--mute)", fontWeight: 500, marginTop: 4, display: "block", letterSpacing: 0.2, textTransform: "uppercase" },

  /* ===== thumb ===== */
  thumb: { borderRadius: 4, objectFit: "cover", flexShrink: 0, background: "#000" },
  thumbEmpty: {
    borderRadius: 4, background: "var(--shelf)",
    display: "flex",
    alignItems: "center", justifyContent: "center", color: "var(--mute)", flexShrink: 0,
  },

  /* ===== today panel ===== */
  todayPanel: {
    background: "var(--shelf)",
    borderRadius: 4, padding: "14px 16px", marginTop: 20,
    display: "flex", alignItems: "center", gap: 14,
  },
  todayEmoji: {
    fontSize: 20, flexShrink: 0,
  },
  todayLine: {
    fontSize: 13.5, fontWeight: 500, lineHeight: 1.4, color: "var(--ink)",
    letterSpacing: "-0.005em",
  },
  todaySub: { fontSize: 11, color: "var(--mute)", fontWeight: 500, marginTop: 3, letterSpacing: 0.2, textTransform: "uppercase" },

  /* ===== video prompt ===== */
  promptCard: {
    background: "var(--paper)", border: "1px solid var(--hair)",
    borderRadius: 4, padding: 22, marginBottom: 18,
    position: "relative",
  },
  promptKicker: {
    fontSize: 10, fontWeight: 600, color: "var(--accent)",
    letterSpacing: 2, textTransform: "uppercase",
  },
  promptText: {
    fontFamily: "'Fraunces', serif", fontSize: 24, color: "var(--ink)",
    margin: "12px 0 16px", lineHeight: 1.2, letterSpacing: "-0.03em", fontWeight: 400,
    fontVariationSettings: "'opsz' 100",
  },
  promptSwap: {
    display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 600,
    background: "transparent", border: "1px solid var(--hair)",
    borderRadius: 999, padding: "7px 13px", color: "var(--mute)",
    letterSpacing: 0.4,
  },
  stage: {
    position: "relative", background: "#000", borderRadius: 4,
    overflow: "hidden", aspectRatio: "3/4", display: "flex",
    alignItems: "center", justifyContent: "center", marginBottom: 14,
  },
  videoEl: { width: "100%", height: "100%", objectFit: "cover" },
  stagePlaceholder: {
    position: "absolute", display: "flex", flexDirection: "column",
    alignItems: "center", gap: 12, color: "rgba(255,255,255,.85)", fontSize: 13, fontWeight: 500,
    textAlign: "center", padding: 20, letterSpacing: -0.005,
  },

  /* ===== buttons ===== */
  primaryBtn: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    background: "var(--ink)",
    color: "#fff", border: "none", borderRadius: 999,
    padding: "16px", fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600,
    width: "100%", letterSpacing: 0.4, textTransform: "uppercase",
  },
  ghostBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
    background: "transparent", color: "var(--ink)",
    border: "1px solid var(--ink)",
    borderRadius: 999, padding: "16px 22px", fontFamily: "'Inter', sans-serif",
    fontSize: 13, fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase",
  },
  videoNote: {
    fontSize: 11.5, color: "var(--mute)", fontWeight: 500, marginTop: 16,
    padding: "12px 14px", lineHeight: 1.55,
    background: "var(--shelf)", borderRadius: 4,
  },
  videoLogRow: {
    display: "flex", alignItems: "center", gap: 14, background: "transparent",
    borderBottom: "1px solid var(--hair)", padding: "14px 0", marginBottom: 0,
  },
  videoLogPrompt: {
    fontSize: 13.5, fontWeight: 500, lineHeight: 1.3, color: "var(--ink)",
    letterSpacing: -0.005,
  },
  videoLogDate: { fontSize: 11, color: "var(--mute)", fontWeight: 500, marginTop: 4, letterSpacing: 0.4, textTransform: "uppercase" },

  /* ===== reward store ===== */
  rewardRow: {
    display: "flex", alignItems: "center", gap: 16, background: "transparent",
    borderBottom: "1px solid var(--hair)", padding: "16px 0", marginBottom: 0,
  },
  rewardEmoji: { fontSize: 32, flexShrink: 0 },
  rewardLabel: { fontWeight: 500, fontSize: 15, color: "var(--ink)", letterSpacing: "-0.005em", lineHeight: 1.3 },
  rewardCost: {
    fontFamily: "'Fraunces', serif", fontSize: 14, color: "var(--mute)",
    fontWeight: 500, marginTop: 3, letterSpacing: -0.015,
  },
  redeemBtn: {
    background: "var(--ink)",
    color: "#fff", border: "none",
    fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 11.5,
    padding: "10px 18px", borderRadius: 999, letterSpacing: 0.5, textTransform: "uppercase",
  },
  redeemLocked: {
    background: "transparent", border: "1px solid var(--hair)",
    color: "var(--mute2)",
  },
  redeemedRow: {
    display: "flex", alignItems: "center", gap: 12, fontSize: 13.5, fontWeight: 500,
    padding: "12px 0", borderBottom: "1px solid var(--hair)",
    color: "var(--ink)",
  },
  redeemedDate: { fontSize: 11, color: "var(--mute)", fontWeight: 500, letterSpacing: 0.4, textTransform: "uppercase" },

  /* ===== auth ===== */
  authWrap: {
    padding: "80px 28px 32px", display: "flex", flexDirection: "column", gap: 16,
    position: "relative", minHeight: "calc(100vh - 60px)",
    maxWidth: 460, margin: "0 auto",
  },
  authBrand: { display: "flex", alignItems: "baseline", gap: 1, marginBottom: 18 },
  authH1: {
    fontFamily: "'Fraunces', serif", fontSize: 56, margin: "16px 0 8px",
    color: "var(--ink)", letterSpacing: "-0.045em", fontWeight: 400, lineHeight: 0.95,
    fontVariationSettings: "'opsz' 144",
  },
  authH1Italic: { fontStyle: "italic", color: "var(--accent)" },
  authSub: { fontSize: 14, color: "var(--mute)", fontWeight: 400, marginBottom: 14, lineHeight: 1.55 },
  authInput: {
    width: "100%", border: "none",
    borderBottom: "1px solid var(--ink)",
    padding: "16px 0", fontSize: 16, fontWeight: 500, color: "var(--ink)",
    background: "transparent", outline: "none", borderRadius: 0,
  },
  authToggle: {
    background: "none", border: "none", color: "var(--ink)", fontSize: 12,
    fontWeight: 600, marginTop: 12, alignSelf: "center", letterSpacing: 0.6,
    textTransform: "uppercase",
    textDecoration: "underline", textDecorationColor: "var(--accent)",
    textDecorationThickness: 1.5, textUnderlineOffset: 5,
  },
  authErr: {
    background: "transparent", color: "var(--err)", fontSize: 12.5, fontWeight: 500,
    borderLeft: "2px solid var(--err)", padding: "8px 12px",
  },
  authInfo: {
    background: "var(--shelf)", color: "var(--ink)", fontSize: 12.5, fontWeight: 400,
    padding: "14px 16px", lineHeight: 1.55, borderRadius: 4,
  },

  /* ===== PARENT HOME ===== */
  parentGreeting: {
    position: "relative",
    background: "var(--ink)",
    borderRadius: 8, padding: "32px 24px 28px", color: "#fff",
    overflow: "hidden",
  },
  parentGreetDate: {
    fontSize: 10, fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase",
    color: "var(--accent)", marginBottom: 12,
  },
  parentGreetH: {
    fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 36,
    lineHeight: 1, letterSpacing: "-0.04em", margin: "0 0 16px", color: "#fff",
    fontVariationSettings: "'opsz' 144",
  },
  parentGreetSub: { fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,.7)", lineHeight: 1.55 },

  weekBand: {
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0,
    marginTop: 22, marginBottom: 0,
    borderTop: "1px solid var(--hair)",
    borderBottom: "1px solid var(--hair)",
  },
  weekCell: {
    padding: "16px 8px", textAlign: "left",
    borderRight: "1px solid var(--hair)",
  },
  weekCellLast: { borderRight: "none" },
  weekCellNum: {
    fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 26,
    color: "var(--ink)", letterSpacing: "-0.03em", lineHeight: 1,
  },
  weekCellLabel: { fontSize: 10, color: "var(--mute)", fontWeight: 600, marginTop: 5, letterSpacing: 1.4, textTransform: "uppercase" },

  blockTitle: {
    fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 10.5,
    margin: "32px 0 12px", display: "flex", alignItems: "center", gap: 8,
    textTransform: "uppercase", letterSpacing: 2, color: "var(--mute)",
  },

  latestVideoCard: {
    display: "flex", alignItems: "center", gap: 14, background: "var(--paper)",
    border: "1px solid var(--hair)", borderRadius: 4, padding: 14,
    textDecoration: "none", color: "inherit",
  },
  latestVideoThumb: {
    width: 72, height: 88, borderRadius: 4, objectFit: "cover",
    background: "#000", flexShrink: 0,
  },
  latestVideoTag: {
    fontSize: 9.5, fontWeight: 600, letterSpacing: 1.8, color: "var(--accent)",
    textTransform: "uppercase",
  },
  latestVideoPrompt: {
    fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 400,
    lineHeight: 1.25, marginTop: 6, color: "var(--ink)", letterSpacing: -0.015,
  },
  latestVideoDate: { fontSize: 10.5, color: "var(--mute)", fontWeight: 500, marginTop: 6, letterSpacing: 0.6, textTransform: "uppercase" },

  rewardProgressCard: {
    background: "var(--paper)", border: "1px solid var(--hair)",
    borderRadius: 4, padding: 18,
  },
  rewardProgressTop: { display: "flex", alignItems: "center", gap: 14, marginBottom: 14 },
  rewardProgressEmoji: { fontSize: 36 },
  rewardProgressLabel: {
    fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 18,
    color: "var(--ink)", lineHeight: 1.2, letterSpacing: -0.02,
  },
  rewardProgressSub: { fontSize: 11, color: "var(--mute)", fontWeight: 500, marginTop: 4, letterSpacing: 0.6, textTransform: "uppercase" },
  miniProgress: { background: "var(--shelf)", height: 2, overflow: "hidden", borderRadius: 0 },
  miniProgressFill: {
    height: "100%", background: "var(--accent)",
    transition: "width .6s cubic-bezier(.2,.8,.3,1)",
  },

  latelyRow: {
    display: "flex", alignItems: "center", gap: 14, background: "transparent",
    borderBottom: "1px solid var(--hair)", padding: "14px 0", marginBottom: 0,
  },
  latelyText: { flex: 1, minWidth: 0 },
  latelyLabel: { fontWeight: 500, fontSize: 14, lineHeight: 1.3, color: "var(--ink)", letterSpacing: -0.005 },
  latelyMeta: { fontSize: 10.5, color: "var(--mute)", fontWeight: 500, marginTop: 4, letterSpacing: 0.6, textTransform: "uppercase" },
  latelyPts: {
    fontFamily: "'Fraunces', serif", fontSize: 15, color: "var(--ok)",
    flexShrink: 0, fontWeight: 500, letterSpacing: -0.02,
  },
  latelyPtsDeclined: {
    fontFamily: "'Fraunces', serif", fontSize: 15, color: "var(--err)",
    flexShrink: 0, fontWeight: 500, letterSpacing: -0.02,
  },

  parentHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  exitBtn: {
    display: "flex", alignItems: "center", gap: 6, background: "transparent",
    border: "1px solid var(--hair)", borderRadius: 999, padding: "8px 14px",
    fontWeight: 600, fontSize: 11.5, color: "var(--ink)",
    letterSpacing: 0.5, textTransform: "uppercase",
  },
  modeRow: {
    display: "flex", gap: 0, marginBottom: 22,
    borderBottom: "1px solid var(--hair)",
  },
  modeBtn: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    background: "transparent", border: "none",
    padding: "12px 6px", fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 11,
    color: "var(--mute)", letterSpacing: 1.4, textTransform: "uppercase",
    position: "relative",
  },
  modeActive: {
    color: "var(--ink)", fontWeight: 700,
    boxShadow: "inset 0 -2px 0 var(--accent)",
  },

  approvalCard: {
    display: "flex", alignItems: "center", gap: 14, background: "var(--paper)",
    border: "1px solid var(--hair)", borderRadius: 4, padding: 14, marginBottom: 9,
  },
  approveBtn: {
    display: "flex", alignItems: "center", gap: 5,
    background: "var(--ink)", color: "#fff", border: "none",
    borderRadius: 999, padding: "10px 14px",
    fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 11.5,
    letterSpacing: 0.4, textTransform: "uppercase",
  },
  declineBtn: {
    background: "transparent", color: "var(--err)",
    border: "1px solid var(--hair)", borderRadius: 999,
    padding: "10px 12px", display: "flex", alignItems: "center",
  },
  emptyBox: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
    padding: "48px 24px", color: "var(--mute)", fontSize: 13, fontWeight: 400,
    textAlign: "center", letterSpacing: -0.005,
  },
  emptyBoxLabel: {
    fontFamily: "'Fraunces', serif", fontSize: 22, fontStyle: "italic",
    fontWeight: 400, color: "var(--ink)",
  },
  signOutBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    width: "100%", marginTop: 32, background: "transparent", border: "none",
    color: "var(--mute)", borderRadius: 0, padding: "13px", fontWeight: 500, fontSize: 11,
    letterSpacing: 1, textTransform: "uppercase",
    borderTop: "1px solid var(--hair)",
  },

  /* editors */
  itemRow: {
    display: "flex", alignItems: "center", gap: 10, background: "transparent",
    borderBottom: "1px solid var(--hair)", padding: "14px 0", marginBottom: 0,
  },
  itemPts: {
    fontFamily: "'Fraunces', serif", fontSize: 15, color: "var(--ink)",
    flexShrink: 0, fontWeight: 500, letterSpacing: -0.02,
  },
  tierBadge: {
    fontSize: 9.5, fontWeight: 600, color: "var(--ink)", padding: "3px 9px",
    borderRadius: 999, flexShrink: 0, letterSpacing: 1, textTransform: "uppercase",
    border: "1px solid var(--hair)",
  },
  iconBtn: {
    background: "transparent", border: "1px solid var(--hair)", borderRadius: 999,
    padding: "8px", display: "flex", color: "var(--ink)", flexShrink: 0,
  },
  iconBtnDanger: {
    background: "transparent", border: "1px solid var(--hair)", borderRadius: 999,
    padding: "8px", display: "flex", color: "var(--err)", flexShrink: 0,
  },
  iconBtnGo: {
    background: "var(--ink)", border: "none", borderRadius: 999,
    padding: "9px", display: "flex", color: "#fff", flexShrink: 0,
  },
  editRow: {
    display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
    background: "var(--shelf)", borderRadius: 4, padding: "10px 12px",
  },
  addRow: {
    display: "flex", alignItems: "center", gap: 8, marginTop: 6,
    background: "transparent", border: "1px dashed var(--hair)",
    borderRadius: 4, padding: "10px 12px",
  },
  editInput: {
    flex: 1, minWidth: 0, border: "1px solid var(--hair)", borderRadius: 4,
    padding: "10px 12px", fontSize: 13.5, fontWeight: 500, color: "var(--ink)",
    background: "var(--paper)", outline: "none",
  },
  editPts: {
    width: 60, border: "1px solid var(--hair)", borderRadius: 4,
    padding: "10px 6px", fontSize: 13.5, fontWeight: 500, color: "var(--ink)",
    background: "var(--paper)", outline: "none", textAlign: "center", flexShrink: 0,
    fontFamily: "'Fraunces', serif",
  },
  rewardEditCard: {
    background: "var(--paper)", border: "1px solid var(--hair)", borderRadius: 4,
    padding: 13, marginBottom: 9,
  },
  emojiPickRow: { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 },
  emojiBtn: {
    width: 34, height: 34, borderRadius: 4, border: "1px solid var(--hair)",
    background: "var(--paper)", fontSize: 17, display: "flex", alignItems: "center",
    justifyContent: "center", padding: 0,
  },
  emojiActive: { borderColor: "var(--ink)", background: "var(--shelf)" },
  select: {
    border: "1px solid var(--hair)", borderRadius: 4, padding: "10px 10px",
    fontSize: 13, fontWeight: 500, color: "var(--ink)", background: "var(--paper)",
    outline: "none", flex: 1,
  },

  /* ===== avatar / personalize ===== */
  avatarChip: {
    width: 38, height: 38, borderRadius: 999,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 19, flexShrink: 0, marginRight: 12,
    background: "var(--shelf)", border: "1px solid var(--hair)",
  },
  personalizeRow: {
    display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8,
    marginBottom: 16,
  },
  personalizeBtn: {
    aspectRatio: "1 / 1", borderRadius: 4, border: "1px solid var(--hair)",
    background: "var(--paper)", fontSize: 22, display: "flex",
    alignItems: "center", justifyContent: "center", padding: 0, cursor: "pointer",
  },
  personalizeActive: {
    borderColor: "var(--ink)", background: "var(--shelf)",
  },
  themeSwatch: {
    aspectRatio: "1 / 1", borderRadius: 4,
    cursor: "pointer", border: "1px solid var(--hair)",
  },
  themeSwatchActive: { boxShadow: "inset 0 0 0 2px var(--ink)" },

  miniBadge: {
    display: "inline-flex", alignItems: "center", gap: 5,
    background: "var(--accentSoft)", color: "var(--accentDark)", fontWeight: 600,
    fontSize: 10.5, padding: "3px 8px", borderRadius: 999, letterSpacing: 0.6, textTransform: "uppercase",
  },
  miniStreakChip: {
    display: "inline-flex", alignItems: "center", gap: 4,
    fontSize: 10.5, color: "var(--accent)", fontWeight: 700, letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  /* toast */
  toast: {
    position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)",
    background: "var(--ink)", color: "#fff", padding: "13px 22px", borderRadius: 4,
    fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 500,
    zIndex: 50, whiteSpace: "nowrap", letterSpacing: 0.4, textTransform: "uppercase",
    maxWidth: "88%",
    boxShadow: "0 20px 60px rgba(0,0,0,.25)",
  },

  /* bottom nav */
  nav: {
    position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
    width: "100%", maxWidth: 480,
    background: "rgba(255,255,255,.96)",
    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    borderTop: "1px solid var(--hair)", display: "flex",
    padding: "10px 6px calc(14px + env(safe-area-inset-bottom))",
    justifyContent: "space-around", zIndex: 40,
  },
  navBtn: {
    background: "none", border: "none", display: "flex", flexDirection: "column",
    alignItems: "center", gap: 4, color: "var(--mute2)", padding: "4px 8px", cursor: "pointer",
  },
  navActive: { color: "var(--ink)" },
  navLabel: { fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" },
  navBadge: {
    position: "absolute", top: -4, right: -8,
    background: "var(--accent)",
    color: "#fff", fontSize: 9.5, fontWeight: 700, minWidth: 16, height: 16,
    borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px",
  },
}

export const TIERS = ["Small", "Medium", "Large"]
export const TIER_COLORS = { Small: "#0A0A0A", Medium: "#0A0A0A", Large: "#E91E63" }
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

export const AVATAR_CHOICES = [
  "🌸","💗","🦋","✨","💎","🌙","☀️","💫","🎀","🪐","🍑","🍓",
  "🦄","🌈","🐱","🐰","🦊","🌻","💄","💅","👛","🕶️",
]

export const THEMES = [
  { id: "signature", label: "Signature", gold: "#E91E63", goldDark: "#B71C4A", lav: "#0A0A0A", lavDark: "#0A0A0A" },
  { id: "rose",      label: "Rose",      gold: "#F06292", goldDark: "#C2185B", lav: "#0A0A0A", lavDark: "#0A0A0A" },
  { id: "amber",     label: "Amber",     gold: "#FF9F1C", goldDark: "#E68A00", lav: "#0A0A0A", lavDark: "#0A0A0A" },
  { id: "ink",       label: "Ink",       gold: "#0A0A0A", goldDark: "#000000", lav: "#0A0A0A", lavDark: "#000000" },
  { id: "petal",     label: "Petal",     gold: "#FFB5C2", goldDark: "#E89AAA", lav: "#0A0A0A", lavDark: "#0A0A0A" },
  { id: "sage",      label: "Sage",      gold: "#7B9B7E", goldDark: "#5F7E62", lav: "#0A0A0A", lavDark: "#0A0A0A" },
]

export function evaluateBadges({ family, claimsCount, videosCount, redemptionsCount, choreApprovedCount }) {
  const lifetime = family.lifetime_points || 0
  const streak = family.streak || 1
  return [
    { id: "first_quest",  emoji: "🎯", label: "First quest done.",        hit: choreApprovedCount >= 1 || claimsCount >= 1 },
    { id: "first_video",  emoji: "🎥", label: "First reflection.",        hit: videosCount >= 1 },
    { id: "first_redeem", emoji: "🎁", label: "First reward redeemed.",   hit: redemptionsCount >= 1 },
    { id: "pts_100",      emoji: "💯", label: "100 points.",              hit: lifetime >= 100 },
    { id: "pts_500",      emoji: "🌟", label: "500 points.",              hit: lifetime >= 500 },
    { id: "pts_1000",     emoji: "👑", label: "1,000 points.",            hit: lifetime >= 1000 },
    { id: "streak_3",     emoji: "🔥", label: "3 days in a row.",         hit: streak >= 3 },
    { id: "streak_7",     emoji: "⚡", label: "7 days. On fire.",         hit: streak >= 7 },
    { id: "ten_quests",   emoji: "🏆", label: "10 quests approved.",      hit: choreApprovedCount >= 10 },
  ]
}

/* editorial-style today line */
export function todayLine(family, approvedTodayCount) {
  const lines = [
    approvedTodayCount > 0 ? `${approvedTodayCount} approved today. keep going.` : "fresh start. make today count.",
    `quick reflection? +${VIDEO_PTS} points, ninety seconds.`,
    `${family.lifetime_points || 0} lifetime. all you.`,
    `${family.streak || 1}-day streak. don't break it.`,
    "small wins compound.",
  ]
  const idx = new Date().getDate() % lines.length
  return lines[idx]
}
