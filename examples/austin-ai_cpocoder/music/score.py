"""Austin (@ai_cpocoder) intro: the score.

The musical idea is his day: he types a prompt, the AI answers, he tests it. So the groove is built from
keyboard taps (his typing is the hi-hat, sixteenths that get busier as the work stacks up) and the answer is a
two-note bell motif, "Aus-tin" (long, short: D up to G), that comes back in each part. Key: G major (its
relative E minor for the eighty days, A minor's colour for the tennis frustration), home to G on the end card.

  opening (0–4 s)     : typing alone, a soft pad; the motif on the pop (2 s)
  eighty days (4–12)  : bass and plucks climb with the calendar, typing doubles; a chord and bell on the lock (10)
  821 frames (12–20)  : space for his line (pads only, slow taps) until the strip stops (17), then full on 18
  end card (20–26)    : bright, the motif twice, held on G to the last frame
"""
import numpy as np

CH = {
    "G": ["G2", "B2", "D3", "G3"], "Em": ["E2", "G2", "B2", "E3"], "C": ["C3", "E3", "G3", "C4"],
    "D": ["D3", "F#3", "A3", "D4"], "Am": ["A2", "C3", "E3", "A3"], "F": ["F2", "A2", "C3", "F3"],
}
END = ["C", "D", "G", "G"]


