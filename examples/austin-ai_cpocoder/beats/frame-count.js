// A practice clip as a strip of film (a film-local beat): the creator's own words come up first, small, over the
// stage ("quote"); then the frames of the clip run past behind the toy like a strip of film, slowing until the
// one that matters stops in the middle; the rest fall away and that frame grows into a big card (the analysed
// frame, both skeletons); beside it a count rolls with the strip and locks on the number of frames, and on the
// downbeat a second line comes in under it. The toy drops in, watches the strip go by, points at the card, cheers
// and leaps out.
//
// film.json, in story.segments:
//   { "beat": "beats/frame-count.js", "bars": 3, "quote": "最近學網球動作有點挫折",
//     "frames": "assets/work/film", "card": "assets/work/tennis-skeleton.jpg",
//     "count": { "to": 821, "label": "格畫面" }, "sub": "33 個關節點" }
// "frames": a folder of the clip's frames in order, the last the one it stops on; "card": that frame, sharper.
export function makeBeat({ opts, len, bar, at, fov, aspect, glyph, kit, math, quat, pop, mulberry32 }) {
  const { seg, smooth, lerp, easeOut, easeInOut, backOut, v3 } = math;
  const { trs, qId, qEuler, qMul, mulT, apply } = quat;
  if (len < 3 * bar - 1e-6) throw new Error('beat "frame-count" needs "bars": 3 or more');
  if (!opts.frames || !opts.card) throw new Error('beat "frame-count" needs "frames" (a folder) and "card" (a picture)');

  // when (seconds into the beat)
  const DROP = [0.05, 0.5];
  const LOCK = len - bar, STOP = LOCK - 1.5;
  const Q_IN = [0.35, 0.35 + 0.05 * [...String(opts.quote ?? "")].length + 0.2], Q_OUT = [LOCK + 0.1, LOCK + 0.4];
  const RUN = [0.55, STOP];
  const GROW = [STOP, STOP + 0.45];
  const CHEER = [LOCK + 0.12, LOCK + 0.72], LEAP = [len - 0.5, len];
  const run = (g) => easeOut(seg(g, RUN[0], RUN[1]), 2.4);

  // the strip: the frames side by side, coming in from the right and stopping with the last one at MID
  const FILES = kit.pictureFiles(opts.frames);
  if (FILES.length < 3) throw new Error(`beat "frame-count": ${opts.frames} needs 3 frames or more`);
  const N = FILES.length, FW = 0.14, PITCH = FW * 1.08, OFF = 1.35;
  const FR = FILES.map((f) => kit.picture(f, FW));
  const FH = FR[0].h;
  const MID = at(0.02, FH / 2 + 0.017, -0.03), TILT = qEuler(-0.04, 0, 0);
  const frameX = (i, g) => MID[0] - (N - 1 - i) * PITCH + OFF * (1 - run(g));
  const fade = (g) => 1 - smooth(seg(g, GROW[0], GROW[0] + 0.3));
  function frameAt(i, g, fr) {
    if (g < RUN[0] - 0.05) return fr.at(MID, TILT, 0);
    if (i === N - 1 && g >= GROW[0]) return fr.at(MID, TILT, 0);
    return fr.at([frameX(i, g), MID[1], MID[2]], TILT, Math.max(kit.HIDDEN, fade(g)));
  }
  // its band and sprocket holes, moving with it
  const BAND_H = FH + 0.03, HOLES = 30, HS = 0.03;
  const bandK = (g) => smooth(seg(g, RUN[0] - 0.25, RUN[0] + 0.05)) * fade(g);
  const holeX = (k, g) => { const span = HOLES * HS, x = k * HS + OFF * (1 - run(g)); return MID[0] - span / 2 + (((x % span) + span) % span); };

  // the big card: the stopped frame, grown in front of where it stopped
  const CW = 0.3, CARD = kit.picture(opts.card, CW);
  const HOME = at(0.0, 0.052 + CARD.h / 2, 0.0), CARD_Q = qEuler(-0.04, 0.08, 0);
  function cardAt(g) {
    if (g < GROW[0]) return CARD.at(HOME, CARD_Q, 0);
    const u = backOut(seg(g, GROW[0], GROW[1]), 1.3);
    const p = v3.lerp(MID, HOME, Math.min(1, u)), k = lerp(FW / CW, 1, u);
    const b = g - LOCK, jolt = b > 0 ? 0.035 * Math.exp(-b * 10) * Math.cos(b * 32) : 0;
    return CARD.at(p, CARD_Q, Math.max(kit.HIDDEN, k * (1 + jolt)));
  }

  // the words: the quote over the stage; the count and its label beside the card; the line under it on the lock
  const Q = opts.quote ? kit.line(glyph, opts.quote, opts.quoteEm ?? 0.024) : null;
  const Q_AT = at(0.03, 0.272, -0.02);
  const C = opts.count ?? { to: N, label: "" };
  const C_EM = 0.042;
  const NUM = kit.readout({ fmt: (v) => kit.formatCount(v), from: 0, to: C.to, em: C_EM, adv: glyph.adv });
  const LAB = C.label ? kit.line(glyph, C.label, 0.019) : null;
  const SUB = opts.sub ? kit.line(glyph, opts.sub, 0.021) : null;
  const TAG = opts.tag ? kit.line(glyph, opts.tag, 0.019) : null;
  const TAG_AT = at(0.0, 0.016, 0.03);
  const tagK = (g) => { const u = seg(g, GROW[0] + 0.25, GROW[0] + 0.55); return u > 0 ? Math.max(kit.HIDDEN, backOut(u, 1.8)) : kit.HIDDEN; };
  const C_AT = at(0.24, 0.232, 0.035), C_Q = qEuler(-0.05, -0.2, 0);
  const missing = [...new Set(NUM.names.map((n) => n.key))].filter((k) => !glyph.has(k));
  if (missing.length) throw new Error(`beat "frame-count": no lettering for ${missing.join(" ")} yet: run the glyph step (run.mjs glyphs)`);
  const countAt = (g) => (g >= STOP ? C.to : Math.floor(C.to * run(g)));
  const cK = (g) => { const u = seg(g, RUN[0] + 0.1, RUN[0] + 0.45); const b = g - STOP, punch = b > 0 ? 0.1 * Math.exp(-b * 9) * Math.cos(b * 30) : 0; return u > 0 ? Math.max(kit.HIDDEN, backOut(u, 1.6) * (1 + punch)) : kit.HIDDEN; };
  const subK = (g) => { const u = seg(g, LOCK - 0.12, LOCK + 0.18); return u > 0 ? Math.max(kit.HIDDEN, backOut(u, 1.8)) : kit.HIDDEN; };

  // the toy, to the left, watching the strip go by, then pointing at the card
  const SPOT = at(-0.215, 0, 0.07);
  function pose(g) {
    const o = kit.stand(SPOT);
    o.pop = 1;
    if (g < DROP[1]) return kit.dropIn(o, g, DROP[0], DROP[1], SPOT);
    if (g >= LEAP[0]) return kit.leapOut(o, g, LEAP[0], LEAP[1], SPOT);
    let q = kit.landSquash(g, DROP[1], 0.26) + kit.crouch(g, LEAP[0], 0.16);
    // looks up at the quote, then follows the strip, then turns to the card
    const look = smooth(seg(g, Q_IN[0], Q_IN[0] + 0.3)) * (1 - smooth(seg(g, Q_OUT[0] - 0.4, Q_OUT[0])));
    o.yaw = lerp(0, 0.6, smooth(seg(g, RUN[0], RUN[0] + 0.5)));
    o.head = [-0.18 * look, 0.1 * look, 0];
    const k = smooth(seg(g, GROW[0], GROW[0] + 0.25)) * (1 - smooth(seg(g, LOCK - 0.05, LOCK + 0.15)));
    if (k > 0) { o.aimR = { world: apply(cardAt(g), [0, 0, 0]), k, len: 1.1 }; o.pointR = k; o.head = [-0.08 * k, 0.15 * k, 0]; }
    if (g >= CHEER[0] && g < CHEER[1] + 0.1) q += kit.cheer(o, g, CHEER[0], CHEER[1]);
    kit.squash(o, q);
    return o;
  }

  const hfov = 2 * Math.atan(Math.tan((fov * Math.PI) / 360) * aspect);
  const D = (0.3 / Math.tan(hfov / 2)) * 1.1;
  const camera = kit.cameraFrom([
    { t: 0, target: at(-0.01, 0.13, 0), dist: D * 1.15, elev: 8, az: 0, fstop: 6 },
    { t: RUN[0], target: at(0.0, 0.13, 0), dist: D * 1.1, elev: 7, az: 0, fstop: 6 },
    { t: STOP, target: at(0.02, 0.13, 0), dist: D * 1.02, elev: 7, az: -2, fstop: 6 },
    { t: LOCK + 0.1, target: at(0.03, 0.13, 0), dist: D, elev: 8, az: 0, fstop: 6 },
    { t: len, target: at(0.01, 0.14, 0), dist: D * 1.08, elev: 9, az: 0, fstop: 6 },
  ], { fov, aspect, shakes: [[LOCK, 0.6]] });

  const CONF = 14, COLS = pop.confetti;
  const box = (name, size, color, emit = 0) => ({ name, geo: { type: "roundBox", size, radius: 0.002 }, mat: { type: "type", color, emit }, anim: true });
  const lineBase = (ln, p, q) => (it) => apply(trs(p, q, 1), [it.x, 0, 0]);
  return {
    declare(add) {
      add({ name: "floor", geo: { type: "plane", w: 6, h: 6 }, mat: { type: "stage" }, anim: true });
      add(box("band", [2.4, BAND_H, 0.004], "#121418"));
      for (let k = 0; k < HOLES; k++) for (const s of ["t", "b"]) add(box(`h${s}${k}`, [0.011, 0.0065, 0.002], "#C9CDD3", 0.15));
      FR.forEach((fr, i) => add({ name: `fr${i}`, geo: fr.geo, mat: fr.mat, anim: true }));
      add({ name: "card", geo: CARD.geo, mat: CARD.mat, anim: true });
      if (Q) kit.declareLine(add, "q", Q, { color: "#F4F1EA", emit: 0.3 });
      for (const n of NUM.names) add({ name: `c_${n.name}`, letter: n.key.split(":")[1], geo: glyph.geo(n.key, C_EM, 0.01, 0.001), mat: { type: "type", color: "#F4F6F8", emit: 0.55 }, anim: true, step: true });
      if (LAB) kit.declareLine(add, "cl", LAB, { color: "#AEB4BA", emit: 0.35 });
      if (SUB) kit.declareLine(add, "sub", SUB, { color: "#3CCBFF", emit: 0.5 });
      if (TAG) kit.declareLine(add, "tag", TAG, { color: "#FF8A3D", emit: 0.45 });
      for (let i = 0; i < CONF; i++) add({ name: `conf${i}`, geo: { type: "box", size: [0.008, 0.0008, 0.006] }, mat: { type: "flake" }, anim: true, colorAnim: true });
    },
    sample(put, g, putColor) {
      put("floor", trs(at(0, 0, 0), qEuler(-Math.PI / 2, 0, 0)));
      const on = g >= 0 && g < len, gg = on ? g : -1;
      const bk = Math.max(kit.HIDDEN, bandK(gg));
      put("band", trs([MID[0], MID[1], MID[2] - 0.004], TILT, [1, bk, 1]));
      for (let k = 0; k < HOLES; k++) {
        const x = holeX(k, gg), edge = Math.abs(x - MID[0]) < HOLES * HS * 0.48 ? 1 : 0;
        put(`ht${k}`, trs([x, MID[1] + (BAND_H / 2 - 0.0075) * bk, MID[2] - 0.001], TILT, Math.max(kit.HIDDEN, bk * edge)));
        put(`hb${k}`, trs([x, MID[1] - (BAND_H / 2 - 0.0075) * bk, MID[2] - 0.001], TILT, Math.max(kit.HIDDEN, bk * edge)));
      }
      FR.forEach((fr, i) => put(`fr${i}`, frameAt(i, gg, fr)));
      put("card", cardAt(gg));
      if (Q) {
        const qq = kit.facing(camera(Q_IN[1]).pos, Q_AT);
        kit.putLine(put, "q", Q, lineBase(Q, Q_AT, qq), qq, (it) => {
          const t0 = Q_IN[0] + it.i * 0.05;
          return gg < t0 ? 0 : backOut(seg(gg, t0, t0 + 0.2), 1.6) * (1 - easeInOut(seg(gg, Q_OUT[0], Q_OUT[1])));
        });
      }
      const grp = trs(C_AT, C_Q, cK(gg));
      for (const [name, tr] of Object.entries(NUM.at(countAt(gg), mulT(grp, trs([NUM.width(C.to) / 2, 0, 0]))))) put(`c_${name}`, tr);
      if (LAB) kit.putLine(put, "cl", LAB, (it) => apply(grp, [it.x, -C_EM * 0.75, 0.002]), qMul(C_Q, qId()), () => cK(gg));
      if (SUB) {
        const sp = v3.add(C_AT, [0, -0.09, 0]);
        kit.putLine(put, "sub", SUB, lineBase(SUB, sp, C_Q), C_Q, () => subK(gg));
      }
      if (TAG) kit.putLine(put, "tag", TAG, lineBase(TAG, TAG_AT, CARD_Q), CARD_Q, () => tagK(gg));
      const r = mulberry32(821);
      for (let i = 0; i < CONF; i++) {
        const f = kit.confetti(i, gg, LOCK, at(0.05, 0.13, 0.06), COLS, r);
        put(`conf${i}`, f.tr);
        putColor(`conf${i}`, f.color);
      }
    },
    pose,
    camera,
    light: (g) => ({ p: at(0.0, 0.2, 0.2), energy: 0.25 + (g >= LOCK ? 1.4 * Math.exp(-(g - LOCK) / 0.22) : 0), color: "#DDF3FF" }),
    cues(add) {
      add(DROP[0], "whooshDown", { dur: 0.45 });
      add(DROP[1], "pomf");
      if (Q) add(Q_IN[0], "tinkles", { dur: Q_IN[1] - Q_IN[0] });
      add(RUN[0], "ticker", { dur: RUN[1] - RUN[0] });
      add(STOP, "slam");
      add(GROW[0] + 0.05, "whoosh", { dur: 0.35 });
      add(LOCK, "lock", { big: true });
      add(LOCK + 0.02, "sparkle");
      add(CHEER[0], "boing");
      add(CHEER[1] - 0.05, "pomf", { soft: true });
      add(LEAP[0], "boing", { long: true });
      add(LEAP[0] + 0.05, "whooshUp", { dur: 0.45 });
    },
    reads: [
      ...(Q ? [{ text: String(opts.quote), at: [Q_IN[0], Q_OUT[1]], whole: Q_IN[1] }] : []),
      ...(TAG ? [{ text: String(opts.tag), at: [GROW[0] + 0.25, len] }] : []),
      { text: [kit.formatCount(C.to) + (C.label ? ` ${C.label}` : ""), opts.sub ?? ""].filter(Boolean).join(" "), at: [RUN[0] + 0.1, len], whole: LOCK },
    ],
    music: { groove: "light", chords: ["Am", "F", "C", "G"], hits: [STOP, LOCK] },
    storyboard: {
      part: {
        label: { "zh-Hant": "821 格", "zh-Hans": "821 格", en: "821 frames" },
        what: { "zh-Hant": `先浮出他的原話「${opts.quote ?? ""}」，練習影片的畫格像底片從公仔身後跑過，停在擊球那格，放大成兩副骨架的分析圖並標上「${opts.tag ?? ""}」，旁邊數字停在 ${kit.formatCount(C.to)} ${C.label ?? ""}${opts.sub ? `，重拍跳出「${opts.sub}」` : ""}`, "zh-Hans": `先浮出他的原话，练习影片的画格像底片从公仔身后跑过，停在击球那格，放大成两副骨架的分析图，数字停在 ${kit.formatCount(C.to)}`, en: `His own words first; then the clip's frames run past like film, stop on the impact frame, which grows into the two-skeleton analysis; the count locks on ${kit.formatCount(C.to)}` },
        uses: { "zh-Hant": "網球實驗室那篇的原文與影片畫面", "zh-Hans": "网球实验室那篇的原文与影片画面", en: "the tennis-lab post's own words and video" },
        why: { "zh-Hant": "他的內容是自己卡關、自己叫 AI 做出來的工具", "zh-Hans": "他的内容是自己卡关、自己让 AI 做出来的工具", en: "his work is tools he had AI build when he got stuck himself" },
      },
      frames: [
        { at: (RUN[0] + RUN[1]) / 2, title: { "zh-Hant": "底片跑過", "zh-Hans": "底片跑过", en: "The strip runs" }, what: { "zh-Hant": "公仔看著畫格一格格跑過", "zh-Hans": "公仔看着画格跑过", en: "The toy watches the frames go by" } },
        { at: LOCK + 0.3, title: { "zh-Hant": "擊球那格", "zh-Hans": "击球那格", en: "Impact" }, what: { "zh-Hant": `骨架分析圖，${kit.formatCount(C.to)} ${C.label ?? ""}${opts.sub ? `、${opts.sub}` : ""}`, "zh-Hans": "骨架分析图与数字", en: "The analysis and the count" } },
      ],
      hits: [{ at: STOP, label: { "zh-Hant": "停", "zh-Hans": "停", en: "stop" } }, { at: LOCK, label: { "zh-Hant": "鎖", "zh-Hans": "锁", en: "lock" } }],
    },
  };
}
