// A wall of the creator's animation Skills, filled hop by hop (a film-local beat): the toy drops in at the left
// and hops along the floor, one hop a beat; each time he lands, the column of cards above him pops up behind,
// each card playing its own Skill's sample film (the same flying car in a different style on many of them).
// Then the count of such Skills rolls up on the floor in front and locks on the downbeat; he cheers and leaps out.
//
// film.json, in story.segments:
//   { "beat": "beats/sketchry-wall.js", "bars": 3, "cards": ["assets/sketchry/retrocel", …],
//     "count": { "to": 50, "label": "種動畫 Skill" } }
// "cards": film-relative paths without extension: <path>.jpg (a still, for the size) and <path>.mp4 (its film).
export function makeBeat({ opts, len, bar, beat, at, fov, aspect, glyph, kit, math, quat, pop, mulberry32 }) {
  const { seg, smooth, lerp, easeOut, backOut, v3 } = math;
  const { trs, qId, qEuler, mulT, apply } = quat;
  if (len < 3 * bar - 1e-6) throw new Error('beat "sketchry-wall" needs "bars": 3 or more');
  const FILES = opts.cards ?? [];
  const ROWS = 2, COLS = Math.ceil(FILES.length / ROWS);
  if (FILES.length < 4) throw new Error('beat "sketchry-wall" needs 4 "cards" or more');

  // when (seconds into the beat): the drop, then a hop a beat, the count, the lock on the second downbeat
  const DROP = [0.05, 0.5];
  const HOP = beat * 0.8;
  const LANDS = Array.from({ length: COLS }, (_, i) => DROP[1] + i * beat); // he lands under column i
  const LOCK = Math.max(2 * bar, LANDS[COLS - 1] + bar);
  const COUNT = [LANDS[COLS - 1] + 0.3, LOCK];
  const CHEER = [LOCK + 0.12, LOCK + 0.72], LEAP = [len - 0.5, len];
  if (LEAP[0] < LOCK + 0.8) throw new Error(`beat "sketchry-wall": ${COLS} columns need "bars": ${Math.ceil((LOCK + 1.3) / bar)} or more`);

  // the wall: ROWS × COLS cards behind the floor the toy hops along
  const WALL_W = 0.66, CW = WALL_W / COLS, GAP = 0.012;
  const PICS = FILES.map((f) => kit.picture(`${f}.jpg`, CW - GAP, { movie: `${f}.mp4`, frames: (opts.framesOf ?? {})[f.split("/").pop()] ?? opts.frames ?? 240, start: 1 + Math.round(mulberry32(f.length * 7)() * 200) }));
  const CH = PICS[0].h;
  const WALL_Z = -0.09, WALL_Y0 = 0.105; // the lower row's middle
  const X = (c) => (c - (COLS - 1) / 2) * CW + 0.02;
  const cellAt = (i) => ({ c: i % COLS, r: Math.floor(i / COLS) });
  function cardAt(i, g) {
    const { c, r } = cellAt(i);
    const home = at(X(c), WALL_Y0 + (ROWS - 1 - r) * (CH + GAP), WALL_Z);
    const t0 = LANDS[c] + r * 0.08;
    if (g < t0) return PICS[i].at(v3.add(home, [0, -0.1, 0]), qId(), 0);
    const u = seg(g, t0, t0 + 0.32);
    const k = backOut(u, 1.7);
    const b = g - LOCK, jolt = b > 0 ? 0.03 * Math.exp(-b * 10) * Math.cos(b * 30) : 0;
    return PICS[i].at(v3.add(home, [0, -0.06 * (1 - easeOut(u)), 0]), qEuler(0.4 * (1 - easeOut(u)), 0, 0), Math.max(kit.HIDDEN, k * (1 + jolt)));
  }

  // the toy: hops along the floor in front of the wall, a column at a time
  const FLOOR_Z = 0.06;
  const spot = (c) => at(X(c), 0, FLOOR_Z);
  const HOPS = LANDS.slice(1).map((t1, i) => ({ t0: t1 - HOP, t1, a: spot(i), b: spot(i + 1) }));
  const END = spot(COLS - 1);
  function pose(g) {
    let here = spot(0);
    for (const h of HOPS) if (g >= h.t1) here = h.b;
    const o = kit.stand(here);
    o.pop = 1;
    if (g < DROP[1]) return kit.dropIn(o, g, DROP[0], DROP[1], spot(0));
    if (g >= LEAP[0]) return kit.leapOut(o, g, LEAP[0], LEAP[1], END);
    const hop = HOPS.find((h) => g >= h.t0 && g < h.t1);
    if (hop) { kit.hop(o, g, hop.a, hop.b, hop.t0, hop.t1, 0.07); return o; }
    let q = kit.landSquash(g, DROP[1], 0.24) + kit.crouch(g, LEAP[0], 0.16);
    for (const h of HOPS) { q += kit.landSquash(g, h.t1, 0.2); q += kit.crouch(g, h.t0, 0.1); }
    // after the last hop he turns to the count on the floor and points at it, then to the camera
    const last = LANDS[COLS - 1];
    o.yaw = lerp(0.6, -0.5, smooth(seg(g, last, last + 0.3)));
    const k = smooth(seg(g, COUNT[0], COUNT[0] + 0.25)) * (1 - smooth(seg(g, LOCK - 0.05, LOCK + 0.15)));
    if (k > 0) { o.aimR = { world: C_AT, k, len: 1.1 }; o.pointR = k; o.head = [-0.15 * k, -0.1 * k, 0]; }
    if (g >= LOCK) o.yaw = lerp(-0.5, 0, smooth(seg(g, LOCK, LOCK + 0.3)));
    if (g >= CHEER[0] && g < CHEER[1] + 0.1) q += kit.cheer(o, g, CHEER[0], CHEER[1]);
    kit.squash(o, q);
    return o;
  }

  // the count on the floor in front of the wall, left of where he ends
  const C = opts.count ?? { to: FILES.length, label: "" };
  const C_EM = 0.05;
  const NUM = kit.readout({ fmt: (v) => kit.formatCount(v), from: 0, to: C.to, em: C_EM, adv: glyph.adv });
  const missing = [...new Set(NUM.names.map((n) => n.key))].filter((k) => !glyph.has(k));
  if (missing.length) throw new Error(`beat "sketchry-wall": no lettering for ${missing.join(" ")} yet: run the glyph step (run.mjs glyphs)`);
  const LAB = C.label ? kit.line(glyph, C.label, 0.034) : null;
  const NW = NUM.width(C.to), GAPW = 0.012, TOTAL = NW + GAPW + (LAB ? LAB.W : 0);
  const C_AT = at(-0.06, 0.0, 0.11);
  let FACE = null;
  const countAt = (g) => (g >= LOCK ? C.to : g < COUNT[0] ? 0 : Math.floor(C.to * easeOut(seg(g, COUNT[0], COUNT[1]))));
  const cK = (g) => { const u = seg(g, COUNT[0] - 0.1, COUNT[0] + 0.2); const b = g - LOCK, punch = b > 0 ? 0.1 * Math.exp(-b * 9) * Math.cos(b * 30) : 0; return u > 0 ? Math.max(kit.HIDDEN, backOut(u, 1.6) * (1 + punch)) : kit.HIDDEN; };

  const hfov = 2 * Math.atan(Math.tan((fov * Math.PI) / 360) * aspect);
  const D = (0.3 / Math.tan(hfov / 2)) * 1.1;
  const camera = kit.cameraFrom([
    { t: 0, target: at(0.0, 0.15, 0), dist: D * 1.2, elev: 8, az: -3, fstop: 7 },
    { t: LANDS[COLS - 1], target: at(0.02, 0.15, 0), dist: D * 1.14, elev: 8, az: 0, fstop: 7 },
    { t: LOCK, target: at(0.01, 0.14, 0), dist: D * 1.1, elev: 9, az: 2, fstop: 7 },
    { t: len, target: at(0.01, 0.15, 0), dist: D * 1.16, elev: 9, az: 0, fstop: 7 },
  ], { fov, aspect, shakes: [[LOCK, 0.6]] });

  const CONF = 16, COLS_C = pop.confetti;
  return {
    declare(add) {
      add({ name: "floor", geo: { type: "plane", w: 6, h: 6 }, mat: { type: "stage" }, anim: true });
      PICS.forEach((p, i) => add({ name: `card${i}`, geo: p.geo, mat: p.mat, anim: true }));
      for (const n of NUM.names) add({ name: `c_${n.name}`, letter: n.key.split(":")[1], geo: glyph.geo(n.key, C_EM, 0.012, 0.001), mat: { type: "type", color: "#FF8A3D", emit: 0.5 }, anim: true, step: true });
      if (LAB) kit.declareLine(add, "cl", LAB, { color: "#F4F1EA", emit: 0.35 });
      for (let i = 0; i < CONF; i++) add({ name: `conf${i}`, geo: { type: "box", size: [0.008, 0.0008, 0.006] }, mat: { type: "flake" }, anim: true, colorAnim: true });
    },
    sample(put, g, putColor) {
      put("floor", trs(at(0, 0, 0), qEuler(-Math.PI / 2, 0, 0)));
      const on = g >= 0 && g < len, gg = on ? g : -1;
      PICS.forEach((_, i) => put(`card${i}`, cardAt(i, gg)));
      const k = cK(gg);
      const CQ = (FACE ??= kit.facing(camera(LOCK).pos, C_AT));
      const grp = trs(C_AT, CQ, k);
      // the number's right end at the label's left; the two centred together on C_AT, standing on the floor
      for (const [name, tr] of Object.entries(NUM.at(countAt(gg), mulT(grp, trs([-TOTAL / 2 + NW, 0.004, 0]))))) put(`c_${name}`, tr);
      if (LAB) kit.putLine(put, "cl", LAB, (it) => apply(grp, [-TOTAL / 2 + NW + GAPW + LAB.W / 2 + it.x, LAB.stand + 0.004, 0]), CQ, () => k);
      const r = mulberry32(50);
      for (let i = 0; i < CONF; i++) {
        const f = kit.confetti(i, gg, LOCK, at(0.0, 0.12, 0.08), COLS_C, r);
        put(`conf${i}`, f.tr);
        putColor(`conf${i}`, f.color);
      }
    },
    pose,
    camera,
    light: (g) => ({ p: at(0.0, 0.22, 0.22), energy: 0.25 + (g >= LOCK ? 1.4 * Math.exp(-(g - LOCK) / 0.22) : 0), color: "#FFE6CC" }),
    cues(add) {
      add(DROP[0], "whooshDown", { dur: 0.45 });
      add(DROP[1], "pomf");
      LANDS.forEach((t, i) => { add(t, "pop"); if (i) add(t - HOP, "boing"); });
      add(COUNT[0], "ticker", { dur: COUNT[1] - COUNT[0] });
      add(LOCK, "lock", { big: true });
      add(LOCK + 0.02, "sparkle");
      add(CHEER[0], "boing");
      add(CHEER[1] - 0.05, "pomf", { soft: true });
      add(LEAP[0], "boing", { long: true });
      add(LEAP[0] + 0.05, "whooshUp", { dur: 0.45 });
    },
    reads: [{ text: `${kit.formatCount(C.to)} ${C.label ?? ""}`.trim(), at: [COUNT[0] - 0.1, len], whole: LOCK }],
    music: { groove: "normal", chords: ["C", "D", "Em", "D"], hits: LANDS.concat([LOCK]) },
    storyboard: {
      part: {
        label: { "zh-Hant": "網站牆", "zh-Hans": "动画墙", en: "The wall" },
        what: { "zh-Hant": `公仔在地上一拍跳一下，每落地一次，背後就彈出一排 Sketchry 網站 Skill 的卡片，卡片裡的網站示範在播；最後地上打出「${kit.formatCount(C.to)} ${C.label ?? ""}」`, "zh-Hans": `公仔一拍跳一下，每落地一次背后弹出一排 Sketchry 动画 Skill 卡片；最后地上打出数字`, en: `The toy hops a beat at a time; each landing pops a column of his Sketchry animation Skills behind him, each playing its sample; then ${kit.formatCount(C.to)} rolls up on the floor` },
        uses: { "zh-Hant": "Sketchry 上他自己做的網站 Skill 示範影片", "zh-Hans": "Sketchry 上他自己做的动画 Skill 示范影片", en: "his own animation Skills' sample films on Sketchry" },
        why: { "zh-Hant": "他每天實測的成果都做成能抄的 Skill，光網站就有這麼多種", "zh-Hans": "他每天实测的成果都做成能抄的 Skill", en: "what he tests every day becomes Skills anyone can copy" },
      },
      frames: [
        { at: LANDS[Math.min(2, COLS - 1)] + 0.2, title: { "zh-Hant": "跳跳跳", "zh-Hans": "跳跳跳", en: "Hop, hop, hop" }, what: { "zh-Hant": "公仔每跳一下，背後彈出一排作品", "zh-Hans": "公仔每跳一下背后弹出一排作品", en: "Each hop pops a column of cards" } },
        { at: LOCK + 0.3, title: { "zh-Hant": "整面牆", "zh-Hans": "整面墙", en: "The whole wall" }, what: { "zh-Hant": `${kit.formatCount(C.to)} ${C.label ?? ""}`, "zh-Hans": "数字锁定", en: "The count locks" } },
      ],
      hits: [{ at: LOCK, label: { "zh-Hant": "鎖", "zh-Hans": "锁", en: "lock" } }],
    },
  };
}
