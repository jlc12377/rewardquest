/* ============================================================
   RewardQuest visual system — "slime"
   Off-white base, electric slime green + hot pink accents,
   drips, glossy wet shine, squishy interactions.
   ============================================================ */

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800;900&display=swap');

* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
body, button, input, select, textarea {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: -0.01em;
}
::-webkit-scrollbar { width: 0; }

.rq-fade { animation: rqFade .45s cubic-bezier(.2,.8,.3,1) both; }
@keyframes rqFade { from { opacity:0; transform: translateY(12px);} to {opacity:1; transform:none;} }

/* squishy press — like pressing into slime */
.rq-squish { transition: transform .18s cubic-bezier(.3,1.6,.4,1), filter .15s ease; cursor: pointer; }
.rq-squish:active { transform: scale(.94, .96) rotate(-.5deg); filter: brightness(1.05); }

/* press (legacy alias) */
.rq-press { transition: transform .15s cubic-bezier(.3,1.5,.6,1); cursor: pointer; }
.rq-press:active { transform: scale(.96); }

.rq-toast { animation: rqToast .35s ease both; }
@keyframes rqToast { from { opacity:0; transform: translate(-50%, 14px);} to {opacity:1; transform: translate(-50%,0);} }

/* gentle bob — for drips and stickers */
.rq-bob { animation: rqBob 4s ease-in-out infinite; }
@keyframes rqBob {
  0%,100% { transform: translateY(0) rotate(var(--r, 0deg)); }
  50%     { transform: translateY(-4px) rotate(calc(var(--r, 0deg) + 3deg)); }
}
.rq-bob-slow { animation: rqBob 6s ease-in-out infinite; }

/* points number bump */
.rq-bump { animation: rqBump .9s cubic-bezier(.3,1.6,.5,1) both; }
@keyframes rqBump {
  0%   { transform: scale(1); }
  35%  { transform: scale(1.22); }
  100% { transform: scale(1); }
}

/* slime drip — animated dripping motion */
.rq-drip {
  animation: rqDrip 3.5s ease-in-out infinite;
  transform-origin: top center;
}
@keyframes rqDrip {
  0%, 100% { transform: scaleY(1); }
  50%      { transform: scaleY(1.08); }
}

/* sparkle pop on point gain */
.rq-sparkle {
  position: fixed; pointer-events: none; z-index: 200;
  font-size: 20px;
  animation: rqSparkle 1.4s cubic-bezier(.2,.6,.4,1) forwards;
}
@keyframes rqSparkle {
  0%   { transform: translate(-50%,-50%) rotate(0) scale(.3); opacity: 1; }
  100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(var(--rot)) scale(1.1); opacity: 0; }
}

/* confetti (still used for big moments) */
.rq-confetti-piece {
  position: fixed; top: 35%; left: 50%; width: 11px; height: 18px;
  border-radius: 3px; pointer-events: none; z-index: 200;
  animation: rqConfetti 1.6s cubic-bezier(.2,.6,.4,1) forwards;
}
@keyframes rqConfetti {
  0%   { transform: translate(-50%,-50%) rotate(0) scale(.5); opacity: 1; }
  100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(var(--rot)) scale(1); opacity: 0; }
}

