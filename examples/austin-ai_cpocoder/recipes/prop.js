// Austin's end-card prop: the Sketchry mark (a white tile, the crop lines of a frame in ink, the orange sun at
// its corner) as a block the toy stands on. It drops in spinning on the cut, the toy lands on its top edge,
// and it glides along the floor while the closing line ("能抄的 Skill 都在這") slaps down: the mark of the
// site where his Skills are. Built from sketchry.app's own favicon.svg (300-unit square).
export function makeProp({ film, E, cta, path, lib, glyph }) {
  const { lerp, seg, easeOut, easeInOut, backOut, TAU, v3, trs, qId, qEuler, apply, HIDDEN, line, declareLine, putLine } = lib;
  // the site's name on the floor in front of the mark, so a stranger knows where "都在這" is
  const URL_TEXT = film.cta.prop.text ?? "sketchry.app";
  const URL = line(glyph, URL_TEXT, 0.03);
  const L = 0.096, T = 0.056, s = L / 300;
  const X = (u) => (u - 150) * s, Y = (v) => (150 - v) * s;
  const SW = 24 * s;
  // the crop lines: M40 108H236 M40 250H236 M70 82V276 M206 82V276 (round caps)
  const LINES = [
    { c: [(X(40) + X(236)) / 2, Y(108)], w: X(236) - X(40) + SW, h: SW },
    { c: [(X(40) + X(236)) / 2, Y(250)], w: X(236) - X(40) + SW, h: SW },
    { c: [X(70), (Y(82) + Y(276)) / 2], w: SW, h: Y(82) - Y(276) + SW },
    { c: [X(206), (Y(82) + Y(276)) / 2], w: SW, h: Y(82) - Y(276) + SW },
  ];
  const SUN = { c: [X(196), Y(108)], r: 62 * s };

  const x = (t) => lerp(path[0], path[1], easeInOut(seg(t, E.glide[0], E.glide[1])));
  function baseAt(t) {
    const rest = cta(x(t), 0, 0.07);
    if (t < E.logo[0]) return trs(v3.add(rest, [0, 0.8, 0]), qId(), HIDDEN);
    const d = seg(t, E.logo[0], E.logo[1]);
    if (t < E.logo[1]) return trs(v3.add(rest, [0, 0.45 * (1 - d * d), 0]), qEuler(0, -TAU * 1.5 * (1 - easeOut(d)), 0));
    const b = t - E.logo[1];
    const sq = 0.16 * Math.exp(-b * 9) * Math.cos(b * 30);
    const sway = t > E.glide[0] ? 0.04 * Math.sin((t - E.glide[0]) * TAU * 1.5) * (1 - seg(t, E.glide[1], E.glide[1] + 0.4)) : 0;
    return trs(rest, qEuler(0, 0, sway), [1 + sq * 0.5, 1 - sq, 1 + sq * 0.5]);
  }
  const part = (b, p) => trs(apply(b, p), b.q, b.s);

  return {
    declare(add) {
      add({ name: "tile", geo: { type: "roundBox", size: [L, L, T], radius: 0.011 }, mat: { type: "toy", key: "tile" }, anim: true });
      LINES.forEach((l, i) => add({ name: `crop${i}`, geo: { type: "roundBox", size: [l.w, l.h, 0.008], radius: SW / 2 - 0.0003 }, mat: { type: "toy", key: "ink" }, anim: true }));
      declareLine(add, "url", URL, { color: "#FF8A3D", emit: 0.5 });
      add({ name: "sun", geo: { type: "prism", sides: 48, r: SUN.r, depth: 0.009, bevel: 0.0015 }, mat: { type: "type", color: "#FF6A1A", emit: 0.12 }, anim: true });
    },
    sample(put, t) {
      const b = baseAt(t);
      put("tile", part(b, [0, L / 2, 0]));
      LINES.forEach((l, i) => put(`crop${i}`, part(b, [l.c[0], L / 2 + l.c[1], T / 2 - 0.0028])));
      put("sun", part(b, [SUN.c[0], L / 2 + SUN.c[1], T / 2 + 0.0005]));
      const k = (it) => { const u = seg(t, E.name + 0.3 + 0.02 * it.i, E.name + 0.55 + 0.02 * it.i); return u > 0 ? backOut(u, 1.8) : 0; };
      putLine(put, "url", URL, (it) => apply(b, [it.x, URL.stand, T / 2 + 0.035]), b.q, k);
    },
    // he stands on the tile's top, a little to the left of the sun's corner
    topAt: (t) => apply(baseAt(t), [-0.012, L + 0.003, 0]),
    cues(add) {
      add(E.logo[0], "whooshDown", { dur: E.logo[1] - E.logo[0] });
      add(E.logo[1], "land");
      add(E.glide[0], "glide", { dur: E.glide[1] - E.glide[0] });
    },
  };
}