def compose(ctx):
    S, midi, add = ctx.synth, ctx.midi, ctx.add
    out = np.zeros((ctx.n, 2))
    hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)  # noqa: E731
    B, BAR = ctx.beat, ctx.bar

    def motif(t, root="G", gain=0.32, octave=0):
        # "Aus-tin": the fifth below, a beat long, then the root, short and bright
        r = midi(CH[root][0]) + 36 + 12 * octave
        add(out, S.bell(hz(r - 5), 0.9, amp=0.22), t, gain, -0.15)
        add(out, S.bell(hz(r), 0.6, amp=0.25), t + B, gain, 0.15)

    for sec in ctx.sections:
        f0, f1 = sec["f0"], sec["f1"]
        prog = sec["music"].get("chords") or END
        name = sec["name"] or ""
        t, k = f0, 0
        while t < f1 - 1e-6:
            ch = prog[k % len(prog)] if name != "" else END[k % 4]
            if sec["kind"] == "story":
                ch = (["G", "C", "G", "D"] if name == "opening" else END)[k % 4]
            notes = [midi(x) for x in CH[ch]]
            span = min(BAR, f1 - t)
            local = t - f0
            if name in ("page-stand", "opening"):
                # typing alone over a soft pad
                add(out, S.pad([hz(m + 12) for m in notes[1:]], span, bright=1100, a=0.3), t, 0.35, 0.0)
                for s16 in range(16):
                    ts = t + s16 * B / 4
                    if s16 % 2 == 0 or (local >= BAR and s16 % 4 == 3):
                        add(out, S.key_tap(), ts, 0.22 if s16 % 4 == 0 else 0.14, 0.25 if s16 % 2 else -0.2)
            elif name.endswith("skill-stack.js"):
                build = (t - f0) / (f1 - f0)
                add(out, S.sub(hz(notes[0] - 12), span * 0.95), t, 0.75, 0.0)
                add(out, S.pad([hz(m + 12) for m in notes[1:]], span, bright=1300 + 1200 * build, a=0.08), t, 0.42, 0.0)
                arp = [notes[0] + 24, notes[1] + 24, notes[2] + 24, notes[3] + 24]
                for s8 in range(8):
                    ts = t + s8 * B / 2
                    add(out, S.pluck(hz(arp[s8 % 4]), 0.3), ts, 0.38 + 0.12 * build, -0.3 + 0.2 * (s8 % 4))
                for s16 in range(16):
                    ts = t + s16 * B / 4
                    if s16 % (1 if build > 0.45 else 2) == 0:
                        add(out, S.key_tap(), ts, 0.13 + (0.06 if s16 % 4 == 0 else 0), 0.3 if s16 % 2 else -0.25)
                for s8 in (0, 4) if build < 0.5 else (0, 3, 4):
                    add(out, S.kick(), t + s8 * B / 2, 0.5, 0.0)
                add(out, S.snare(), t + 2 * B, 0.22, 0.05)
                add(out, S.snare(), t + 6 * B / 2, 0.22, 0.05)
            elif name.endswith("sketchry-wall.js"):
                # the wall: a pluck on every hop's landing, the band in full once the wall is up
                full = local >= BAR - 1e-6
                add(out, S.sub(hz(notes[0] - 12), span * 0.95), t, 0.75, 0.0)
                add(out, S.pad([hz(m + 12) for m in notes[1:]], span, bright=2200, a=0.05), t, 0.45, 0.0)
                for s8 in range(8):
                    ts = t + s8 * B / 2
                    add(out, S.pluck(hz(notes[[1, 2, 3, 2][s8 % 4]] + 24), 0.3), ts, 0.4, -0.3 + 0.2 * (s8 % 4))
                    add(out, S.key_tap(), ts, 0.15, 0.3)
                for s8 in ((0, 2, 4, 6) if not full else (0, 3, 4, 6)):
                    add(out, S.kick(), t + s8 * B / 2, 0.55, 0.0)
                add(out, S.snare(), t + B, 0.24, 0.05)
                add(out, S.snare(), t + 3 * B, 0.24, 0.05)
            elif name.endswith("frame-count.js"):
                # space for his line until the strip stops (5 s in), then the band comes back
                after = local >= 5 - 1e-6 or local + BAR > 5 + BAR / 2
                add(out, S.sub(hz(notes[0] - 12), span * 0.95), t, 0.55 if not after else 0.75, 0.0)
                add(out, S.pad([hz(m + 12) for m in notes[1:]], span, bright=900 if not after else 2000, a=0.25), t, 0.4, 0.0)
                if not after:
                    for s4 in range(4):
                        add(out, S.key_tap(), t + s4 * B, 0.12, 0.2 if s4 % 2 else -0.2)
                else:
                    for s8 in range(8):
                        add(out, S.pluck(hz(notes[s8 % 3 + 1] + 24), 0.28), t + s8 * B / 2, 0.42, -0.3 + 0.2 * (s8 % 4))
                        add(out, S.hat(), t + s8 * B / 2, 0.16, 0.3)
                    for s8 in (0, 3, 4):
                        add(out, S.kick(), t + s8 * B / 2, 0.55, 0.0)
                    add(out, S.snare(), t + 2 * B, 0.24, 0.05)
                    add(out, S.snare(), t + 3 * B, 0.24, 0.05)
            else:
                # the end card: bright and full, home to G and held
                last = t + BAR >= f1 - 1e-6
                add(out, S.sub(hz(notes[0] - 12), span * (1.0 if last else 0.95)), t, 0.75, 0.0)
                add(out, S.pad([hz(m + 12) for m in notes[1:]], span, bright=2600, a=0.05), t, 0.48, 0.0)
                if not last:
                    for s8 in range(8):
                        add(out, S.pluck(hz(notes[[1, 2, 3, 2][s8 % 4]] + 24), 0.3), t + s8 * B / 2, 0.45, -0.3 + 0.2 * (s8 % 4))
                        add(out, S.key_tap(), t + s8 * B / 2, 0.14, 0.3)
                    for s8 in (0, 3, 4, 6):
                        add(out, S.kick(), t + s8 * B / 2, 0.55, 0.0)
                    add(out, S.snare(), t + B, 0.24, 0.05)
                    add(out, S.snare(), t + 3 * B, 0.24, 0.05)
                else:
                    add(out, S.bell(hz(midi("G5")), 1.8, amp=0.22), t, 0.45, 0.0)
                    add(out, S.bell(hz(midi("B5")), 1.8, amp=0.16), t + 0.03, 0.4, 0.2)
            t += BAR
            k += 1

    # the motif: on the pop, at the start of the eighty days, after the tennis lock, on the end card twice
    motif(2.0, "G")
    for sec in ctx.sections:
        if sec["kind"] == "beat" and sec["name"].endswith("skill-stack.js"):
            motif(sec["f0"], "G", gain=0.2)
        if sec["kind"] == "beat" and sec["name"].endswith("sketchry-wall.js"):
            motif(sec["f0"] + 2 * BAR + BAR / 2, "G", gain=0.26)
    end = [s for s in ctx.sections if s["kind"] == "story"]
    if end:
        motif(end[0]["f0"] + BAR, "G", gain=0.3)
        motif(end[0]["f0"] + 2 * BAR, "G", gain=0.3, octave=0)
    # every big hit: a held chord of the part and a bell an octave up
    for h in ctx.hits:
        sec = next((s for s in ctx.sections if s["f0"] <= h < s["f1"]), None)
        root = "G"
        if sec and sec["kind"] == "beat":
            prog = sec["music"].get("chords") or ["G"]
            root = prog[int((h - sec["f0"]) // BAR) % len(prog)]
        add(out, S.pad([hz(midi(x) + 12) for x in CH[root][1:]], 1.4, bright=2400, a=0.01), h, 0.4, 0.0)
        add(out, S.bell(hz(midi(CH[root][0]) + 36), 1.2, amp=0.2), h, 0.35, 0.0)
    return out