/* badge unlock card */
.rq-badge-pop {
  position: fixed; top: 28%; left: 50%; transform: translateX(-50%);
  background: linear-gradient(135deg, #C8FF3D 0%, #9DD12E 100%);
  color: #0A0A0A; padding: 22px 28px; border-radius: 28px;
  font-family: 'Space Grotesk', sans-serif; font-weight: 700; text-align: center;
  box-shadow: 0 20px 60px rgba(157,209,46,.5), 0 0 0 3px #0A0A0A;
  z-index: 180; max-width: 84%;
  animation: rqBadgePop .6s cubic-bezier(.2,1.4,.5,1) both, rqBadgeOut .4s ease 2.5s both;
}
@keyframes rqBadgePop {
  0% { opacity: 0; transform: translateX(-50%) scale(.4) rotate(-12deg); }
  100% { opacity: 1; transform: translateX(-50%) scale(1) rotate(-2deg); }
}
@keyframes rqBadgeOut {
  to { opacity: 0; transform: translateX(-50%) translateY(-40px) scale(.9); }
}

/* ticker tape — running marquee */
.rq-ticker {
  display: flex; gap: 32px; white-space: nowrap;
  animation: rqTicker 28s linear infinite;
}
@keyframes rqTicker {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* wordmark dot pulse */
.rq-dot { animation: rqDot 1.8s ease-in-out infinite; }
@keyframes rqDot {
  0%,100% { transform: scale(1); }
  50%     { transform: scale(1.4); }
}
`

/* ============================================================
   STYLES
   ============================================================ */
export const S = {
  app: {
    /* slime palette */
    "--bg":        "#F8F6EF",  /* warm off-white, slight cream */
    "--surface":   "#FFFFFF",
    "--ink":       "#0A0A0A",  /* near-black, more confident than #000 */
    "--inkSoft":   "#1A1A1A",
    "--mute":      "#6B6B6B",
    "--mute2":     "#A3A3A3",
    "--line":      "#0A0A0A",  /* yes — borders are solid black, very editorial */
    "--lineSoft":  "#E5E2D8",

    /* slime accents */
    "--slime":     "#C8FF3D",  /* THE color */
    "--slimeDeep": "#9DD12E",
    "--slimeGlow": "#E1FF7A",
    "--gum":       "#FF52A8",  /* hot pink */
    "--gumDeep":   "#D63D8E",
    "--ink2":      "#0A0A0A",
    "--sun":       "#FFCD3D",
    "--cyan":      "#3DD9FF",

    maxWidth: 480, margin: "0 auto", minHeight: "100vh",
    background: "var(--bg)",
    color: "var(--ink)",
    fontFamily: "'Inter', sans-serif",
    display: "flex", flexDirection: "column",
    position: "relative",
    paddingBottom: "calc(82px + env(safe-area-inset-bottom))",
    paddingTop: "env(safe-area-inset-top)",
    overflowX: "hidden",
  },

  loading: {
    minHeight: "60vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    color: "#6B6B6B", fontWeight: 500,
  },

  /* ===== header ===== */
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "20px 22px 8px",
  },
  brand: { display: "flex", alignItems: "baseline", gap: 3 },
  brandName: {
    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
    fontSize: 24, letterSpacing: "-0.045em", color: "var(--ink)",
  },
  brandDot: {
    display: "inline-block", width: 10, height: 10, borderRadius: "50%",
    background: "var(--slime)", marginLeft: 3,
    border: "1.5px solid var(--ink)",
  },
  whoami: {
    fontSize: 12, color: "var(--mute)", display: "flex", alignItems: "center",
    gap: 6, marginTop: 4, fontWeight: 600, letterSpacing: 0.1,
  },

  /* points pill — small in the header */
  pointsBadge: {
    display: "flex", alignItems: "center", gap: 5,
    background: "var(--slime)",
    color: "var(--ink)",
    padding: "8px 14px", borderRadius: 999,
    border: "1.5px solid var(--ink)",
    boxShadow: "3px 3px 0 var(--ink)",
  },
  pointsNum: {
    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
    fontSize: 16, color: "var(--ink)", letterSpacing: "-0.02em",
  },
  pointsLabel: { fontSize: 10, fontWeight: 700, color: "var(--ink)", letterSpacing: 0.6 },

  main: { flex: 1, padding: "8px 22px 24px" },

  /* ===== typography ===== */
  h2: {
    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 34,
    color: "var(--ink)", margin: "10px 0 18px", letterSpacing: "-0.04em", lineHeight: 1,
  },
  h3: {
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 600,
    margin: "32px 0 12px", color: "var(--mute)",
    textTransform: "uppercase", letterSpacing: 2,
  },

  /* ===== KID HOME: MEGA points hero ===== */
  megaPoints: {
    position: "relative", padding: "16px 0 8px", textAlign: "center",
    marginBottom: 4,
  },
  megaPointsLabel: {
    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
    fontSize: 11, letterSpacing: 4, textTransform: "uppercase",
    color: "var(--mute)",
  },
  megaPointsNum: {
    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
    fontSize: 108, lineHeight: 0.95, letterSpacing: "-0.07em",
    color: "var(--ink)",
    margin: "8px 0 2px", display: "inline-block",
    position: "relative",
  },
  /* the slime drip under the number */
  megaPointsDrip: {
    width: 100, height: 28, margin: "-6px auto 0", display: "block",
  },
  megaPointsSub: {
    fontSize: 14, color: "var(--ink)", fontWeight: 600,
    marginTop: 14, letterSpacing: -0.005,
  },

  /* "on a roll" streak chip */
  streakChip: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "var(--gum)",
    color: "#fff", padding: "8px 16px", borderRadius: 999,
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600,
    border: "1.5px solid var(--ink)",
    boxShadow: "3px 3px 0 var(--ink)",
    letterSpacing: "-0.005em",
  },

  /* ticker tape */
  tickerWrap: {
    margin: "18px -22px 24px", padding: "9px 0",
    background: "var(--ink)",
    overflow: "hidden",
    borderTop: "1.5px solid var(--ink)",
    borderBottom: "1.5px solid var(--ink)",
  },
  tickerItem: {
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 12,
    fontWeight: 600, color: "var(--slime)", letterSpacing: 1.8,
    textTransform: "uppercase", display: "flex", alignItems: "center", gap: 10,
  },
  tickerStar: {
    color: "var(--slime)", fontSize: 14,
  },

  /* ===== next-reward sticker card ===== */
  nextRewardCard: {
    position: "relative", marginTop: 22, padding: 22,
    background: "var(--slime)",
    borderRadius: 28, overflow: "visible",
    border: "1.5px solid var(--ink)",
    boxShadow: "5px 5px 0 var(--ink)",
    transform: "rotate(-1deg)",
  },
  nextRewardSticker: {
    position: "absolute", top: -16, right: 14,
    background: "var(--gum)", color: "#fff",
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 700,
    padding: "7px 14px", borderRadius: 999, letterSpacing: 1.4,
    transform: "rotate(8deg)",
    border: "1.5px solid var(--ink)",
    boxShadow: "2px 2px 0 var(--ink)",
    textTransform: "uppercase",
  },
  nextRewardEmoji: { fontSize: 56, marginBottom: 4, display: "block", lineHeight: 1 },
  nextRewardLabel: {
    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
    fontSize: 24, color: "var(--ink)", letterSpacing: "-0.03em",
    marginBottom: 14, lineHeight: 1.1,
  },
  nextProgressTrack: {
    height: 14, borderRadius: 999, background: "#fff",
    border: "1.5px solid var(--ink)", overflow: "hidden",
  },
  nextProgressFill: {
    height: "100%", borderRadius: 999,
    background: "var(--gum)",
    transition: "width .6s cubic-bezier(.2,.8,.3,1)",
  },
  nextProgressFoot: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginTop: 10, color: "var(--ink)", fontSize: 13,
    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: -0.005,
  },

  /* ===== stat row ===== */
  statRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 22 },
  statCard: {
    background: "var(--surface)", borderRadius: 18, padding: "14px 8px",
    border: "1.5px solid var(--ink)", textAlign: "center",
    boxShadow: "3px 3px 0 var(--ink)",
  },
  statNum: {
    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
    fontSize: 22, color: "var(--ink)", letterSpacing: "-0.025em",
  },
  statLabel: {
    fontSize: 10, color: "var(--mute)", fontWeight: 600, marginTop: 3,
    letterSpacing: 1.2, textTransform: "uppercase",
  },

  /* ===== shortcut tiles ===== */
  shortcutBright: {
    width: "100%", position: "relative", display: "flex", alignItems: "center", gap: 14,
    background: "var(--surface)", border: "1.5px solid var(--ink)",
    borderRadius: 22, padding: "16px 18px", marginBottom: 12,
    overflow: "hidden",
    boxShadow: "4px 4px 0 var(--ink)",
  },
  shortcutBrightIcon: {
    width: 52, height: 52, borderRadius: 16, display: "flex",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
    border: "1.5px solid var(--ink)",
  },
  shortcutTitle: {
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700,
    color: "var(--ink)", letterSpacing: "-0.025em",
  },
  shortcutSub: { fontSize: 12.5, color: "var(--mute)", fontWeight: 500, marginTop: 2 },

  shortcut: {
    width: "100%", display: "flex", alignItems: "center", gap: 13,
    background: "var(--surface)", border: "1.5px solid var(--ink)",
    borderRadius: 18, padding: 13, marginBottom: 10,
    boxShadow: "3px 3px 0 var(--ink)",
  },
  shortcutIcon: {
    width: 42, height: 42, borderRadius: 13, display: "flex",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
    border: "1.5px solid var(--ink)",
  },

  /* pending chip + proof banner */
  pendingNote: {
    marginTop: 18,
    background: "var(--sun)", border: "1.5px solid var(--ink)",
    borderRadius: 14, padding: "11px 14px",
    fontSize: 13, fontWeight: 600, color: "var(--ink)",
    display: "flex", alignItems: "center", gap: 8,
    boxShadow: "3px 3px 0 var(--ink)",
  },
  proofBanner: {
    background: "var(--ink)", color: "var(--slime)", borderRadius: 14,
    padding: "11px 14px", fontSize: 13, fontWeight: 500,
    display: "flex", alignItems: "center", gap: 8, marginBottom: 18,
  },

  /* section tag */
  sectionTag: {
    display: "flex", alignItems: "center", gap: 7,
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700,
    marginBottom: 4, color: "var(--ink)", letterSpacing: "-0.015em",
  },
  sectionHint: { fontSize: 12.5, color: "var(--mute)", fontWeight: 500, margin: "0 0 14px" },
  tierDot: { width: 11, height: 11, borderRadius: 4, display: "inline-block", border: "1.5px solid var(--ink)" },

  /* task rows */
  taskRow: {
    width: "100%", display: "flex", alignItems: "center", gap: 12,
    background: "var(--surface)", border: "1.5px solid var(--ink)",
    borderRadius: 16, padding: "12px 14px", marginBottom: 9,
    boxShadow: "3px 3px 0 var(--ink)",
  },
  taskRowDone: {
    background: "var(--slime)",
  },
  taskRowPending: {
    background: "var(--sun)",
  },
  taskLabel: { fontWeight: 600, fontSize: 14.5, color: "var(--ink)", letterSpacing: "-0.005em" },
  strike: { textDecoration: "line-through", color: "var(--mute)" },
  taskPts: {
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: "var(--ink)",
    background: "var(--slime)", padding: "6px 12px", borderRadius: 10,
    flexShrink: 0, fontWeight: 700, letterSpacing: "-0.01em",
    border: "1.5px solid var(--ink)",
  },
  proofBtn: {
    display: "flex", alignItems: "center", gap: 5,
    background: "var(--slime)",
    color: "var(--ink)", border: "1.5px solid var(--ink)", borderRadius: 12, padding: "10px 14px",
    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13,
    boxShadow: "3px 3px 0 var(--ink)", flexShrink: 0,
    letterSpacing: "-0.01em",
  },

  decisionRow: {
    width: "100%", display: "flex", alignItems: "center", gap: 12,
    background: "var(--surface)",
    border: "1.5px solid var(--ink)",
    borderRadius: 16, padding: "12px 14px", marginBottom: 9,
    boxShadow: "3px 3px 0 var(--ink)",
  },
  decisionPending: { background: "var(--sun)" },
  decisionMain: { flex: 1, textAlign: "left" },
  decisionLabel: { fontWeight: 600, fontSize: 14.5, color: "var(--ink)", letterSpacing: "-0.005em" },
  decisionPts: {
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: "#fff",
    background: "var(--gum)",
    padding: "6px 13px", borderRadius: 11, flexShrink: 0, fontWeight: 700,
    border: "1.5px solid var(--ink)",
  },
  pendingTag: { fontSize: 11.5, color: "var(--ink)", fontWeight: 600, marginTop: 3, display: "block" },

  /* media thumbnail */
  thumb: { borderRadius: 11, objectFit: "cover", flexShrink: 0, background: "#000", border: "1.5px solid var(--ink)" },
  thumbEmpty: {
    borderRadius: 11, background: "var(--bg)",
    border: "1.5px solid var(--ink)",
    display: "flex",
    alignItems: "center", justifyContent: "center", color: "var(--mute)", flexShrink: 0,
  },

  /* today panel */
  todayPanel: {
    background: "var(--surface)", border: "1.5px solid var(--ink)",
    borderRadius: 18, padding: "14px 16px", marginTop: 18,
    display: "flex", alignItems: "center", gap: 12,
    boxShadow: "3px 3px 0 var(--ink)",
  },
  todayEmoji: {
    fontSize: 26, flexShrink: 0,
  },
  todayLine: {
    fontSize: 14, fontWeight: 600, lineHeight: 1.35, color: "var(--ink)",
    letterSpacing: "-0.005em",
  },
  todaySub: { fontSize: 11.5, color: "var(--mute)", fontWeight: 500, marginTop: 3, letterSpacing: 0.1 },

  /* video prompt */
  promptCard: {
    background: "var(--slime)", border: "1.5px solid var(--ink)",
    borderRadius: 22, padding: 20, marginBottom: 16,
    position: "relative", overflow: "hidden",
    boxShadow: "4px 4px 0 var(--ink)",
  },
  promptKicker: {
    fontSize: 10, fontWeight: 700, color: "var(--ink)",
    letterSpacing: 2, textTransform: "uppercase",
  },
  promptText: {
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, color: "var(--ink)",
    margin: "10px 0 14px", lineHeight: 1.2, letterSpacing: "-0.03em", fontWeight: 700,
  },
  promptSwap: {
    display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600,
    background: "var(--ink)", border: "none",
    borderRadius: 999, padding: "8px 14px", color: "var(--slime)",
  },
  stage: {
    position: "relative", background: "#000", borderRadius: 22,
    overflow: "hidden", aspectRatio: "3/4", display: "flex",
    alignItems: "center", justifyContent: "center", marginBottom: 14,
    border: "1.5px solid var(--ink)",
    boxShadow: "4px 4px 0 var(--ink)",
  },
  videoEl: { width: "100%", height: "100%", objectFit: "cover" },
  stagePlaceholder: {
    position: "absolute", display: "flex", flexDirection: "column",
    alignItems: "center", gap: 10, color: "#fff", fontSize: 13.5, fontWeight: 500,
    textAlign: "center", padding: 20,
  },

  /* buttons */
  primaryBtn: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    background: "var(--ink)",
    color: "var(--slime)", border: "1.5px solid var(--ink)", borderRadius: 16,
    padding: "16px", fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700,
    boxShadow: "4px 4px 0 var(--slimeDeep)", width: "100%",
    letterSpacing: "-0.015em",
  },
  ghostBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
    background: "var(--surface)", color: "var(--ink)",
    border: "1.5px solid var(--ink)",
    borderRadius: 16, padding: "16px 20px", fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 14.5, fontWeight: 600,
    boxShadow: "3px 3px 0 var(--ink)",
  },
  videoNote: {
    fontSize: 12, color: "var(--mute)", fontWeight: 500, marginTop: 14,
    padding: "12px 14px", lineHeight: 1.5,
    background: "var(--bg)", borderRadius: 12,
    border: "1.5px solid var(--lineSoft)",
  },
  videoLogRow: {
    display: "flex", alignItems: "center", gap: 12, background: "var(--surface)",
    border: "1.5px solid var(--ink)", borderRadius: 16, padding: 12, marginBottom: 9,
    boxShadow: "3px 3px 0 var(--ink)",
  },
  videoLogPrompt: {
    fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap",
    overflow: "hidden", textOverflow: "ellipsis", color: "var(--ink)",
  },
  videoLogDate: { fontSize: 11.5, color: "var(--mute)", fontWeight: 500, marginTop: 3 },

  /* reward store */
  rewardRow: {
    display: "flex", alignItems: "center", gap: 13, background: "var(--surface)",
    border: "1.5px solid var(--ink)", borderRadius: 18, padding: 14, marginBottom: 10,
    boxShadow: "3px 3px 0 var(--ink)",
  },
  rewardEmoji: { fontSize: 30 },
  rewardLabel: { fontWeight: 700, fontSize: 15, color: "var(--ink)", letterSpacing: "-0.01em" },
  rewardCost: { fontSize: 12.5, color: "var(--mute)", fontWeight: 600, marginTop: 2 },
  redeemBtn: {
    background: "var(--slime)",
    color: "var(--ink)", border: "1.5px solid var(--ink)",
    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13,
    padding: "11px 18px", borderRadius: 12, boxShadow: "3px 3px 0 var(--ink)",
    letterSpacing: "-0.01em",
  },
  redeemLocked: {
    background: "var(--bg)", boxShadow: "none",
    color: "var(--mute)", border: "1.5px solid var(--lineSoft)",
  },
  redeemedRow: {
    display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, fontWeight: 600,
    padding: "11px 14px", background: "var(--surface)", border: "1.5px solid var(--ink)",
    borderRadius: 14, marginBottom: 8, color: "var(--ink)",
    boxShadow: "3px 3px 0 var(--ink)",
  },
  redeemedDate: { fontSize: 11.5, color: "var(--mute)", fontWeight: 500 },

  /* auth */
  authWrap: {
    padding: "60px 26px 30px", display: "flex", flexDirection: "column", gap: 14,
    position: "relative", minHeight: "calc(100vh - 60px)",
  },
  authBrand: { display: "flex", alignItems: "baseline", gap: 3, marginBottom: 20 },
  authH1: {
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 48, margin: "12px 0 6px",
    color: "var(--ink)", letterSpacing: "-0.045em", fontWeight: 700, lineHeight: 1,
  },
  authSub: { fontSize: 14, color: "var(--mute)", fontWeight: 500, marginBottom: 12, lineHeight: 1.5 },
  authInput: {
    width: "100%", border: "1.5px solid var(--ink)", borderRadius: 14,
    padding: "16px 16px", fontSize: 15, fontWeight: 500, color: "var(--ink)",
    background: "var(--surface)", outline: "none",
  },
  authToggle: {
    background: "none", border: "none", color: "var(--ink)", fontSize: 13,
    fontWeight: 700, marginTop: 8, alignSelf: "center", letterSpacing: "-0.005em",
    textDecoration: "underline", textDecorationColor: "var(--slime)",
    textDecorationThickness: 3, textUnderlineOffset: 4,
  },
  authErr: {
    background: "#FFE6E0", color: "#B5503A", fontSize: 13, fontWeight: 600,
    borderRadius: 12, padding: "12px 14px", border: "1.5px solid #B5503A",
  },
  authInfo: {
    background: "var(--slime)", color: "var(--ink)", fontSize: 12.5, fontWeight: 600,
    borderRadius: 12, padding: "12px 14px", lineHeight: 1.5,
    border: "1.5px solid var(--ink)",
  },

  /* ===== PARENT HOME ===== */
  parentGreeting: {
    position: "relative",
    background: "var(--ink)",
    border: "1.5px solid var(--ink)",
    borderRadius: 26, padding: "26px 22px", color: "#fff",
    overflow: "hidden",
    boxShadow: "5px 5px 0 var(--slime)",
  },
  parentGreetDate: {
    fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase",
    color: "var(--slime)", marginBottom: 8,
  },
  parentGreetH: {
    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30,
    lineHeight: 1.05, letterSpacing: "-0.04em", margin: "2px 0 12px", color: "#fff",
  },
  parentGreetSub: { fontSize: 14.5, fontWeight: 500, color: "#FFF8", lineHeight: 1.5 },

  weekBand: {
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9,
    marginTop: 18, marginBottom: 18,
  },
  weekCard: {
    background: "var(--surface)", borderRadius: 18, padding: "14px 8px",
    border: "1.5px solid var(--ink)", textAlign: "center",
    boxShadow: "3px 3px 0 var(--ink)",
  },
  weekCardEmoji: { fontSize: 20, marginBottom: 4 },
  weekCardNum: {
    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22,
    color: "var(--ink)", letterSpacing: "-0.025em",
  },
  weekCardLabel: { fontSize: 10, color: "var(--mute)", fontWeight: 600, marginTop: 1, letterSpacing: 1 },

  blockTitle: {
    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11,
    margin: "26px 0 12px", display: "flex", alignItems: "center", gap: 8,
    textTransform: "uppercase", letterSpacing: 2, color: "var(--mute)",
  },

  latestVideoCard: {
    display: "flex", alignItems: "center", gap: 13, background: "var(--gum)",
    border: "1.5px solid var(--ink)", borderRadius: 20, padding: 13,
    textDecoration: "none", color: "inherit",
    boxShadow: "4px 4px 0 var(--ink)",
  },
  latestVideoThumb: {
    width: 68, height: 84, borderRadius: 14, objectFit: "cover",
    background: "#000", flexShrink: 0, border: "1.5px solid var(--ink)",
  },
  latestVideoTag: {
    fontSize: 9.5, fontWeight: 700, letterSpacing: 1.6, color: "#fff",
    textTransform: "uppercase",
  },
  latestVideoPrompt: { fontSize: 13.5, fontWeight: 700, lineHeight: 1.3, marginTop: 5, color: "#fff" },
  latestVideoDate: { fontSize: 11.5, color: "#FFF9", fontWeight: 500, marginTop: 5 },

  rewardProgressCard: {
    background: "var(--slime)", border: "1.5px solid var(--ink)",
    borderRadius: 20, padding: 16,
    boxShadow: "4px 4px 0 var(--ink)",
  },
  rewardProgressTop: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
  rewardProgressEmoji: { fontSize: 36 },
  rewardProgressLabel: { fontWeight: 700, fontSize: 16, color: "var(--ink)", lineHeight: 1.25, letterSpacing: "-0.015em" },
  rewardProgressSub: { fontSize: 11.5, color: "var(--ink)", opacity: 0.7, fontWeight: 600, marginTop: 3 },
  miniProgress: { background: "#fff", height: 12, borderRadius: 999, overflow: "hidden", border: "1.5px solid var(--ink)" },
  miniProgressFill: {
    height: "100%", background: "var(--gum)",
    borderRadius: 999, transition: "width .6s cubic-bezier(.2,.8,.3,1)",
  },

  latelyRow: {
    display: "flex", alignItems: "center", gap: 12, background: "var(--surface)",
    border: "1.5px solid var(--ink)", borderRadius: 16, padding: 12, marginBottom: 9,
    boxShadow: "3px 3px 0 var(--ink)",
  },
  latelyText: { flex: 1, minWidth: 0 },
  latelyLabel: { fontWeight: 600, fontSize: 13.5, lineHeight: 1.3, color: "var(--ink)", letterSpacing: "-0.005em" },
  latelyMeta: { fontSize: 11.5, color: "var(--mute)", fontWeight: 500, marginTop: 3 },
  latelyPts: {
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: "var(--ink)",
    background: "var(--slime)", padding: "5px 12px", border: "1.5px solid var(--ink)",
    borderRadius: 10, flexShrink: 0, fontWeight: 700,
  },
  latelyPtsDeclined: {
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: "#B5503A",
    background: "#FFE6E0", padding: "5px 12px", border: "1.5px solid #B5503A",
    borderRadius: 10, flexShrink: 0, fontWeight: 700,
  },

  parentHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  exitBtn: {
    display: "flex", alignItems: "center", gap: 5, background: "var(--surface)",
    border: "1.5px solid var(--ink)", borderRadius: 11, padding: "9px 13px",
    fontWeight: 700, fontSize: 12.5, color: "var(--ink)",
    boxShadow: "2px 2px 0 var(--ink)",
  },
  modeRow: { display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" },
  modeBtn: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    background: "var(--surface)", border: "1.5px solid var(--ink)", borderRadius: 12,
    padding: "10px 8px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 12.5,
    color: "var(--ink)", minWidth: 90, letterSpacing: "-0.005em",
  },
  modeActive: {
    background: "var(--ink)",
    color: "var(--slime)", borderColor: "var(--ink)",
    boxShadow: "2px 2px 0 var(--slime)",
  },

  approvalCard: {
    display: "flex", alignItems: "center", gap: 12, background: "var(--sun)",
    border: "1.5px solid var(--ink)", borderRadius: 18, padding: 13, marginBottom: 11,
    boxShadow: "4px 4px 0 var(--ink)",
  },
  approveBtn: {
    display: "flex", alignItems: "center", gap: 5,
    background: "var(--slime)",
    color: "var(--ink)", border: "1.5px solid var(--ink)", borderRadius: 12, padding: "12px 14px",
    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13,
    boxShadow: "3px 3px 0 var(--ink)",
  },
  declineBtn: {
    background: "#FFE6E0", color: "#B5503A",
    border: "1.5px solid var(--ink)", borderRadius: 12,
    padding: "12px 13px", display: "flex", alignItems: "center",
    boxShadow: "3px 3px 0 var(--ink)",
  },
  emptyBox: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
    padding: "36px 22px", color: "var(--mute)", fontSize: 13.5, fontWeight: 500,
    background: "var(--surface)",
    border: "1.5px dashed var(--ink)", borderRadius: 18,
  },
  signOutBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    width: "100%", marginTop: 28, background: "transparent", border: "1.5px solid var(--lineSoft)",
    color: "var(--mute)", borderRadius: 12, padding: "13px", fontWeight: 500, fontSize: 12.5,
  },

  /* editors */
  itemRow: {
    display: "flex", alignItems: "center", gap: 8, background: "var(--surface)",
    border: "1.5px solid var(--ink)", borderRadius: 13, padding: "11px 13px", marginBottom: 8,
    boxShadow: "2px 2px 0 var(--ink)",
  },
  itemPts: {
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: "var(--ink)",
    background: "var(--slime)", padding: "4px 10px", border: "1.5px solid var(--ink)",
    borderRadius: 9, flexShrink: 0, fontWeight: 700,
  },
  tierBadge: {
    fontSize: 10, fontWeight: 700, color: "var(--ink)", padding: "4px 9px",
    borderRadius: 7, flexShrink: 0, letterSpacing: 0.4,
    border: "1.5px solid var(--ink)",
  },
  iconBtn: {
    background: "var(--bg)", border: "1.5px solid var(--ink)", borderRadius: 10,
    padding: "8px", display: "flex", color: "var(--ink)", flexShrink: 0,
  },
  iconBtnDanger: {
    background: "#FFE6E0", border: "1.5px solid var(--ink)", borderRadius: 10,
    padding: "8px", display: "flex", color: "#B5503A", flexShrink: 0,
  },
  iconBtnGo: {
    background: "var(--slime)", border: "1.5px solid var(--ink)", borderRadius: 10,
    padding: "9px", display: "flex", color: "var(--ink)", flexShrink: 0,
    boxShadow: "2px 2px 0 var(--ink)",
  },
  editRow: {
    display: "flex", alignItems: "center", gap: 7, marginBottom: 7,
    background: "var(--sun)", border: "1.5px solid var(--ink)",
    borderRadius: 13, padding: "9px 10px",
  },
  addRow: {
    display: "flex", alignItems: "center", gap: 7, marginTop: 4,
    background: "var(--surface)", border: "1.5px dashed var(--ink)",
    borderRadius: 13, padding: "9px 10px",
  },
  editInput: {
    flex: 1, minWidth: 0, border: "1.5px solid var(--ink)", borderRadius: 10,
    padding: "10px 12px", fontSize: 13.5, fontWeight: 500, color: "var(--ink)",
    background: "var(--surface)", outline: "none",
  },
  editPts: {
    width: 62, border: "1.5px solid var(--ink)", borderRadius: 10,
    padding: "10px 6px", fontSize: 13.5, fontWeight: 700, color: "var(--ink)",
    background: "var(--surface)", outline: "none", textAlign: "center", flexShrink: 0,
  },
  rewardEditCard: {
    background: "var(--surface)", border: "1.5px solid var(--ink)", borderRadius: 14,
    padding: 12, marginBottom: 10,
    boxShadow: "3px 3px 0 var(--ink)",
  },
  emojiPickRow: { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 },
  emojiBtn: {
    width: 34, height: 34, borderRadius: 9, border: "1.5px solid var(--ink)",
    background: "var(--surface)", fontSize: 16, display: "flex", alignItems: "center",
    justifyContent: "center", padding: 0,
  },
  emojiActive: { background: "var(--slime)" },
  select: {
    border: "1.5px solid var(--ink)", borderRadius: 10, padding: "10px 8px",
    fontSize: 13, fontWeight: 600, color: "var(--ink)", background: "var(--surface)",
    outline: "none", flex: 1,
  },

  /* avatar / personalize */
  avatarChip: {
    width: 40, height: 40, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20, flexShrink: 0, marginRight: 10,
    background: "var(--surface)", border: "1.5px solid var(--ink)",
    boxShadow: "2px 2px 0 var(--ink)",
  },
  personalizeRow: {
    display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8,
    marginBottom: 14,
  },
  personalizeBtn: {
    aspectRatio: "1 / 1", borderRadius: 14, border: "1.5px solid var(--ink)",
    background: "var(--surface)", fontSize: 22, display: "flex",
    alignItems: "center", justifyContent: "center", padding: 0, cursor: "pointer",
  },
  personalizeActive: {
    background: "var(--slime)",
    boxShadow: "3px 3px 0 var(--ink)",
  },
  themeSwatch: {
    aspectRatio: "1 / 1", borderRadius: 14, border: "1.5px solid var(--ink)",
    cursor: "pointer",
  },
  themeSwatchActive: { boxShadow: "3px 3px 0 var(--ink)", transform: "scale(1.05)" },

  miniBadge: {
    display: "inline-flex", alignItems: "center", gap: 5,
    background: "var(--slime)", color: "var(--ink)", fontWeight: 700,
    fontSize: 11, padding: "4px 9px", borderRadius: 8, letterSpacing: 0.2,
    border: "1.5px solid var(--ink)",
  },

  /* toast */
  toast: {
    position: "fixed", bottom: 102, left: "50%", transform: "translateX(-50%)",
    background: "var(--ink)", color: "var(--slime)", padding: "13px 22px", borderRadius: 999,
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600,
    boxShadow: "4px 4px 0 var(--slime)", zIndex: 50, whiteSpace: "nowrap",
    maxWidth: "88%", letterSpacing: "-0.01em",
    border: "1.5px solid var(--ink)",
  },

  /* bottom nav */
  nav: {
    position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
    width: "100%", maxWidth: 480,
    background: "var(--surface)",
    borderTop: "1.5px solid var(--ink)", display: "flex",
    padding: "10px 6px calc(14px + env(safe-area-inset-bottom))",
    justifyContent: "space-around", zIndex: 40,
  },
  navBtn: {
    background: "none", border: "none", display: "flex", flexDirection: "column",
    alignItems: "center", gap: 3, color: "var(--mute2)", padding: "4px 8px", cursor: "pointer",
  },
  navActive: { color: "var(--ink)" },
  navLabel: { fontSize: 10, fontWeight: 700, letterSpacing: 0.4 },
  navBadge: {
    position: "absolute", top: -5, right: -8,
    background: "var(--gum)",
    color: "#fff", fontSize: 10, fontWeight: 700, minWidth: 17, height: 17,
    borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px",
    border: "1.5px solid var(--ink)",
  },

  miniStreakChip: {
    display: "inline-flex", alignItems: "center", gap: 4,
    fontSize: 12, color: "var(--ink)", fontWeight: 700, letterSpacing: 0.2,
    background: "var(--slime)", padding: "3px 9px", borderRadius: 999,
    border: "1.5px solid var(--ink)",
  },
}

export const TIERS = ["Small", "Medium", "Large"]
export const TIER_COLORS = { Small: "var(--slime)", Medium: "var(--sun)", Large: "var(--gum)" }
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
  "🦄","🌸","🌈","⭐","🦋","🌻","🍓","🐱","🐰","🦊","🐼","🐻",
  "🐢","🦔","🌙","☀️","💫","✨","🎀","🪐","🍑","🍉"
]

export const THEMES = [
  { id: "slime",   label: "Slime",    gold: "#C8FF3D", goldDark: "#9DD12E", lav: "#FF52A8", lavDark: "#D63D8E" },
  { id: "bubble",  label: "Bubble",   gold: "#FF52A8", goldDark: "#D63D8E", lav: "#C8FF3D", lavDark: "#9DD12E" },
  { id: "sun",     label: "Sun",      gold: "#FFCD3D", goldDark: "#D9A82E", lav: "#FF52A8", lavDark: "#D63D8E" },
  { id: "ice",     label: "Ice",      gold: "#3DD9FF", goldDark: "#28B6D9", lav: "#C8FF3D", lavDark: "#9DD12E" },
  { id: "ember",   label: "Ember",    gold: "#FF8A3D", goldDark: "#D9742E", lav: "#FF52A8", lavDark: "#D63D8E" },
  { id: "lilac",   label: "Lilac",    gold: "#B98EF0", goldDark: "#9D6FE8", lav: "#C8FF3D", lavDark: "#9DD12E" },
]

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

export function todayLine(family, approvedTodayCount) {
  const lines = [
    `${approvedTodayCount > 0 ? approvedTodayCount + " down today. keep cooking." : "Fresh day. make it count."}`,
    `Drop a reflection — ${VIDEO_PTS} pts, takes a minute.`,
    `${family.lifetime_points || 0} lifetime pts. that's all you.`,
    `${family.streak || 1}-day streak. don't break the chain.`,
    `One quick win starts the day right.`,
  ]
  const idx = new Date().getDate() % lines.length
  return lines[idx]
}
