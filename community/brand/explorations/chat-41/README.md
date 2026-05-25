# chat-41 brand v1.2 exploration boards

These are the visual comparison boards generated during chat-41 (the v1.2 lock — see `brand.md` §10 v1.2). They were originally rendered to a gitignored `.scratch/` temp dir (throwaway), so they were not persisted at the time. Recovered + committed in chat-42 (2026-05-25) by re-running the generator scripts — output is deterministic, so these are byte-faithful to what chat-41 reviewed.

## `boards/` — rendered comparison boards (open in a browser)

| File | What it shows |
|---|---|
| `all-candidates-contact-sheet.html` | Contact sheet of all 34 mark candidates from chat-36 / chat-37 / chat-40 (inline SVG). |
| `q1-favicon-comparison.html` | Q1 — favicon options (standalone PL monogram treatments). |
| `q1-s-color-treatment.html` | Q1 — "S" colour-treatment options for the wordmark. |
| `q2-trailing-asterisk.html` | Q2 — trailing brand-signature `*` treatments (size / colour / position). |
| `q3-wire-in-execution.html` … `-v5.html` | Q3 — platform wire-in execution mockups, 5 iterations (v5 = the version that became community-platform v0.7). |
| `section-45-location-submarks.html` | §4.5 location sub-mark compositions (lockup + city stamp stack). |

## `scripts/` — the generators (source of truth)

Deterministic Node scripts (opentype.js path-draws the Geist wordmark; inline SVG). To regenerate any board:

```bash
cd community/brand
# one-time deps (gitignored): mkdir -p .scratch && cd .scratch && npm init -y && npm i opentype.js geist png-to-ico sharp && cd ..
node explorations/chat-41/scripts/build-q3-wire-in-board-v5.js <output-dir>
```

`build-lockup.js` is the canonical lockup generator (also referenced by `brand.md` §3 Build pipeline) — it emits `assets/subploters-lockup{,-dark}.svg`.

## Related archives
- `../chat-37/` — 17 mark concepts (the PL-refined concept-11 won) + `comparison-marks.html`.
- `../chat-40/` — 16 rejected v1.2 candidates (PSA architectures / badges / abstract glyphs).
- `../chat-36-archive/` — the original rejected 6-point asterisk.
