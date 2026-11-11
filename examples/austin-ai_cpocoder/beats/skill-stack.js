// The eighty days as a calendar with the work stacked beside it (a film-local beat, after the skill's calendar):
// the desk calendar flips from the first day to the last while the follower count climbs through the creator's
// own dated milestones; each piece of work the creator posted in the span drops onto a deck at the calendar's
// side on the day it went up (its card only: the beat never says which one brought the followers). On the last
// day the count locks and a stamp slams on; the toy points at the pages, cheers and leaps out.
//
// film.json, in story.segments, as "calendar" plus:
//   "cards": [{ "file": "assets/web199-1.jpg", "date": "2026-09-21" }, …]  the work, each on its post's date
export function makeBeat({ opts, len, bar, at, fov, aspect, glyph, kit, math, quat, pop, mulberry32 }) {
  const { seg, smooth, lerp, easeOut, easeIn, easeInOut, backOut, v3 } = math;
  const { trs, qId, qEuler, qMul, qAxis, mulT, apply } = quat;
  const day = (s) => { const [y, m, d] = String(s).split("-").map(Number); return Date.UTC(y, m - 1, d); };
  if (!opts.from || !opts.to) throw new Error('beat "skill-stack" needs "from" and "to" (dates, "2026-07-10")');
  if (len < 3 * bar - 1e-6) throw new Error('beat "skill-stack" needs "bars": 3 or more');
  const D0 = day(opts.from), DAYS = Math.round((day(opts.to) - D0) / 864e5);
  if (!(DAYS > 0)) throw new Error(`beat "skill-stack": "to" (${opts.to}) is not after "from" (${opts.from})`);
  const dateOf = (n) => { const d = new Date(D0 + Math.round(n) * 864e5); return { m: d.getUTCMonth() + 1, d: d.getUTCDate() }; };
  const hidden = (p) => trs(p, qId(), kit.HIDDEN);

  // when (seconds into the beat)
  const LOCK = len - bar;
  const DROP = [0.05, 0.5], RISE = [0.5, 1.1], LABEL_IN = 1.5, FLIP = [1.5, LOCK - 0.25], CHEER = [LOCK + 0.15, LOCK + 0.75], LEAP = [len - 0.5, len];
  const flipS = (g) => easeInOut(seg(g, FLIP[0], FLIP[1]));
  const nAt = (g) => (g >= LOCK - 0.25 ? DAYS : flipS(g) * DAYS);

  // the work: a card for each post, dropping onto the deck as its day shows on the page
  // the work as a staircase: each post a step (a dark block with its picture on the front), dropping in on the
  // day it went up; the toy hops onto each one, so on the last day he stands on top of his own work
  const CALX = -0.19;
  const STEP_W = 0.085, STEP_D = 0.07, PIC_W = 0.082, STEP_Z = 0.03;
  const CARDS = (opts.cards ?? []).map((c, i) => {
    const d = Math.round((day(c.date) - D0) / 864e5);
    if (!(d >= 0 && d <= DAYS)) throw new Error(`beat "skill-stack": card ${c.file} (${c.date}) is outside ${opts.from}–${opts.to}`);
    return { ...c, i, d, pic: kit.picture(c.file, PIC_W) };
  }).sort((a, b) => a.d - b.d).map((c, i) => ({ ...c, i, x: 0.02 + i * (STEP_W + 0.004), top: 0.052 + i * 0.034 }));
  const whenDay = (d) => { for (let g = FLIP[0]; g < LOCK; g += 0.005) if (nAt(g) >= d - 0.5) return g; return LOCK - 0.25; };
  CARDS.forEach((c) => { c.t = Math.max(FLIP[0] + 0.3, whenDay(c.d)); });
  const FALL = 0.3, HOP = 0.34;
  // the toy's hops: onto step i once it has landed and the hop before is done
  const SPOT0 = at(-0.065, 0, STEP_Z);
  const HOPS = [];
  CARDS.forEach((c, i) => {
    const t0 = Math.max(c.t + 0.04, i ? HOPS[i - 1].t1 + 0.04 : 0);
    HOPS.push({ t0, t1: t0 + HOP, a: i ? HOPS[i - 1].b : SPOT0, b: at(c.x, c.top, STEP_Z) });
  });
  if (HOPS.length && HOPS[HOPS.length - 1].t1 > LOCK - 0.1) throw new Error(`beat "skill-stack": the toy's last hop ends at ${HOPS[HOPS.length - 1].t1.toFixed(2)} s, after the lock: more "bars"`);
  const drop = (c, g) => {
    if (g < c.t - FALL) return null;
    if (g < c.t) { const u = easeIn(seg(g, c.t - FALL, c.t)); return { dy: 0.26 * (1 - u), rz: 0.4 * (1 - u), s: 1 }; }
    const b = g - c.t; return { dy: 0, rz: 0, s: 1 + 0.05 * Math.exp(-b * 12) * Math.cos(b * 30) };
  };
  function stepAt(c, g) {
    const d = drop(c, g);
    if (!d) return trs(at(c.x, c.top / 2, STEP_Z), qId(), kit.HIDDEN);
    return trs(at(c.x, c.top / 2 + d.dy, STEP_Z), qEuler(0, 0, d.rz), [d.s, d.s, d.s]);
  }
  function cardAt(c, g) {
    const d = drop(c, g);
    const home = at(c.x, c.top - c.pic.h / 2 - 0.004, STEP_Z + STEP_D / 2 + 0.0015);
    if (!d) return c.pic.at(home, qId(), 0);
    return c.pic.at(v3.add(home, [0, d.dy, 0]), qEuler(0, 0, d.rz), d.s);
  }

  // the calendar: a base, the day's page, the red month band, two rings (calendar-local m)
  const CAL = { w: 0.16, h: 0.19, d: 0.035, base: 0.025, band: 0.05 };
  const FRONT = CAL.d / 2 + 0.0004;
  const M_EM = 0.034, D_EM = 0.085;
  const MONTH = kit.readout({ fmt: (n) => `${dateOf(n).m}月`, from: 0, to: DAYS, em: M_EM, adv: glyph.adv, steps: DAYS });
  const DAY = kit.readout({ fmt: (n) => String(dateOf(n).d), from: 0, to: DAYS, em: D_EM, adv: glyph.adv, steps: DAYS });
  function calAt(g) {
    if (g < RISE[0]) return hidden(at(CALX, -0.3, 0));
    const u = seg(g, RISE[0], RISE[1]), hit = g - LOCK;
    const jolt = hit > 0 ? 0.04 * Math.exp(-hit * 10) * Math.cos(hit * 35) : 0;
    return trs(at(CALX, lerp(-0.25, 0, Math.min(1, backOut(u, 1.4))), 0), qEuler(0, 0.12, 0), [1 + jolt, 1 - jolt, 1 + jolt]);
  }
  // the pages that flip away, hinged under the band, over the top to the back
  const FLIPS = 2;
  function flipAt(i, g, cal) {
    const top = CAL.base + CAL.h - CAL.band;
    const off = mulT(cal, trs([0, top, 0], qId(), kit.HIDDEN));
    if (g < FLIP[0] || g >= FLIP[1]) return off;
    const n = nAt(g), rate = (nAt(g + 0.01) - n) / 0.01;
    if (i > 0 && rate < 6) return off;
    const p = (((n + i / FLIPS) % 1) + 1) % 1;
    if (p > 0.62) return off;
    return mulT(cal, mulT(trs([0, top, FRONT + 0.0015], qAxis([1, 0, 0], -Math.PI * easeOut(Math.min(1, p * 1.6)))), trs([0, -(CAL.h - CAL.band) / 2, 0])));
  }
  // the stamp slammed onto the page on the lock
  const STAMP = [...String(opts.stamp ?? "")].filter((c) => !/\s/.test(c)), S_EM = 0.036;
  const SW = STAMP.reduce((w, c) => w + glyph.adv(`heavy:${c}`) * S_EM, 0);
  function stampAt(g, cal) {
    const home = mulT(cal, trs([0.004, CAL.base + 0.03, FRONT + 0.004], qEuler(0, 0, -0.12), 0.85));
    if (g < LOCK - 0.25) return trs(home.p, home.q, kit.HIDDEN);
    if (g < LOCK) {
      const u = easeIn(seg(g, LOCK - 0.25, LOCK));
      return trs(v3.lerp(v3.add(home.p, [0.05, 0.2, 0.3]), home.p, u), qMul(home.q, qEuler(0.6 * (1 - u), 0, 0.5 * (1 - u))), home.s.map((v) => v * lerp(2.0, 1, u)));
    }
    const b = g - LOCK, sq = 0.22 * Math.exp(-b * 14) * Math.cos(b * 40);
    return trs(home.p, home.q, [home.s[0] * (1 + sq), home.s[1] * (1 - sq), home.s[2]]);
  }
  // the count beside it (optional)
  const C = opts.count ?? null;
  const FMT = C ? { decimals: C.decimals ?? 0, sep: C.sep ?? ",", unit: C.unit ?? "" } : null;
  const C_EM = 0.04, L_EM = C_EM * 0.45;
  const NUM = C ? kit.readout({ fmt: (v) => kit.formatCount(v, FMT), from: C.from ?? 0, to: C.to, em: C_EM, adv: glyph.adv }) : null;
  const LABEL = C ? [...String(C.label ?? "")].filter((c) => !/\s/.test(c)) : [];
  // the creator's dated milestones, as [day of the span, value], from the first day to the last
  const KEYS = C?.keys ? [[0, C.from ?? 0], ...C.keys.map(([d, v]) => [Math.round((day(d) - D0) / 864e5), v]), [DAYS, C.to]] : null;
  if (KEYS?.some(([d, v], i) => i && (d < KEYS[i - 1][0] || v < KEYS[i - 1][1] || d > DAYS))) throw new Error(`beat "skill-stack": count.keys must run in date order within ${opts.from}–${opts.to}, each value at least the one before and at most "to"`);
  const onDay = (n) => {
    const i = KEYS.findIndex(([d]) => d >= n);
    if (i <= 0) return KEYS[Math.max(0, i)][1];
    // it rolls on while the page before turns, and reads the milestone by the time its day shows (the day rounds at .5)
    const [d0, v0] = KEYS[i - 1], [d1, v1] = KEYS[i], roll = Math.min(1, d1 - d0);
    return v0 + (v1 - v0) * smooth(seg(n, d1 - roll, d1 - roll / 2));
  };
  const countAt = (g) => (g >= LOCK ? C.to : g < FLIP[0] ? (C.from ?? 0) : Math.floor(KEYS ? onDay(nAt(g)) : (C.from ?? 0) + (C.to - (C.from ?? 0)) * Math.pow(flipS(g), 1.8)));
  function countGroup(g) {
    const u = seg(g, LABEL_IN - 0.2, LABEL_IN + 0.2);
    const punch = g > LOCK ? 0.09 * Math.exp(-(g - LOCK) * 9) * Math.cos((g - LOCK) * 30) : 0;
    return trs(at(0.005, 0.262, -0.02), qEuler(-0.05, 0, 0), u > 0 ? Math.max(kit.HIDDEN, backOut(u, 1.6) * (1 + punch)) : kit.HIDDEN);
  }
  const keys = [...MONTH.names, ...DAY.names, ...(NUM ? NUM.names : [])].map((n) => n.key).concat([...STAMP, ...LABEL].map((c) => `heavy:${c}`));
  const missing = [...new Set(keys)].filter((k) => !glyph.has(k));
  if (missing.length) throw new Error(`beat "skill-stack": no lettering for ${missing.join(" ")} yet: run the glyph step (run.mjs glyphs)`);

  // the toy, right of the calendar, pointing at it while the pages fly, then up the steps as they land
  const spotAt = (g) => { let p = SPOT0; for (const h of HOPS) if (g >= h.t1) p = h.b; return p; };
  function pose(g) {
    const here = spotAt(g);
    const o = kit.stand(here);
    o.pop = 1;
    if (g < DROP[1]) return kit.dropIn(o, g, DROP[0], DROP[1], SPOT0);
    if (g >= LEAP[0]) return kit.leapOut(o, g, LEAP[0], LEAP[1], here);
    const hop = HOPS.find((h) => g >= h.t0 && g < h.t1);
    if (hop) { kit.hop(o, g, hop.a, hop.b, hop.t0, hop.t1, 0.06); return o; }
    let q = kit.landSquash(g, DROP[1], 0.26) + kit.crouch(g, LEAP[0], 0.16);
    for (const h of HOPS) { q += kit.landSquash(g, h.t1, 0.18); q += kit.crouch(g, h.t0, 0.12); }
    const first = HOPS.length ? HOPS[0].t0 : LOCK;
    const last = HOPS.length ? HOPS[HOPS.length - 1].t1 : LOCK;
    o.yaw = g < first ? lerp(0, -0.55, smooth(seg(g, RISE[0], RISE[0] + 0.4))) : lerp(0.5, 0, smooth(seg(g, last, last + 0.4)));
    const k = smooth(seg(g, FLIP[0] - 0.3, FLIP[0])) * (1 - smooth(seg(g, first - 0.2, first)));
    if (k > 0) { o.aimR = { world: apply(calAt(g), [0, CAL.base + 0.1, FRONT]), k, len: 1.1 }; o.pointR = k; o.head = [-0.1 * k, -0.15 * k, 0]; }
    if (g >= CHEER[0] && g < CHEER[1] + 0.1) q += kit.cheer(o, g, CHEER[0], CHEER[1]);
    kit.squash(o, q);
    return o;
  }

  const hfov = 2 * Math.atan(Math.tan((fov * Math.PI) / 360) * aspect);
  const D = (0.3 / Math.tan(hfov / 2)) * 1.1;
  const camera = kit.cameraFrom([
    { t: 0, target: at(-0.06, 0.13, 0), dist: D * 1.15, elev: 9, az: 0, fstop: 6 },
    { t: FLIP[0], target: at(-0.02, 0.14, 0), dist: D * 1.12, elev: 8, az: 0, fstop: 6 },
    { t: LOCK - 0.1, target: at(0.02, 0.16, 0), dist: D * 1.06, elev: 8, az: 2, fstop: 6 },
    { t: CHEER[1], target: at(0.02, 0.16, 0), dist: D * 1.1, elev: 8, az: 0, fstop: 6 },
    { t: len, target: at(0.0, 0.17, 0), dist: D * 1.14, elev: 9, az: 0, fstop: 6 },
  ], { fov, aspect, shakes: [[LOCK, 0.7]] });

  const CONF = 16, COLS = pop.confetti;
  const date = (s) => { const { m, d } = dateOf(Math.round((day(s) - D0) / 864e5)); return `${m}月${d}日`; };
  const span = `${date(opts.from)} → ${date(opts.to)}`;
  const box = (name, size, color, emit = 0) => ({ name, geo: { type: "roundBox", size, radius: 0.003 }, mat: { type: "type", color, emit }, anim: true });
  return {
    declare(add) {
      add({ name: "floor", geo: { type: "plane", w: 6, h: 6 }, mat: { type: "stage" }, anim: true });
      add({ ...box("base", [CAL.w + 0.02, CAL.base, CAL.d + 0.05], "#2B2E35"), geo: { type: "roundBox", size: [CAL.w + 0.02, CAL.base, CAL.d + 0.05], radius: 0.004 } });
      add({ name: "page", geo: { type: "roundBox", size: [CAL.w, CAL.h - CAL.band, CAL.d], radius: 0.003 }, mat: { type: "paper", color: "#F7F4EE" }, anim: true });
      add(box("band", [CAL.w + 0.001, CAL.band, CAL.d + 0.001], "#D93A2B", 0.06));
      [-1, 1].forEach((k) => add({ ...box(`ring${k}`, [0.012, 0.022, 0.012], "#C9CDD3"), geo: { type: "roundBox", size: [0.012, 0.022, 0.012], radius: 0.004 } }));
      for (const n of MONTH.names) add({ name: `m_${n.name}`, letter: n.key.split(":")[1], geo: glyph.geo(n.key, M_EM, 0.002, 0.0003), mat: { type: "type", color: "#FFF6E8", emit: 0.25 }, anim: true, step: true });
      for (const n of DAY.names) add({ name: `d_${n.name}`, letter: n.key.split(":")[1], geo: glyph.geo(n.key, D_EM, 0.004, 0.0005), mat: { type: "type", color: "#1B1C20", emit: 0 }, anim: true, step: true });
      for (let i = 0; i < FLIPS; i++) add({ name: `flip${i}`, geo: { type: "roundBox", size: [CAL.w - 0.002, CAL.h - CAL.band, 0.0008], radius: 0.001 }, mat: { type: "paper", color: "#F7F4EE" }, anim: true });
      if (STAMP.length) {
        add({ ...box("stamp", [SW + 0.03, 0.052, 0.006], "#D93A2B", 0.12), geo: { type: "roundBox", size: [SW + 0.03, 0.052, 0.006], radius: 0.006 } });
        STAMP.forEach((c, i) => add({ name: `s${i}`, letter: c, geo: glyph.geo(`heavy:${c}`, S_EM, 0.002, 0.0003), mat: { type: "type", color: "#FFF6E8", emit: 0.25 }, anim: true }));
      }
      if (NUM) {
        for (const n of NUM.names) add({ name: `c_${n.name}`, letter: n.key.split(":")[1], geo: glyph.geo(n.key, C_EM, 0.01, 0.001), mat: { type: "type", color: "#F4F6F8", emit: 0.55 }, anim: true, step: true });
        LABEL.forEach((c, i) => add({ name: `cl${i}`, letter: c, geo: glyph.geo(`heavy:${c}`, L_EM, 0.005, 0.0005), mat: { type: "type", color: "#AEB4BA", emit: 0.35 }, anim: true }));
      }
      for (const c of CARDS) {
        add({ name: `step${c.i}`, geo: { type: "roundBox", size: [STEP_W, c.top, STEP_D], radius: 0.004 }, mat: { type: "type", color: "#2B2E35", emit: 0 }, anim: true });
        add({ name: `card${c.i}`, geo: c.pic.geo, mat: c.pic.mat, anim: true });
      }
      for (let i = 0; i < CONF; i++) add({ name: `conf${i}`, geo: { type: "box", size: [0.008, 0.0008, 0.006] }, mat: { type: "flake" }, anim: true, colorAnim: true });
    },
    sample(put, g, putColor) {
      put("floor", trs(at(0, 0, 0), qEuler(-Math.PI / 2, 0, 0)));
      const on = g >= 0 && g < len, gg = on ? g : -1;
      const cal = calAt(gg);
      put("base", mulT(cal, trs([0, CAL.base / 2, 0])));
      put("page", mulT(cal, trs([0, CAL.base + (CAL.h - CAL.band) / 2, 0])));
      put("band", mulT(cal, trs([0, CAL.base + CAL.h - CAL.band / 2, 0])));
      [-1, 1].forEach((k) => put(`ring${k}`, mulT(cal, trs([k * 0.045, CAL.base + CAL.h + 0.006, 0]))));
      const n = nAt(gg);
      const yb = CAL.base + CAL.h - CAL.band / 2 - 0.36 * M_EM;
      for (const [name, tr] of Object.entries(MONTH.at(n, mulT(cal, trs([MONTH.width(n) / 2, yb, FRONT + 0.0012]))))) put(`m_${name}`, tr);
      for (const [name, tr] of Object.entries(DAY.at(n, mulT(cal, trs([DAY.width(n) / 2, CAL.base + 0.06, FRONT + 0.0006]))))) put(`d_${name}`, tr);
      for (let i = 0; i < FLIPS; i++) put(`flip${i}`, flipAt(i, gg, cal));
      if (STAMP.length) {
        const st = stampAt(gg, cal);
        put("stamp", st);
        let x = -SW / 2;
        STAMP.forEach((c, i) => { put(`s${i}`, mulT(st, trs([x, -0.36 * S_EM, 0.0032]))); x += glyph.adv(`heavy:${c}`) * S_EM; });
      }
      if (NUM) {
        const grp = countGroup(gg);
        const v = countAt(gg);
        for (const [name, tr] of Object.entries(NUM.at(v, mulT(grp, trs([NUM.width(C.to) / 2, 0, 0]))))) put(`c_${name}`, tr);
        const LW = LABEL.reduce((w, c) => w + glyph.adv(`heavy:${c}`) * L_EM, 0);
        let x = -LW / 2;
        LABEL.forEach((c, i) => { put(`cl${i}`, mulT(grp, trs([x, -L_EM * 1.6, 0.002]))); x += glyph.adv(`heavy:${c}`) * L_EM; });
      }
      CARDS.forEach((c) => { put(`step${c.i}`, stepAt(c, gg)); put(`card${c.i}`, cardAt(c, gg)); });
      const r = mulberry32(900);
      for (let i = 0; i < CONF; i++) {
        const f = kit.confetti(i, gg, LOCK, at(-0.05, 0.16, 0.05), COLS, r);
        put(`conf${i}`, f.tr);
        putColor(`conf${i}`, f.color);
      }
    },
    pose,
    camera,
    light: (g) => ({ p: at(0.05, 0.2, 0.18), energy: 0.25 + (g >= LOCK ? 1.6 * Math.exp(-(g - LOCK) / 0.22) : 0), color: "#FFE6CC" }),
    cues(add) {
      add(DROP[0], "whooshDown", { dur: 0.45 });
      add(DROP[1], "pomf");
      add(RISE[0], "stand", { dur: RISE[1] - RISE[0] });
      add(FLIP[0], "ticker", { dur: FLIP[1] - FLIP[0] });
      CARDS.forEach((c) => add(c.t, "pomf", { soft: true }));
      HOPS.forEach((h, i) => { add(h.t0, "boing"); add(h.t1, "pomf", i === HOPS.length - 1 ? { big: true } : { soft: true }); });
      add(LOCK, "lock", { big: true });
      add(LOCK + 0.02, "sparkle");
      if (STAMP.length) add(LOCK + 0.04, "slam");
      add(CHEER[0], "boing");
      add(CHEER[1] - 0.05, "pomf", { soft: true });
      add(LEAP[0], "boing", { long: true });
      add(LEAP[0] + 0.05, "whooshUp", { dur: 0.45 });
    },
    // what the viewer reads (engine/lib/pacing.py): the last day, the count and the stamp, from when the label comes in
    reads: [{ text: [date(opts.to), C ? kit.formatCount(C.to, FMT) + (LABEL.length ? ` ${LABEL.join("")}` : "") : "", STAMP.join("")].filter(Boolean).join(" "), at: [RISE[0], len], whole: LOCK }],
    music: { groove: "light", chords: ["Em", "C", "G", "D"], hits: [LOCK] },
    storyboard: {
      part: {
        label: { "zh-Hant": "八十天", "zh-Hans": "八十天", en: "Eighty days" },
        what: { "zh-Hant": `日曆從 ${span} 越翻越快，粉絲數照當天紀錄往上跳，每翻到一篇作品的發文日，那篇就落成一階樓梯，公仔跳上去；最後停在重拍上${STAMP.length ? `，蓋上「${STAMP.join("")}」` : ""}`, "zh-Hans": `日历从 ${span} 越翻越快，粉丝数照当天记录往上跳，每翻到一篇作品的发文日，那篇的卡片就叠到旁边；最后停在重拍上${STAMP.length ? `，盖上「${STAMP.join("")}」` : ""}`, en: `A flip calendar runs ${span}, the count climbing through the dated milestones; each piece of work drops onto a deck on the day it was posted; it stops on the downbeat${STAMP.length ? ` under a stamp: ${STAMP.join("")}` : ""}` },
        uses: { "zh-Hant": "他自己的粉絲紀錄（growth_log）與四篇作品的發文日", "zh-Hans": "他自己的粉丝记录与四篇作品的发文日", en: "his own follower log and four posts' dates" },
        why: { "zh-Hant": "這一萬是一篇篇作品累積出來的時間軸（只標日期，不說哪篇帶多少粉）", "zh-Hans": "这一万是一篇篇作品累积出来的时间轴（只标日期）", en: "the ten thousand as a timeline of work (dates only, no claim of cause)" },
      },
      frames: [
        { at: CARDS.length ? CARDS[Math.min(1, CARDS.length - 1)].t + 0.2 : (FLIP[0] + FLIP[1]) / 2, title: { "zh-Hant": "作品疊上來", "zh-Hans": "作品叠上来", en: "The work stacks up" }, what: { "zh-Hant": "作品照發文日一階階落下，公仔一路跳上去", "zh-Hans": "公仔指着日历，作品卡照发文日落下", en: "The toy points; cards drop on their days" } },
        { at: LOCK + 0.3, title: { "zh-Hant": "破萬", "zh-Hans": "破万", en: "Ten thousand" }, what: { "zh-Hant": "停在 11/6，蓋章", "zh-Hans": "停在 11/6，盖章", en: "It stops; the stamp" } },
      ],
      hits: [{ at: LOCK, label: { "zh-Hant": "停", "zh-Hans": "停", en: "stop" } }],
    },
  };
}
